import initSqlJs, { Database } from 'sql.js';
import { Book } from '../data/books';
import { HomepageConfig, SiteCategory } from '../data/siteConfig';

export interface AuditRecord {
  id: number;
  action_type: string;
  target_type: string;
  target_name: string;
  details: string;
  total_books_count: number;
  admin_id: string;
  created_at: string;
  ip_address: string;
}

export interface StatsSnapshot {
  id: number;
  total_books: number;
  total_stock: number;
  total_rentable: number;
  active_borrowed: number;
  snapshot_time: string;
  admin_id: string;
}

export interface DeletedBookRecord {
  id: string;
  title: string;
  original_title?: string;
  author: string;
  translator?: string;
  category: string;
  category_label?: string;
  buy_price: number;
  original_price?: number;
  rent_price_per_week: number;
  deposit_amount: number;
  format?: string;
  isbn?: string;
  pages?: number;
  cover_image?: string;
  in_stock: number;
  raw_book_json: string;
  deleted_at: string;
  deleted_by: string;
  deletion_reason?: string;
}

const STORAGE_KEY = 'naiin_bookstore_sqlite_bin';
const BACKUP_LOGS_KEY = 'naiin_bookstore_audit_backup';
export const STORAGE_DELETED_BOOKS_KEY = 'bookstore_deleted_books_archive';
export const STORAGE_DELETED_IDS_KEY = 'bookstore_deleted_book_ids';
export const STORAGE_ACTIVE_BOOKS_KEY = 'bookstore_active_books';

class SqliteService {
  private db: Database | null = null;
  private initPromise: Promise<Database | null> | null = null;
  private fallbackLogs: AuditRecord[] = [];

  constructor() {
    this.loadFallbackLogs();
  }

  private loadFallbackLogs() {
    try {
      const saved = localStorage.getItem(BACKUP_LOGS_KEY);
      if (saved) {
        this.fallbackLogs = JSON.parse(saved);
      }
    } catch {
      this.fallbackLogs = [];
    }
  }

  private saveFallbackLogs() {
    try {
      localStorage.setItem(BACKUP_LOGS_KEY, JSON.stringify(this.fallbackLogs));
    } catch {
      // ignore
    }
  }

  public async getDatabase(): Promise<Database | null> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        let baseUrl = import.meta.env.BASE_URL || './';
        if (!baseUrl.endsWith('/')) {
          baseUrl += '/';
        }

        let SQL: any = null;
        try {
          SQL = await initSqlJs({
            locateFile: (file) => `${baseUrl}${file}`
          });
        } catch (localErr) {
          console.warn('Could not load local WASM, falling back to CDN:', localErr);
          try {
            SQL = await initSqlJs({
              locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
            });
          } catch (cdnErr) {
            console.warn('WASM CDN initialization also failed:', cdnErr);
            return null;
          }
        }

        if (!SQL) return null;

        // Check if user has an existing saved database in localStorage
        const savedBin = localStorage.getItem(STORAGE_KEY);
        if (savedBin) {
          try {
            const binary = Uint8Array.from(atob(savedBin), (c) => c.charCodeAt(0));
            this.db = new SQL.Database(binary);
          } catch {
            this.db = new SQL.Database();
          }
        } else {
          // Attempt to load the pre-built physical database.sqlite file
          try {
            const resp = await fetch(`${baseUrl}database.sqlite`);
            if (resp.ok) {
              const arrayBuffer = await resp.arrayBuffer();
              const u8 = new Uint8Array(arrayBuffer);
              this.db = new SQL.Database(u8);
            } else {
              this.db = new SQL.Database();
            }
          } catch {
            this.db = new SQL.Database();
          }
        }

