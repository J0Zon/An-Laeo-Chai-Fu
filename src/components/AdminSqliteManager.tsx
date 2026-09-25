import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Play, 
  RotateCcw, 
  Table, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { sqliteService, AuditRecord } from '../db/sqliteService';
import { Book } from '../data/books';

interface AdminSqliteManagerProps {
  books: Book[];
  adminId: string;
}

export const AdminSqliteManager: React.FC<AdminSqliteManagerProps> = ({ books, adminId }) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM site_audit_logs ORDER BY id DESC LIMIT 20;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; values: any[][] } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const totalStock = books.reduce((sum, b) => sum + b.inStock, 0);
  const totalRentable = books.reduce((sum, b) => sum + b.availableForRent, 0);

  const loadLogs = async () => {
    try {
      const records = await sqliteService.getAllAuditLogs();
      setLogs(records);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [books.length]);

  const handleDownloadDatabase = async () => {
    setIsDownloading(true);
    try {
      await sqliteService.downloadSqliteFile('database.sqlite');
      setNotification('ดาวน์โหลดไฟล์ database.sqlite (ฐานข้อมูล SQLite จริง) สำเร็จเรียบร้อย');
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      alert('ไม่สามารถดาวน์โหลดไฟล์ได้: ' + e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadDatabaseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await sqliteService.loadDatabaseFromFile(file);
      await loadLogs();
      setNotification(`นำเข้าและโหลดฐานข้อมูล SQLite จากไฟล์ "${file.name}" สำเร็จ`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert('ไม่สามารถโหลดไฟล์ SQLite ได้: ' + (err.message || 'ไฟล์อาจไม่ใช่ SQLite 3'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTakeSnapshot = async () => {
    await sqliteService.recordStatsSnapshot({
      totalBooks: books.length,
      totalStock,
      totalRentable,
      activeBorrowed: 2,
      adminId
    });

    await sqliteService.logAuditAction({
      actionType: 'SNAPSHOT',
      targetType: 'SYSTEM',
      targetName: 'สถิติภาพรวมหนังสือและสต็อก',
      details: `บันทึก Snapshot ระบบ: หนังสือทั้งหมด ${books.length} เล่ม, สต็อกขาย ${totalStock} เล่ม, สต็อกยืม ${totalRentable} เล่ม`,
      totalBooksCount: books.length,
      adminId
    });

    await loadLogs();
    setNotification(`บันทึก Snapshot สถิติหนังสือ (${books.length} เล่ม) ลง SQLite สำเร็จ`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await sqliteService.runCustomQuery(sqlQuery.trim());
      setQueryResult(res);
    } catch (err: any) {
      setQueryError(err.message || 'คำสั่ง SQL ไม่ถูกต้อง');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action_type.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="bg-white rounded border border-[#dac1b8] overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#dac1b8] bg-[#f9ebe7] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#914724]" />
            <h3 className="font-semibold text-base font-editorial-serif text-[#211a18]">
              ฐานข้อมูล SQLite & ประวัติการแก้ไขเว็บไซต์ (SQLite Audit Database)
            </h3>
            <span className="text-[10px] bg-[#914724] text-white px-2 py-0.5 rounded font-mono font-medium">
              SQLite 3 File
            </span>
          </div>
          <p className="text-xs text-[#54433c] mt-0.5">
            บันทึกประวัติการเพิ่ม/แก้ไข/ลบหนังสือ ยอดสต็อก การปรับหน้าหลัก และจำนวนหนังสือในระบบลงในไฟล์ฐานข้อมูลจริง
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadDatabaseFile}
            accept=".sqlite,.db"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 bg-white hover:bg-[#fff1ed] text-[#7c563f] border border-[#dac1b8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="นำเข้าไฟล์ SQLite (.sqlite / .db) จากเครื่องของคุณ"
          >
            <span>📤 นำเข้าไฟล์ SQLite</span>
          </button>

          <button
            type="button"
            onClick={handleTakeSnapshot}
            className="py-2 px-3 bg-white hover:bg-[#fff1ed] text-[#7c563f] border border-[#dac1b8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="บันทึกภาพรวมสถิติหนังสือปัจจุบันลง SQLite"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>บันทึก Snapshot</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDatabase}
            disabled={isDownloading}
            className="py-2 px-3.5 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-70"
            title="ดาวน์โหลดไฟล์ฐานข้อมูล SQLite (database.sqlite) ไปเปิดในโปรแกรม SQLite Browser"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'กำลังสร้างไฟล์...' : '📥 ดาวน์โหลด database.sqlite'}</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Database File & Stats Summary Bar */}
      <div className="p-4 sm:p-5 bg-[#fff8f6] border-b border-[#dac1b8]/70">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded border border-[#dac1b8] shadow-2xs">
            <div className="text-[11px] text-[#7c563f] font-medium flex items-center justify-between">
              <span>หนังสือทั้งหมดในระบบ</span>
              <BookOpen className="w-3.5 h-3.5 text-[#914724]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18] mt-1">
              {books.length} <span className="text-xs font-sans font-normal text-[#54433c]">เล่ม</span>
            </div>
            <div className="text-[10px] text-[#87736b] mt-0.5">ตาราง site_stats_snapshots</div>
          </div>

          <div className="bg-white p-3.5 rounded border border-[#dac1b8] shadow-2xs">
            <div className="text-[11px] text-[#7c563f] font-medium flex items-center justify-between">
              <span>สต็อกขายในคลัง</span>
              <Layers className="w-3.5 h-3.5 text-[#914724]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18] mt-1">
              {totalStock} <span className="text-xs font-sans font-normal text-[#54433c]">เล่ม</span>
            </div>
            <div className="text-[10px] text-[#87736b] mt-0.5">สาขาอ่านแล้วใจฟู อารีย์</div>
          </div>

          <div className="bg-white p-3.5 rounded border border-[#dac1b8] shadow-2xs">
            <div className="text-[11px] text-[#7c563f] font-medium flex items-center justify-between">
              <span>เล่มหมุนเวียนให้ยืม</span>
              <RotateCcw className="w-3.5 h-3.5 text-[#914724]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18] mt-1">
              {totalRentable} <span className="text-xs font-sans font-normal text-[#54433c]">เล่ม</span>
            </div>
            <div className="text-[10px] text-[#87736b] mt-0.5">บริการยืม-อ่าน 7 วัน</div>
          </div>

          <div className="bg-white p-3.5 rounded border border-[#dac1b8] shadow-2xs">
            <div className="text-[11px] text-[#7c563f] font-medium flex items-center justify-between">
              <span>ประวัติการแก้ไขใน SQLite</span>
              <Database className="w-3.5 h-3.5 text-[#914724]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-editorial-serif text-[#211a18] mt-1">
              {logs.length} <span className="text-xs font-sans font-normal text-[#54433c]">รายการ</span>
            </div>
            <div className="text-[10px] text-[#87736b] mt-0.5">ไฟล์: database.sqlite</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: SQLite Audit Logs Table */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#914724]" />
            <h4 className="font-semibold text-xs sm:text-sm font-editorial-serif text-[#211a18]">
              ตารางประวัติการแก้ไขเว็บไซต์ (Table: site_audit_logs)
            </h4>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7c563f]">กรองประเภท:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2 py-1 bg-white border border-[#dac1b8] rounded text-xs text-[#211a18]"
            >
              <option value="all">ทั้งหมด ({logs.length})</option>
              <option value="BOOK">หนังสือ (เพิ่ม/แก้ไข/ลบ)</option>
              <option value="STOCK">สต็อกสินค้า</option>
              <option value="HOMEPAGE">หน้าหลัก</option>
              <option value="CATEGORY">หมวดหมู่</option>
              <option value="SNAPSHOT">Snapshot สถิติ</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-[#dac1b8] rounded overflow-x-auto bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9ebe7] border-b border-[#dac1b8] text-[#54433c] font-medium">
              <tr>
                <th className="py-2.5 px-3">การกระทำ (Action)</th>
                <th className="py-2.5 px-3">เป้าหมาย (Target)</th>
                <th className="py-2.5 px-3">รายละเอียดการแก้ไข</th>
                <th className="py-2.5 px-3 whitespace-nowrap">จำนวนหนังสือรวม</th>
                <th className="py-2.5 px-3 whitespace-nowrap">เจ้าหน้าที่</th>
                <th className="py-2.5 px-3 whitespace-nowrap">เวลาที่บันทึก</th>
                <th className="py-2.5 px-3 whitespace-nowrap">IP Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dac1b8]/40 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#87736b] font-sans">
                    ยังไม่มีข้อมูลประวัติการแก้ไขในประเภทนี้
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#fff8f6] transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.action_type.includes('UPLOAD') || item.action_type.includes('ADD') ? 'bg-emerald-100 text-emerald-800' :
                        item.action_type.includes('EDIT') || item.action_type.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                        item.action_type.includes('DELETE') ? 'bg-rose-100 text-rose-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {item.action_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-[#211a18] max-w-[150px] truncate">
                      {item.target_name}
                    </td>
                    <td className="py-2 px-3 font-sans text-[#54433c] max-w-[280px]">
                      {item.details}
                    </td>
                    <td className="py-2 px-3 text-[#914724] font-bold whitespace-nowrap">
                      {item.total_books_count} เล่ม
                    </td>
                    <td className="py-2 px-3 text-[#7c563f] whitespace-nowrap">
                      {item.admin_id}
                    </td>
                    <td className="py-2 px-3 text-[#87736b] whitespace-nowrap">
                      {item.created_at}
                    </td>
                    <td className="py-2 px-3 text-[#87736b] whitespace-nowrap">
                      {item.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Interactive WASM SQL Query Runner */}
      <div className="p-4 sm:p-5 bg-[#f5f0eb] border-t border-[#dac1b8] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#914724]" />
            <h4 className="font-semibold text-xs sm:text-sm font-editorial-serif text-[#211a18]">
              รันคำสั่ง SQL ผ่าน SQLite WebAssembly Engine
            </h4>
          </div>

          {/* Quick Query Templates */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[#7c563f]">ตัวอย่างคำสั่ง:</span>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT * FROM site_audit_logs ORDER BY id DESC LIMIT 10;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              Logs 10 รายการ
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT action_type, target_name, total_books_count, created_at FROM site_audit_logs;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              สรุปจำนวนเล่ม
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT * FROM site_stats_snapshots ORDER BY id DESC;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              Snapshots
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT id, title, category, buy_price, in_stock, available_for_rent FROM books;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              Books (หนังสือ)
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT * FROM site_categories;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery('SELECT * FROM site_config;')}
              className="px-2 py-0.5 bg-white border border-[#dac1b8] rounded text-[#211a18] hover:bg-[#fff1ed]"
            >
              Site Config
            </button>
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="relative">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="พิมพ์คำสั่ง SQL เช่น SELECT * FROM site_audit_logs;"
            className="w-full p-3 font-mono text-xs bg-[#211a18] text-[#f9ebe7] rounded border border-[#54433c] focus:outline-none focus:border-[#fdcaac]"
          />
          <button
            type="button"
            onClick={handleRunQuery}
            disabled={isExecuting}
            className="absolute right-3 bottom-3 py-1.5 px-3 bg-[#914724] hover:bg-[#af5f3a] text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isExecuting ? 'กำลังประมวลผล...' : 'รันคำสั่ง SQL'}</span>
          </button>
        </div>

        {/* Query Error */}
        {queryError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{queryError}</span>
          </div>
        )}

        {/* Query Results Table */}
        {queryResult && (
          <div className="border border-[#dac1b8] rounded overflow-x-auto bg-white max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#f9ebe7] sticky top-0 border-b border-[#dac1b8] text-[#54433c]">
                <tr>
                  {queryResult.columns.map((col, idx) => (
                    <th key={idx} className="py-2 px-3 font-semibold whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dac1b8]/40 text-[11px]">
                {queryResult.values.length === 0 ? (
                  <tr>
                    <td colSpan={queryResult.columns.length} className="py-4 text-center text-[#87736b]">
                      ผลลัพธ์ว่างเปล่า (0 แถว)
                    </td>
                  </tr>
                ) : (
                  queryResult.values.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#fff8f6]">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap max-w-xs truncate">
                          {String(val ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
