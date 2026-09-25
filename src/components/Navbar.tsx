import React, { useState } from 'react';
import { 
  BookHeart, 
  ShoppingBag, 
  User, 
  Key, 
  BookOpen, 
  HelpCircle, 
  MapPin, 
  Phone, 
  Menu, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  memberUser: { name: string; email: string; avatarText: string; tier: string } | null;
  onOpenCart: () => void;
  onOpenAdminGateway: () => void;
  onOpenMemberAuth: () => void;
  onOpenRentTracker: () => void;
  onOpenCatalog: () => void;
  onOpenHome: () => void;
  onOpenShop: () => void;
  onOpenUserModal: () => void;
  onOpenGuideModal: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  memberUser,
  onOpenCart,
  onOpenAdminGateway,
  onOpenMemberAuth,
  onOpenRentTracker,
  onOpenCatalog,
  onOpenHome,
  onOpenShop,
  onOpenUserModal,
  onOpenGuideModal,
  currentView
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#fff8f6] border-b border-[#dac1b8] sticky top-0 z-40">
      {/* 1. Top Utility Bar (Exact match to screenshot) */}
      <div className="bg-[#f9ebe7] text-[11px] sm:text-xs text-[#54433c] border-b border-[#dac1b8]/70 px-4 sm:px-8 py-1.5 font-editorial-sans">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
          {/* Left Announcement */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#914724]" />
            <span className="font-normal text-[#211a18]">
              บริการยืม-อ่านหนังสือ จัดส่งถึงมือภายใน 7 วัน
            </span>
            <span className="hidden sm:inline text-[#87736b]">•</span>
            <span className="hidden sm:inline">คืนหนังสือได้ทุกสาขาที่ร่วมรายการ 1</span>
          </div>

          {/* Right Utility Links */}
          <div className="flex items-center gap-3 sm:gap-4 divide-x divide-[#dac1b8]">
            <button 
              onClick={onOpenGuideModal}
              className="hover:text-[#914724] transition-colors flex items-center gap-1 text-left"
            >
              <MapPin className="w-3 h-3 text-[#914724]" />
              <span>จุดคืนหนังสือ 1</span>
            </button>
            <button 
              onClick={onOpenGuideModal}
              className="pl-3 sm:pl-4 hover:text-[#914724] transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-[#7c563f]" />
              <span>คู่มือบริการยืม-คืน</span>
            </button>
            <a 
              href="tel:0952260122" 
              className="pl-3 sm:pl-4 hover:text-[#914724] transition-colors flex items-center gap-1 font-mono"
            >
              <Phone className="w-3 h-3 text-[#914724]" />
              <span>โทร 0952260122</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <button 
          onClick={onOpenHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded bg-[#f3e5e2] border border-[#dac1b8] flex items-center justify-center text-[#914724] group-hover:bg-[#af5f3a] group-hover:text-white transition-all">
            <BookHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-editorial-serif text-lg sm:text-xl font-bold tracking-tight text-[#211a18]">
              อ่านแล้วใจฟู
            </div>
            <div className="text-[10px] text-[#7c563f] tracking-wider uppercase font-medium">
              อ่านแล้วใจฟู
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#54433c]">
          <button 
            onClick={onOpenHome}
            className={`transition-colors hover:text-[#914724] relative py-1 ${
              currentView === 'home' ? 'text-[#914724] font-semibold' : ''
            }`}
          >
            <span>หน้าแรก</span>
            {currentView === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#914724] rounded-full" />
            )}
          </button>

          <button 
            onClick={onOpenCatalog}
            className={`transition-colors hover:text-[#914724] relative py-1 ${
              currentView === 'catalog' ? 'text-[#914724] font-semibold' : ''
            }`}
          >
            <span>คลังหนังสือ</span>
            {currentView === 'catalog' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#914724] rounded-full" />
            )}
          </button>

          <button 
            onClick={onOpenRentTracker}
            className={`transition-colors hover:text-[#914724] relative py-1 flex items-center gap-1.5 ${
              currentView === 'rentals' ? 'text-[#914724] font-semibold' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#914724]" />
            <span>รายการเช่า/ยืมหนังสือ</span>
            {currentView === 'rentals' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#914724] rounded-full" />
            )}
          </button>

          <button 
            onClick={onOpenShop}
            className={`transition-colors hover:text-[#914724] relative py-1 ${
              currentView === 'shop' ? 'text-[#914724] font-semibold' : ''
            }`}
          >
            <span>ขายหนังสือ/จัดจำหน่าย</span>
            {currentView === 'shop' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#914724] rounded-full" />
            )}
          </button>
        </nav>

        {/* Action Buttons Zone */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Admin Gateway Button (From screenshot) */}
          <button
            onClick={onOpenAdminGateway}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs bg-[#f9ebe7] hover:bg-[#f3e5e2] text-[#7c563f] hover:text-[#914724] px-2.5 sm:px-3 py-1.5 rounded border border-[#dac1b8] font-medium transition-colors cursor-pointer"
            title="เข้าสู่ระบบผู้ดูแลระบบ Naiin Backoffice (Admin Gateway)"
          >
            <Key className="w-3.5 h-3.5 text-[#914724]" />
            <span className="font-semibold">แอดมิน</span>
          </button>

          {/* User Sign in / Register OR Member Profile Name */}
          {memberUser ? (
            <button
              onClick={onOpenUserModal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white hover:bg-[#fff1ed] text-[#211a18] px-3 py-1.5 rounded border border-[#dac1b8] font-medium transition-colors"
              title="ดูโปรไฟล์และสิทธิ์สมาชิก"
            >
              <User className="w-3.5 h-3.5 text-[#914724]" />
              <span className="max-w-[120px] truncate">{memberUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenMemberAuth}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white hover:bg-[#fff1ed] text-[#211a18] px-3 py-1.5 rounded border border-[#dac1b8] font-medium transition-colors cursor-pointer"
              title="เข้าสู่ระบบสำหรับสมาชิกนักอ่าน"
            >
              <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
            </button>
          )}

          {/* Cart Icon with badge (matching 2 in screenshot) */}
          <button
            onClick={onOpenCart}
            type="button"
            className="relative p-2 text-[#211a18] hover:text-[#914724] hover:bg-[#f9ebe7] rounded border border-[#dac1b8] transition-colors"
            aria-label="เปิดตะกร้าสินค้า"
          >
            <ShoppingBag className="w-4 h-4 text-[#914724]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#914724] text-white text-[10px] font-bold flex items-center justify-center font-mono shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Avatar "กช" (From screenshot) */}
          <button
            onClick={onOpenUserModal}
            type="button"
            className="w-8 h-8 rounded-full bg-[#7c563f] hover:bg-[#914724] text-white text-xs font-semibold flex items-center justify-center border border-[#dac1b8] transition-colors shadow-xs cursor-pointer"
            title={`โปรไฟล์: ${memberUser ? memberUser.name : 'คุณกานต์ชนก (กช)'}`}
          >
            {memberUser ? memberUser.avatarText : 'กช'}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#54433c] hover:text-[#211a18] focus:outline-none"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fff8f6] border-b border-[#dac1b8] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <button 
            onClick={() => { onOpenHome(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded hover:bg-[#f9ebe7] text-[#211a18]"
          >
            หน้าแรก
          </button>
          <button 
            onClick={() => { onOpenCatalog(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded hover:bg-[#f9ebe7] text-[#211a18]"
          >
            คลังหนังสือ
          </button>
          <button 
            onClick={() => { onOpenRentTracker(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded hover:bg-[#f9ebe7] text-[#211a18] flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#914724]" />
            <span>รายการเช่า/ยืมหนังสือ</span>
          </button>
          <button 
            onClick={() => { onOpenShop(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded hover:bg-[#f9ebe7] text-[#211a18]"
          >
            ขายหนังสือ/จัดจำหน่าย
          </button>
          <div className="pt-2 border-t border-[#dac1b8] flex flex-col gap-2">
            <button
              onClick={() => { onOpenMemberAuth(); setMobileMenuOpen(false); }}
              className="w-full py-2 text-xs bg-white text-[#211a18] border border-[#dac1b8] rounded font-medium text-center flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#914724]" />
              <span>เข้าสู่ระบบสมาชิก / สมัครสมาชิก</span>
            </button>
            <button
              onClick={() => { onOpenAdminGateway(); setMobileMenuOpen(false); }}
              className="w-full py-2 text-xs bg-[#f9ebe7] text-[#914724] border border-[#dac1b8] rounded font-semibold text-center flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-[#914724]" />
              <span>เข้าสู่ระบบแอดมิน (Naiin Backoffice Gateway)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