        this.initSchema();
        return this.db;
      } catch (err) {
        console.warn('Could not initialize sql.js WASM, using persistent SQLite fallback mode:', err);
        return null;
      }
    })();

    return this.initPromise;
  }

  private initSchema() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS site_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_name TEXT NOT NULL,
        details TEXT NOT NULL,
        total_books_count INTEGER DEFAULT 0,
        admin_id TEXT DEFAULT 'AD-8842',
        created_at TEXT NOT NULL,
        ip_address TEXT DEFAULT '203.144.144.89'
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS site_stats_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_books INTEGER NOT NULL,
        total_stock INTEGER NOT NULL,
        total_rentable INTEGER NOT NULL,
        active_borrowed INTEGER NOT NULL,
        snapshot_time TEXT NOT NULL,
        admin_id TEXT DEFAULT 'AD-8842'
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS site_config (
        config_key TEXT PRIMARY KEY,
        config_value TEXT NOT NULL,
        updated_at TEXT,
        admin_id TEXT DEFAULT 'AD-8842'
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        book_count INTEGER DEFAULT 0,
        updated_at TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        original_title TEXT,
        author TEXT NOT NULL,
        translator TEXT,
        category TEXT NOT NULL,
        category_label TEXT,
        buy_price REAL NOT NULL,
        original_price REAL,
        rent_price_per_week REAL NOT NULL,
        deposit_amount REAL NOT NULL,
        format TEXT,
        isbn TEXT,
        pages INTEGER,
        cover_image TEXT,
        in_stock INTEGER NOT NULL,
        available_for_rent INTEGER NOT NULL,
        publish_year TEXT,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        curator_quote TEXT,
        description TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS deleted_books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        original_title TEXT,
        author TEXT NOT NULL,
        translator TEXT,
        category TEXT NOT NULL,
        category_label TEXT,
        buy_price REAL,
        original_price REAL,
        rent_price_per_week REAL,
        deposit_amount REAL,
        format TEXT,
        isbn TEXT,
        pages INTEGER,
        cover_image TEXT,
        in_stock INTEGER,
        raw_book_json TEXT NOT NULL,
        deleted_at TEXT NOT NULL,
        deleted_by TEXT NOT NULL,
        deletion_reason TEXT
      );
    `);

    this.persist();
  }

  public persist() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      let binaryStr = '';
      const len = data.byteLength;
      for (let i = 0; i < len; i++) {
        binaryStr += String.fromCharCode(data[i]);
      }
      localStorage.setItem(STORAGE_KEY, btoa(binaryStr));
    } catch (e) {
      console.warn('Failed to persist SQLite database to localStorage:', e);
    }
  }

  public async logAuditAction(params: {
    actionType: string;
    targetType: string;
    targetName: string;
    details: string;
    totalBooksCount: number;
    adminId?: string;
  }): Promise<void> {
    const adminId = params.adminId || 'AD-8842';
    const now = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });

    const db = await this.getDatabase();
    if (db) {
      try {
        db.run(
          `INSERT INTO site_audit_logs (action_type, target_type, target_name, details, total_books_count, admin_id, created_at, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            params.actionType,
            params.targetType,
            params.targetName,
            params.details,
            params.totalBooksCount,
            adminId,
            now,
            '203.144.144.89 (AD-8842)'
          ]
        );
        this.persist();
      } catch (e) {
        console.error('Error inserting audit log into SQLite:', e);
      }
    }

    // Always keep in fallback mirror
    const newRecord: AuditRecord = {
      id: Date.now(),
      action_type: params.actionType,
      target_type: params.targetType,
      target_name: params.targetName,
      details: params.details,
      total_books_count: params.totalBooksCount,
      admin_id: adminId,
      created_at: now,
      ip_address: '203.144.144.89 (AD-8842)'
    };
    this.fallbackLogs.unshift(newRecord);
    this.saveFallbackLogs();
  }

  public getDeletedBookIds(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_DELETED_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public async recordDeletedBook(book: Book, deletedBy = 'AD-8842', reason = 'ลบออกจากระบบโดยผู้ดูแลระบบ'): Promise<void> {
    const now = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });

    const deletedRecord: DeletedBookRecord = {
      id: book.id,
      title: book.title,
      original_title: book.originalTitle || '',
      author: book.author,
      translator: book.translator || '',
      category: book.category,
      category_label: book.categoryLabel || '',
      buy_price: book.buyPrice,
      original_price: book.originalPrice || book.buyPrice,
      rent_price_per_week: book.rentPricePerWeek,
      deposit_amount: book.depositAmount,
      format: book.format,
      isbn: book.isbn,
      pages: book.pages,
      cover_image: book.coverImage || '',
      in_stock: book.inStock,
      raw_book_json: JSON.stringify(book),
      deleted_at: now,
      deleted_by: deletedBy,
      deletion_reason: reason
    };

    // 1. Permanent save in LocalStorage (both deleted IDs list and full data archive)
    try {
      const deletedIds = this.getDeletedBookIds();
      if (!deletedIds.includes(book.id)) {
        deletedIds.push(book.id);
        localStorage.setItem(STORAGE_DELETED_IDS_KEY, JSON.stringify(deletedIds));
      }

      const archiveStr = localStorage.getItem(STORAGE_DELETED_BOOKS_KEY);
      const archive: DeletedBookRecord[] = archiveStr ? JSON.parse(archiveStr) : [];
      const updatedArchive = archive.filter((item) => item.id !== book.id);
      updatedArchive.unshift(deletedRecord);
      localStorage.setItem(STORAGE_DELETED_BOOKS_KEY, JSON.stringify(updatedArchive));

      // Remove from active books in storage so refresh will NEVER pull it back
      const activeStr = localStorage.getItem(STORAGE_ACTIVE_BOOKS_KEY);
      if (activeStr) {
        const active: Book[] = JSON.parse(activeStr);
        const updatedActive = active.filter((b) => b.id !== book.id);
        localStorage.setItem(STORAGE_ACTIVE_BOOKS_KEY, JSON.stringify(updatedActive));
      }
    } catch (err) {
      console.warn('LocalStorage save deleted book failed:', err);
    }

    // 2. Permanent save in SQLite database
    const db = await this.getDatabase();
    if (db) {
      try {
        db.run(
          `INSERT OR REPLACE INTO deleted_books (
            id, title, original_title, author, translator, category, category_label,
            buy_price, original_price, rent_price_per_week, deposit_amount, format,
            isbn, pages, cover_image, in_stock, raw_book_json, deleted_at, deleted_by, deletion_reason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            deletedRecord.id,
            deletedRecord.title,
            deletedRecord.original_title || '',
            deletedRecord.author,
            deletedRecord.translator || '',
            deletedRecord.category,
            deletedRecord.category_label || '',
            deletedRecord.buy_price,
            deletedRecord.original_price || deletedRecord.buy_price,
            deletedRecord.rent_price_per_week,
            deletedRecord.deposit_amount,
            deletedRecord.format || '',
            deletedRecord.isbn || '',
            deletedRecord.pages || 0,
            deletedRecord.cover_image || '',
            deletedRecord.in_stock,
            deletedRecord.raw_book_json,
            deletedRecord.deleted_at,
            deletedRecord.deleted_by,
            deletedRecord.deletion_reason || ''
          ]
        );

        // Delete from books table in SQLite
        db.run(`DELETE FROM books WHERE id = ?`, [book.id]);
        this.persist();
      } catch (e) {
        console.error('Error recording deleted book into SQLite:', e);
      }
    }
  }

  public async getDeletedBooks(): Promise<DeletedBookRecord[]> {
    const db = await this.getDatabase();
    if (db) {
      try {
        const stmt = db.prepare(`SELECT * FROM deleted_books ORDER BY deleted_at DESC`);
        const results: DeletedBookRecord[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          results.push(row as unknown as DeletedBookRecord);
        }
        stmt.free();
        if (results.length > 0) {
          return results;
        }
      } catch (e) {
        console.warn('Querying deleted_books from SQLite failed, checking fallback:', e);
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_DELETED_BOOKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return [];
  }

  public async restoreDeletedBook(bookId: string): Promise<Book | null> {
    let restoredBook: Book | null = null;
    try {
      const archiveStr = localStorage.getItem(STORAGE_DELETED_BOOKS_KEY);
      const archive: DeletedBookRecord[] = archiveStr ? JSON.parse(archiveStr) : [];
      const item = archive.find((i) => i.id === bookId);
      if (item && item.raw_book_json) {
        restoredBook = JSON.parse(item.raw_book_json);
        const newArchive = archive.filter((i) => i.id !== bookId);
        localStorage.setItem(STORAGE_DELETED_BOOKS_KEY, JSON.stringify(newArchive));
      }

      const deletedIds = this.getDeletedBookIds();
      const newDeletedIds = deletedIds.filter((id) => id !== bookId);
      localStorage.setItem(STORAGE_DELETED_IDS_KEY, JSON.stringify(newDeletedIds));
    } catch (e) {
      console.warn('Failed to restore book from localStorage:', e);
    }

    const db = await this.getDatabase();
    if (db) {
      try {
        db.run(`DELETE FROM deleted_books WHERE id = ?`, [bookId]);
        this.persist();
      } catch {}
    }

    return restoredBook;
  }

  public async syncBooks(books: Book[]): Promise<void> {
    const deletedIds = this.getDeletedBookIds();
    // Guarantee that NO deleted book ever enters SQLite
    const activeBooks = books.filter((b) => !deletedIds.includes(b.id));

    const db = await this.getDatabase();
    if (!db) return;

    const now = new Date().toLocaleString('th-TH');
    try {
      db.run('DELETE FROM books');
      for (const b of activeBooks) {
        db.run(
          `INSERT INTO books (
            id, title, original_title, author, translator, category, category_label, buy_price, original_price,
            rent_price_per_week, deposit_amount, format, isbn, pages, cover_image, in_stock, available_for_rent,
            publish_year, rating, review_count, curator_quote, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id, b.title, b.originalTitle || '', b.author, b.translator || '', b.category,
            b.categoryLabel || '', b.buyPrice, b.originalPrice || b.buyPrice, b.rentPricePerWeek, b.depositAmount,
            b.format, b.isbn, b.pages, b.coverImage || '', b.inStock, b.availableForRent, b.publishYear,
            b.rating, b.reviewCount || 0, b.curatorQuote || '', b.description || '', now, now
          ]
        );
      }
      this.persist();
    } catch (e) {
      console.error('Error syncing books to SQLite:', e);
    }
  }

  public async syncCategories(categories: SiteCategory[], books: Book[]): Promise<void> {
    const db = await this.getDatabase();
    if (!db) return;

    const now = new Date().toLocaleString('th-TH');
    try {
      db.run('DELETE FROM categories');
      for (const cat of categories) {
        const count = books.filter(b => b.category === cat.slug || b.category === cat.name).length;
        db.run(
          `INSERT INTO categories (slug, name, description, book_count, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [cat.slug, cat.name, cat.description || '', count, now]
        );
      }
      this.persist();
    } catch (e) {
      console.error('Error syncing categories to SQLite:', e);
    }
  }

  public async syncHomepageConfig(config: HomepageConfig, adminId = 'AD-8842'): Promise<void> {
    const db = await this.getDatabase();
    if (!db) return;

    const now = new Date().toLocaleString('th-TH');
    try {
      const keys = Object.keys(config) as (keyof HomepageConfig)[];
      for (const k of keys) {
        const val = String(config[k] || '');
        db.run(
          `INSERT OR REPLACE INTO site_config (config_key, config_value, updated_at, admin_id) VALUES (?, ?, ?, ?)`,
          [k, val, now, adminId]
        );
      }
      this.persist();
    } catch (e) {
      console.error('Error syncing homepage config to SQLite:', e);
    }
  }

  public async recordStatsSnapshot(params: {
    totalBooks: number;
    totalStock: number;
    totalRentable: number;
    activeBorrowed: number;
    adminId?: string;
  }): Promise<void> {
    const adminId = params.adminId || 'AD-8842';
    const now = new Date().toLocaleString('th-TH');

    const db = await this.getDatabase();
    if (db) {
      try {
        db.run(
          `INSERT INTO site_stats_snapshots (total_books, total_stock, total_rentable, active_borrowed, snapshot_time, admin_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            params.totalBooks,
            params.totalStock,
            params.totalRentable,
            params.activeBorrowed,
            now,
            adminId
          ]
        );
        this.persist();
      } catch (e) {
        console.error('Error recording snapshot in SQLite:', e);
      }
    }
  }

  public async getAllAuditLogs(): Promise<AuditRecord[]> {
    const db = await this.getDatabase();
    if (db) {
      try {
        const res = db.exec(`SELECT * FROM site_audit_logs ORDER BY id DESC LIMIT 150`);
        if (res.length > 0) {
          const columns = res[0].columns;
          return res[0].values.map((row) => {
            const obj: any = {};
            columns.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            return obj as AuditRecord;
          });
        }
      } catch (e) {
        console.error('Error querying SQLite logs:', e);
      }
    }
    return this.fallbackLogs;
  }

  public async runCustomQuery(sqlQuery: string): Promise<{ columns: string[]; values: any[][] }> {
    const db = await this.getDatabase();
    if (!db) {
      throw new Error('ฐานข้อมูล SQLite กำลังเริ่มต้น หรือยังไม่พร้อมใช้งาน');
    }
    try {
      const res = db.exec(sqlQuery);
      if (res.length > 0) {
        return {
          columns: res[0].columns,
          values: res[0].values
        };
      }
      this.persist();
      return { columns: ['Status'], values: [['คำสั่ง SQL ทำงานสำเร็จ (0 แถวที่ส่งกลับ)']] };
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการประมวลผลคำสั่ง SQL');
    }
  }

  public async downloadSqliteFile(filename = 'database.sqlite'): Promise<void> {
    const db = await this.getDatabase();
    let blob: Blob;
    if (db) {
      const data = db.export();
      blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    } else {
      // Fallback text dump
      const json = JSON.stringify(this.fallbackLogs, null, 2);
      blob = new Blob([json], { type: 'application/json' });
      filename = filename.replace('.sqlite', '.json');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async loadDatabaseFromFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const u8 = new Uint8Array(arrayBuffer);
          const baseUrl = import.meta.env.BASE_URL || '/';
          const SQL = await initSqlJs({
            locateFile: (f) => `${baseUrl}${f}`
          });
          this.db = new SQL.Database(u8);
          this.persist();
          resolve(true);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
      reader.readAsArrayBuffer(file);
    });
  }
}

export const sqliteService = new SqliteService();
