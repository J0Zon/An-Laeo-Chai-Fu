import React from 'react';
import { Book } from '../data/books';
import { Star, BookOpen, ShoppingBag, Eye } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onAddToCart: (book: Book, type: 'buy' | 'rent') => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onAddToCart }) => {
  const discountPercent = Math.round(((book.originalPrice - book.buyPrice) / book.originalPrice) * 100);

  return (
    <article className="group bg-white rounded border border-[#dac1b8]/70 hover:border-[#914724]/40 shadow-editorial-card hover:shadow-editorial-lift transition-all duration-300 flex flex-col overflow-hidden">
      {/* Book Cover Frame */}
      <div 
        onClick={() => onSelect(book)} 
        className="relative bg-[#f5f0eb] pt-6 pb-4 px-6 flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#dac1b8]/40"
      >
        {/* Format Tag */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="text-[11px] font-medium tracking-wide text-[#7c563f] bg-[#fff8f6] px-2 py-0.5 rounded border border-[#dac1b8]">
            {book.format}
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="text-[11px] font-bold text-[#914724] bg-[#fff1ed] px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Tactile Book Jacket */}
        <div className="relative transform group-hover:-translate-y-1.5 transition-transform duration-300 w-36 sm:w-40 aspect-[1/1.45] shadow-md rounded-xs overflow-hidden book-spine-crease">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-[#211a18]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-white/95 text-[#211a18] text-xs font-medium px-3 py-1.5 rounded shadow-sm flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#914724]" />
            <span>ดูเนื้อหา & รายละเอียด</span>
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="text-[11px] text-[#7c563f] font-medium line-clamp-1 mb-1">
            {book.categoryLabel}
          </div>

          {/* Book Title */}
          <h3 
            onClick={() => onSelect(book)}
            className="font-editorial-serif text-sm sm:text-base font-semibold text-[#211a18] line-clamp-2 hover:text-[#914724] cursor-pointer transition-colors leading-snug mb-1"
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-[#54433c] font-normal mb-2">
            {book.author} {book.translator && <span className="text-[#87736b]">· แปล: {book.translator}</span>}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-[#54433c] mb-3">
            <div className="flex text-amber-600">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-[#211a18]">{book.rating}</span>
            <span className="text-[11px] text-[#87736b]">({book.reviewCount} รีวิว)</span>
          </div>
        </div>

        {/* Pricing & CTA Controls */}
        <div className="pt-3 border-t border-[#dac1b8]/40 space-y-2.5">
          {/* Prices */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] text-[#7c563f]">ราคาจำหน่าย</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-[#914724] font-mono tabular-nums">
                  ฿{book.buyPrice}
                </span>
                <span className="text-xs text-[#87736b] line-through font-mono tabular-nums">
                  ฿{book.originalPrice}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-[#7c563f]">บริการยืมอ่าน</div>
              <div className="text-xs font-semibold text-[#211a18]">
                ฿{book.rentPricePerWeek}
                <span className="text-[10px] text-[#7c563f] font-normal"> / สัปดาห์</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onAddToCart(book, 'rent')}
              type="button"
              className="py-1.5 px-2 bg-[#fff1ed] hover:bg-[#f9ebe7] text-[#914724] border border-[#af5f3a]/30 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="ยืมหนังสืออ่าน (จัดส่งถึงบ้าน คืนได้ที่สาขา)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ยืมอ่าน</span>
            </button>

            <button
              onClick={() => onAddToCart(book, 'buy')}
              type="button"
              className="py-1.5 px-2 bg-[#914724] hover:bg-[#793a1c] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              title="ซื้อหนังสือเล่มนี้เป็นเจ้าของ"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ซื้อเล่มนี้</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
