import coverCozyMorning from '../assets/images/book_cover_cozy_morning_1790332767768.jpg';
import coverQuietLibrary from '../assets/images/book_cover_quiet_library_1790332806366.jpg';
import coverPeacefulMind from '../assets/images/book_cover_peaceful_mind_1790332819709.jpg';

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  translator?: string;
  category: string;
  categoryLabel: string;
  buyPrice: number;
  originalPrice: number;
  rentPricePerWeek: number;
  depositAmount: number;
  format: 'ปกอ่อน' | 'ปกแข็ง' | 'E-Book';
  isbn: string;
  pages: number;
  coverImage: string;
  description: string;
  curatorQuote: string;
  rating: number;
  reviewCount: number;
  inStock: number;
  availableForRent: number;
  publishYear: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  borrowDate: string;
  dueDate: string;
  daysRemaining: number;
  depositPaid: number;
  rentFee: number;
  status: 'active' | 'returning' | 'returned';
  branchName: string;
}

export interface CartItem {
  id: string;
  book: Book;
  type: 'buy' | 'rent';
  weeks?: number;
  quantity: number;
}

export const INITIAL_BOOKS: Book[] = [];

export const INITIAL_CART_ITEMS: CartItem[] = [];
