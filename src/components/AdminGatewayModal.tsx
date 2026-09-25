import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  KeyRound,
  IdCard,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AdminGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (credentials: { id: string; email: string }) => void;
  onSwitchToMemberLogin?: () => void;
}

export const AdminGatewayModal: React.FC<AdminGatewayModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToMemberLogin,
}) => {
  const [adminId, setAdminId] = useState('staff.naiin@admin.com');
  const [password, setPassword] = useState('NaiinAdmin#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [otp, setOtp] = useState<string[]>(['8', '8', '4', '2', '1', '0']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetNotice, setShowResetNotice] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanVal.length > 1) {
      // Handle paste
      const pastedDigits = cleanVal.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto advance
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminId.trim()) {
      setErrorMsg('กรุณากรอกรหัสเจ้าหน้าที่ หรืออีเมลผู้ดูแล');
      return;
    }
    if (!password) {
      setErrorMsg('กรุณากรอกรหัสผ่านบัญชีเจ้าหน้าที่');
      return;
    }
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('กรุณากรอกรหัสความปลอดภัย 2FA ให้ครบ 6 หลัก');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        id: 'AD-8842',
        email: adminId
      });
    }, 700);
  };

  const fillSampleOtp = () => {
    setOtp(['8', '8', '4', '2', '1', '0']);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-[620px] bg-[#fff8f6] rounded-md border border-[#dac1b8] shadow-2xl relative overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gateway-title"
      >
        {/* Top bar within card */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3">
          <button
            onClick={onClose}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#7c563f] hover:text-[#914724] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าร้าน อ่านแล้วใจฟู</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#54433c]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono tracking-tight font-medium">GATEWAY PORTAL v4.8</span>
          </div>
        </div>

        {/* Inner Card Content */}
        <div className="px-5 sm:px-8 py-3">
          {/* Header Badges & Title Box */}
          <div className="bg-[#f9ebe7] rounded-sm p-4 sm:p-5 border border-[#dac1b8]/60 mb-5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="inline-block text-[11px] font-semibold tracking-wider text-[#7c563f] uppercase">
                NAIIN BACKOFFICE & ADMIN SUITE
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#54433c] font-medium bg-[#fff8f6] px-2 py-0.5 rounded border border-[#dac1b8]">
                <Lock className="w-3 h-3 text-[#914724]" />
                <span>256-Bit SSL</span>
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-[#914724]/10 border border-[#914724]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#914724]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 id="gateway-title" className="text-base sm:text-lg font-semibold text-[#211a18] font-editorial-serif leading-snug">
                  เข้าสู่ระบบผู้ดูแลระบบ
                </h2>
                <p className="text-xs sm:text-[13px] text-[#54433c] mt-0.5 leading-relaxed">
                  ระบบจัดการคำสั่งซื้อ หนังสือยืม-คืน คลังสินค้าสาขา และสมาชิกของ อ่านแล้วใจฟู
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {showResetNotice && (
            <div className="mb-4 p-3 bg-[#fff1ed] border border-[#af5f3a]/40 text-[#914724] text-xs rounded flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">แจ้งรีเซ็ตรหัสผ่านเจ้าหน้าที่</p>
                <p className="text-[11px] text-[#54433c] mt-0.5">
                  กรุณาติดต่อ IT Helpdesk (เบอร์ภายใน 804) หรือส่งคำขอผ่าน Slack แชนแนล #it-support-admin
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Admin ID / Email */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#54433c] mb-1.5">
                <label htmlFor="adminIdInput" className="font-medium">
                  รหัสเจ้าหน้าที่ หรือ อีเมลผู้ดูแล
                </label>
                <span className="text-[11px] text-[#87736b]">Admin ID / Email</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87736b]">
                  <IdCard className="w-4 h-4" />
                </div>
                <input
                  id="adminIdInput"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="staff.naiin@admin.com หรือ AD-8842"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] focus:ring-1 focus:ring-[#914724] text-[#211a18] placeholder-[#87736b]"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#54433c] mb-1.5">
                <label htmlFor="adminPasswordInput" className="font-medium">
                  รหัสผ่านบัญชีเจ้าหน้าที่
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetNotice(!showResetNotice)}
                  className="text-[11px] text-[#914724] hover:underline"
                >
                  ติดต่อฝ่าย IT เพื่อรีเซ็ต
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87736b]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="adminPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] focus:ring-1 focus:ring-[#914724] text-[#211a18]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#87736b] hover:text-[#54433c]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: 2FA OTP */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-[#54433c] mb-1">
                <div className="flex items-center gap-1 font-medium text-[#211a18]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#914724]" />
                  <span>ยืนยันตัวตน 2FA (Authenticator / SMS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fillSampleOtp}
                    className="text-[11px] text-[#914724] hover:underline inline-flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>กรอกรหัสตัวอย่าง</span>
                  </button>
                  <span className="text-[11px] text-[#87736b]">OTP 6 หลัก</span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-[#54433c] mb-2 leading-relaxed">
                กรุณากรอกรหัสผ่านชั่วคราวความปลอดภัย 6 หลักจาก Microsoft/Google Authenticator หรือ SMS ทางโทรศัพท์ที่ผูกไว้
              </p>

              {/* 6 OTP boxes matching screenshot layout */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx] || ''}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-12 h-11 text-center text-lg font-semibold font-mono bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] focus:ring-1 focus:ring-[#914724] text-[#211a18]"
                    aria-label={`OTP Digit ${idx + 1}`}
                  />
                ))}

                <span className="text-[#87736b] font-bold px-0.5">-</span>

                {[3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx] || ''}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-12 h-11 text-center text-lg font-semibold font-mono bg-white border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] focus:ring-1 focus:ring-[#914724] text-[#211a18]"
                    aria-label={`OTP Digit ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Remember session checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="rememberSession"
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded text-[#914724] accent-[#914724] border-[#dac1b8] focus:ring-0 focus:outline-none cursor-pointer"
              />
              <label htmlFor="rememberSession" className="text-xs text-[#54433c] cursor-pointer select-none">
                จดจำเซสชันการทำงานบนอุปกรณ์นี้ (8 ชม.)
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-sm rounded shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบหลังบ้าน (Sign in to Admin Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* IT Desk Help line */}
          <div className="mt-4 pt-3 border-t border-[#dac1b8]/40 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#54433c]">
            <span>ต้องการความช่วยเหลือทางเทคนิค?</span>
            <span className="inline-flex items-center gap-1 font-medium text-[#7c563f]">
              ☎ ติดต่อฝ่ายสารสนเทศ (IT Desk Ext. 804)
            </span>
          </div>

          {/* Switch to General Member Login */}
          {onSwitchToMemberLogin && (
            <div className="mt-2.5 pt-2 text-center border-t border-dashed border-[#dac1b8]/40 text-xs">
              <span className="text-[#87736b]">ไม่ใช่เจ้าหน้าที่? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToMemberLogin();
                }}
                className="text-[#914724] font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>เข้าสู่ระบบสมาชิกนักอ่านทั่วไป (Member Portal)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Security Warning Box (Bottom of card as in Image 7) */}
        <div className="px-5 sm:px-8 pb-5 pt-2">
          <div className="bg-[#ede0dc]/80 rounded p-3.5 border border-[#dac1b8]/70 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
            <div className="text-xs text-[#54433c] leading-relaxed">
              <span className="font-semibold text-[#211a18]">
                ข้อบังคับความมั่นคงปลอดภัยของข้อมูลสารสนเทศ :
              </span>{' '}
              สงวนสิทธิ์เฉพาะพนักงานและผู้ดูแลระบบ Naiin ที่ได้รับมอบหมายเท่านั้น
              การเข้าถึงโดยมิชอบจะถูกบันทึก IP Audit Trail และดำเนินการตาม พ.ร.บ. คอมพิวเตอร์
            </div>
          </div>

          {/* Daily Maintenance Time */}
          <div className="text-center mt-3 text-[11px] text-[#87736b] flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Maintenance: 08:30 - 17:30 น.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
