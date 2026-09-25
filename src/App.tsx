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
import { RentBorrowTrackerModal } from './components/RentBorrowTrackerModal';
import { BorrowingGuideModal } from './components/BorrowingGuideModal';
import { UserAccountModal } from './components/UserAccountModal';
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
  User
} from 'lucide-react';

export default function App() {
  // Books & circulation state
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>(INITIAL_BORROWED_BOOKS);
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

  // Member Authentication state
  const [memberUser, setMemberUser] = useState<{
    name: string;
    email: string;
    phone?: string;
    avatarText: string;
    tier: string;
  } | null>({
    name: 'กานต์ชนก วรรณวิศิษฏ์',
    email: 'kanchana.w@reader.co.th',
    phone: '081-992-4819',
    avatarText: 'กช',
    tier: 'สมาชิกคลับอ่านใจฟู VIP'
  });
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);

  // Admin Gateway & Dashboard state
  // Start with isAdminGatewayOpen: true to match Image 7.jpeg directly upon initial viewing
  const [isAdminGatewayOpen, setIsAdminGatewayOpen] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState({ id: 'AD-8842', email: 'staff.naiin@admin.com' });

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRentTrackerOpen, setIsRentTrackerOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'rentals' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  // Return book operation
  const handleReturnBook = (borrowId: string) => {
    const updated = borrowedBooks.map((item) => {
      if (item.id === borrowId) {
        return { ...item, status: 'returned' as const, daysRemaining: 0 };
      }
      return item;
    });
    setBorrowedBooks(updated);
  };

  // Member login & logout handlers
  const handleMemberLoginSuccess = (user: { name: string; email: string; phone?: string; avatarText: string; tier: string }) => {
    setMemberUser(user);
    setIsMemberAuthOpen(false);
    showToast(`ยินดีต้อนรับคุณ ${user.name} เข้าสู่ระบบสมาชิกเรียบร้อยแล้ว`);
  };

  const handleMemberLogout = () => {
    setMemberUser(null);
    showToast('ออกจากระบบสมาชิกเรียบร้อยแล้ว');
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
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
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
        onUpdateBooks={setBooks}
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
          if (memberUser) {
            setIsUserModalOpen(true);
          } else {
            setIsMemberAuthOpen(true);
          }
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
                  พื้นที่แห่งการอ่านอันสงบนิ่ง • จัดส่งถึงมือภายใน 7 วัน
                </span>
              </div>

              <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#211a18] tracking-tight leading-[1.15]">
                ให้ทุกหน้าหนังสือ <br className="hidden sm:inline" />
                <span className="text-[#914724]">อยู่เป็นเพื่อนใจของคุณ</span>
              </h1>

              <p className="text-sm sm:text-base text-[#54433c] leading-relaxed max-w-xl">
                อ่านแล้วใจฟู คัดสรรหนังสือฮีลใจ วรรณกรรมแปลร่วมสมัย และบทกวีปรัชญา 
                พร้อมบริการยืม-อ่านส่งถึงบ้าน คืนได้ที่จุดคืนหนังสือสาขาหรือเรียกรับพัสดุฟรี 
                สร้างช่วงเวลาแห่งความสงบสุขุมให้แก่ชีวิตประจำวัน
              </p>

              {/* Action Buttons: Clearly Separated Member vs Admin Login */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setCurrentView('catalog');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-xs sm:text-sm rounded transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>สำรวจคลังหนังสือ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMemberAuthOpen(true)}
                  className="px-4 py-2.5 bg-white hover:bg-[#f9ebe7] text-[#211a18] border border-[#dac1b8] text-xs sm:text-sm font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="เข้าสู่ระบบหรือสมัครสมาชิกสำหรับผู้อ่าน"
                >
                  <User className="w-3.5 h-3.5 text-[#914724]" />
                  <span>เข้าสู่ระบบสมาชิก</span>
                </button>

                <button
                  onClick={() => setIsAdminGatewayOpen(true)}
                  className="px-3.5 py-2.5 bg-[#f9ebe7] hover:bg-[#f3e5e2] text-[#7c563f] border border-[#dac1b8] text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="เข้าสู่ระบบผู้ดูแลระบบ (Naiin Backoffice & Admin Suite)"
                >
                  <Lock className="w-3.5 h-3.5 text-[#914724]" />
                  <span>เข้าสู่ระบบแอดมิน</span>
                </button>
              </div>

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
                  src="/src/assets/images/hero_bookstore_curation_1790332831900.jpg"
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

          {/* Search Box */}
          <div className="relative w-full md:w-72">
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
      />

      {/* 4. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
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

      {/* 7. User Account Modal ("กช") */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        activeBorrowedCount={borrowedBooks.filter((b) => b.status === 'active').length}
        memberUser={memberUser}
        onLogoutMember={handleMemberLogout}
      />
    </div>
  );
}
