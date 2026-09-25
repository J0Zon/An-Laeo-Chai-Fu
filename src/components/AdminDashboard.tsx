import React, { useState } from 'react';
import { 
  BookOpen, 
  Package, 
  RotateCcw, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  LogOut, 
  Search, 
  Check, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Barcode, 
  Plus, 
  Send,
  Building,
  RefreshCw,
  TrendingUp,
  Lock,
  Edit,
  Trash2,
  UploadCloud,
  Filter,
  Database,
  Layout,
  Compass
} from 'lucide-react';
import { Book, BorrowedBook } from '../data/books';
import { HomepageConfig, SiteCategory } from '../data/siteConfig';
import { BookFormModal } from './BookFormModal';
import { AdminHomepageManager } from './AdminHomepageManager';
import { AdminSqliteManager } from './AdminSqliteManager';
import { sqliteService } from '../db/sqliteService';

interface AdminDashboardProps {
  adminUser: { id: string; email: string };
  onLogout: () => void;
  onReturnToStore: () => void;
  books: Book[];
  borrowedBooks: BorrowedBook[];
  onUpdateBorrowedBooks: (books: BorrowedBook[]) => void;
  onUpdateBooks: (books: Book[]) => void;
  homepageConfig: HomepageConfig;
  onUpdateHomepageConfig: (config: HomepageConfig) => void;
  categories: SiteCategory[];
  onUpdateCategories: (categories: SiteCategory[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onReturnToStore,
  books,
  borrowedBooks,
  onUpdateBorrowedBooks,
  onUpdateBooks,
  homepageConfig,
  onUpdateHomepageConfig,
  categories,
  onUpdateCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'homepage' | 'inventory' | 'rentals' | 'orders' | 'sqlite' | 'security'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Book management modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Orders sample data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-9021',
      customer: 'กานต์ชนก วรรณวิศิษฏ์',
      phone: '081-992-4819',
      items: 'ในความเงียบงัน... มีเสียงของหัวใจกระซิบเบาๆ (ยืม 2 สัปดาห์) + สถาปัตยกรรมแห่งความสงบในใจคุณ (ซื้อ)',
      total: 445,
      deposit: 150,
      status: 'จัดส่งแล้ว',
      date: 'วันนี้, 10:24 น.',
      tracking: 'TH-EX2899401'
    },
    {
      id: 'ORD-9020',
      customer: 'ภัทรดนัย ศรีสุข',
      phone: '089-112-9844',
      items: 'ปรัชญาใบไม้ร่วงและศิลปะแห่งการเริ่มต้นใหม่ (ซื้อเล่มพิมพ์พิเศษ)',
      total: 315,
      deposit: 0,
      status: 'กำลังจัดเตรียม',
      date: 'วันนี้, 09:12 น.',
      tracking: '-'
    },
    {
      id: 'ORD-9019',
      customer: 'วรินทร จินตการ',
      phone: '062-884-1029',
      items: 'จังหวะก้าวสั้นๆ ของวันแสนธรรมดา (ยืม 1 สัปดาห์)',
      total: 185,
      deposit: 150,
      status: 'จัดส่งแล้ว',
      date: 'เมื่อวาน, 16:40 น.',
      tracking: 'TH-EX2899388'
    }
  ]);

  // Security audit log
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'LOG-8842-1',
      time: '25 ก.ย. 2026, 03:38 น.',
      event: 'เจ้าหน้าที่ AD-8842 เข้าสู่ระบบสำเร็จ ผ่านการยืนยัน 2FA',
      ip: '203.144.144.89 (BKK-TH)',
      status: 'SUCCESS'
    },
    {
      id: 'LOG-8842-2',
      time: '25 ก.ย. 2026, 03:15 น.',
      event: 'ระบบสำรองข้อมูลอัตโนมัติ Database Snapshot (Daily Nightly)',
      ip: '10.0.4.12 (Internal Service)',
      status: 'SYSTEM'
    },
    {
      id: 'LOG-8842-3',
      time: '24 ก.ย. 2026, 17:30 น.',
      event: 'สิ้นสุดช่วงบำรุงรักษาประจำวัน (Maintenance Window Complete)',
      ip: '10.0.1.5 (Naiin Gateway)',
      status: 'SYSTEM'
    },
    {
      id: 'LOG-8842-4',
      time: '24 ก.ย. 2026, 14:12 น.',
      event: 'อนุมัติการคืนเงินมัดจำหนังสือให้สมาชิก บันทึกธุรกรรม ฿150.00',
      ip: '203.144.144.89 (AD-8842)',
      status: 'ACTION'
    }
  ]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleProcessReturn = (borrowId: string, bookTitle: string, deposit: number) => {
    const updated = borrowedBooks.map(item => {
      if (item.id === borrowId) {
        return { ...item, status: 'returned' as const, daysRemaining: 0 };
      }
      return item;
    });
    onUpdateBorrowedBooks(updated);

    sqliteService.logAuditAction({
      actionType: 'RETURN_BOOK',
      targetType: 'RENTAL',
      targetName: bookTitle,
      details: `ตรวจรับคืนหนังสือและโอนคืนเงินมัดจำ ฿${deposit}`,
      totalBooksCount: books.length,
      adminId: adminUser.id
    });

    const newLog = {
      id: `LOG-${Date.now()}`,
      time: 'เมื่อสักครู่',
      event: `ตรวจรับคืนหนังสือ "${bookTitle}" สำเร็จ และโอนคืนเงินมัดจำ ฿${deposit}.00`,
      ip: '203.144.144.89 (AD-8842)',
      status: 'ACTION'
    };
    setAuditLogs([newLog, ...auditLogs]);

    showNotification(`รับคืนหนังสือ "${bookTitle}" เรียบร้อยแล้ว พร้อมคืนมัดจำ ฿${deposit}`);
  };

  const handleSendReminder = (customer: string, bookTitle: string) => {
    showNotification(`ส่งข้อความแจ้งเตือนกำหนดส่งคืนหนังสือ "${bookTitle}" ทาง SMS & LINE สำเร็จ`);
  };

  const handleExtendLoan = (borrowId: string) => {
    const updated = borrowedBooks.map(item => {
      if (item.id === borrowId) {
        return { ...item, daysRemaining: item.daysRemaining + 7 };
      }
      return item;
    });
    onUpdateBorrowedBooks(updated);
    showNotification(`ขยายระยะเวลายืมหนังสือเพิ่มอีก 7 วันเรียบร้อยแล้ว`);
  };

  const handleUpdateStock = (bookId: string, delta: number) => {
    let targetTitle = '';
    let newStock = 0;
    const updated = books.map(b => {
      if (b.id === bookId) {
        newStock = Math.max(0, b.inStock + delta);
        targetTitle = b.title;
        return { ...b, inStock: newStock };
      }
      return b;
    });
    onUpdateBooks(updated);

    sqliteService.logAuditAction({
      actionType: 'UPDATE_STOCK',
      targetType: 'BOOK',
      targetName: targetTitle || bookId,
      details: `ปรับยอดสต็อกขายเป็น ${newStock} เล่ม (${delta > 0 ? '+' : ''}${delta})`,
      totalBooksCount: books.length,
      adminId: adminUser.id
    });

    showNotification(`ปรับยอดสต็อกหนังสือเรียบร้อยแล้ว`);
  };

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (savedBook: Book, isNew: boolean) => {
    if (isNew) {
      const newBooks = [savedBook, ...books];
      onUpdateBooks(newBooks);
      sqliteService.syncBooks(newBooks);
      sqliteService.syncCategories(categories, newBooks);
      showNotification(`อัปโหลดและเพิ่มหนังสือ "${savedBook.title}" สู่คลังหนังสือเรียบร้อยแล้ว`);
      
      sqliteService.logAuditAction({
        actionType: 'UPLOAD_BOOK',
        targetType: 'BOOK',
        targetName: savedBook.title,
        details: `อัปโหลดหนังสือใหม่: ISBN ${savedBook.isbn}, ราคา ฿${savedBook.buyPrice}, สต็อก ${savedBook.inStock} เล่ม`,
        totalBooksCount: newBooks.length,
        adminId: adminUser.id
      });

      const newLog = {
        id: `LOG-${Date.now()}`,
        time: 'เมื่อสักครู่',
        event: `เจ้าหน้าที่ ${adminUser.id} อัปโหลดหนังสือใหม่เข้าสู่ระบบ: "${savedBook.title}" (ISBN: ${savedBook.isbn})`,
        ip: '203.144.144.89 (AD-8842)',
        status: 'ACTION'
      };
      setAuditLogs([newLog, ...auditLogs]);
    } else {
      const updated = books.map(b => b.id === savedBook.id ? savedBook : b);
      onUpdateBooks(updated);
      sqliteService.syncBooks(updated);
      sqliteService.syncCategories(categories, updated);
      showNotification(`บันทึกการแก้ไขหนังสือ "${savedBook.title}" สำเร็จแล้ว`);

      sqliteService.logAuditAction({
        actionType: 'EDIT_BOOK',
        targetType: 'BOOK',
        targetName: savedBook.title,
        details: `แก้ไขข้อมูลหนังสือ: ราคา ฿${savedBook.buyPrice}, ค่ายืม ฿${savedBook.rentPricePerWeek}/สัปดาห์, มัดจำ ฿${savedBook.depositAmount}`,
        totalBooksCount: books.length,
        adminId: adminUser.id
      });

      const newLog = {
        id: `LOG-${Date.now()}`,
        time: 'เมื่อสักครู่',
        event: `เจ้าหน้าที่ ${adminUser.id} แก้ไขข้อมูลหนังสือ: "${savedBook.title}"`,
        ip: '203.144.144.89 (AD-8842)',
        status: 'ACTION'
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    const targetBook = books.find(b => b.id === bookId);
    const updated = books.filter(b => b.id !== bookId);
    onUpdateBooks(updated);
    sqliteService.syncBooks(updated);
    sqliteService.syncCategories(categories, updated);
    showNotification(`ลบหนังสือ "${targetBook?.title || bookId}" ออกจากระบบแล้ว`);

    sqliteService.logAuditAction({
      actionType: 'DELETE_BOOK',
      targetType: 'BOOK',
      targetName: targetBook?.title || bookId,
      details: `ลบหนังสือออกจากคลัง (ยอดหนังสือเหลือ ${updated.length} เล่ม)`,
      totalBooksCount: updated.length,
      adminId: adminUser.id
    });

    const newLog = {
      id: `LOG-${Date.now()}`,
      time: 'เมื่อสักครู่',
      event: `เจ้าหน้าที่ ${adminUser.id} ทำการลบหนังสือออกจากคลัง: "${targetBook?.title || bookId}"`,
      ip: '203.144.144.89 (AD-8842)',
      status: 'ACTION'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSaveHomepageConfig = (config: HomepageConfig) => {
    onUpdateHomepageConfig(config);
    sqliteService.syncHomepageConfig(config, adminUser.id);
    sqliteService.logAuditAction({
      actionType: 'UPDATE_HOMEPAGE',
      targetType: 'HOMEPAGE',
      targetName: 'หน้าหลักและแบนเนอร์',
      details: `ปรับแต่งข้อความและรูปภาพหน้าหลัก (หัวข้อ: "${config.heroHeading.slice(0, 30)}...")`,
      totalBooksCount: books.length,
      adminId: adminUser.id
    });
    showNotification('บันทึกการตั้งค่าหน้าหลักและบันทึกลง SQLite เรียบร้อยแล้ว');
  };

  const handleSaveCategories = (cats: SiteCategory[]) => {
    onUpdateCategories(cats);
    sqliteService.syncCategories(cats, books);
    sqliteService.logAuditAction({
      actionType: 'UPDATE_CATEGORIES',
      targetType: 'CATEGORY',
      targetName: 'หมวดหมู่หนังสือ',
      details: `ปรับปรุงหมวดหมู่หนังสือในระบบ (รวม ${cats.length} หมวด)`,
      totalBooksCount: books.length,
      adminId: adminUser.id
    });
    showNotification('บันทึกการปรับปรุงหมวดหมู่และบันทึกลง SQLite เรียบร้อยแล้ว');
  };

  // Filter books for admin inventory
  const filteredInventoryBooks = books.filter(b => {
    const matchesCategory = inventoryCategory === 'all' || b.category === inventoryCategory;
    const matchesSearch = 
      b.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      b.author.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#211a18] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#f9ebe7] border-b border-[#dac1b8] px-4 sm:px-8 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#7c563f] hover:text-[#914724] bg-white px-2.5 py-1.5 rounded border border-[#dac1b8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าร้าน</span>
            </button>
            <div className="h-4 w-px bg-[#dac1b8]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base font-editorial-serif text-[#211a18]">
                  NAIIN BACKOFFICE & ADMIN SUITE
                </span>
                <span className="text-[10px] bg-[#914724] text-white px-1.5 py-0.5 rounded font-mono">
                  PROD v4.8
                </span>
              </div>
              <p className="text-[11px] text-[#54433c]">
                สาขาหลัก: อ่านแล้วใจฟู อารีย์ (จุดคืนหนังสือ 1)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-[#211a18]">{adminUser.email}</div>
              <div className="text-[11px] text-[#7c563f] font-mono">Staff ID: {adminUser.id} · Level 4</div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs bg-[#f3e5e2] hover:bg-[#ede0dc] text-[#ba1a1a] px-3 py-1.5 rounded border border-[#dac1b8] transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-[#914724] text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#dac1b8] mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ภาพรวมระบบ (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'homepage'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>ปรับแต่งหน้าหลัก & หมวดหมู่</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังสินค้าและสาขา</span>
            <span className="text-[10px] bg-[#fff1ed] text-[#914724] px-1.5 py-0.2 rounded font-bold">
              {books.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'rentals'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>จัดการยืม-คืนหนังสือ</span>
            <span className="text-[10px] bg-[#fff1ed] text-[#914724] px-1.5 py-0.2 rounded font-bold">
              {borrowedBooks.filter(b => b.status === 'active').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>คำสั่งซื้อ & จัดส่ง</span>
            <span className="text-[10px] bg-[#fff1ed] text-[#914724] px-1.5 py-0.2 rounded font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sqlite')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'sqlite'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>ฐานข้อมูล SQLite & ประวัติ</span>
            <span className="text-[10px] bg-[#fff1ed] text-[#914724] px-1.5 py-0.2 rounded font-bold font-mono">
              .sqlite
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded transition-all whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#914724] text-white shadow-sm'
                : 'bg-white text-[#54433c] hover:bg-[#f9ebe7] border border-[#dac1b8]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Audit Log</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-[#dac1b8] shadow-editorial-card">
                <div className="text-xs text-[#54433c] font-medium">หนังสือที่ถูกยืมอยู่ในขณะนี้</div>
                <div className="text-2xl font-bold font-editorial-serif text-[#914724] mt-1 tabular-nums">
                  {borrowedBooks.filter(b => b.status === 'active').length} เล่ม
                </div>
                <div className="text-[11px] text-[#7c563f] mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>กำหนดคืนสัปดาห์นี้ 1 เล่ม</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-[#dac1b8] shadow-editorial-card">
                <div className="text-xs text-[#54433c] font-medium">คำสั่งซื้อรอดำเนินการ</div>
                <div className="text-2xl font-bold font-editorial-serif text-[#211a18] mt-1 tabular-nums">
                  3 ออร์เดอร์
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>จัดส่งภายในวันนี้ทั้งหมด</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-[#dac1b8] shadow-editorial-card">
                <div className="text-xs text-[#54433c] font-medium">ยอดเงินมัดจำถือครองในระบบ</div>
                <div className="text-2xl font-bold font-editorial-serif text-[#211a18] mt-1 tabular-nums">
                  ฿330.00
                </div>
                <div className="text-[11px] text-[#7c563f] mt-1">
                  พร้อมคืนทันทีเมื่อหนังสือถึงสาขา
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-[#dac1b8] shadow-editorial-card">
                <div className="text-xs text-[#54433c] font-medium">ความพร้อมของหนังสือในสต็อก</div>
                <div className="text-2xl font-bold font-editorial-serif text-emerald-700 mt-1 tabular-nums">
                  96.8%
                </div>
                <div className="text-[11px] text-[#7c563f] mt-1">
                  คลังสินค้าสาขาอารีย์
                </div>
              </div>
            </div>

            {/* Quick Action Station */}
            <div className="bg-[#f9ebe7] p-5 rounded border border-[#dac1b8]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#211a18] font-editorial-serif">
                    โต๊ะตรวจรับคืนหนังสือหน้าร้าน & สแกนบาร์โค้ด
                  </h3>
                  <p className="text-xs text-[#54433c]">
                    เจ้าหน้าที่สามารถรับหนังสือคืนจากลูกค้า ตรวจสอบสภาพ และกดยืนยันคืนมัดจำได้ทันที
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7c563f] bg-white px-2 py-1 rounded border border-[#dac1b8]">
                    จุดคืนหนังสือ 1: สาขาอารีย์
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {borrowedBooks.map((borrow) => (
                  <div key={borrow.id} className="bg-white p-3.5 rounded border border-[#dac1b8] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={borrow.coverImage} 
                        alt={borrow.bookTitle} 
                        className="w-12 h-16 object-cover rounded shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#211a18] line-clamp-1">
                          {borrow.bookTitle}
                        </div>
                        <div className="text-[11px] text-[#54433c]">
                          ผู้ยืม: คุณกานต์ชนก · มัดจำ: ฿{borrow.depositPaid}
                        </div>
                        <div className="text-[11px] text-[#7c563f] mt-0.5">
                          {borrow.status === 'returned' ? (
                            <span className="text-emerald-700 font-medium">คืนแล้วเมื่อสักครู่</span>
                          ) : (
                            <span>กำหนดคืน: {borrow.dueDate} ({borrow.daysRemaining} วันคงเหลือ)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {borrow.status === 'returned' ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                          รับคืนสำเร็จ
                        </span>
                      ) : (
                        <button
                          onClick={() => handleProcessReturn(borrow.id, borrow.bookTitle, borrow.depositPaid)}
                          className="text-xs bg-[#914724] hover:bg-[#793a1c] text-white px-3 py-1.5 rounded transition-colors font-medium whitespace-nowrap cursor-pointer"
                        >
                          ตรวจรับคืน & คืนมัดจำ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Book Upload & Management Banner */}
            <div className="bg-white p-5 rounded border border-[#dac1b8] shadow-editorial-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-[#914724] text-white flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-editorial-serif font-semibold text-sm text-[#211a18]">
                    ระบบจัดการและอัปโหลดหนังสือใหม่สู่เว็บไซต์
                  </h4>
                  <p className="text-xs text-[#54433c] mt-0.5">
                    ปัจจุบันมีหนังสือเผยแพร่อยู่ในระบบทั้งหมด {books.length} เล่ม สามารถอัปโหลดหนังสือใหม่พร้อมรูปภาพ หรือแก้ไขข้อมูลเล่มเดิมได้ทันที
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-3 py-2 bg-white hover:bg-[#f9ebe7] border border-[#dac1b8] text-xs font-medium text-[#211a18] rounded transition-colors"
                >
                  ดูคลังหนังสือทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBook}
                  className="px-3.5 py-2 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ อัปโหลดหนังสือใหม่</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rentals & Returns */}
        {activeTab === 'rentals' && (
          <div className="bg-white rounded border border-[#dac1b8] overflow-hidden">
            <div className="p-4 border-b border-[#dac1b8] flex flex-wrap items-center justify-between gap-3 bg-[#f9ebe7]">
              <div>
                <h3 className="font-semibold text-sm font-editorial-serif text-[#211a18]">
                  รายการหนังสือยืม-คืนทั้งหมดในระบบ
                </h3>
                <p className="text-xs text-[#54433c]">
                  ติดตามสถานะ กำหนดส่งคืน และประวัติการโอนคืนเงินประกันมัดจำ
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหนังสือ / สมาชิก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724]"
                />
                <Search className="w-3.5 h-3.5 text-[#87736b] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f3e5e2] text-[#54433c] border-b border-[#dac1b8]">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">รหัส / เล่ม</th>
                    <th className="py-2.5 px-4 font-medium">ผู้ยืม / ติดต่อ</th>
                    <th className="py-2.5 px-4 font-medium">วันที่ยืม - กำหนดคืน</th>
                    <th className="py-2.5 px-4 font-medium">เงินมัดจำ</th>
                    <th className="py-2.5 px-4 font-medium">สถานะ</th>
                    <th className="py-2.5 px-4 font-medium text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dac1b8]/40">
                  {borrowedBooks.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-[#fff8f6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={borrow.coverImage} 
                            alt={borrow.bookTitle} 
                            className="w-8 h-11 object-cover rounded"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-semibold text-[#211a18]">{borrow.bookTitle}</div>
                            <div className="text-[11px] text-[#7c563f] font-mono">{borrow.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#211a18]">คุณกานต์ชนก วรรณวิศิษฏ์</div>
                        <div className="text-[11px] text-[#7c563f]">081-992-4819 (LINE ผูกไว้)</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{borrow.borrowDate} → {borrow.dueDate}</div>
                        <div className="text-[11px] text-[#7c563f]">
                          {borrow.status === 'returned' ? 'คืนตรงเวลา' : `คงเหลือ ${borrow.daysRemaining} วัน`}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#211a18] tabular-nums">
                        ฿{borrow.depositPaid}.00
                      </td>
                      <td className="py-3 px-4">
                        {borrow.status === 'returned' ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-medium">
                            คืนเรียบร้อยแล้ว
                          </span>
                        ) : borrow.daysRemaining <= 2 ? (
                          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[11px] font-medium">
                            ใกล้ถึงกำหนดส่ง
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-[#f9ebe7] text-[#914724] rounded text-[11px] font-medium">
                            กำลังยืมอ่าน
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {borrow.status !== 'returned' && (
                          <>
                            <button
                              onClick={() => handleSendReminder('คุณกานต์ชนก', borrow.bookTitle)}
                              className="px-2 py-1 bg-white hover:bg-[#f9ebe7] border border-[#dac1b8] text-[#54433c] rounded text-[11px] transition-colors"
                              title="ส่งแจ้งเตือน SMS/LINE"
                            >
                              เตือนส่งคืน
                            </button>
                            <button
                              onClick={() => handleExtendLoan(borrow.id)}
                              className="px-2 py-1 bg-white hover:bg-[#f9ebe7] border border-[#dac1b8] text-[#7c563f] rounded text-[11px] transition-colors"
                              title="ขยายเวลา 7 วัน"
                            >
                              +7 วัน
                            </button>
                            <button
                              onClick={() => handleProcessReturn(borrow.id, borrow.bookTitle, borrow.depositPaid)}
                              className="px-2.5 py-1 bg-[#914724] hover:bg-[#793a1c] text-white rounded text-[11px] transition-colors font-medium"
                            >
                              ตรวจรับคืน
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded border border-[#dac1b8] overflow-hidden">
            <div className="p-4 border-b border-[#dac1b8] bg-[#f9ebe7] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm font-editorial-serif text-[#211a18]">
                  คำสั่งซื้อประจำวัน (ขาย & บริการยืมส่งถึงบ้าน)
                </h3>
                <p className="text-xs text-[#54433c]">
                  จัดส่งถึงมือภายใน 7 วันด้วยกล่องพัสดุห่อผ้าฝ้ายและบับเบิลรักษ์โลก
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#dac1b8]/40">
              {orders.map((order) => (
                <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#fff8f6]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#914724]">{order.id}</span>
                      <span className="text-xs font-semibold text-[#211a18]">{order.customer}</span>
                      <span className="text-[11px] text-[#7c563f]">({order.phone})</span>
                      <span className="text-[11px] text-[#87736b]">· {order.date}</span>
                    </div>
                    <p className="text-xs text-[#54433c] mt-1">
                      {order.items}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#7c563f] mt-1">
                      <span>ยอดชำระรวม: ฿{order.total}</span>
                      {order.deposit > 0 && <span>(รวมมัดจำ ฿{order.deposit})</span>}
                      <span>Tracking: {order.tracking}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded bg-[#fff1ed] text-[#914724] font-medium border border-[#dac1b8]">
                      {order.status}
                    </span>
                    <button
                      onClick={() => showNotification(`พิมพ์ใบกำกับภาษี & ป้ายจัดส่งของ ${order.id} สำเร็จ`)}
                      className="text-xs px-2.5 py-1 bg-white hover:bg-[#f9ebe7] border border-[#dac1b8] text-[#211a18] rounded"
                    >
                      พิมพ์ป้ายพัสดุ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Inventory & Stock */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded border border-[#dac1b8] overflow-hidden space-y-0">
            {/* Header with Title and Add Button */}
            <div className="p-4 sm:p-5 border-b border-[#dac1b8] bg-[#f9ebe7] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#914724]" />
                  <h3 className="font-semibold text-base font-editorial-serif text-[#211a18]">
                    จัดการคลังหนังสือ & สต็อกสาขาอารีย์
                  </h3>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#dac1b8] text-[#7c563f]">
                    {books.length} เล่มในระบบ
                  </span>
                </div>
                <p className="text-xs text-[#54433c] mt-0.5">
                  แอดมินสามารถแก้ไขเนื้อหา ราคา อัตราค่ายืม เปลี่ยนรูปภาพหน้าปก หรืออัปโหลดหนังสือใหม่เข้าสู่เว็บไซต์
                </p>
              </div>

              {/* Add New Book Button */}
              <button
                type="button"
                onClick={handleOpenAddBook}
                className="py-2 px-3.5 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ อัปโหลด / เพิ่มหนังสือใหม่</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 sm:p-4 bg-[#fff8f6] border-b border-[#dac1b8]/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#7c563f] font-medium flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>หมวด:</span>
                </span>
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#dac1b8] rounded text-[#211a18] focus:outline-none focus:border-[#914724]"
                >
                  <option value="all">ทุกหมวดหมู่ ({books.length})</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724]"
                />
                <Search className="w-3.5 h-3.5 text-[#87736b] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Books List */}
            {filteredInventoryBooks.length === 0 ? (
              <div className="p-12 text-center text-[#87736b]">
                <BookOpen className="w-10 h-10 mx-auto opacity-40 mb-2" />
                <p className="font-medium text-xs">ไม่พบหนังสือที่ตรงกับเงื่อนไขการค้นหา</p>
                <button
                  type="button"
                  onClick={() => { setInventorySearch(''); setInventoryCategory('all'); }}
                  className="mt-2 text-xs text-[#914724] hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#dac1b8]/40">
                {filteredInventoryBooks.map((b) => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fff8f6] transition-colors">
                    {/* Book Information */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-16 rounded shadow-xs overflow-hidden book-spine-crease shrink-0 border border-[#dac1b8] bg-[#f5f0eb]">
                        <img 
                          src={b.coverImage} 
                          alt={b.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-[#f9ebe7] text-[#7c563f] px-1.5 py-0.2 rounded border border-[#dac1b8] font-medium">
                            {b.format}
                          </span>
                          <span className="text-[11px] text-[#87736b] font-mono">
                            ISBN: {b.isbn}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#211a18] line-clamp-1">
                          {b.title}
                        </h4>
                        <p className="text-xs text-[#7c563f]">
                          โดย {b.author} {b.translator && `· แปล: ${b.translator}`} · <span className="text-[#54433c]">{b.categoryLabel}</span>
                        </p>
                        <div className="text-[11px] text-[#54433c] flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="font-semibold text-[#914724]">
                            ราคาจำหน่าย: ฿{b.buyPrice} (เดิม ฿{b.originalPrice})
                          </span>
                          <span>·</span>
                          <span className="text-[#211a18]">
                            ค่ายืม: ฿{b.rentPricePerWeek}/สัปดาห์ (มัดจำ ฿{b.depositAmount})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Counters and Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-[#dac1b8]/40">
                      <div className="text-right">
                        <div className="font-medium text-[#211a18] tabular-nums">
                          สต็อกขาย: <span className="font-bold text-[#914724]">{b.inStock}</span> เล่ม
                        </div>
                        <div className="text-[11px] text-[#7c563f] tabular-nums">
                          พร้อมให้ยืม: {b.availableForRent} เล่ม
                        </div>
                      </div>

                      {/* Stock Quick Stepper */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(b.id, -1)}
                          className="w-6 h-6 rounded bg-[#f3e5e2] text-[#211a18] font-bold hover:bg-[#ede0dc] flex items-center justify-center border border-[#dac1b8]"
                          title="ลดยอดสต็อก"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(b.id, 1)}
                          className="w-6 h-6 rounded bg-[#914724] text-white font-bold hover:bg-[#793a1c] flex items-center justify-center"
                          title="เพิ่มยอดสต็อก"
                        >
                          +
                        </button>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-[#dac1b8]">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBook(b)}
                          className="px-2.5 py-1.5 bg-[#f9ebe7] hover:bg-[#f3e5e2] text-[#914724] border border-[#dac1b8] rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="แก้ไขข้อมูลหนังสือเล่มนี้"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBook(b.id)}
                          className="p-1.5 text-[#87736b] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="ลบหนังสือเล่มนี้ออกจากระบบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Security & Audit Trail */}
        {activeTab === 'security' && (
          <div className="bg-white rounded border border-[#dac1b8] overflow-hidden">
            <div className="p-4 border-b border-[#dac1b8] bg-[#f9ebe7] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#914724]" />
                  <h3 className="font-semibold text-sm font-editorial-serif text-[#211a18]">
                    ระบบบันทึกความมั่นคงปลอดภัย (256-Bit SSL IP Audit Trail)
                  </h3>
                </div>
                <p className="text-xs text-[#54433c] mt-0.5">
                  เป็นไปตาม พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ และมาตรฐานความปลอดภัยสารสนเทศ Naiin
                </p>
              </div>

              <span className="text-xs bg-[#ede0dc] text-[#54433c] px-2.5 py-1 rounded font-mono border border-[#dac1b8]">
                SSL: TLS_AES_256_GCM_SHA384
              </span>
            </div>

            <div className="p-4">
              <div className="space-y-3 font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#fff8f6] rounded border border-[#dac1b8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#87736b]">{log.time}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'ACTION' ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-800'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[#7c563f]">{log.id}</span>
                      </div>
                      <div className="text-[#211a18] mt-1 font-sans text-xs">
                        {log.event}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#87736b] sm:text-right shrink-0">
                      IP: {log.ip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Tab 6: Homepage & Category Customization */}
        {activeTab === 'homepage' && (
          <AdminHomepageManager
            homepageConfig={homepageConfig}
            onSaveHomepageConfig={handleSaveHomepageConfig}
            categories={categories}
            onSaveCategories={handleSaveCategories}
            books={books}
          />
        )}

        {/* Tab 7: SQLite Audit Database */}
        {activeTab === 'sqlite' && (
          <AdminSqliteManager
            books={books}
            adminId={adminUser.id}
          />
        )}
      </main>

      {/* Book Form Modal for Add / Edit */}
      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSaveBook={handleSaveBook}
        onDeleteBook={handleDeleteBook}
        bookToEdit={editingBook}
        categories={categories}
      />
    </div>
  );
};
