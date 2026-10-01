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

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-01',
    title: 'ในความเงียบงัน... มีเสียงของหัวใจกระซิบเบาๆ',
    originalTitle: 'The Quiet Sound of Being',
    author: 'ฮารุกิ ชินโด',
    translator: 'เมธาวี สุขเกษม',
    category: 'healing',
    categoryLabel: 'หนังสือฮีลใจและพัฒนาตนเอง',
    buyPrice: 285,
    originalPrice: 335,
    rentPricePerWeek: 35,
    depositAmount: 150,
    format: 'ปกอ่อน',
    isbn: '978-616-93821-0-1',
    pages: 248,
    coverImage: coverCozyMorning,
    description: 'บันทึกบทสนทนาอันอ่อนโยนกับตนเองในเช้าวันหยุดที่ไม่มีกำหนดการ ค้นพบความงามของความธรรมดาและการปล่อยวางความคาดหวังที่หนักอึ้ง',
    curatorQuote: '“บางครั้ง สิ่งที่เราต้องการมากที่สุด ไม่ใช่คำตอบที่ยิ่งใหญ่ แต่เป็นความเงียบสงบเพียงพอที่จะได้ยินเสียงลมหายใจของตัวเอง”',
    rating: 4.9,
    reviewCount: 142,
    inStock: 14,
    availableForRent: 5,
    publishYear: '2025'
  },
  {
    id: 'book-02',
    title: 'ปรัชญาใบไม้ร่วงและศิลปะแห่งการเริ่มต้นใหม่',
    originalTitle: 'The Philosophy of Falling Leaves',
    author: 'เคย์ ทาคาฮาชิ',
    translator: 'ดร. นลินี อารีรักษ์',
    category: 'philosophy',
    categoryLabel: 'ปรัชญาและบทกวี',
    buyPrice: 315,
    originalPrice: 370,
    rentPricePerWeek: 40,
    depositAmount: 180,
    format: 'ปกแข็ง',
    isbn: '978-616-93821-2-5',
    pages: 312,
    coverImage: coverQuietLibrary,
    description: 'สำรวจปรัชญาวะบิ-ซะบิ ผ่านวัฏจักรของธรรมชาติและการยอมรับความไม่สมบูรณ์แบบของชีวิต หนังสือที่จะโอบกอดช่วงเวลาที่คุณรู้สึกเปราะบาง',
    curatorQuote: '“ใบไม้ที่ร่วงหล่นมิได้พ่ายแพ้ต่อกาลเวลา หากแต่กำลังสละตนเพื่อให้กิ่งก้านได้ผลิใบใหม่อย่างสง่างาม”',
    rating: 4.8,
    reviewCount: 98,
    inStock: 8,
    availableForRent: 3,
    publishYear: '2025'
  },
  {
    id: 'book-03',
    title: 'สถาปัตยกรรมแห่งความสงบในใจคุณ',
    originalTitle: 'Architectures of Inner Serenity',
    author: 'เอลีนา วานน์',
    translator: 'ปิยะวัฒน์ จันทร',
    category: 'essay',
    categoryLabel: 'วรรณกรรมแปลร่วมสมัย',
    buyPrice: 295,
    originalPrice: 350,
    rentPricePerWeek: 35,
    depositAmount: 160,
    format: 'ปกอ่อน',
    isbn: '978-616-93821-4-9',
    pages: 280,
    coverImage: coverPeacefulMind,
    description: 'การออกแบบชีวิตและพื้นที่ภายในให้เปรียบเสมือนเรือนพักใจอันปลอดภัย ท่ามกลางโลกยุคใหม่ที่เต็มไปด้วยการเร่งรีบและสิ่งรบกวน',
    curatorQuote: '“บ้านที่แท้จริงไม่ใช่สถานที่ที่มีหลังคาคุ้มกะลาหัว หากคือสภาวะจิตใจที่คุณสามารถถอดหน้ากากและทอดกายลงได้อย่างสนิทใจ”',
    rating: 4.9,
    reviewCount: 175,
    inStock: 19,
    availableForRent: 6,
    publishYear: '2026'
  },
  {
    id: 'book-04',
    title: 'ร้านกาแฟใต้เงาไม้ใหญ่กับจดหมายที่ส่งไม่ถึง',
    originalTitle: 'The Café Beneath the Camphor Tree',
    author: 'มิยาซาวะ ริน',
    translator: 'ชลิตา วรรณสิน',
    category: 'fiction',
    categoryLabel: 'นิยายแปลอบอุ่น',
    buyPrice: 260,
    originalPrice: 310,
    rentPricePerWeek: 30,
    depositAmount: 140,
    format: 'ปกอ่อน',
    isbn: '978-616-93821-6-3',
    pages: 264,
    coverImage: coverCozyMorning,
    description: 'เรื่องราวของร้านกาแฟเล็กๆ ที่เจ้าของร้านยินดีรับฝากจดหมายที่ผู้คนไม่อาจเอ่ยปากส่งตรงๆ ความอบอุ่นที่ชะโลมหัวใจผู้คนในวันที่เหนื่อยล้า',
    curatorQuote: '“บางความรู้สึก แม้ไม่ได้ส่งออกไป แต่การได้จรดปากกาเขียน ก็เพียงพอแล้วที่จะเยียวยาบาดแผลข้างใน”',
    rating: 4.7,
    reviewCount: 88,
    inStock: 11,
    availableForRent: 4,
    publishYear: '2025'
  },
  {
    id: 'book-05',
    title: 'บทกวีแด่ดวงดาวที่ยังคงเปล่งประกายในความมืด',
    originalTitle: 'Poems for the Resilient Stars',
    author: 'กวีเงียบแห่งสารคาม',
    category: 'philosophy',
    categoryLabel: 'ปรัชญาและบทกวี',
    buyPrice: 240,
    originalPrice: 280,
    rentPricePerWeek: 30,
    depositAmount: 130,
    format: 'ปกแข็ง',
    isbn: '978-616-93821-8-7',
    pages: 196,
    coverImage: coverQuietLibrary,
    description: 'รวมบทกวีคัดสรรว่าด้วยความหวัง ความเพียร และรอยยิ้มของคนตัวเล็กๆ ในสังคม ร่วมเดินทางผ่านตัวอักษรที่ชุบชูวิญญาณ',
    curatorQuote: '“ท้องฟ้ายามค่ำไม่ได้ดำมืดสนิท มันเพียงแค่เตรียมม่านสีเข้มไว้ เพื่อให้ดาวดวงเล็กๆ ได้แสดงพลัง”',
    rating: 5.0,
    reviewCount: 64,
    inStock: 6,
    availableForRent: 2,
    publishYear: '2026'
  },
  {
    id: 'book-06',
    title: 'จังหวะก้าวสั้นๆ ของวันแสนธรรมดา',
    originalTitle: 'Small Steps in Ordinary Days',
    author: 'อาซึมิ มาริ',
    translator: 'ธนาภา วงศ์วัฒนา',
    category: 'healing',
    categoryLabel: 'หนังสือฮีลใจและพัฒนาตนเอง',
    buyPrice: 275,
    originalPrice: 320,
    rentPricePerWeek: 35,
    depositAmount: 150,
    format: 'ปกอ่อน',
    isbn: '978-616-93821-9-4',
    pages: 220,
    coverImage: coverPeacefulMind,
    description: 'วิธีฝึกสังเกตความสุขเล็กๆ รายวัน ตั้งแต่กลิ่นกาแฟยามเช้า ลมอ่อนๆ ข้างหน้าต่าง ไปจนถึงการยิ้มให้กับคนแปลกหน้า',
    curatorQuote: '“ชีวิตไม่ต้องยิ่งใหญ่ในทุกนาที แค่มีความสุขกับเรื่องเล็กน้อยสามสิ่งในแต่ละวัน ก็ถือเป็นวันที่งดงามแล้ว”',
    rating: 4.8,
    reviewCount: 112,
    inStock: 16,
    availableForRent: 7,
    publishYear: '2025'
  }
];

