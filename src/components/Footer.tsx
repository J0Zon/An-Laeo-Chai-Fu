import React, { useState } from 'react';
import { Mail, Check, Phone, MessageSquare, BookOpen, Heart, ArrowRight } from 'lucide-react';

interface FooterProps {
  onOpenGuideModal: () => void;
  onOpenCatalogCategory?: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuideModal, onOpenCatalogCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#ede0dc]/50 border-t border-[#dac1b8] text-[#54433c] text-xs font-editorial-sans pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main 4-column grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#dac1b8]/70">
          {/* Column 1: Brand & Newsletter (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="font-editorial-serif text-lg font-bold text-[#211a18]">
                อ่านแล้วใจฟู
              </div>
              <div className="text-[10px] text-[#7c563f] uppercase tracking-wider font-medium">
                อ่านแล้วใจฟู
              </div>
            </div>

            <p className="text-xs text-[#54433c] leading-relaxed max-w-sm">
              พื้นที่แห่งการอ่านอันสงบนิ่งและพิถีพิถัน คัดสรรหนังสือดีๆ พร้อมบริการยืม-อ่าน 
              และจัดส่งถึงหน้าบ้าน เพื่อให้ทุกหน้าหนังสืออยู่เป็นเพื่อนใจของคุณ
            </p>

            {/* Newsletter input from screenshot */}
            <div className="pt-2">
              <label htmlFor="newsletterInput" className="block text-xs font-medium text-[#211a18] mb-1.5">
                รับจดหมายข่าวแนะนำหนังสือประจำสัปดาห์
              </label>
              {subscribed ? (
                <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ขอบคุณสำหรับการติดตาม เราจะส่งจดหมายฉบับแรกไปให้คุณ</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5 max-w-sm">
                  <input
                    id="newsletterInput"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ระบุอีเมลของคุณ"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    ติดตาม
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: บริการยืม-เช่าหนังสือ (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-xs text-[#211a18] uppercase tracking-wider">
              บริการยืม-เช่าหนังสือ
            </h4>
            <ul className="space-y-2 text-xs text-[#54433c]">
              <li>
                <button 
                  onClick={onOpenGuideModal} 
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  วิธีสั่งยืมและรอบจัดส่ง
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenGuideModal} 
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  อัตราค่าบริการและมัดจำ
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenGuideModal} 
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  จุดรับ-คืนหนังสือ 1 สาขา
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenGuideModal} 
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  แพ็กเกจสมาชิกยืมอ่านรายเดือน
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: หมวดหนังสือแนะนำ (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-xs text-[#211a18] uppercase tracking-wider">
              หมวดหนังสือแนะนำ
            </h4>
            <ul className="space-y-2 text-xs text-[#54433c]">
              <li>
                <button 
                  onClick={() => onOpenCatalogCategory?.('healing')}
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  หนังสือฮีลใจและพัฒนาตนเอง
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenCatalogCategory?.('literature')}
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  วรรณกรรมแปลร่วมสมัย
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenCatalogCategory?.('philosophy')}
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  ปรัชญาและบทกวี
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenCatalogCategory?.('all')}
                  className="hover:text-[#914724] transition-colors text-left"
                >
                  อีบุ๊กพร้อมอ่านทันที
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: ติดต่อและช่วยเหลือ (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs text-[#211a18] uppercase tracking-wider">
              ติดต่อและช่วยเหลือ
            </h4>
            <div className="space-y-1.5 text-xs text-[#54433c]">
              <p>ศูนย์บริการลูกค้า: 095-226-0122</p>
              <p className="text-[11px] text-[#7c563f]">จันทร์ - ศุกร์ (08:30 - 17:30 น.)</p>
              <p>LINE: @0952260122</p>
            </div>

            {/* Social Icons row */}
            <div className="flex items-center gap-2 pt-2">
              <a 
                href="#line" 
                className="w-7 h-7 rounded border border-[#dac1b8] bg-white flex items-center justify-center text-[#7c563f] hover:text-[#914724] hover:bg-[#fff1ed] transition-colors"
                title="LINE Official"
              >
                <span className="font-bold text-[10px]">L</span>
              </a>
              <a 
                href="#facebook" 
                className="w-7 h-7 rounded border border-[#dac1b8] bg-white flex items-center justify-center text-[#7c563f] hover:text-[#914724] hover:bg-[#fff1ed] transition-colors"
                title="Facebook"
              >
                <span className="font-bold text-[10px]">f</span>
              </a>
              <a 
                href="#instagram" 
                className="w-7 h-7 rounded border border-[#dac1b8] bg-white flex items-center justify-center text-[#7c563f] hover:text-[#914724] hover:bg-[#fff1ed] transition-colors"
                title="Instagram"
              >
                <span className="font-bold text-[10px]">ig</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#87736b]">
          <div>
            (ร้านอ่านใจฟู) • อ่านแล้วใจฟู. สงวนลิขสิทธิ์.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenGuideModal} className="hover:text-[#54433c] transition-colors">
              เงื่อนไขการยืม-คืน
            </button>
            <span>•</span>
            <button onClick={onOpenGuideModal} className="hover:text-[#54433c] transition-colors">
              นโยบายความเป็นส่วนตัว
            </button>
            <span>•</span>
            <button onClick={onOpenGuideModal} className="hover:text-[#54433c] transition-colors">
              ตั้งค่าคุกกี้
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
