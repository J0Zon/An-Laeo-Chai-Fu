import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Key, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  FileJson,
  Sparkles,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import { Book } from '../data/books';
import { githubSyncService, GitHubConfig } from '../services/githubSyncService';

interface AdminGitHubManagerProps {
  books: Book[];
  onUpdateBooks: (books: Book[]) => void;
  showNotification: (msg: string) => void;
}

export const AdminGitHubManager: React.FC<AdminGitHubManagerProps> = ({
  books,
  onUpdateBooks,
  showNotification
}) => {
  const [config, setConfig] = useState<GitHubConfig>(githubSyncService.getConfig());
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    setConfig(githubSyncService.getConfig());
  }, []);

  const handleSaveConfig = (newConfigPartial: Partial<GitHubConfig>) => {
    const updated = githubSyncService.saveConfig(newConfigPartial);
    setConfig(updated);
    showNotification('บันทึกการตั้งค่า GitHub เรียบร้อยแล้ว');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await githubSyncService.testConnection();
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      showNotification(result.message);
    }
  };

  const handlePushToGitHub = async () => {
    setIsPushing(true);
    const result = await githubSyncService.commitBooksToGitHub(
      books,
      `แอดมินซิงก์ข้อมูลหนังสือทั้งหมดผ่านหน้าจัดการ`
    );
    setIsPushing(false);
    setConfig(githubSyncService.getConfig());

    if (result.success) {
      showNotification(result.message);
    } else {
      showNotification(result.message);
    }
  };

  const handlePullFromGitHub = async () => {
    setIsPulling(true);
    try {
      const result = await githubSyncService.fetchBooksFromGitHub();
      if (result && result.books && result.books.length > 0) {
        onUpdateBooks(result.books);
        try {
          localStorage.setItem('bookstore_active_books', JSON.stringify(result.books));
        } catch {}
        showNotification(`ดึงข้อมูลหนังสือล่าสุดจาก GitHub เรียบร้อยแล้ว (${result.books.length} เล่ม ผ่านช่องทาง ${result.source})`);
      } else {
        showNotification('ไม่พบไฟล์ข้อมูลหนังสือบน GitHub หรือไฟล์ว่างเปล่า');
      }
    } catch (err: any) {
      showNotification(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(books, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
      showNotification('คัดลอกไฟล์ JSON หนังสือล่าสุดเรียบร้อยแล้ว');
    } catch {}
  };

  const handleDownloadJson = () => {
    try {
      const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'server_books.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('ดาวน์โหลดไฟล์ server_books.json เรียบร้อยแล้ว');
    } catch {}
  };

  const isConfigured = Boolean(config.owner && config.repo && config.token);

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isConfigured 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : 'bg-[#fff1ed] border-[#dac1b8] text-[#793a1c]'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-[#fdcaac]/60 text-[#914724]'}`}>
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base">
                {isConfigured ? 'ระบบซิงก์ข้อมูลกับ GitHub เปิดใช้งานแล้ว' : 'ตั้งค่าระบบเชื่อมต่อ GitHub (Auto-Sync)'}
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isConfigured ? 'bg-emerald-200/80 text-emerald-900' : 'bg-[#eecdc2] text-[#793a1c]'
              }`}>
                {isConfigured ? 'พร้อมซิงก์อัตโนมัติ' : 'ยังไม่ได้เชื่อมต่อ'}
              </span>
            </div>
            <p className="text-xs mt-1 text-[#54433c]">
              เมื่อตั้งค่าเชื่อมต่อแล้ว ทุกครั้งที่มีการแก้ไข เพิ่ม หรือลบหนังสือ ข้อมูลจะถูกคอมมิตขึ้น GitHub ทันที 
              และคนที่นำลิงก์เว็บไซต์ไปเปิด (ต่อให้ไม่ได้ล็อกอิน) ก็จะเห็นข้อมูลหนังสือล่าสุดเสมอ
            </p>
            {config.lastSyncedAt && (
              <p className="text-[11px] mt-1 text-emerald-800 font-medium">
                ซิงก์ล่าสุดเมื่อ: {config.lastSyncedAt}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handlePushToGitHub}
            disabled={!isConfigured || isPushing}
            className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              isConfigured && !isPushing
                ? 'bg-[#914724] hover:bg-[#793a1c] text-white shadow-xs'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title="ส่งข้อมูลหนังสือทั้งหมดขึ้น GitHub เดี๋ยวนี้"
          >
            <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
            <span>{isPushing ? 'กำลัง Push...' : 'Push ขึ้น GitHub'}</span>
          </button>

          <button
            type="button"
            onClick={handlePullFromGitHub}
            disabled={isPulling}
            className="px-3 py-2 text-xs font-semibold rounded bg-[#fff8f6] hover:bg-[#f9ebe7] text-[#7c563f] border border-[#dac1b8] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดึงข้อมูลหนังสือล่าสุดจาก GitHub"
          >
            <DownloadCloud className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? 'กำลังดึง...' : 'Pull จาก GitHub'}</span>
          </button>
        </div>
      </div>

      {/* GitHub Repository Settings Form */}
      <div className="bg-white border border-[#dac1b8] rounded-lg p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#dac1b8]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211a18]">
            <Globe className="w-4 h-4 text-[#914724]" />
            <span>ข้อมูลการเชื่อมต่อ GitHub Repository</span>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#54433c] cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleSaveConfig({ autoSync: e.target.checked })}
              className="accent-[#914724] w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-medium">เปิด Auto-Sync เมื่อแก้ไข/เพิ่ม/ลบหนังสือ</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Owner */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#54433c] flex items-center justify-between">
              <span>GitHub Owner (ชื่อบัญชีผู้ใช้ หรือ องค์กร)</span>
              <span className="text-[10px] text-stone-400 font-normal">เช่น fang47007</span>
            </label>
            <input
              type="text"
              value={config.owner}
              onChange={(e) => setConfig({ ...config, owner: e.target.value.trim() })}
              placeholder="e.g. fang47007"
              className="w-full px-3 py-2 border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] font-mono text-xs"
            />
          </div>

          {/* Repo Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#54433c] flex items-center justify-between">
              <span>Repository Name (ชื่อคลังโปรเจกต์)</span>
              <span className="text-[10px] text-stone-400 font-normal">เช่น my-bookstore</span>
            </label>
            <input
              type="text"
              value={config.repo}
              onChange={(e) => setConfig({ ...config, repo: e.target.value.trim() })}
              placeholder="e.g. read-healing-bookstore"
              className="w-full px-3 py-2 border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] font-mono text-xs"
            />
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#54433c] flex items-center justify-between">
              <span>Branch (กิ่งที่ใช้บันทึก)</span>
              <span className="text-[10px] text-stone-400 font-normal">ค่าเริ่มต้น: main</span>
            </label>
            <input
              type="text"
              value={config.branch}
              onChange={(e) => setConfig({ ...config, branch: e.target.value.trim() })}
              placeholder="main"
              className="w-full px-3 py-2 border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] font-mono text-xs"
            />
          </div>

          {/* Target File Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#54433c] flex items-center justify-between">
              <span>File Path ใน Repository</span>
              <span className="text-[10px] text-stone-400 font-normal">ค่าเริ่มต้น: src/data/server_books.json</span>
            </label>
            <input
              type="text"
              value={config.filePath}
              onChange={(e) => setConfig({ ...config, filePath: e.target.value.trim() })}
              placeholder="src/data/server_books.json"
              className="w-full px-3 py-2 border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] font-mono text-xs"
            />
          </div>
        </div>

        {/* GitHub Personal Access Token */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-xs text-[#54433c] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#914724]" />
              <span>GitHub Personal Access Token (PAT)</span>
            </label>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#914724] hover:underline flex items-center gap-1"
            >
              <span>กดที่นี่เพื่อสร้าง Token ใหม่บน GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value.trim() })}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full pl-3 pr-10 py-2 border border-[#dac1b8] rounded focus:outline-none focus:border-[#914724] font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            * Token จะถูกบันทึกไว้อย่างปลอดภัยในเบราว์เซอร์ของคุณเพื่อใช้ในการคอมมิตไฟล์ขึ้น GitHub (เลือก scope: <code className="bg-stone-100 px-1 py-0.5 rounded text-[#914724]">repo</code> หรือ <code className="bg-stone-100 px-1 py-0.5 rounded text-[#914724]">contents:write</code>)
          </p>
        </div>

        {/* Action Buttons & Test Connection */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dac1b8]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveConfig(config)}
              className="px-4 py-2 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-xs"
            >
              บันทึกการตั้งค่า
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-[#f9ebe7] hover:bg-[#f3e5e2] text-[#7c563f] border border-[#dac1b8] text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1.5 text-xs text-[#7c563f] hover:text-[#914724] border border-[#dac1b8] rounded flex items-center gap-1.5 bg-[#fff8f6] cursor-pointer"
              title="คัดลอก JSON ทั้งหมด"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-1.5 text-xs text-[#7c563f] hover:text-[#914724] border border-[#dac1b8] rounded flex items-center gap-1.5 bg-[#fff8f6] cursor-pointer"
              title="ดาวน์โหลดไฟล์ JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded text-xs flex items-center gap-2 ${
            testResult.success 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}>
            {testResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Instructional Guide for Sharing Website Link */}
      <div className="bg-[#fcf8f5] border border-[#dac1b8] rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#793a1c]">
          <Sparkles className="w-4 h-4 text-[#914724]" />
          <span>การทำงานแบบ Real-time เมื่อนำลิงก์เว็บไปแจกจ่ายให้ผู้อื่น (GitHub Pages)</span>
        </div>
        <ul className="text-xs text-[#54433c] space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>ไม่ต้องล็อกอินก็เห็นเหมือนกัน:</strong> เมื่อคุณแก้ไข เพิ่ม หรือลบหนังสือ ระบบจะคอมมิตอัปเดตไฟล์ขึ้น GitHub โดยอัตโนมัติ
          </li>
          <li>
            <strong>Real-time Auto-Fetch:</strong> ทุกคนที่เปิดดูผ่านลิงก์เว็บไซต์ ระบบจะตรวจจับและดึงข้อมูลหนังสือล่าสุดจาก GitHub ทุกๆ 15 วินาที ทำให้หนังสือที่ลงขายหรือถูกลบ จะอัปเดตตรงกันทันที
          </li>
          <li>
            <strong>รองรับทั้งสองไฟล์พร้อมกัน:</strong> ระบบจะบันทึกทั้ง <code className="bg-[#f0dfd8] px-1 py-0.5 rounded text-[#914724]">src/data/server_books.json</code> และ <code className="bg-[#f0dfd8] px-1 py-0.5 rounded text-[#914724]">public/books.json</code> ทำให้การ Deploy บน GitHub Pages ทำงานได้อย่างสมบูรณ์แบบ
          </li>
        </ul>
      </div>
    </div>
  );
};
