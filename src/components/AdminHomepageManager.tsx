import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  CheckCircle2, 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Layout, 
  Megaphone, 
  Phone, 
  Compass, 
  AlertCircle 
} from 'lucide-react';
import { HomepageConfig, SiteCategory } from '../data/siteConfig';
import { Book } from '../data/books';
import heroBookstore from '../assets/images/hero_bookstore_curation_1790332831900.jpg';
import coverCozyMorning from '../assets/images/book_cover_cozy_morning_1790332767768.jpg';
import coverQuietLibrary from '../assets/images/book_cover_quiet_library_1790332806366.jpg';
import coverPeacefulMind from '../assets/images/book_cover_peaceful_mind_1790332819709.jpg';

interface AdminHomepageManagerProps {
  homepageConfig: HomepageConfig;
  onSaveHomepageConfig: (config: HomepageConfig) => void;
  categories: SiteCategory[];
  onSaveCategories: (categories: SiteCategory[]) => void;
  books: Book[];
}

const PRESET_HERO_IMAGES = [
  { label: 'บรรยากาศร้านหนังสือสงบ (Original Warm Store)', url: heroBookstore },
  { label: 'กาแฟยามเช้าและหนังสือ (Cozy Morning Linen)', url: coverCozyMorning },
  { label: 'ห้องสมุดไม้ธรรมชาติ (Quiet Botanical Library)', url: coverQuietLibrary },
  { label: 'เรขาคณิตดินเผา (Peaceful Clay & Terracotta)', url: coverPeacefulMind }
];

