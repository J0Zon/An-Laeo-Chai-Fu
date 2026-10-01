import React from 'react';
import { X, User, BookOpen, ShieldCheck, Heart, Award, Sparkles, LogIn, CheckCircle2 } from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBorrowedCount: number;
  memberUser: { name: string; email: string; phone?: string; avatarText: string; tier: string } | null;
  onLogoutMember: () => void;
  onOpenMemberAuth?: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  activeBorrowedCount,
  memberUser,
  onLogoutMember,
  onOpenMemberAuth,
}) => {
  if (!isOpen) return null;

  const isGuest = !memberUser;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-md bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-xs ${
              isGuest ? 'bg-[#914724]' : 'bg-[#7c563f]'
            }`}>
              {isGuest ? 'G' : memberUser.avatarText}
            </div>
            <div>
              <h2 className="font-editorial-serif font-bold text-base text-[#211a18]">
                {isGuest ? 'ผู้อ่านทั่วไป (Guest Reader)' : memberUser.name}
              </h2>
              <p className="text-[11px] text-[#7c563f]">
                {isGuest ? 'ใช้งานได้ทันที ไม่จำเป็นต้องเข้าสู่ระบบ' : memberUser.tier}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#54433c]">
          {/* Guest Reassurance Box */}
          {isGuest && (
            <div className="p-3.5 bg-[#e8f5e9] border border-emerald-300 rounded text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>คุณไม่จำเป็นต้องเข้าสู่ระบบ</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                คุณสามารถเลือกหนังสือเล่มโปรด กด <strong>"ยืมอ่าน"</strong>, <strong>"ซื้อเล่มนี้"</strong> หรือ <strong>"ลงขายหนังสือ"</strong> ได้ทันทีโดยไม่ต้องสมัครสมาชิกหรือล็อกอิน ระบบเปิดให้ทำรายการได้อิสระ
              </p>
            </div>
          )}

          {/* Member stats / Rental Status */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">กำลังยืมอ่าน</div>
              <div className="text-lg font-bold font-mono text-[#914724]">{activeBorrowedCount} เล่ม</div>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">{isGuest ? 'สถานะบริการ' : 'สิทธิ์ยืมคงเหลือ'}</div>
              <div className="text-sm font-bold font-mono text-[#211a18] mt-1">
                {isGuest ? 'เปิดอิสระ' : `${Math.max(0, 3 - activeBorrowedCount)} เล่ม`}
              </div>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">แต้มสะสม</div>
              <div className="text-lg font-bold font-mono text-amber-700">
                {isGuest ? '0 pt' : '420 pt'}
              </div>
            </div>
          </div>

          {!isGuest ? (
            <>
              <div className="p-3 bg-[#f5f0eb] rounded border border-[#dac1b8] space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-[#211a18]">
                  <Award className="w-4 h-4 text-[#914724]" />
                  <span>สิทธิประโยชน์แพ็กเกจสมาชิกรายเดือน</span>
                </div>
                <p className="leading-relaxed">
                  ยืมอ่านได้พร้อมกันสูงสุด 3 เล่ม ไม่จำกัดรอบตลอดปี พร้อมจัดส่งและรับคืนถึงบ้านฟรี
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#211a18]">ข้อมูลบัญชี & การติดต่อ</h4>
                <div className="bg-white p-3 rounded border border-[#dac1b8] space-y-1 text-[11px]">
                  <div><strong>อีเมล:</strong> {memberUser.email}</div>
                  <div><strong>เบอร์โทร:</strong> {memberUser.phone || '081-992-4819'}</div>
                  <div><strong>สถานะสมาชิก:</strong> สมาชิกยืนยันตัวตนแล้ว</div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 bg-[#fff8f6] rounded border border-[#dac1b8] space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-[#211a18]">
                <Sparkles className="w-4 h-4 text-[#914724]" />
                <span>ต้องการสะสมแต้มหรือรับสิทธิพิเศษเพิ่มเติม?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#7c563f]">
                การสมัครสมาชิกคลับอ่านใจฟูจะช่วยให้คุณสะสมคะแนนแลกส่วนลดได้ (ไม่บังคับ สามารถช้อปและยืมอ่านต่อได้เลย)
              </p>
              {onOpenMemberAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMemberAuth();
                  }}
                  className="w-full py-2 bg-white hover:bg-[#fff1ed] border border-[#dac1b8] text-[#914724] font-medium rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบหรือสมัครสมาชิก (ไม่บังคับ)</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#f9ebe7] border-t border-[#dac1b8] flex items-center justify-between">
          {!isGuest ? (
            <button
              onClick={() => {
                onLogoutMember();
                onClose();
              }}
              className="text-xs text-[#ba1a1a] hover:underline font-medium cursor-pointer"
            >
              ออกจากระบบสมาชิก
            </button>
          ) : (
            <span className="text-[11px] text-[#7c563f]">
              ช้อป & ยืมอ่านได้ตลอดเวลา
            </span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#914724] text-white text-xs font-medium rounded hover:bg-[#793a1c] transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

