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

const STORAGE_KEY = 'naiin_bookstore_sqlite_bin';
const BACKUP_LOGS_KEY = 'naiin_bookstore_audit_backup';

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
        const baseUrl = import.meta.env.BASE_URL || '/';
        const SQL = await initSqlJs({
          locateFile: (file) => {
            // First try relative base URL, sql.js will fall back if necessary
            return `${baseUrl}${file}`;
          }
        });

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
        buy_price REAL NOT NULL,
        original_price REAL,
        rent_price_per_week REAL NOT NULL,
        deposit_amount REAL NOT NULL,
        format TEXT,
        isbn TEXT,
        pages INTEGER,
        in_stock INTEGER NOT NULL,
        available_for_rent INTEGER NOT NULL,
        publish_year TEXT,
        rating REAL,
        curator_quote TEXT,
        description TEXT,
        created_at TEXT,
        updated_at TEXT
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

  public async syncBooks(books: Book[]): Promise<void> {
    const db = await this.getDatabase();
    if (!db) return;

    const now = new Date().toLocaleString('th-TH');
    try {
      db.run('DELETE FROM books');
      for (const b of books) {
        db.run(
          `INSERT INTO books (
            id, title, original_title, author, translator, category, buy_price, original_price,
            rent_price_per_week, deposit_amount, format, isbn, pages, in_stock, available_for_rent,
            publish_year, rating, curator_quote, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id, b.title, b.originalTitle || '', b.author, b.translator || '', b.category,
            b.buyPrice, b.originalPrice || b.buyPrice, b.rentPricePerWeek, b.depositAmount,
            b.format, b.isbn, b.pages, b.inStock, b.availableForRent, b.publishYear,
            b.rating, b.curatorQuote || '', b.description || '', now, now
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
