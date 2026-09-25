const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function generateDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables
  db.run(`
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

  db.run(`
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
      format TEXT DEFAULT 'ปกอ่อน',
      isbn TEXT,
      pages INTEGER,
      in_stock INTEGER NOT NULL,
      available_for_rent INTEGER NOT NULL,
      publish_year TEXT,
      rating REAL DEFAULT 4.8,
      curator_quote TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      book_count INTEGER DEFAULT 0,
      updated_at TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_config (
      config_key TEXT PRIMARY KEY,
      config_value TEXT NOT NULL,
      updated_at TEXT,
      admin_id TEXT DEFAULT 'AD-8842'
    );
  `);

  const now = new Date().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Insert initial categories
  const categories = [
    { slug: 'healing', name: 'หนังสือฮีลใจและพัฒนาตนเอง', desc: 'เพื่อการเยียวยาจิตใจและเติมพลังบวกในทุกๆ วัน', count: 1 },
    { slug: 'literature', name: 'วรรณกรรมแปลร่วมสมัย', desc: 'เรื่องราวสะท้อนมิติชีวิตลึกซึ้งจากทั่วทุกมุมโลก', count: 1 },
    { slug: 'philosophy', name: 'ปรัชญาและบทกวี', desc: 'ความคิดตกผลึกและสุนทรียภาพแห่งชีวิตที่เรียบง่าย', count: 1 },
    { slug: 'essay', name: 'บทความและเรียงความ', desc: 'มุมมองอันละเมียดละไมต่อสิ่งรอบตัวและวิถีผู้คน', count: 1 },
    { slug: 'fiction', name: 'นิยายแปลอบอุ่น', desc: 'เรื่องเล่าชุบชูหัวใจและมิตรภาพที่ตราตรึง', count: 1 }
  ];

  for (const cat of categories) {
    db.run(
      `INSERT OR REPLACE INTO categories (slug, name, description, book_count, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [cat.slug, cat.name, cat.desc, cat.count, now]
    );
  }

  // Insert initial books
  const books = [
    {
      id: 'book-01',
      title: 'ในความเงียบงัน... มีเสียงของหัวใจกระซิบเบาๆ',
      original_title: 'The Quiet Sound of Being',
      author: 'ฮารุกิ ชินโด',
      translator: 'เมธาวี สุขเกษม',
      category: 'healing',
      buy_price: 295,
      original_price: 330,
      rent_price_per_week: 45,
      deposit_amount: 150,
      format: 'ปกอ่อน',
      isbn: '978-616-93821-0-4',
      pages: 248,
      in_stock: 14,
      available_for_rent: 4,
      publish_year: '2025',
      rating: 4.9,
      curator_quote: 'หนังสือเล่มนี้คือถ้วยชาร้อนในเช้าฤดูหนาวที่ช่วยปลอบประโลมจิตใจอันอ่อนล้า',
      description: 'บันทึกบทสนทนาอันอ่อนโยนกับตนเองในเช้าวันหยุดที่ไม่มีกำหนดการ ค้นพบความสุขจากสิ่งเล็กๆ'
    },
    {
      id: 'book-02',
      title: 'สถาปัตยกรรมแห่งความสงบในใจคุณ',
      original_title: 'Architecture of Tranquility',
      author: 'เคนโซะ อิวาซากิ',
      translator: 'ปวีณ์นุช ตันติเวช',
      category: 'literature',
      buy_price: 320,
      original_price: 360,
      rent_price_per_week: 50,
      deposit_amount: 160,
      format: 'ปกอ่อน',
      isbn: '978-616-93821-1-1',
      pages: 280,
      in_stock: 9,
      available_for_rent: 2,
      publish_year: '2024',
      rating: 4.8,
      curator_quote: 'การจัดวางพื้นที่ว่างไม่ได้มีไว้เพื่อความสวยงามเพียงอย่างเดียว แต่มีไว้เพื่อให้จิตใจได้หายใจ',
      description: 'สารคดีเชิงปรัชญาว่าด้วยความสัมพันธ์ระหว่างแสง เงา พื้นผิวไม้ และความนิ่งสงบภายใน'
    },
    {
      id: 'book-03',
      title: 'ปรัชญาใบไม้ร่วงและศิลปะแห่งการเริ่มต้นใหม่',
      original_title: 'Autumn Leaves Philosophy',
      author: 'เอมิ ชิราอิชิ',
      translator: 'กมลชนก เกรียงไกร',
      category: 'philosophy',
      buy_price: 270,
      original_price: 300,
      rent_price_per_week: 40,
      deposit_amount: 140,
      format: 'ปกอ่อน',
      isbn: '978-616-93821-2-8',
      pages: 216,
      in_stock: 12,
      available_for_rent: 5,
      publish_year: '2025',
      rating: 4.7,
      curator_quote: 'ใบไม้ร่วงไม่ใช่จุดจบ แต่เป็นการสละเพื่อผลิบานใหม่อย่างงดงามในฤดูกาลถัดไป',
      description: 'ข้อคิดสั้นๆ เปี่ยมความหมายว่าด้วยการปล่อยวางสิ่งที่ไม่จำเป็นในชีวิต เพื่อต้อนรับความเบาสบาย'
    },
    {
      id: 'book-04',
      title: 'จังหวะก้าวสั้นๆ ของวันแสนธรรมดา',
      original_title: 'Small Steps in Ordinary Days',
      author: 'ทาคาชิ ยามาโมโตะ',
      translator: 'สิรินทร์ ศักดิ์เจริญ',
      category: 'essay',
      buy_price: 260,
      original_price: 290,
      rent_price_per_week: 35,
      deposit_amount: 130,
      format: 'ปกอ่อน',
      isbn: '978-616-93821-3-5',
      pages: 192,
      in_stock: 18,
      available_for_rent: 6,
      publish_year: '2024',
      rating: 4.9,
      curator_quote: 'หนังสือที่ทำให้อยากเดินให้ช้าลง หายใจให้ลึกขึ้น และสังเกตดอกไม้ริมทาง',
      description: 'รวมบทความความเรียงละเมียดละไม บันทึกการเดินสำรวจละแวกบ้านในวันอาทิตย์'
    },
    {
      id: 'book-05',
      title: 'จดหมายถึงฤดูใบไม้ผลิที่มาช้า',
      original_title: 'Letters to a Late Spring',
      author: 'มิชิโกะ โคบายาชิ',
      translator: 'ณัฐพร วงศ์สว่าง',
      category: 'fiction',
      buy_price: 340,
      original_price: 380,
      rent_price_per_week: 55,
      deposit_amount: 170,
      format: 'ปกแข็ง',
      isbn: '978-616-93821-4-2',
      pages: 312,
      in_stock: 6,
      available_for_rent: 2,
      publish_year: '2025',
      rating: 5.0,
      curator_quote: 'ความอบอุ่นที่รอคอย ย่อมคุ้มค่าเสมอเมื่อมาถึงในจังหวะของหัวใจ',
      description: 'นวนิยายอบอุ่นหัวใจว่าด้วยมิตรภาพทางจดหมายระหว่างเจ้าของร้านกาแฟเก่าแก่กับเด็กหนุ่มผู้สับสน'
    }
  ];

  for (const b of books) {
    db.run(
      `INSERT OR REPLACE INTO books (
        id, title, original_title, author, translator, category, buy_price, original_price,
        rent_price_per_week, deposit_amount, format, isbn, pages, in_stock, available_for_rent,
        publish_year, rating, curator_quote, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.id, b.title, b.original_title, b.author, b.translator, b.category, b.buy_price, b.original_price,
        b.rent_price_per_week, b.deposit_amount, b.format, b.isbn, b.pages, b.in_stock, b.available_for_rent,
        b.publish_year, b.rating, b.curator_quote, b.description, now, now
      ]
    );
  }

  // Insert Site Config
  const configs = [
    { key: 'heroBadge', val: 'บริการยืม-อ่านหนังสือส่งถึงบ้าน · อ่านแล้วใจฟู' },
    { key: 'heroHeading', val: 'ช่วงเวลาที่ผ่อนคลายที่สุด มักเริ่มต้นด้วยหนังสือเล่มโปรด' },
    { key: 'heroSubtitle', val: 'ค้นพบวรรณกรรมคัดสรร บทความสร้างแรงบันดาลใจ และหนังสือฮีลใจ พร้อมบริการส่งตรงถึงบ้าน และส่งคืนง่ายดาย สร้างช่วงเวลาแห่งความสงบสุขุมให้แก่ชีวิตประจำวัน' },
    { key: 'heroQuote', val: '“หนังสือที่ดีจะพบกับผู้อ่านในเวลาที่เหมาะสมเสมอ”' },
    { key: 'heroBranchTag', val: 'จุดคืนหนังสือ 1 : สาขาอารีย์' },
    { key: 'announcementText', val: 'บริการยืม-อ่านหนังสือ จัดส่งถึงมือภายใน 7 วัน • คืนหนังสือได้ทุกสาขาที่ร่วมรายการ' },
    { key: 'contactPhone', val: '0952260122' },
    { key: 'curatorMotto', val: '“การอ่านไม่ได้พาเราหนีความจริง แต่สอนให้เราสบตากับชีวิตด้วยความเมตตา”' }
  ];

  for (const c of configs) {
    db.run(
      `INSERT OR REPLACE INTO site_config (config_key, config_value, updated_at, admin_id) VALUES (?, ?, ?, ?)`,
      [c.key, c.val, now, 'AD-8842']
    );
  }

  // Insert Initial Audit Logs
  const initialLogs = [
    {
      action: 'SYSTEM_BOOTSTRAP',
      targetType: 'SYSTEM',
      targetName: 'ฐานข้อมูล SQLite คลังหนังสือและประวัติเว็บ',
      details: 'สร้างฐานข้อมูล SQLite สำหรับบันทึกความเปลี่ยนแปลงของเว็บและคลังหนังสือ (bookstore.sqlite)',
      bookCount: 5,
      admin: 'AD-8842'
    },
    {
      action: 'INIT_INVENTORY',
      targetType: 'BOOK',
      targetName: 'คลังหนังสือเริ่มต้น',
      details: 'บันทึกยอดหนังสือในระบบเริ่มต้น 5 เล่ม (สต็อกขายรวม 59 เล่ม, โควตายืมรวม 19 เล่ม)',
      bookCount: 5,
      admin: 'AD-8842'
    },
    {
      action: 'INIT_HOMEPAGE',
      targetType: 'HOMEPAGE',
      targetName: 'แบนเนอร์และข้อมูลหน้าหลัก',
      details: 'ตั้งค่าข้อความต้อนรับ, คำคมบรรณาธิการ, จุดคืนหนังสือสาขาอารีย์ และเบอร์ติดต่อ 0952260122',
      bookCount: 5,
      admin: 'AD-8842'
    },
    {
      action: 'INIT_CATEGORIES',
      targetType: 'CATEGORY',
      targetName: 'หมวดหมู่หนังสือหลัก',
      details: 'กำหนดหมวดหมู่เริ่มต้น 5 หมวด: ฮีลใจ, วรรณกรรม, ปรัชญา, บทความ, นิยาย',
      bookCount: 5,
      admin: 'AD-8842'
    }
  ];

  for (const log of initialLogs) {
    db.run(
      `INSERT INTO site_audit_logs (action_type, target_type, target_name, details, total_books_count, admin_id, created_at, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.action, log.targetType, log.targetName, log.details, log.bookCount, log.admin, now, '203.144.144.89 (AD-8842)']
    );
  }

  // Export binary
  const binaryData = db.export();
  const buffer = Buffer.from(binaryData);

  // Write to root, public, and src/db
  fs.writeFileSync(path.join(__dirname, '../database.sqlite'), buffer);
  fs.writeFileSync(path.join(__dirname, '../public/database.sqlite'), buffer);
  
  if (!fs.existsSync(path.join(__dirname, '../src/db'))) {
    fs.mkdirSync(path.join(__dirname, '../src/db'), { recursive: true });
  }
  fs.writeFileSync(path.join(__dirname, '../src/db/database.sqlite'), buffer);

  console.log('Successfully generated SQLite file!');
  console.log('File sizes:', buffer.length, 'bytes');
}

generateDatabase().catch(err => {
  console.error('Error generating SQLite database:', err);
  process.exit(1);
});
