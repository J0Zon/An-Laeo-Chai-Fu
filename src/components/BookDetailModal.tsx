import React, { useState } from 'react';
import { Book } from '../data/books';
import { X, Star, BookOpen, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Sparkles, BookMarked, Edit } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book, type: 'buy' | 'rent', weeks?: number) => void;
  onEditBook?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ 
  book, 
  onClose, 
  onAddToCart,
  onEditBook 
}) => {
  const [rentWeeks, setRentWeeks] = useState(2);
  const [selectedMode, setSelectedMode] = useState<'rent' | 'buy'>('rent');

  if (!book) return null;

  const totalRentFee = book.rentPricePerWeek * rentWeeks;
  const discountPercent = Math.round(((book.originalPrice - book.buyPrice) / book.originalPrice) * 100);

  const handleAdd = () => {
    onAddToCart(book, selectedMode, selectedMode === 'rent' ? rentWeeks : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-3xl bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#f9ebe7] hover:bg-[#ede0dc] text-[#54433c] flex items-center justify-center transition-colors"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#dac1b8]/60">
          {/* Left Column: Visual Jacket & Spine */}
          <div className="md:col-span-5 bg-[#f5f0eb] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-44 sm:w-52 aspect-[1/1.45] shadow-xl rounded-xs overflow-hidden book-spine-crease mb-4">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-xs text-[#7c563f] font-mono mb-1">
              ISBN: {book.isbn}
            </div>
            <div className="text-xs text-[#54433c]">
              จำนวน {book.pages} หน้า · จัดพิมพ์ พ.ศ. {book.publishYear}
            </div>

            {/* Trust badge */}
            <div className="mt-5 w-full bg-[#fff8f6] p-3 rounded border border-[#dac1b8]/70 text-left text-xs space-y-1.5 text-[#54433c]">
              <div className="flex items-center gap-1.5 text-[#914724] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>รับประกันสภาพเล่มสมบูรณ์ 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#7c563f]" />
                <span>จัดส่งถึงบ้านภายใน 7 วันทั่วประเทศ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#7c563f]" />
                <span>คืนได้ที่จุดคืนหนังสือสาขา หรือส่งพัสดุคืน</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Copy & Purchase Choice */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="inline-block text-[11px] font-medium text-[#7c563f] bg-[#f9ebe7] px-2.5 py-0.5 rounded border border-[#dac1b8]">
                  {book.categoryLabel} · {book.format}
                </div>

                {onEditBook && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditBook(book);
                    }}
                    className="text-xs text-[#914724] bg-[#fff1ed] hover:bg-[#f9ebe7] px-2.5 py-0.5 rounded border border-[#dac1b8] inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="แก้ไขข้อมูลหนังสือเล่มนี้ (ระบบแอดมิน)"
                  >
                    <Edit className="w-3 h-3" />
                    <span>แก้ไขเล่มนี้ (แอดมิน)</span>
                  </button>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18] leading-snug">
                {book.title}
              </h2>
              {book.originalTitle && (
                <div className="text-xs text-[#87736b] font-mono mt-0.5">
                  {book.originalTitle}
                </div>
              )}

              <div className="text-xs sm:text-sm text-[#54433c] mt-1">
                โดย <span className="font-semibold text-[#211a18]">{book.author}</span>
                {book.translator && <span> · แปลโดย {book.translator}</span>}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs text-[#54433c]">
                <div className="flex text-amber-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#211a18]">{book.rating}</span>
                <span>(จากผู้อ่าน {book.reviewCount} คน)</span>
              </div>

              {/* Literary Excerpt Quote */}
              <div className="my-4 p-3.5 bg-[#f9ebe7]/80 rounded border-l-2 border-[#914724] text-xs sm:text-sm italic text-[#54433c] leading-relaxed font-editorial-serif">
                {book.curatorQuote}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#54433c] leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Transaction Options: Rent vs Buy */}
            <div className="mt-6 pt-5 border-t border-[#dac1b8]/70 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Rent */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('rent')}
                  className={`p-3 text-left rounded border transition-all text-xs cursor-pointer ${
                    selectedMode === 'rent'
                      ? 'bg-[#fff1ed] border-[#914724] ring-1 ring-[#914724]'
                      : 'bg-white border-[#dac1b8] hover:bg-[#f9ebe7]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[#211a18]">
                    <span>ยืม-อ่าน (7-14 วัน)</span>
                    <span className="text-[#914724]">฿{book.rentPricePerWeek}/สัปดาห์</span>
                  </div>
                  <div className="text-[11px] text-[#7c563f] mt-1">
                    มัดจำ ฿{book.depositAmount} (คืนทันทีเมื่อส่งคืน)
                  </div>
                </button>

                {/* Option 2: Buy */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('buy')}
                  className={`p-3 text-left rounded border transition-all text-xs cursor-pointer ${
                    selectedMode === 'buy'
                      ? 'bg-[#fff1ed] border-[#914724] ring-1 ring-[#914724]'
                      : 'bg-white border-[#dac1b8] hover:bg-[#f9ebe7]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[#211a18]">
                    <span>ซื้อหนังสือเล่มนี้</span>
                    <span className="text-[#914724] font-bold">฿{book.buyPrice}</span>
                  </div>
                  <div className="text-[11px] text-[#7c563f] mt-1">
                    ลด {discountPercent}% จาก ฿{book.originalPrice}
                  </div>
                </button>
              </div>

              {/* If Rent Selected: duration picker */}
              {selectedMode === 'rent' && (
                <div className="bg-[#f9ebe7] p-3 rounded text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#54433c]">
                    <span>เลือกระยะเวลายืมอ่าน:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setRentWeeks(w)}
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                            rentWeeks === w
                              ? 'bg-[#914724] text-white'
                              : 'bg-white text-[#211a18] border border-[#dac1b8]'
                          }`}
                        >
                          {w} สัปดาห์
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 text-[#7c563f]">
                    <span>ค่าบริการยืม: ฿{totalRentFee} + เงินมัดจำเล่ม: ฿{book.depositAmount}</span>
                    <span className="font-semibold text-[#211a18]">
                      รวมชำระตอนยืม: ฿{totalRentFee + book.depositAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-sm rounded shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {selectedMode === 'rent' ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>เพิ่มเข้ารายการยืม ({rentWeeks} สัปดาห์)</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>เพิ่มลงตะกร้าสั่งซื้อ (฿{book.buyPrice})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
