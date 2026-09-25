import React, { useState } from 'react';
import { BorrowedBook } from '../data/books';
import { X, BookOpen, Clock, MapPin, RotateCcw, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface RentBorrowTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowedBooks: BorrowedBook[];
  onReturnBook: (id: string) => void;
}

export const RentBorrowTrackerModal: React.FC<RentBorrowTrackerModalProps> = ({
  isOpen,
  onClose,
  borrowedBooks,
  onReturnBook,
}) => {
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReturn = (id: string, title: string) => {
    onReturnBook(id);
    setReturnSuccessMsg(`สร้างคำร้องคืนหนังสือ "${title}" เรียบร้อยแล้ว ท่านสามารถนำไปหย่อนที่จุดคืนหนังสือ หรือรอขนส่งเข้ารับ`);
    setTimeout(() => setReturnSuccessMsg(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#914724]" />
            <div>
              <h2 className="font-editorial-serif font-bold text-base text-[#211a18]">
                รายการเช่า/ยืมหนังสือของฉัน
              </h2>
              <p className="text-xs text-[#54433c]">
                ติดตามหนังสือที่กำลังยืมอ่าน กำหนดส่งคืน และจุดคืนหนังสือ 1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {returnSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{returnSuccessMsg}</span>
            </div>
          )}

          {/* Quick Info Box: Drop-off location 1 */}
          <div className="bg-[#f5f0eb] p-3.5 rounded border border-[#dac1b8] flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#914724] shrink-0 mt-0.5" />
            <div className="text-xs text-[#54433c]">
              <span className="font-semibold text-[#211a18]">
                จุดคืนหนังสือ 1 : สาขาอ่านแล้วใจฟู อารีย์
              </span>
              <p className="mt-0.5">
                เปิดให้บริการทุกวัน 08:30 - 17:30 น. มีตู้คืนหนังสืออัจฉริยะ (Drop Box) 24 ชม. หน้าร้าน 
                หรือเลือกกดเรียกขนส่งเข้ามารับหนังสือที่บ้านได้โดยไม่มีค่าบริการ
              </p>
            </div>
          </div>

          {/* List of borrowed books */}
          <div className="space-y-3">
            {borrowedBooks.map((borrow) => (
              <div 
                key={borrow.id} 
                className="bg-white p-4 rounded border border-[#dac1b8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={borrow.coverImage}
                    alt={borrow.bookTitle}
                    className="w-14 h-20 object-cover rounded shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-editorial-serif text-sm font-semibold text-[#211a18] line-clamp-1">
                      {borrow.bookTitle}
                    </h4>
                    <p className="text-xs text-[#7c563f] mb-1.5">{borrow.bookAuthor}</p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#54433c]">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#914724]" />
                        กำหนดส่งคืน: {borrow.dueDate}
                      </span>
                      <span>·</span>
                      <span className="text-[#914724] font-medium">
                        มัดจำ ฿{borrow.depositPaid}
                      </span>
                    </div>

                    <div className="mt-1">
                      {borrow.status === 'returned' ? (
                        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ คืนหนังสือแล้ว (โอนคืนมัดจำเรียบร้อย)
                        </span>
                      ) : borrow.daysRemaining <= 1 ? (
                        <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span>เหลือเวลาอีก {borrow.daysRemaining} วัน (ใกล้ถึงกำหนด)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7c563f] font-medium bg-[#fff1ed] px-2 py-0.5 rounded border border-[#dac1b8]">
                          คงเหลือเวลายืมอีก {borrow.daysRemaining} วัน
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {borrow.status !== 'returned' && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleReturn(borrow.id, borrow.bookTitle)}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>แจ้งส่งคืนเล่มนี้</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
