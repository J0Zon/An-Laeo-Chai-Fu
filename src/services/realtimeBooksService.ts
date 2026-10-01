import { Book, INITIAL_BOOKS } from '../data/books';
import { githubSyncService } from './githubSyncService';

export type RealtimeAction = 'book_added' | 'book_updated' | 'book_deleted' | 'book_restored' | 'sync';

export interface RealtimeBookEvent {
  type: RealtimeAction;
  book?: Book;
  id?: string;
  books?: Book[];
  timestamp: number;
  source?: 'sse' | 'broadcast' | 'local' | 'poll';
}

type RealtimeListener = (event: RealtimeBookEvent) => void;

class RealtimeBooksService {
  private listeners: Set<RealtimeListener> = new Set();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnecting: boolean = false;
  private pollInterval: any = null;
  private lastKnownVersion: number = 0;

  constructor() {
    this.initBroadcastChannel();
    this.initEventSource();
    this.initWindowStorageListener();
    this.startPollingFallback();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('bookstore_realtime_channel');
        this.broadcastChannel.onmessage = (messageEvent) => {
          if (messageEvent.data && messageEvent.data.type) {
            this.notifyListeners({
              ...messageEvent.data,
              source: 'broadcast'
            });
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not available:', e);
      }
    }
  }

  private initWindowStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'bookstore_active_books' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners({
              type: 'sync',
              books: parsed,
              timestamp: Date.now(),
              source: 'local'
            });
          } catch {}
        }
      });
    }
  }

  private initEventSource() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.isConnecting || this.eventSource) return;

    this.isConnecting = true;
    try {
      this.eventSource = new EventSource('/api/books/events');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type && data.type !== 'connected') {
            this.notifyListeners({
              type: data.type as RealtimeAction,
              book: data.payload?.book,
              id: data.payload?.id,
              books: data.payload?.books,
              timestamp: data.timestamp || Date.now(),
              source: 'sse'
            });
          }
        } catch {
          // ignore keepalive or non-json
        }
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 4 seconds
        setTimeout(() => this.initEventSource(), 4000);
      };
    } catch {
      this.isConnecting = false;
    }
  }

  private startPollingFallback() {
    if (typeof window === 'undefined') return;
    // Check for updates every 15 seconds (works on GitHub Pages and across different devices)
    this.pollInterval = setInterval(async () => {
      try {
        const remote = await this.fetchServerBooks();
        if (remote && remote.books && remote.books.length > 0) {
          // Check if changed compared to local
          const localStr = localStorage.getItem('bookstore_active_books');
          const localBooks: Book[] = localStr ? JSON.parse(localStr) : [];
          
          const hasCountChange = remote.books.length !== localBooks.length;
          const hasContentChange = JSON.stringify(remote.books.map(b => b.id + b.inStock)) !== JSON.stringify(localBooks.map(b => b.id + b.inStock));

          if (hasCountChange || hasContentChange) {
            this.notifyListeners({
              type: 'sync',
              books: remote.books,
              timestamp: Date.now(),
              source: 'poll'
            });
          }
        }
      } catch {}
    }, 15000);
  }

  private notifyListeners(event: RealtimeBookEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    }
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcastLocal(event: RealtimeBookEvent) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch {}
    }
    this.notifyListeners(event);
  }

  public async fetchServerBooks(): Promise<{ books: Book[]; deletedBookIds: string[] } | null> {
    // 1. Try local Express backend API (if running with server.ts)
    try {
      const resp = await fetch('/api/books', {
        headers: { Accept: 'application/json' },
        cache: 'no-cache'
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.books)) {
          return {
            books: data.books,
            deletedBookIds: Array.isArray(data.deletedBookIds) ? data.deletedBookIds : []
          };
        }
      }
    } catch (err) {
      // Local server not available (e.g. deployed to GitHub Pages)
    }

    // 2. Try fetching directly from GitHub (GitHub Raw CDN or ./books.json)
    // This allows EVERY visitor on GitHub Pages to see the latest changes in real time!
    try {
      const githubResult = await githubSyncService.fetchBooksFromGitHub();
      if (githubResult && githubResult.books && githubResult.books.length > 0) {
        return {
          books: githubResult.books,
          deletedBookIds: []
        };
      }
    } catch (ghErr) {
      console.warn('GitHub fetch error in fetchServerBooks:', ghErr);
    }

    return null;
  }

  public async addBook(book: Book): Promise<Book> {
    // 1. Optimistic broadcast
    this.broadcastLocal({
      type: 'book_added',
      book,
      timestamp: Date.now(),
      source: 'local'
    });

    // 2. Send to backend server if available
    try {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
    } catch (err) {
      console.warn('Backend addBook failed, saved in local store:', err);
    }

    // 3. Auto-commit to GitHub if configured
    try {
      if (githubSyncService.isConfigured() && githubSyncService.getConfig().autoSync) {
        const localStr = localStorage.getItem('bookstore_active_books');
        const list: Book[] = localStr ? JSON.parse(localStr) : [];
        const fullList = list.some(b => b.id === book.id) ? list : [book, ...list];
        await githubSyncService.commitBooksToGitHub(fullList, `เพิ่มหนังสือใหม่: "${book.title}"`);
      }
    } catch (ghErr) {
      console.warn('Auto-sync to GitHub failed on addBook:', ghErr);
    }

    return book;
  }

  public async updateBook(book: Book): Promise<Book> {
    // 1. Optimistic broadcast
    this.broadcastLocal({
      type: 'book_updated',
      book,
      id: book.id,
      timestamp: Date.now(),
      source: 'local'
    });

    // 2. Send to backend server if available
    try {
      await fetch(`/api/books/${encodeURIComponent(book.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
    } catch (err) {
      console.warn('Backend updateBook failed, saved in local store:', err);
    }

    // 3. Auto-commit to GitHub if configured
    try {
      if (githubSyncService.isConfigured() && githubSyncService.getConfig().autoSync) {
        const localStr = localStorage.getItem('bookstore_active_books');
        const list: Book[] = localStr ? JSON.parse(localStr) : [];
        const fullList = list.map(b => b.id === book.id ? book : b);
        await githubSyncService.commitBooksToGitHub(fullList, `แก้ไขหนังสือ: "${book.title}"`);
      }
    } catch (ghErr) {
      console.warn('Auto-sync to GitHub failed on updateBook:', ghErr);
    }

    return book;
  }

  public async deleteBook(id: string): Promise<boolean> {
    // 1. Optimistic broadcast
    this.broadcastLocal({
      type: 'book_deleted',
      id,
      timestamp: Date.now(),
      source: 'local'
    });

    // 2. Send to backend server if available
    try {
      await fetch(`/api/books/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend deleteBook failed, saved in local store:', err);
    }

    // 3. Auto-commit to GitHub if configured
    try {
      if (githubSyncService.isConfigured() && githubSyncService.getConfig().autoSync) {
        const localStr = localStorage.getItem('bookstore_active_books');
        const list: Book[] = localStr ? JSON.parse(localStr) : [];
        const fullList = list.filter(b => b.id !== id);
        await githubSyncService.commitBooksToGitHub(fullList, `ลบหนังสือ ID: ${id}`);
      }
    } catch (ghErr) {
      console.warn('Auto-sync to GitHub failed on deleteBook:', ghErr);
    }

    return true;
  }

  public async restoreBook(id: string): Promise<Book | null> {
    try {
      const resp = await fetch(`/api/books/restore/${encodeURIComponent(id)}`, {
        method: 'POST'
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.book) {
          this.broadcastLocal({
            type: 'book_restored',
            book: data.book,
            id,
            timestamp: Date.now(),
            source: 'local'
          });
          return data.book;
        }
      }
    } catch (err) {
      console.warn('Backend restoreBook failed:', err);
    }
    return null;
  }
}

export const realtimeBooksService = new RealtimeBooksService();
