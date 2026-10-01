import React, { useState } from 'react';
import { 
  INITIAL_BOOKS, 
  INITIAL_BORROWED_BOOKS, 
  INITIAL_CART_ITEMS, 
  Book, 
  BorrowedBook, 
  CartItem 
} from './data/books';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminGatewayModal } from './components/AdminGatewayModal';
import { MemberAuthModal } from './components/MemberAuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BookFormModal } from './components/BookFormModal';
import { RentBorrowTrackerModal } from './components/RentBorrowTrackerModal';
import { BorrowingGuideModal } from './components/BorrowingGuideModal';
import { UserAccountModal } from './components/UserAccountModal';
import { 
  HomepageConfig, 
  SiteCategory, 
  INITIAL_HOMEPAGE_CONFIG, 
  INITIAL_CATEGORIES 
} from './data/siteConfig';
import { sqliteService } from './db/sqliteService';
import { realtimeBooksService } from './services/realtimeBooksService';
import heroBookstore from './assets/images/hero_bookstore_curation_1790332831900.jpg';
import { 
  Search, 
  BookHeart, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MapPin, 
  BookOpen, 
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Lock,
  User,
  Plus
} from 'lucide-react';

const getInitialBooks = (): Book[] => {
  try {
    const deletedIdsStr = localStorage.getItem('bookstore_deleted_book_ids');
    const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];

    const saved = localStorage.getItem('bookstore_active_books');
    if (saved) {
      const parsed: Book[] = JSON.parse(saved);
      // Ensure no deleted book is ever present
      return parsed.filter((b) => !deletedIds.includes(b.id));
    }
    return INITIAL_BOOKS.filter((b) => !deletedIds.includes(b.id));
  } catch (e) {
    console.error('Failed to load initial books:', e);
    return INITIAL_BOOKS;
  }
};

