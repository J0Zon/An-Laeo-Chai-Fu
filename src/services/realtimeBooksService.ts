import { Book, INITIAL_BOOKS } from '../data/books';

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
    // Check for updates every 12 seconds in case SSE disconnected or between multiple devices
    this.pollInterval = setInterval(async () => {
      try {
        const remote = await this.fetchServerBooks();
        if (remote && remote.books) {
          // Check if changed compared to local
          const localStr = localStorage.getItem('bookstore_active_books');
          const currentCount = localStr ? JSON.parse(localStr).length : 0;
          if (remote.books.length !== currentCount) {
            this.notifyListeners({
              type: 'sync',
              books: remote.books,
              timestamp: Date.now(),
              source: 'poll'
            });
          }
        }
      } catch {}
    }, 12000);
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
      // Server not reachable (e.g. static host)
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

    // 2. Send to backend server
    try {
      const resp = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.book) return data.book;
      }
    } catch (err) {
      console.warn('Backend addBook failed, saved in local store:', err);
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

    // 2. Send to backend server
    try {
      const resp = await fetch(`/api/books/${encodeURIComponent(book.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.book) return data.book;
      }
    } catch (err) {
      console.warn('Backend updateBook failed, saved in local store:', err);
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

    // 2. Send to backend server
    try {
      const resp = await fetch(`/api/books/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (resp.ok) return true;
    } catch (err) {
      console.warn('Backend deleteBook failed, saved in local store:', err);
    }
    return false;
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
