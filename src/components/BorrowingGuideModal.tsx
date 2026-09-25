import React from 'react';
import { X, BookOpen, Truck, ShieldCheck, MapPin, Clock, Phone, CheckCircle2, RotateCcw } from 'lucide-react';

interface BorrowingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowingGuideModal: React.FC<BorrowingGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7]">
          <div>
            <h2 className="font-editorial-serif font-bold text-base text-[#211a18]">
              คู่มือบริการยืม-คืน & ข้อมูลจุดคืนหนังสือ 1
            </h2>
            <p className="text-xs text-[#54433c]">
              อ่านสบายใจ ไร้ความกังวล คืนสะดวกทุกสาขาที่ร่วมรายการ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 text-xs text-[#54433c]">
          {/* Section 1: Process steps */}
          <div>
            <h3 className="font-editorial-serif font-semibold text-sm text-[#211a18] mb-3">
              ขั้นตอนการยืมและคืนหนังสือ 4 ขั้นตอนง่ายๆ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border border-[#dac1b8]">
                <div className="font-bold text-[#914724] font-mono text-sm mb-1">01. เลือกหนังสือ & ชำระเงิน</div>
                <p>เลือกยืมเล่มที่ต้องการ เลือกระยะเวลา (1-4 สัปดาห์) ชำระค่าบริการยืมเริ่มต้นเพียง ฿30-฿40 พร้อมเงินมัดจำตามราคาหน้าปก</p>
              </div>
              <div className="p-3 bg-white rounded border border-[#dac1b8]">
                <div className="font-bold text-[#914724] font-mono text-sm mb-1">02. จัดส่งถึงมือภายใน 7 วัน</div>
                <p>เราบรรจุหนังสือด้วยซองผ้าฝ้ายถนอมหนังสือและส่งตรงถึงบ้านคุณ พร้อมซองพัสดุสำหรับส่งคืนแนบไปให้</p>
              </div>
              <div className="p-3 bg-white rounded border border-[#dac1b8]">
                <div className="font-bold text-[#914724] font-mono text-sm mb-1">03. อ่านอย่างผ่อนคลาย</div>
                <p>อ่านได้ตามเวลาที่เลือก มีระบบส่งแจ้งเตือนทาง SMS และ LINE ล่วงหน้า 2 วันก่อนครบกำหนด</p>
              </div>
              <div className="p-3 bg-white rounded border border-[#dac1b8]">
                <div className="font-bold text-[#914724] font-mono text-sm mb-1">04. คืนง่าย & รับมัดจำคืน 100%</div>
                <p>หย่อนคืนที่ตู้ Drop Box สาขาอารีย์ (จุดคืน 1) หรือเรียกพี่ไปรษณีย์มารับฟรี เมื่อตรวจรับแล้วมัดจำจะโอนคืนภายใน 24 ชม.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Branch Info matching top bar */}
          <div className="p-4 bg-[#f5f0eb] rounded border border-[#dac1b8] space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#211a18]">
              <MapPin className="w-4 h-4 text-[#914724]" />
              <span>ข้อมูลจุดคืนหนังสือ 1 : สาขาอ่านแล้วใจฟู อารีย์</span>
            </div>
            <p className="leading-relaxed">
              ที่ตั้ง: อาคารวรรณกรรม ซอยอารีย์สัมพันธ์ 1 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-[#7c563f]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                เวลาทำการ: ทุกวัน 08:30 - 17:30 น. (ตู้คืนหน้าร้าน 24 ชม.)
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                สายด่วนบริการ: 095-226-0122
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#f9ebe7] border-t border-[#dac1b8] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#914724] text-white text-xs font-medium rounded hover:bg-[#793a1c] transition-colors"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
