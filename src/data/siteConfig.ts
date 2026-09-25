import heroBookstore from '../assets/images/hero_bookstore_curation_1790332831900.jpg';

export interface HomepageConfig {
  heroImage: string;
  heroBadge: string;
  heroHeading: string;
  heroSubtitle: string;
  heroQuote: string;
  heroBranchTag: string;
  announcementText: string;
  contactPhone: string;
  curatorMotto: string;
}

export interface SiteCategory {
  slug: string;
  name: string;
  description?: string;
  isCustom?: boolean;
}

export const INITIAL_HOMEPAGE_CONFIG: HomepageConfig = {
  heroImage: heroBookstore,
  heroBadge: 'บริการยืม-อ่านหนังสือส่งถึงบ้าน · อ่านแล้วใจฟู',
  heroHeading: 'ช่วงเวลาที่ผ่อนคลายที่สุด มักเริ่มต้นด้วยหนังสือเล่มโปรด',
  heroSubtitle: 'ค้นพบวรรณกรรมคัดสรร บทความสร้างแรงบันดาลใจ และหนังสือฮีลใจ พร้อมบริการส่งตรงถึงบ้าน และส่งคืนง่ายดาย สร้างช่วงเวลาแห่งความสงบสุขุมให้แก่ชีวิตประจำวัน',
  heroQuote: '“หนังสือที่ดีจะพบกับผู้อ่านในเวลาที่เหมาะสมเสมอ”',
  heroBranchTag: 'จุดคืนหนังสือ 1 : สาขาอารีย์',
  announcementText: 'บริการยืม-อ่านหนังสือ จัดส่งถึงมือภายใน 7 วัน • คืนหนังสือได้ทุกสาขาที่ร่วมรายการ 1',
  contactPhone: '0952260122',
  curatorMotto: '“การอ่านไม่ได้พาเราหนีความจริง แต่สอนให้เราสบตากับชีวิตด้วยความเมตตา”'
};

export const INITIAL_CATEGORIES: SiteCategory[] = [
  { slug: 'healing', name: 'หนังสือฮีลใจและพัฒนาตนเอง', description: 'เพื่อการเยียวยาจิตใจและเติมพลังบวกในทุกๆ วัน' },
  { slug: 'literature', name: 'วรรณกรรมแปลร่วมสมัย', description: 'เรื่องราวสะท้อนมิติชีวิตลึกซึ้งจากทั่วทุกมุมโลก' },
  { slug: 'philosophy', name: 'ปรัชญาและบทกวี', description: 'ความคิดตกผลึกและสุนทรียภาพแห่งชีวิตที่เรียบง่าย' },
  { slug: 'essay', name: 'บทความและเรียงความ', description: 'มุมมองอันละเมียดละไมต่อสิ่งรอบตัวและวิถีผู้คน' },
  { slug: 'fiction', name: 'นิยายแปลอบอุ่น', description: 'เรื่องเล่าชุบชูหัวใจและมิตรภาพที่ตราตรึง' }
];