export const INITIAL_BORROWED_BOOKS: BorrowedBook[] = [
  {
    id: 'borrow-101',
    bookId: 'book-01',
    bookTitle: 'ในความเงียบงัน... มีเสียงของหัวใจกระซิบเบาๆ',
    bookAuthor: 'ฮารุกิ ชินโด',
    coverImage: coverCozyMorning,
    borrowDate: '18 ก.ย. 2026',
    dueDate: '2 ต.ค. 2026',
    daysRemaining: 7,
    depositPaid: 150,
    rentFee: 70,
    status: 'active',
    branchName: 'จุดคืนหนังสือ 1 : สาขาอ่านแล้วใจฟู อารีย์'
  },
  {
    id: 'borrow-102',
    bookId: 'book-02',
    bookTitle: 'ปรัชญาใบไม้ร่วงและศิลปะแห่งการเริ่มต้นใหม่',
    bookAuthor: 'เคย์ ทาคาฮาชิ',
    coverImage: coverQuietLibrary,
    borrowDate: '12 ก.ย. 2026',
    dueDate: '26 ก.ย. 2026',
    daysRemaining: 1,
    depositPaid: 180,
    rentFee: 80,
    status: 'active',
    branchName: 'จุดคืนหนังสือ 1 : สาขาอ่านแล้วใจฟู อารีย์'
  }
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    book: INITIAL_BOOKS[0],
    type: 'rent',
    weeks: 2,
    quantity: 1
  },
  {
    id: 'cart-2',
    book: INITIAL_BOOKS[2],
    type: 'buy',
    quantity: 1
  }
];