export const AdminHomepageManager: React.FC<AdminHomepageManagerProps> = ({
  homepageConfig,
  onSaveHomepageConfig,
  categories,
  onSaveCategories,
  books
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'categories'>('hero');

  // Homepage Config Form States
  const [heroImage, setHeroImage] = useState(homepageConfig.heroImage);
  const [heroBadge, setHeroBadge] = useState(homepageConfig.heroBadge);
  const [heroHeading, setHeroHeading] = useState(homepageConfig.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(homepageConfig.heroSubtitle);
  const [heroQuote, setHeroQuote] = useState(homepageConfig.heroQuote);
  const [heroBranchTag, setHeroBranchTag] = useState(homepageConfig.heroBranchTag);
  const [announcementText, setAnnouncementText] = useState(homepageConfig.announcementText);
  const [contactPhone, setContactPhone] = useState(homepageConfig.contactPhone);
  const [curatorMotto, setCuratorMotto] = useState(homepageConfig.curatorMotto);

  const [imageInputMode, setImageInputMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Category Manager States
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatSlug, setEditingCatSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ภาพที่ถูกต้อง');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHeroImage(reader.result);
        setCustomUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHomepage = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HomepageConfig = {
      heroImage,
      heroBadge,
      heroHeading,
      heroSubtitle,
      heroQuote,
      heroBranchTag,
      announcementText,
      contactPhone,
      curatorMotto
    };
    onSaveHomepageConfig(updated);
    setSaveSuccessMsg('บันทึกการตั้งค่าหน้าหลักเรียบร้อยแล้ว และบันทึกลง SQLite');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');

    const slug = newCatSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!slug) {
      setCategoryError('กรุณาระบุรหัสหมวดภาษาอังกฤษ (Slug เช่น psychology, wellness)');
      return;
    }
    if (!newCatName.trim()) {
      setCategoryError('กรุณาระบุชื่อหมวดหมู่ภาษาไทย');
      return;
    }
    if (categories.some((c) => c.slug === slug)) {
      setCategoryError(`มีหมวดหมู่รหัส "${slug}" อยู่ในระบบแล้ว`);
      return;
    }

    const newCat: SiteCategory = {
      slug,
      name: newCatName.trim(),
      description: newCatDesc.trim() || undefined,
      isCustom: true
    };

    onSaveCategories([...categories, newCat]);
    setNewCatSlug('');
    setNewCatName('');
    setNewCatDesc('');
    setSaveSuccessMsg(`เพิ่มหมวดหมู่ "${newCat.name}" เรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Start Edit Category
  const handleStartEdit = (cat: SiteCategory) => {
    setEditingCatSlug(cat.slug);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  // Save Edit Category
  const handleSaveEdit = (slug: string) => {
    if (!editName.trim()) return;
    const updated = categories.map((c) => {
      if (c.slug === slug) {
        return { ...c, name: editName.trim(), description: editDesc.trim() };
      }
      return c;
    });
    onSaveCategories(updated);
    setEditingCatSlug(null);
    setSaveSuccessMsg(`แก้ไขข้อมูลหมวดหมู่เรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Delete Category
  const handleDeleteCategory = (slug: string, name: string) => {
    const bookCount = books.filter((b) => b.category === slug).length;
    if (bookCount > 0) {
      alert(`ไม่สามารถลบหมวดหมู่ "${name}" ได้ เนื่องจากยังมีหนังสือสังกัดหมวดหมู่นี้อยู่ ${bookCount} เล่ม กรุณาย้ายหมวดหมู่หนังสือก่อน`);
      return;
    }
    if (confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
      const updated = categories.filter((c) => c.slug !== slug);
      onSaveCategories(updated);
      setSaveSuccessMsg(`ลบหมวดหมู่ "${name}" เรียบร้อยแล้ว`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded border border-[#dac1b8] overflow-hidden space-y-0">
      {/* Tab Header */}
      <div className="p-4 sm:p-5 border-b border-[#dac1b8] bg-[#f9ebe7] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#914724]" />
            <h3 className="font-semibold text-base font-editorial-serif text-[#211a18]">
              ระบบปรับแต่งหน้าหลัก & จัดการหมวดหมู่หนังสือ
            </h3>
          </div>
          <p className="text-xs text-[#54433c] mt-0.5">
            แอดมินสามารถเปลี่ยนรูปภาพแบนเนอร์หน้าแรก แก้ไขข้อความประชาสัมพันธ์ และเพิ่ม/แก้ไขหมวดหมู่หนังสือในระบบ
          </p>
        </div>

        {/* Sub-tab Selector */}
        <div className="flex bg-white p-0.5 rounded border border-[#dac1b8] text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('hero')}
            className={`px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'hero' ? 'bg-[#914724] text-white shadow-xs' : 'text-[#54433c] hover:text-[#211a18]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ปรับแต่งหน้าหลัก (Hero & Banner)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('categories')}
            className={`px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'categories' ? 'bg-[#914724] text-white shadow-xs' : 'text-[#54433c] hover:text-[#211a18]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>จัดการหมวดหมู่ ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: HERO & HOMEPAGE CONFIG */}
      {activeSubTab === 'hero' && (
        <form onSubmit={handleSaveHomepage} className="p-5 sm:p-7 space-y-6 text-xs text-[#211a18]">
          {/* 1. Hero Image Customization */}
          <div className="bg-[#f5f0eb] p-4 sm:p-5 rounded border border-[#dac1b8] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-semibold text-xs sm:text-sm text-[#211a18] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#914724]" />
                <span>รูปภาพหน้าหลัก (Hero Atmosphere Banner)</span>
              </label>

              {/* Mode switch */}
              <div className="flex bg-white p-0.5 rounded border border-[#dac1b8] text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    imageInputMode === 'upload' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                  }`}
                >
                  อัปโหลดไฟล์ภาพ
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('preset')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    imageInputMode === 'preset' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                  }`}
                >
                  เลือกภาพแนะนำ
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    imageInputMode === 'url' ? 'bg-[#914724] text-white font-medium' : 'text-[#54433c]'
                  }`}
                >
                  ระบุ URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Preview */}
              <div className="md:col-span-5 relative rounded overflow-hidden border border-[#dac1b8] shadow-md bg-white">
                <img 
                  src={heroImage} 
                  alt="ตัวอย่างรูปภาพหน้าหลัก" 
                  className="w-full aspect-[16/10] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 text-white">
                  <div>
                    <span className="text-[10px] text-[#fdcaac] uppercase tracking-wider">{heroBranchTag}</span>
                    <p className="text-xs font-editorial-serif font-medium leading-snug mt-0.5">{heroQuote}</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="md:col-span-7 space-y-3">
                {imageInputMode === 'upload' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#dac1b8] hover:border-[#914724] bg-white p-5 rounded text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto text-[#914724] mb-1.5" />
                    <div className="font-medium text-xs text-[#211a18]">คลิกเพื่ออัปโหลดรูปภาพหน้าหลักใหม่</div>
                    <div className="text-[11px] text-[#7c563f] mt-0.5">รองรับไฟล์ JPG, PNG, WEBP แนะนำขนาดแนวนอน (16:10)</div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleHeroImageUpload} 
                    />
                  </div>
                )}

                {imageInputMode === 'preset' && (
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_HERO_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHeroImage(preset.url)}
                        className={`p-2 text-left rounded border text-xs flex items-center justify-between transition-colors ${
                          heroImage === preset.url 
                            ? 'bg-[#fff1ed] border-[#914724] font-medium text-[#914724]' 
                            : 'bg-white border-[#dac1b8] hover:bg-[#fff8f6]'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {heroImage === preset.url && <CheckCircle2 className="w-3.5 h-3.5 text-[#914724]" />}
                      </button>
                    ))}
                  </div>
                )}

                {imageInputMode === 'url' && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#54433c]">กรอก URL รูปภาพความละเอียดสูง:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#dac1b8] rounded bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => { if (customUrl.trim()) setHeroImage(customUrl.trim()); }}
                        className="px-3 py-1.5 bg-[#914724] text-white rounded text-xs"
                      >
                        ใช้ภาพนี้
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                      โควทบนรูปภาพหน้าแรก
                    </label>
                    <input
                      type="text"
                      value={heroQuote}
                      onChange={(e) => setHeroQuote(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-white text-xs font-editorial-serif italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                      ป้ายกำกับสาขาบนรูปภาพ
                    </label>
                    <input
                      type="text"
                      value={heroBranchTag}
                      onChange={(e) => setHeroBranchTag(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Hero Headings & Text */}
          <div className="space-y-4">
            <h4 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#914724]" />
              <span>ข้อความแนะนำร้าน (Hero Copywriting)</span>
            </h4>

            <div>
              <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                ป้ายหัวเรื่องเล็ก (Hero Badge)
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-medium text-[#914724]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                หัวข้อหลักประจำหน้าแรก (Main Heading)
              </label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs sm:text-sm font-editorial-serif font-bold text-[#211a18]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                คำบรรยายแนะนำบริการ (Hero Subtitle)
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Top Announcement & Utility Bar */}
          <div className="space-y-4 pt-3 border-t border-[#dac1b8]/70">
            <h4 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f] flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#914724]" />
              <span>แถบประกาศและติดต่อด้านบนสุด (Top Announcement Bar)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                  ข้อความประชาสัมพันธ์ในแถบบนสุด
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                คติพจน์ท้ายเว็บไซต์ (Curator Motto)
              </label>
              <input
                type="text"
                value={curatorMotto}
                onChange={(e) => setCuratorMotto(e.target.value)}
                className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-editorial-serif italic"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-[#dac1b8] flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#914724] hover:bg-[#793a1c] text-white font-semibold text-xs rounded transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการแก้ไขหน้าหลักทั้งหมด (Save to SQLite)</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: CATEGORY MANAGER */}
      {activeSubTab === 'categories' && (
        <div className="p-5 sm:p-7 space-y-6">
          {categoryError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{categoryError}</span>
            </div>
          )}

          {/* Existing Categories Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#914724]" />
                <span>หมวดหมู่หนังสือทั้งหมดในระบบ ({categories.length} หมวด)</span>
              </h4>
              <span className="text-[11px] text-[#87736b]">
                รวมหนังสือทั้งหมด {books.length} เล่ม
              </span>
            </div>

            <div className="border border-[#dac1b8] rounded overflow-hidden bg-white divide-y divide-[#dac1b8]/40">
              {categories.map((cat) => {
                const bookCount = books.filter((b) => b.category === cat.slug).length;
                const isEditing = editingCatSlug === cat.slug;

                return (
                  <div key={cat.slug} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fff8f6] transition-colors">
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="ชื่อหมวดหมู่ภาษาไทย"
                            className="flex-1 px-3 py-1.5 border border-[#914724] rounded text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.slug)}
                            className="px-3 py-1.5 bg-[#914724] text-white rounded text-xs font-medium"
                          >
                            บันทึก
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatSlug(null)}
                            className="px-2.5 py-1.5 border border-[#dac1b8] rounded text-xs text-[#54433c]"
                          >
                            ยกเลิก
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="คำอธิบายหมวดหมู่"
                          className="w-full px-3 py-1 border border-[#dac1b8] rounded text-xs bg-white text-[#54433c]"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-[#211a18]">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono bg-[#f9ebe7] text-[#7c563f] px-1.5 py-0.2 rounded border border-[#dac1b8]">
                            slug: {cat.slug}
                          </span>
                          {cat.isCustom && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                              กำหนดเอง
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#54433c] mt-0.5">
                          {cat.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#dac1b8]/40">
                      <span className="text-[#7c563f] font-mono text-[11px] bg-white px-2 py-1 rounded border border-[#dac1b8]">
                        มีหนังสือ: <strong>{bookCount}</strong> เล่ม
                      </span>

                      {!isEditing && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-[#54433c] hover:text-[#914724] hover:bg-[#ede0dc] rounded transition-colors"
                            title="แก้ไขชื่อหมวดหมู่นี้"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                            className="p-1.5 text-[#87736b] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="ลบหมวดหมู่นี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Category Form */}
          <div className="bg-[#f5f0eb] p-4 sm:p-5 rounded border border-[#dac1b8] space-y-4">
            <h4 className="font-editorial-serif font-semibold text-xs uppercase tracking-wider text-[#7c563f] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#914724]" />
              <span>เพิ่มหมวดหมู่หนังสือใหม่ (Add Category)</span>
            </h4>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    รหัสหมวดหมู่ภาษาอังกฤษ (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น psychology, self-growth, art"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-[#87736b]">ใช้เป็นรหัสอ้างอิง ไม่เว้นวรรค</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                    ชื่อหมวดหมู่ภาษาไทย (Display Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น จิตวิทยาความสัมพันธ์, ศิลปะและการเติบโต"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#54433c] mb-1">
                  คำอธิบายหมวดหมู่ (ความรู้สึกหรือแก่นของหนังสือในหมวด)
                </label>
                <input
                  type="text"
                  placeholder="เช่น หนังสือที่ช่วยให้เข้าใจมิติของความสัมพันธ์และความรักอันอบอุ่น"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dac1b8] rounded bg-white text-xs"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-xs rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มหมวดหมู่ใหม่สู่เว็บไซต์ (Log to SQLite)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
