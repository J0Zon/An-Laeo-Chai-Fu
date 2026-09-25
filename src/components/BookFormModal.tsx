import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  BookOpen, 
  Sparkles, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';
import { Book } from '../data/books';
import { SiteCategory, INITIAL_CATEGORIES } from '../data/siteConfig';
import coverCozyMorning from '../assets/images/book_cover_cozy_morning_1790332767768.jpg';
import coverQuietLibrary from '../assets/images/book_cover_quiet_library_1790332806366.jpg';
import coverPeacefulMind from '../assets/images/book_cover_peaceful_mind_1790332819709.jpg';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (book: Book, isNew: boolean) => void;
  onDeleteBook?: (bookId: string) => void;
  bookToEdit?: Book | null;
  categories?: SiteCategory[];
}

const PRESET_COVERS = [
  { label: 'ปกเช้าอันสงบ (Terracotta & Linen)', url: coverCozyMorning },
  { label: 'ปกวะบิ-ซะบิ (Botanical Paper)', url: coverQuietLibrary },
  { label: 'ปกเรขาคณิตดินเผา (Clay Arches)', url: coverPeacefulMind }
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  onDeleteBook,
  bookToEdit,
  categories = INITIAL_CATEGORIES
}) => {
  const isEditing = !!bookToEdit;

  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [translator, setTranslator] = useState('');
  const [category, setCategory] = useState<string>('healing');
  const [format, setFormat] = useState<Book['format']>('ปกอ่อน');
  const [buyPrice, setBuyPrice] = useState(280);
  const [originalPrice, setOriginalPrice] = useState(330);
  const [rentPricePerWeek, setRentPricePerWeek] = useState(35);
  const [depositAmount, setDepositAmount] = useState(150);
  const [isbn, setIsbn] = useState('978-616-93821-0-0');
  const [pages, setPages] = useState(240);
  const [publishYear, setPublishYear] = useState('2026');
  const [inStock, setInStock] = useState(10);
  const [availableForRent, setAvailableForRent] = useState(4);
  const [curatorQuote, setCuratorQuote] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/src/assets/images/book_cover_cozy_morning_1790332767768.jpg');
  
  const [imageUploadType, setImageUploadType] = useState<'upload' | 'url' | 'preset'>('upload');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setOriginalTitle(bookToEdit.originalTitle || '');
      setAuthor(bookToEdit.author);
      setTranslator(bookToEdit.translator || '');
      setCategory(bookToEdit.category);
      setFormat(bookToEdit.format);
      setBuyPrice(bookToEdit.buyPrice);
      setOriginalPrice(bookToEdit.originalPrice);
      setRentPricePerWeek(bookToEdit.rentPricePerWeek);
      setDepositAmount(bookToEdit.depositAmount);
      setIsbn(bookToEdit.isbn);
      setPages(bookToEdit.pages);
      setPublishYear(bookToEdit.publishYear);
      setInStock(bookToEdit.inStock);
      setAvailableForRent(bookToEdit.availableForRent);
      setCuratorQuote(bookToEdit.curatorQuote || '');
      setDescription(bookToEdit.description);
      setCoverImage(bookToEdit.coverImage);
      setCustomImageUrl(bookToEdit.coverImage);
    } else {
      // Reset for new book
      setTitle('');
      setOriginalTitle('');
      setAuthor('');
      setTranslator('');
      setCategory('healing');
      setFormat('ปกอ่อน');
      setBuyPrice(280);
      setOriginalPrice(330);
      setRentPricePerWeek(35);
      setDepositAmount(150);
      setIsbn(`978-616-93821-${Math.floor(Math.random() * 90) + 10}-1`);
      setPages(240);
      setPublishYear('2026');
      setInStock(10);
      setAvailableForRent(4);
      setCuratorQuote('');
      setDescription('');
      setCoverImage('/src/assets/images/book_cover_cozy_morning_1790332767768.jpg');
      setCustomImageUrl('');
    }
    setErrorMessage('');
    setConfirmDelete(false);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
        setCustomImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อหนังสือ');
      return;
    }
    if (!author.trim()) {
      setErrorMessage('กรุณาระบุชื่อผู้แต่ง / นักเขียน');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('กรุณาระบุคำโปรยหรือเรื่องย่อ');
      return;
    }
    if (!coverImage) {
      setErrorMessage('กรุณาระบุหรืออัปโหลดรูปภาพหน้าปกหนังสือ');
      return;
    }

    const selectedCat = categories.find((c) => c.slug === category);
    const categoryLabel = selectedCat ? selectedCat.name : (category || 'หนังสือทั่วไป');

    const savedBook: Book = {
      id: bookToEdit ? bookToEdit.id : `book-${Date.now()}`,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      author: author.trim(),
      translator: translator.trim() || undefined,
      category,
      categoryLabel,
      buyPrice: Number(buyPrice) || 0,
      originalPrice: Number(originalPrice) || Number(buyPrice),
      rentPricePerWeek: Number(rentPricePerWeek) || 30,
      depositAmount: Number(depositAmount) || 100,
      format,
      isbn: isbn.trim(),
      pages: Number(pages) || 200,
      coverImage,
      description: description.trim(),
      curatorQuote: curatorQuote.trim() || `“${title} — ตัวอักษรที่โอบกอดช่วงเวลาเหนื่อยล้าของคุณ”`,
      rating: bookToEdit ? bookToEdit.rating : 5.0,
      reviewCount: bookToEdit ? bookToEdit.reviewCount : 1,
      inStock: Number(inStock) || 0,
      availableForRent: Number(availableForRent) || 0,
      publishYear: publishYear || '2026'
    };

    onSaveBook(savedBook, !isEditing);
    onClose();
  };

  const handleDelete = () => {
    if (bookToEdit && onDeleteBook) {
      onDeleteBook(bookToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-3xl bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#914724]/10 text-[#914724] border border-[#914724]/30 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial-serif font-bold text-base sm:text-lg text-[#211a18]">
                {isEditing ? `แก้ไขข้อมูลหนังสือ: ${bookToEdit.title}` : 'อัปโหลดและเพิ่มหนังสือเล่มใหม่สู่คลัง'}
              </h2>
              <p className="text-xs text-[#54433c]">
                {isEditing 
                  ? 'ปรับปรุงรายละเอียด ราคา สต็อก หรือเปลี่ยนรูปภาพหน้าปก' 
                  : 'กรอกรายละเอียดหนังสือเพื่อเผยแพร่บนหน้าร้านและเปิดให้ยืม-อ่านทันที'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="bookForm" onSubmit={handleSubmit} className="space-y-6 text-xs text-[#211a18]">
            {/* 1. Cover Image Section */}
            <div className="bg-[#f5f0eb] p-4 sm:p-5 rounded border border-[#dac1b8] space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs sm:text-sm text-[#211a18] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#914724]" />
                  <span>รูปภาพหน้าปกหนังสือ (Cover Image) *</span>
                </label>
                <div className="flex bg-white p-0.5 rounded border border-[#dac1b8] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageUploadType('upload')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      imageUploadType === 'upload' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                    }`}
                  >
                    อัปโหลดไฟล์ภาพ
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('preset')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      imageUploadType === 'preset' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                    }`}
                  >
                    เลือกภาพแนะนำ
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('url')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      imageUploadType === 'url' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                    }`}
                  >
                    ระบุลิงก์ URL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Image Live Preview */}
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="w-28 sm:w-32 aspect-[1/1.45] rounded-xs shadow-md overflow-hidden bg-white border border-[#dac1b8] book-spine-crease relative group">
                    <img 
                      src={coverImage} 
                      alt="ตัวอย่างหน้าปก" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[11px] text-[#7c563f] mt-1.5 font-medium">ภาพตัวอย่างหน้าปก</span>
                </div>

                {/* Upload Control Options */}
                <div className="sm:col-span-8 space-y-3">
                  {imageUploadType === 'upload' && (
                    <div className="space-y-2">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#dac1b8] hover:border-[#914724] bg-white p-5 rounded text-center cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 mx-auto text-[#914724] mb-1.5" />
                        <div className="font-medium text-xs text-[#211a18]">คลิกเพื่อเลือกไฟล์รูปภาพจากอุปกรณ์ของคุณ</div>
                        <div className="text-[11px] text-[#7c563f] mt-0.5">รองรับไฟล์ JPG, PNG, WEBP (ความละเอียดชัดสูง)</div>
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </div>
                  )}

                  {imageUploadType === 'preset' && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#54433c] block">เลือกหน้าปกสำเร็จรูปสไตล์ Warm Editorial:</label>
                      <div className="grid grid-cols-1 gap-2">
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCoverImage(preset.url)}
                            className={`p-2 text-left rounded border text-xs flex items-center justify-between transition-colors ${
                              coverImage === preset.url 
                                ? 'bg-[#fff1ed] border-[#914724] font-medium text-[#914724]' 
                                : 'bg-white border-[#dac1b8] hover:bg-[#fff8f6]'
                            }`}
                          >
                            <span>{preset.label}</span>
                            {coverImage === preset.url && <CheckCircle2 className="w-3.5 h-3.5 text-[#914724]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageUploadType === 'url' && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#54433c] block">กรอก URL ของรูปภาพ:</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/cover.jpg"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-[#dac1b8] rounded bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customImageUrl.trim()) setCoverImage(customImageUrl.trim());
                          }}
                          className="px-3 py-1.5 bg-[#7c563f] hover:bg-[#914724] text-white rounded text-xs"
                        >
                          ใช้ลิงก์นี้
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Basic Metadata */}
            <div className="space-y-3">
              <h3 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f]">
                ข้อมูลพื้นฐานของหนังสือ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ชื่อหนังสือภาษาไทย *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ในความเงียบงัน... มีเสียงของหัวใจกระซิบเบาๆ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ชื่อภาษาอังกฤษ / ชื่อต้นฉบับ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น The Quiet Sound of Being"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ชื่อผู้แต่ง / นักเขียน *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ฮารุกิ ชินโด"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ผู้แปล (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เมธาวี สุขเกษม"
                    value={translator}
                    onChange={(e) => setTranslator(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    หมวดหมู่หนังสือ
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    รูปแบบหนังสือ
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as Book['format'])}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18]"
                  >
                    <option value="ปกอ่อน">ปกอ่อน (Paperback)</option>
                    <option value="ปกแข็ง">ปกแข็ง (Hardcover)</option>
                    <option value="E-Book">E-Book (Digital)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    รหัส ISBN
                  </label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs text-[#211a18] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing, Rental & Stock Management */}
            <div className="space-y-3 pt-2 border-t border-[#dac1b8]/70">
              <h3 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f]">
                ราคา, อัตราค่าบริการยืม และสต็อกหนังสือ
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ราคาขาย (฿) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono font-semibold text-[#914724]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ราคาเดิม/ปก (฿)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono text-[#87736b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ค่ายืม / สัปดาห์ (฿) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={rentPricePerWeek}
                    onChange={(e) => setRentPricePerWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono font-semibold text-[#211a18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    เงินมัดจำหนังสือ (฿) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono text-[#7c563f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    สต็อกพร้อมขาย (เล่ม)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={inStock}
                    onChange={(e) => setInStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    เล่มหมุนเวียนให้ยืม
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={availableForRent}
                    onChange={(e) => setAvailableForRent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    จำนวนหน้า
                  </label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ปีที่ตีพิมพ์
                  </label>
                  <input
                    type="text"
                    value={publishYear}
                    onChange={(e) => setPublishYear(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Editorial Excerpt & Description */}
            <div className="space-y-3 pt-2 border-t border-[#dac1b8]/70">
              <h3 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f]">
                เนื้อหา & ข้อความบรรณาธิการ
              </h3>

              <div>
                <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                  โควทหรือประโยคคัดสรรโดนใจ (Curator Quote)
                </label>
                <input
                  type="text"
                  placeholder="“บางความเงียบ... โอบกอดเราได้แน่นกว่าคำปลอบโยนพันคำ”"
                  value={curatorQuote}
                  onChange={(e) => setCuratorQuote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-editorial-serif italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                  เรื่องย่อและคำโปรย (Description) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="เขียนเรื่องย่อ หรือแนะนำความรู้สึกที่ผู้อ่านจะได้รับจากหนังสือเล่มนี้..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-[#dac1b8] bg-[#f9ebe7] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {isEditing && onDeleteBook && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700 font-medium">ยืนยันลบเล่มนี้?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                    >
                      ลบจริง
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 text-xs text-[#54433c] hover:underline"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded border border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบหนังสือเล่มนี้</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#ede0dc] text-[#54433c] text-xs font-medium rounded border border-[#dac1b8] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="bookForm"
              className="px-5 py-2 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกและเผยแพร่หนังสือ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
