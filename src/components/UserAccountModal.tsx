import React from 'react';
import { X, User, BookOpen, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBorrowedCount: number;
  memberUser: { name: string; email: string; phone?: string; avatarText: string; tier: string } | null;
  onLogoutMember: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  activeBorrowedCount,
  memberUser,
  onLogoutMember,
}) => {
  if (!isOpen) return null;

  const currentMember = memberUser || {
    name: 'คุณกานต์ชนก วรรณวิศิษฏ์',
    email: 'kanchana.w@reader.co.th',
    phone: '081-992-4819',
    avatarText: 'กช',
    tier: 'สมาชิกคลับอ่านใจฟู VIP Member'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-md bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7c563f] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {currentMember.avatarText}
            </div>
            <div>
              <h2 className="font-editorial-serif font-bold text-base text-[#211a18]">
                {currentMember.name}
              </h2>
              <p className="text-[11px] text-[#7c563f]">
                {currentMember.tier}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#54433c]">
          {/* Member stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">กำลังยืมอ่าน</div>
              <div className="text-lg font-bold font-mono text-[#914724]">{activeBorrowedCount} เล่ม</div>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">สิทธิ์ยืมคงเหลือ</div>
              <div className="text-lg font-bold font-mono text-[#211a18]">{Math.max(0, 3 - activeBorrowedCount)} เล่ม</div>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#dac1b8]">
              <div className="text-[11px] text-[#7c563f]">แต้มสะสมอ่านใจฟู</div>
              <div className="text-lg font-bold font-mono text-amber-700">420 pt</div>
            </div>
          </div>

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
              <div><strong>อีเมล:</strong> {currentMember.email}</div>
              <div><strong>เบอร์โทร:</strong> {currentMember.phone || '081-992-4819'}</div>
              <div><strong>LINE ID:</strong> @kanchana_reads (ผูกระบบแจ้งเตือนแล้ว)</div>
              <div><strong>ที่อยู่รับหนังสือ:</strong> 14/82 ซอยอารีย์สัมพันธ์ 1 เขตพญาไท กทม.</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#f9ebe7] border-t border-[#dac1b8] flex items-center justify-between">
          <button
            onClick={() => {
              onLogoutMember();
              onClose();
            }}
            className="text-xs text-[#ba1a1a] hover:underline font-medium"
          >
            ออกจากระบบสมาชิก
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#914724] text-white text-xs font-medium rounded hover:bg-[#793a1c] transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
