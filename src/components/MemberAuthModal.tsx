import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  BookHeart, 
  User, 
  Phone, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Key,
  Heart
} from 'lucide-react';

interface MemberAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; phone: string; avatarText: string; tier: string }) => void;
  onSwitchToAdmin: () => void;
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('kanchana.w@reader.co.th');
  const [loginPassword, setLoginPassword] = useState('Reader2026#');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFavoriteGenre, setRegFavoriteGenre] = useState('healing');
  const [regConsent, setRegConsent] = useState(true);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์');
      return;
    }
    if (!loginPassword) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'กานต์ชนก วรรณวิศิษฏ์',
        email: loginIdentifier.includes('@') ? loginIdentifier : 'kanchana.w@reader.co.th',
        phone: '081-992-4819',
        avatarText: 'กช',
        tier: 'สมาชิกคลับอ่านใจฟู VIP'
      });
      onClose();
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setLoginError('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const initials = regName.trim().slice(0, 2);
      onLoginSuccess({
        name: regName,
        email: regEmail,
        phone: regPhone || '089-123-4567',
        avatarText: initials || 'สม',
        tier: 'สมาชิกคลับอ่านใจฟู (สมาชิกใหม่)'
      });
      onClose();
    }, 700);
  };

  const fillDemoAccount = () => {
    setLoginIdentifier('kanchana.w@reader.co.th');
    setLoginPassword('Reader2026#');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-[520px] bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-auth-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#f9ebe7] hover:bg-[#ede0dc] text-[#54433c] flex items-center justify-center transition-colors"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-[#f9ebe7] px-6 sm:px-8 pt-7 pb-5 border-b border-[#dac1b8]/70">
          <div className="flex items-center gap-2 text-[#914724] mb-1.5">
            <BookHeart className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#7c563f]">
              อ่านแล้วใจฟู · สมาชิกนักอ่าน
            </span>
          </div>

          <h2 id="member-auth-title" className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18]">
            {activeTab === 'login' ? 'เข้าสู่ระบบสมาชิก' : 'สมัครสมาชิกคลับอ่านใจฟู'}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#54433c] mt-1 leading-relaxed">
            {activeTab === 'login' 
              ? 'ยินดีต้อนรับกลับสู่พื้นที่แห่งการอ่านอันสงบ เพื่อยืม-อ่านหนังสือ ติดตามพัสดุ และสะสมคะแนน'
              : 'เริ่มต้นช่วงเวลาแห่งความสุขสงบ ยืมหนังสือส่งถึงบ้าน พร้อมรับสิทธิ์อ่านฟรี 1 สัปดาห์'}
          </p>

          {/* Tab Selector */}
          <div className="flex bg-white p-1 rounded border border-[#dac1b8] mt-4">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#914724] text-white shadow-xs'
                  : 'text-[#54433c] hover:text-[#211a18]'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setLoginError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#914724] text-white shadow-xs'
                  : 'text-[#54433c] hover:text-[#211a18]'
              }`}
            >
              สมัครสมาชิกใหม่ (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {loginError}
            </div>
          )}

          {activeTab === 'login' ? (
            /* TAB 1: Member Login */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#54433c] mb-1.5">
                  <label htmlFor="memberLoginId" className="font-medium text-[#211a18]">
                    อีเมล หรือ เบอร์โทรศัพท์มือถือ
                  </label>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="text-[11px] text-[#914724] hover:underline inline-flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>กรอกบัญชีตัวอย่าง</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87736b]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="memberLoginId"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="kanchana.w@reader.co.th หรือ 081-992-4819"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#54433c] mb-1.5">
                  <label htmlFor="memberPassword" className="font-medium text-[#211a18]">
                    รหัสผ่าน
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณเรียบร้อยแล้ว'); }} className="text-[11px] text-[#914724] hover:underline">
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87736b]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="memberPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#87736b] hover:text-[#54433c]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#54433c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#914724] accent-[#914724] border-[#dac1b8]"
                  />
                  <span>จดจำการเข้าสู่ระบบในครั้งถัดไป</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-sm rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบสมาชิก</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Social Login Options */}
              <div className="pt-3">
                <div className="relative flex items-center justify-center text-xs text-[#87736b] mb-3">
                  <div className="border-t border-[#dac1b8] w-full" />
                  <span className="bg-[#fff8f6] px-3 absolute">หรือเข้าสู่ระบบด้วย</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess({
                        name: 'กานต์ชนก (LINE ID)',
                        email: 'kanchana@line.me',
                        phone: '081-992-4819',
                        avatarText: 'กช',
                        tier: 'สมาชิกคลับอ่านใจฟู (LINE)'
                      });
                      onClose();
                    }}
                    className="py-2 px-3 border border-[#dac1b8] bg-white hover:bg-[#f9ebe7] rounded flex items-center justify-center gap-2 text-[#211a18] font-medium transition-colors"
                  >
                    <span className="w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">L</span>
                    <span>LINE Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess({
                        name: 'กานต์ชนก วรรณวิศิษฏ์',
                        email: 'kanchana.w@gmail.com',
                        phone: '081-992-4819',
                        avatarText: 'กช',
                        tier: 'สมาชิกคลับอ่านใจฟู (Google)'
                      });
                      onClose();
                    }}
                    className="py-2 px-3 border border-[#dac1b8] bg-white hover:bg-[#f9ebe7] rounded flex items-center justify-center gap-2 text-[#211a18] font-medium transition-colors"
                  >
                    <span className="font-bold text-[#ba1a1a]">G</span>
                    <span>Google</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: Member Register */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#211a18] mb-1">
                  ชื่อ-นามสกุล ที่แสดงในบัญชี
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#87736b] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น กานต์ชนก วรรณวิศิษฏ์"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#211a18] mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@mail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#211a18] mb-1">
                    เบอร์โทรศัพท์ (รับ SMS คืนหนังสือ)
                  </label>
                  <input
                    type="tel"
                    placeholder="081-xxx-xxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#211a18] mb-1">
                  กำหนดรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#211a18] mb-1">
                  หมวดหนังสือที่คุณโปรดปรานที่สุด
                </label>
                <select
                  value={regFavoriteGenre}
                  onChange={(e) => setRegFavoriteGenre(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] text-[#211a18]"
                >
                  <option value="healing">หนังสือฮีลใจและพัฒนาตนเอง (Mental Wellness)</option>
                  <option value="literature">วรรณกรรมแปลร่วมสมัย (Contemporary Literature)</option>
                  <option value="philosophy">ปรัชญาและวะบิ-ซะบิ (Philosophy & Wabi-Sabi)</option>
                  <option value="fiction">นิยายแปลอบอุ่นหัวใจ (Cozy Fiction)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-[#54433c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regConsent}
                    onChange={(e) => setRegConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#914724] accent-[#914724] border-[#dac1b8]"
                  />
                  <span>ฉันยอมรับข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวของ อ่านแล้วใจฟู</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-sm rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
              >
                <span>สมัครสมาชิกและเริ่มยืมอ่าน</span>
                <Heart className="w-4 h-4 fill-current text-white/90" />
              </button>
            </form>
          )}

          {/* Separation Footer: Dedicated Link to Admin Gateway */}
          <div className="mt-6 pt-4 border-t border-[#dac1b8]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#54433c] bg-[#f9ebe7] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4">
            <div className="flex items-center gap-1.5 text-[#7c563f]">
              <Key className="w-3.5 h-3.5 text-[#914724]" />
              <span>สำหรับพนักงานและผู้ดูแลระบบ:</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToAdmin();
              }}
              className="font-semibold text-[#914724] hover:underline inline-flex items-center gap-1"
            >
              <span>เข้าสู่ระบบหลังบ้าน (Admin Suite) ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
