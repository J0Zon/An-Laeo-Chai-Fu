import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cross-Origin headers for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Paths to persistent data stores
const DATA_DIR = path.resolve(__dirname, 'src/data');
const STORE_FILE = path.resolve(DATA_DIR, 'server_books.json');
const DELETED_FILE = path.resolve(DATA_DIR, 'server_deleted_books.json');
const DB_FILE = path.resolve(__dirname, 'database.sqlite');

let currentVersion = Date.now();

// Helper to read active books
function readBooks(): any[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading server_books.json:', err);
  }
  return [];
}

// Helper to write active books
function writeBooks(books: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(books, null, 2), 'utf-8');
    currentVersion = Date.now();
  } catch (err) {
    console.error('Error writing server_books.json:', err);
  }
}

// Helper to read deleted books
function readDeletedBooks(): any[] {
  try {
    if (fs.existsSync(DELETED_FILE)) {
      const data = fs.readFileSync(DELETED_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

// Helper to write deleted books
function writeDeletedBooks(books: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DELETED_FILE, JSON.stringify(books, null, 2), 'utf-8');
  } catch {}
}

// Real-Time Server-Sent Events (SSE) subscribers
const sseClients = new Set<Response>();

function broadcastRealtime(type: string, payload: any) {
  const dataString = `data: ${JSON.stringify({ type, payload, timestamp: Date.now(), version: currentVersion })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE Heartbeat ping every 20 seconds
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// --- REST API ROUTES ---

// 1. SSE Real-Time Stream
app.get('/api/books/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const books = readBooks();
  const initMsg = `data: ${JSON.stringify({
    type: 'connected',
    payload: { booksCount: books.length, version: currentVersion },
    timestamp: Date.now()
  })}\n\n`;
  res.write(initMsg);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 2. GET all books & deleted list (Every visitor fetches this immediately on visit)
app.get('/api/books', (req: Request, res: Response) => {
  const books = readBooks();
  const deletedBooks = readDeletedBooks();
  const deletedBookIds = deletedBooks.map((b) => b.id);

  res.json({
    success: true,
    books,
    deletedBookIds,
    version: currentVersion,
    count: books.length,
    updatedAt: new Date(currentVersion).toISOString()
  });
});

// 3. POST new book (upload/add)
app.post('/api/books', (req: Request, res: Response) => {
  try {
    const bookData = req.body;
    if (!bookData || !bookData.title) {
      return res.status(400).json({ success: false, error: 'Book title is required' });
    }

    const books = readBooks();
    const newBook = {
      ...bookData,
      id: bookData.id || `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: bookData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Remove from deleted list if present
    const deletedBooks = readDeletedBooks().filter((b) => b.id !== newBook.id);
    writeDeletedBooks(deletedBooks);

    // Prevent duplicates
    const existingIndex = books.findIndex((b) => b.id === newBook.id);
    if (existingIndex >= 0) {
      books[existingIndex] = newBook;
    } else {
      books.unshift(newBook);
    }

    writeBooks(books);

    // Broadcast in REAL-TIME to all connected clients!
    broadcastRealtime('book_added', {
      book: newBook,
      books,
      id: newBook.id
    });

    console.log(`[Realtime Server] Added book: "${newBook.title}" (Total: ${books.length})`);
    return res.status(201).json({ success: true, book: newBook, version: currentVersion });
  } catch (err: any) {
    console.error('Error adding book:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. PUT update book
app.put('/api/books/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const books = readBooks();

    const index = books.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const updatedBook = {
      ...books[index],
      ...updateData,
      id,
      updatedAt: new Date().toISOString()
    };

    books[index] = updatedBook;
    writeBooks(books);

    // Broadcast in REAL-TIME to all connected clients!
    broadcastRealtime('book_updated', {
      book: updatedBook,
      books,
      id
    });

    console.log(`[Realtime Server] Updated book: "${updatedBook.title}"`);
    return res.json({ success: true, book: updatedBook, version: currentVersion });
  } catch (err: any) {
    console.error('Error updating book:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE book
app.delete('/api/books/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const books = readBooks();
    const bookToDelete = books.find((b) => b.id === id);

    if (!bookToDelete) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const filteredBooks = books.filter((b) => b.id !== id);
    writeBooks(filteredBooks);

    // Record into deleted archive
    const deletedBooks = readDeletedBooks();
    deletedBooks.unshift({
      ...bookToDelete,
      deletedAt: new Date().toISOString()
    });
    writeDeletedBooks(deletedBooks);

    // Broadcast in REAL-TIME to all connected clients!
    broadcastRealtime('book_deleted', {
      id,
      book: bookToDelete,
      books: filteredBooks
    });

    console.log(`[Realtime Server] Deleted book: "${bookToDelete.title}" (Remaining: ${filteredBooks.length})`);
    return res.json({ success: true, id, version: currentVersion });
  } catch (err: any) {
    console.error('Error deleting book:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST restore book
app.post('/api/books/restore/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBooks = readDeletedBooks();
    const bookToRestore = deletedBooks.find((b) => b.id === id);

    if (!bookToRestore) {
      return res.status(404).json({ success: false, error: 'Deleted book not found' });
    }

    // Remove from deleted list
    const remainingDeleted = deletedBooks.filter((b) => b.id !== id);
    writeDeletedBooks(remainingDeleted);

    // Add back to active books
    const books = readBooks();
    const cleanBook = { ...bookToRestore };
    delete cleanBook.deletedAt;
    books.unshift(cleanBook);
    writeBooks(books);

    // Broadcast in REAL-TIME!
    broadcastRealtime('book_restored', {
      id,
      book: cleanBook,
      books
    });

    console.log(`[Realtime Server] Restored book: "${cleanBook.title}"`);
    return res.json({ success: true, book: cleanBook, version: currentVersion });
  } catch (err: any) {
    console.error('Error restoring book:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET Health check
app.get('/api/health', (req: Request, res: Response) => {
  const books = readBooks();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    booksCount: books.length,
    activeSSEClients: sseClients.size
  });
});

// Start Server with Vite or Static
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (!isProduction || !fs.existsSync(distPath)) {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Running in Vite Dev middleware mode on port 3000');
  } else {
    // Production mode: Serve dist
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Running in Production mode serving dist on port 3000');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Realtime Bookstore Server] listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