const getInitialHomepageConfig = (): HomepageConfig => {
  try {
    const saved = localStorage.getItem('bookstore_homepage_config');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_HOMEPAGE_CONFIG;
};

const getInitialCategories = (): SiteCategory[] => {
  try {
    const saved = localStorage.getItem('bookstore_categories');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_CATEGORIES;
};

const getInitialBorrowedBooks = (): BorrowedBook[] => {
  try {
    const saved = localStorage.getItem('bookstore_borrowed_books');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_BORROWED_BOOKS;
};

const getInitialMemberUser = () => {
  try {
    const saved = localStorage.getItem('bookstore_member_user');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

export default function App() {
  // Books & circulation state
  const [books, setBooks] = useState<Book[]>(getInitialBooks);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>(getInitialBorrowedBooks);
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

  // Member Authentication state (defaults to null for Guest Reader)
  const [memberUser, setMemberUser] = useState<{
    name: string;
    email: string;
    phone?: string;
    avatarText: string;
    tier: string;
  } | null>(getInitialMemberUser);
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);

  // Admin Gateway & Dashboard state
  const [isAdminGatewayOpen, setIsAdminGatewayOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState({ id: 'AD-8842', email: 'staff.naiin@admin.com' });

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRentTrackerOpen, setIsRentTrackerOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Global Book Edit / Upload Modal
  const [isGlobalBookModalOpen, setIsGlobalBookModalOpen] = useState(false);
  const [bookToEditGlobal, setBookToEditGlobal] = useState<Book | null>(null);

  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'rentals' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Site Settings & Categories
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(getInitialHomepageConfig);
  const [categories, setCategories] = useState<SiteCategory[]>(getInitialCategories);

  const handleUpdateBooks = (newBooks: Book[]) => {
    const deletedIds = sqliteService.getDeletedBookIds();
    const cleanBooks = newBooks.filter((b) => !deletedIds.includes(b.id));
    setBooks(cleanBooks);
    try {
      localStorage.setItem('bookstore_active_books', JSON.stringify(cleanBooks));
    } catch (e) {
      console.warn('LocalStorage save books failed:', e);
    }
  };

  const handleUpdateHomepageConfig = (config: HomepageConfig) => {
    setHomepageConfig(config);
    try {
      localStorage.setItem('bookstore_homepage_config', JSON.stringify(config));
    } catch {}
  };

  const handleUpdateCategories = (cats: SiteCategory[]) => {
    setCategories(cats);
    try {
      localStorage.setItem('bookstore_categories', JSON.stringify(cats));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync and Real-Time Event Subscription
  React.useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch from server to get latest books & files
    const fetchLatestServerBooks = async () => {
      try {
        const remoteData = await realtimeBooksService.fetchServerBooks();
        if (isMounted && remoteData && Array.isArray(remoteData.books) && remoteData.books.length > 0) {
          const deletedIds = sqliteService.getDeletedBookIds();
          const cleanBooks = remoteData.books.filter((b) => !deletedIds.includes(b.id));
          setBooks(cleanBooks);
          try {
            localStorage.setItem('bookstore_active_books', JSON.stringify(cleanBooks));
          } catch {}
          sqliteService.syncBooks(cleanBooks);
        }
      } catch (err) {
        console.warn('Initial server books fetch failed:', err);
      }
    };

    fetchLatestServerBooks();

    // 2. Real-Time Subscription (SSE from server & cross-tab BroadcastChannel)
    const unsubscribe = realtimeBooksService.subscribe((event) => {
      if (!isMounted) return;

      if (event.type === 'book_added' && event.book) {
        const addedBook = event.book;
        setBooks((prev) => {
          if (prev.some((b) => b.id === addedBook.id)) return prev;
          const updated = [addedBook, ...prev];
          try {
            localStorage.setItem('bookstore_active_books', JSON.stringify(updated));
          } catch {}
          sqliteService.syncBooks(updated);
          return updated;
        });
        showToast(`หนังสือใหม่ถูกเพิ่มเข้าระบบแบบ Real-time: "${addedBook.title}"`);
      } else if (event.type === 'book_updated' && event.book) {
        const updatedBook = event.book;
        setBooks((prev) => {
          const updated = prev.map((b) => (b.id === updatedBook.id ? updatedBook : b));
          try {
            localStorage.setItem('bookstore_active_books', JSON.stringify(updated));
          } catch {}
          sqliteService.syncBooks(updated);
          return updated;
        });
        showToast(`อัปเดตข้อมูลหนังสือแบบ Real-time: "${updatedBook.title}"`);
      } else if (event.type === 'book_deleted' && event.id) {
        const deletedId = event.id;
        const deletedTitle = event.book?.title;
        setBooks((prev) => {
          const updated = prev.filter((b) => b.id !== deletedId);
          try {
            localStorage.setItem('bookstore_active_books', JSON.stringify(updated));
          } catch {}
          sqliteService.syncBooks(updated);
          return updated;
        });
        showToast(`หนังสือถูกลบออกจากระบบแบบ Real-time${deletedTitle ? `: "${deletedTitle}"` : ''}`);
      } else if (event.type === 'book_restored' && event.book) {
        const restoredBook = event.book;
        setBooks((prev) => {
          if (prev.some((b) => b.id === restoredBook.id)) return prev;
          const updated = [restoredBook, ...prev];
          try {
            localStorage.setItem('bookstore_active_books', JSON.stringify(updated));
          } catch {}
          sqliteService.syncBooks(updated);
          return updated;
        });
        showToast(`กู้คืนหนังสือเข้าสู่ระบบแบบ Real-time: "${restoredBook.title}"`);
      } else if (event.type === 'sync' && event.books) {
        setBooks(event.books);
        try {
          localStorage.setItem('bookstore_active_books', JSON.stringify(event.books));
        } catch {}
        sqliteService.syncBooks(event.books);
      }
    });

    // 3. Initial sync of categories and homepage config to SQLite
    sqliteService.syncCategories(categories, books);
    sqliteService.syncHomepageConfig(homepageConfig);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (book: Book, type: 'buy' | 'rent', weeks: number = 2) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.book.id === book.id && item.type === type && (type === 'buy' || item.weeks === weeks)
    );

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        book,
        type,
        weeks: type === 'rent' ? weeks : undefined,
        quantity: 1,
      };
      setCartItems([...cartItems, newItem]);
    }

    showToast(
      type === 'rent' 
        ? `เพิ่ม "${book.title}" เข้ารายการยืม (${weeks} สัปดาห์) ในตะกร้าแล้ว` 
        : `เพิ่ม "${book.title}" ลงในตะกร้าสั่งซื้อแล้ว`
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    setCartItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Borrowed books persistence
  const handleUpdateBorrowedBooks = (newBorrowed: BorrowedBook[]) => {
    setBorrowedBooks(newBorrowed);
    try {
      localStorage.setItem('bookstore_borrowed_books', JSON.stringify(newBorrowed));
    } catch {}
  };

  // Return book operation
  const handleReturnBook = (borrowId: string) => {
    const updated = borrowedBooks.map((item) => {
      if (item.id === borrowId) {
        return { ...item, status: 'returned' as const, daysRemaining: 0 };
      }
      return item;
    });
    handleUpdateBorrowedBooks(updated);
  };

  // Checkout handler (supports both Guest and Member)
  const handleCheckoutSuccess = (
    customer: { name: string; phone: string; address: string; email: string },
    rentedItems: CartItem[]
  ) => {
    if (rentedItems.length > 0) {
      const nowStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      const newBorrowedList: BorrowedBook[] = rentedItems.map((item, idx) => {
        const weeks = item.weeks || 2;
        const due = new Date();
        due.setDate(due.getDate() + weeks * 7);
        const dueStr = due.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

        return {
          id: `BORROW-${Date.now()}-${idx}`,
          bookId: item.book.id,
          bookTitle: item.book.title,
          bookAuthor: item.book.author,
          coverImage: item.book.coverImage,
          borrowDate: nowStr,
          dueDate: dueStr,
          daysRemaining: weeks * 7,
          depositPaid: item.book.depositAmount * item.quantity,
          rentFee: item.book.rentPricePerWeek * weeks * item.quantity,
          status: 'active',
          branchName: 'สาขาอ่านแล้วใจฟู อารีย์ (จุดคืน 1)',
        };
      });

      const updatedBorrowed = [...newBorrowedList, ...borrowedBooks];
      handleUpdateBorrowedBooks(updatedBorrowed);

      sqliteService.logAuditAction({
        actionType: 'CIRCULATION_BORROW',
        targetType: 'CIRCULATION',
        targetName: customer.name,
        details: `สั่งซื้อ/เช่ายืมสำเร็จ (${memberUser ? 'สมาชิก' : 'บุคคลทั่วไป/Guest'}): ยืม ${rentedItems.length} เล่ม [${rentedItems.map(i => i.book.title).join(', ')}]`,
        totalBooksCount: books.length,
        adminId: 'SYSTEM_CHECKOUT'
      });

      showToast(`สั่งซื้อ/ยืมหนังสือสำเร็จ! บันทึกรายการยืม ${rentedItems.length} เล่มเข้าสู่ระบบติดตามของคุณเรียบร้อยแล้ว`);
    } else {
      sqliteService.logAuditAction({
        actionType: 'ORDER_BUY',
        targetType: 'CIRCULATION',
        targetName: customer.name,
        details: `สั่งซื้อหนังสือสำเร็จ (${memberUser ? 'สมาชิก' : 'บุคคลทั่วไป/Guest'}): จัดส่งถึง ${customer.address}`,
        totalBooksCount: books.length,
        adminId: 'SYSTEM_CHECKOUT'
      });

      showToast('สั่งซื้อหนังสือสำเร็จเรียบร้อย! พัสดุห่อผ้าฝ้ายจะจัดส่งถึงคุณภายใน 7 วัน');
    }
  };

  // Member login & logout handlers
  const handleMemberLoginSuccess = (user: { name: string; email: string; phone?: string; avatarText: string; tier: string }) => {
    setMemberUser(user);
    try {
      localStorage.setItem('bookstore_member_user', JSON.stringify(user));
    } catch {}
    setIsMemberAuthOpen(false);
    showToast(`ยินดีต้อนรับคุณ ${user.name} เข้าสู่ระบบสมาชิกเรียบร้อยแล้ว`);
  };

  const handleMemberLogout = () => {
    setMemberUser(null);
    try {
      localStorage.removeItem('bookstore_member_user');
    } catch {}
    showToast('ออกจากระบบสมาชิกแล้ว คุณกำลังใช้งานในฐานะบุคคลทั่วไป (ยังคงเช่าหรือซื้อได้ตามปกติ)');
  };

  // Global Book Management Handlers
  const handleOpenAddGlobalBook = () => {
    setBookToEditGlobal(null);
    setIsGlobalBookModalOpen(true);
  };

  const handleOpenEditGlobalBook = (book: Book) => {
    setBookToEditGlobal(book);
    setIsGlobalBookModalOpen(true);
  };

  const handleSaveGlobalBook = async (savedBook: Book, isNew: boolean) => {
    if (isNew) {
      const newBooks = [savedBook, ...books];
      handleUpdateBooks(newBooks);
      sqliteService.syncBooks(newBooks);
      sqliteService.syncCategories(categories, newBooks);
      sqliteService.logAuditAction({
        actionType: 'UPLOAD_BOOK',
        targetType: 'BOOK',
        targetName: savedBook.title,
        details: `อัปโหลดหนังสือใหม่สู่เว็บไซต์: ราคา ฿${savedBook.buyPrice}, สต็อก ${savedBook.inStock} เล่ม`,
        totalBooksCount: newBooks.length,
        adminId: adminUser.id
      });
      // Sync to Realtime Server & broadcast to all visitors
      await realtimeBooksService.addBook(savedBook);
      showToast(`อัปโหลดและเพิ่มหนังสือ "${savedBook.title}" เข้าสู่เว็บไซต์เรียบร้อยแล้ว`);
    } else {
      const updated = books.map((b) => (b.id === savedBook.id ? savedBook : b));
      handleUpdateBooks(updated);
      sqliteService.syncBooks(updated);
      sqliteService.syncCategories(categories, updated);
      sqliteService.logAuditAction({
        actionType: 'EDIT_BOOK',
        targetType: 'BOOK',
        targetName: savedBook.title,
        details: `แก้ไขข้อมูลหนังสือ: ราคา ฿${savedBook.buyPrice}, ค่ายืม ฿${savedBook.rentPricePerWeek}`,
        totalBooksCount: books.length,
        adminId: adminUser.id
      });
      // Sync to Realtime Server & broadcast to all visitors
      await realtimeBooksService.updateBook(savedBook);
      showToast(`บันทึกการแก้ไขข้อมูลหนังสือ "${savedBook.title}" เรียบร้อยแล้ว`);
    }
  };

  const handleDeleteGlobalBook = async (bookId: string) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    // 1. Permanently record and archive deleted book data in SQLite & LocalStorage
    await sqliteService.recordDeletedBook(targetBook, adminUser.id, 'ลบออกจากระบบโดยผู้ดูแล');

    // 2. Remove from active books
    const updated = books.filter((b) => b.id !== bookId);
    handleUpdateBooks(updated);
    await sqliteService.syncBooks(updated);
    await sqliteService.syncCategories(categories, updated);

    // 3. Realtime server sync & broadcast to all visitors
    await realtimeBooksService.deleteBook(bookId);

    // 4. Log audit action in SQLite
    await sqliteService.logAuditAction({
      actionType: 'DELETE_BOOK',
      targetType: 'BOOK',
      targetName: targetBook.title,
      details: `ลบหนังสือ "${targetBook.title}" (ISBN: ${targetBook.isbn}, ราคา ฿${targetBook.buyPrice}) ออกจากคลังถาวร - บันทึกเข้า deleted_books (คงเหลือ ${updated.length} เล่ม)`,
      totalBooksCount: updated.length,
      adminId: adminUser.id
    });

    showToast(`ลบหนังสือ "${targetBook.title}" ออกจากระบบและเซฟประวัติเรียบร้อยแล้ว (จะไม่ถูกดึงกลับมาอีก)`);
  };

  // Admin login handlers
  const handleAdminLoginSuccess = (credentials: { id: string; email: string }) => {
    setAdminUser(credentials);
    setIsAdminLoggedIn(true);
    setIsAdminGatewayOpen(false);
    showToast('เข้าสู่ระบบผู้ดูแลระบบ Naiin Backoffice สำเร็จ');
  };

  // Filter books based on category and search
  const filteredBooks = books.filter((b) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      b.category === selectedCategory ||
      categories.find((c) => c.slug === selectedCategory)?.name === b.category;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.translator && b.translator.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate cart total count
  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If Admin is logged in and viewing the dashboard
  if (isAdminLoggedIn) {
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={() => setIsAdminLoggedIn(false)}
        onReturnToStore={() => setIsAdminLoggedIn(false)}
        books={books}
        borrowedBooks={borrowedBooks}
        onUpdateBorrowedBooks={setBorrowedBooks}
        onUpdateBooks={handleUpdateBooks}
        homepageConfig={homepageConfig}
        onUpdateHomepageConfig={handleUpdateHomepageConfig}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#211a18] flex flex-col font-editorial-sans selection:bg-[#fdcaac] selection:text-[#79533c]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211a18] text-[#fff8f6] px-4 py-3 rounded shadow-xl text-xs sm:text-sm flex items-center gap-2 border border-[#dac1b8] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#fdcaac]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar matching Image 7 */}
      <Navbar
        cartCount={cartTotalCount}
        memberUser={memberUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdminGateway={() => setIsAdminGatewayOpen(true)}
        onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
        onOpenRentTracker={() => setIsRentTrackerOpen(true)}
        onOpenCatalog={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenShop={() => {
          setCurrentView('shop');
          setSelectedCategory('all');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenUserModal={() => {
          setIsUserModalOpen(true);
        }}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        currentView={currentView}
      />

      {/* Hero Section: Warm Editorial Split-Screen Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff8f6] via-[#f9ebe7]/60 to-[#fff8f6] border-b border-[#dac1b8]/70 pt-8 sm:pt-14 pb-12 sm:pb-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left Column: Brand Statement & Primary Action */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs text-[#7c563f] bg-white px-3 py-1 rounded border border-[#dac1b8]">
                <Sparkles className="w-3.5 h-3.5 text-[#914724]" />
                <span className="font-medium">
                  {homepageConfig.heroBadge}
                </span>
              </div>

              <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#211a18] tracking-tight leading-[1.15]">
                {homepageConfig.heroHeading}
              </h1>

              <p className="text-sm sm:text-base text-[#54433c] leading-relaxed max-w-xl whitespace-pre-line">
                {homepageConfig.heroSubtitle}
              </p>

              {/* Key Trust Signals */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[#dac1b8]/60 text-xs text-[#54433c]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#914724] shrink-0" />
                  <span>ส่งถึงบ้านใน 7 วัน</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#914724] shrink-0" />
                  <span>คืนได้ทุกสาขา</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#914724] shrink-0" />
                  <span>คืนมัดจำใน 24 ชม.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Atmosphere */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xs overflow-hidden shadow-editorial-lift border border-[#dac1b8] bg-[#f5f0eb]">
                <img
                  src={heroBookstore}
                  alt="ร้านหนังสืออ่านแล้วใจฟู บรรยากาศเงียบสงบ"
                  className="w-full aspect-[4/3] sm:aspect-[16/10] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211a18]/70 via-transparent to-transparent flex items-end p-5 text-white">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#fdcaac] font-medium">
                      จุดคืนหนังสือ 1 : สาขาอารีย์
                    </div>
                    <div className="font-editorial-serif text-sm sm:text-base font-medium mt-0.5">
                      “หนังสือที่ดีจะพบกับผู้อ่านในเวลาที่เหมาะสมเสมอ”
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Stacks Section */}
      <section id="catalog-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#dac1b8]">
          <div>
            <div className="text-xs text-[#7c563f] font-medium uppercase tracking-wider mb-1">
              Curated Book Stacks
            </div>
            <h2 className="font-editorial-serif text-2xl sm:text-3xl font-semibold text-[#211a18]">
              คลังหนังสือและวรรณกรรมคัดสรร
            </h2>
            <p className="text-xs sm:text-sm text-[#54433c] mt-1">
              เลือกอ่านได้ทั้งบริการยืมรายสัปดาห์ หรือสั่งซื้อเป็นเจ้าของหนังสือเล่มโปรด
            </p>
          </div>

          {/* Search Box & Quick Upload */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="ค้นหาชื่อหนังสือ, นักเขียน, ผู้แปล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
              />
              <Search className="w-4 h-4 text-[#87736b] absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-[#87736b] hover:text-[#211a18]"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 text-xs font-medium text-[#54433c] scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#211a18] text-[#fff8f6]'
                : 'bg-[#f5f0eb] hover:bg-[#ede0dc] text-[#54433c]'
            }`}
          >
            ทั้งหมด ({books.length})
          </button>
          <button
            onClick={() => setSelectedCategory('healing')}
            className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'healing'
                ? 'bg-[#211a18] text-[#fff8f6]'
                : 'bg-[#f5f0eb] hover:bg-[#ede0dc] text-[#54433c]'
            }`}
          >
            จิตวิทยา & ฮีลใจ
          </button>
          <button
            onClick={() => setSelectedCategory('literature')}
            className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'literature'
                ? 'bg-[#211a18] text-[#fff8f6]'
                : 'bg-[#f5f0eb] hover:bg-[#ede0dc] text-[#54433c]'
            }`}
          >
            วรรณกรรมแปลร่วมสมัย
          </button>
          <button
            onClick={() => setSelectedCategory('philosophy')}
            className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'philosophy'
                ? 'bg-[#211a18] text-[#fff8f6]'
                : 'bg-[#f5f0eb] hover:bg-[#ede0dc] text-[#54433c]'
            }`}
          >
            ปรัชญา & วะบิ-ซะบิ
          </button>
          <button
            onClick={() => setSelectedCategory('fiction')}
            className={`px-3.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'fiction'
                ? 'bg-[#211a18] text-[#fff8f6]'
                : 'bg-[#f5f0eb] hover:bg-[#ede0dc] text-[#54433c]'
            }`}
          >
            นิยายแปลอบอุ่น
          </button>
        </div>

        {/* Book Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-[#f9ebe7] rounded border border-[#dac1b8] mt-4">
            <BookOpen className="w-12 h-12 mx-auto text-[#7c563f] opacity-50 mb-2" />
            <h3 className="font-editorial-serif text-base font-semibold text-[#211a18]">
              ไม่พบหนังสือที่ตรงกับคำค้นหา
            </h3>
            <p className="text-xs text-[#54433c] mt-1">
              ลองค้นหาด้วยคำอื่นๆ หรือเลือกดูหมวดหนังสือทั้งหมด
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 bg-[#914724] text-white text-xs font-medium rounded"
            >
              แสดงหนังสือทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pt-2">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => setSelectedBook(b)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* Curated Editorial Callout: How Borrowing Works */}
      <section className="bg-[#f9ebe7] border-y border-[#dac1b8] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs text-[#7c563f] font-medium uppercase tracking-wider">
              Boutique Book Circulation
            </div>
            <h2 className="font-editorial-serif text-2xl sm:text-3xl font-semibold text-[#211a18] mt-1">
              บริการยืม-อ่านหนังสือ เพื่อประสบการณ์ที่เบาสบาย
            </h2>
            <p className="text-xs sm:text-sm text-[#54433c] mt-1.5 leading-relaxed">
              ไม่ต้องกังวลเรื่องที่เก็บหนังสือในบ้าน อ่านจบแล้วส่งคืนเพื่อส่งต่อพลังใจให้ผู้อื่นต่อไป
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded border border-[#dac1b8] shadow-editorial-card space-y-3">
              <div className="w-10 h-10 rounded bg-[#fff1ed] flex items-center justify-center text-[#914724]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial-serif text-base font-semibold text-[#211a18]">
                จัดส่งถึงมือภายใน 7 วัน
              </h3>
              <p className="text-xs text-[#54433c] leading-relaxed">
                หนังสือทุกเล่มถูกทำความสะอาดและห่อด้วยซองผ้าฝ้ายกันเปื้อน จัดส่งตรงถึงหน้าประตูบ้านอย่างประณีต
              </p>
            </div>

            <div className="bg-white p-6 rounded border border-[#dac1b8] shadow-editorial-card space-y-3">
              <div className="w-10 h-10 rounded bg-[#fff1ed] flex items-center justify-center text-[#914724]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-editorial-serif text-base font-semibold text-[#211a18]">
                จุดคืนหนังสือ 1 & นัดรับที่บ้าน
              </h3>
              <p className="text-xs text-[#54433c] leading-relaxed">
                คืนง่ายที่ตู้ Drop Box สาขาอารีย์ได้ตลอด 24 ชั่วโมง หรือกดแจ้งผ่านระบบเพื่อให้พี่ไปรษณีย์มารับถึงหน้าบ้าน
              </p>
            </div>

            <div className="bg-white p-6 rounded border border-[#dac1b8] shadow-editorial-card space-y-3">
              <div className="w-10 h-10 rounded bg-[#fff1ed] flex items-center justify-center text-[#914724]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial-serif text-base font-semibold text-[#211a18]">
                คืนเงินมัดจำทันที 100%
              </h3>
              <p className="text-xs text-[#54433c] leading-relaxed">
                เมื่อหนังสือถึงสาขาและผ่านการตรวจรับ ระบบจะโอนเงินมัดจำคืนเข้าบัญชีของท่านโดยอัตโนมัติภายใน 24 ชม.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer matching screenshot layout */}
      <Footer
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenCatalogCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* --- ALL INTERACTIVE MODALS & PORTALS --- */}

      {/* 1. Admin Gateway Modal (Exact replica of Image 7) */}
      <AdminGatewayModal
        isOpen={isAdminGatewayOpen}
        onClose={() => setIsAdminGatewayOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        onSwitchToMemberLogin={() => {
          setIsAdminGatewayOpen(false);
          setIsMemberAuthOpen(true);
        }}
      />

      {/* 2. Member Authentication Modal (Separated General Member Login / Register) */}
      <MemberAuthModal
        isOpen={isMemberAuthOpen}
        onClose={() => setIsMemberAuthOpen(false)}
        onLoginSuccess={handleMemberLoginSuccess}
        onSwitchToAdmin={() => {
          setIsMemberAuthOpen(false);
          setIsAdminGatewayOpen(true);
        }}
      />

      {/* 3. Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={handleAddToCart}
        onEditBook={handleOpenEditGlobalBook}
      />

      {/* 4. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        memberUser={memberUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
        onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
      />

      {/* 5. Rent / Borrow Tracker Modal ("รายการเช่า/ยืมหนังสือ") */}
      <RentBorrowTrackerModal
        isOpen={isRentTrackerOpen}
        onClose={() => setIsRentTrackerOpen(false)}
        borrowedBooks={borrowedBooks}
        onReturnBook={handleReturnBook}
      />

      {/* 6. Borrowing Guide & Branch 1 Info */}
      <BorrowingGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* 7. User Account Modal ("กช" or Guest Reader) */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        activeBorrowedCount={borrowedBooks.filter((b) => b.status === 'active').length}
        memberUser={memberUser}
        onLogoutMember={handleMemberLogout}
        onOpenMemberAuth={() => {
          setIsUserModalOpen(false);
          setIsMemberAuthOpen(true);
        }}
      />

      {/* 8. Global Book Form Modal (Upload & Edit) */}
      <BookFormModal
        isOpen={isGlobalBookModalOpen}
        onClose={() => setIsGlobalBookModalOpen(false)}
        onSaveBook={handleSaveGlobalBook}
        onDeleteBook={handleDeleteGlobalBook}
        bookToEdit={bookToEditGlobal}
      />
    </div>
  );
}
