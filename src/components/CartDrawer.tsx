import React, { useState, useEffect } from 'react';
import { CartItem, BorrowedBook } from '../data/books';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Truck, UserCheck, Sparkles, Mail, Phone, MapPin, User } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  memberUser?: { name: string; email: string; phone?: string } | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess?: (customer: { name: string; phone: string; address: string; email: string }, rentedItems: CartItem[]) => void;
  onOpenMemberAuth?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  memberUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  onOpenMemberAuth,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Prefill if member logged in, otherwise default to empty or friendly guest placeholder
  useEffect(() => {
    if (memberUser) {
      setCustomerName(memberUser.name || '');
      setPhoneNumber(memberUser.phone || '081-992-4819');
      setEmail(memberUser.email || '');
      if (!shippingAddress) {
        setShippingAddress('14/82 ซอยอารีย์สัมพันธ์ 1 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กทม. 10400');
      }
    }
  }, [memberUser]);

  if (!isOpen) return null;

  // Calculations
  const booksSubtotal = items.reduce((sum, item) => {
    if (item.type === 'buy') {
      return sum + item.book.buyPrice * item.quantity;
    } else {
      const weeks = item.weeks || 2;
      return sum + item.book.rentPricePerWeek * weeks * item.quantity;
    }
  }, 0);

  const depositsTotal = items.reduce((sum, item) => {
    if (item.type === 'rent') {
      return sum + item.book.depositAmount * item.quantity;
    }
    return sum;
  }, 0);

  const rentedItems = items.filter((i) => i.type === 'rent');
  const boughtItems = items.filter((i) => i.type === 'buy');

  const shippingFee = booksSubtotal > 300 ? 0 : 45;
  const grandTotal = booksSubtotal + depositsTotal + shippingFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCheckoutSuccess) {
      onCheckoutSuccess(
        {
          name: customerName.trim() || 'ผู้อ่านทั่วไป (Guest)',
          phone: phoneNumber.trim(),
          address: shippingAddress.trim(),
          email: email.trim(),
        },
        rentedItems
      );
    }
    setCheckoutComplete(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 backdrop-blur-[2px]">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fff8f6] border-l border-[#dac1b8] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#dac1b8] flex items-center justify-between bg-[#f9ebe7]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#914724]" />
              <h2 className="font-editorial-serif font-bold text-base text-[#211a18]">
                ตะกร้าหนังสือของคุณ
              </h2>
              <span className="text-xs bg-white text-[#914724] px-2 py-0.5 rounded border border-[#dac1b8] font-mono">
                {items.length} รายการ
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#54433c] hover:text-[#211a18] hover:bg-[#ede0dc] transition-colors cursor-pointer"
              aria-label="ปิดตะกร้า"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {memberUser && (
            <div className="px-4 py-2 bg-[#fff1ed] border-b border-[#dac1b8] flex items-center justify-between text-[11px] text-emerald-800 font-medium">
              <span>สมาชิกคลับอ่านใจฟู</span>
              <span>{memberUser.name}</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {checkoutComplete ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-editorial-serif text-lg font-bold text-[#211a18]">
                  สั่งซื้อและยืมหนังสือสำเร็จ!
                </h3>
                <p className="text-xs text-[#54433c] leading-relaxed max-w-xs mx-auto">
                  หมายเลขคำสั่งซื้อ <strong className="font-mono text-[#914724]">#ORD-{Date.now().toString().slice(-4)}</strong>
                  <br />
                  เรากำลังจัดเตรียมหนังสือและจัดส่งถึงคุณภายใน 7 วันทำการ
                </p>

                {rentedItems.length > 0 && (
                  <div className="p-3 bg-[#e8f5e9] border border-emerald-300 rounded text-left text-xs text-emerald-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>บันทึกรายการยืมอ่าน ({rentedItems.length} เล่ม) ให้คุณแล้ว!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      คุณสามารถตรวจสอบกำหนดส่งคืนและจุดคืนหนังสือได้ทันทีที่เมนู <strong>"รายการเช่า/ยืมหนังสือ"</strong> โดยไม่ต้องล็อกอิน
                    </p>
                  </div>
                )}

                <div className="bg-[#f9ebe7] p-3 rounded text-left text-xs space-y-1 text-[#54433c] border border-[#dac1b8]">
                  <p><strong>ผู้รับ:</strong> {customerName || 'ผู้อ่านทั่วไป (Guest)'}</p>
                  {phoneNumber && <p><strong>เบอร์โทร:</strong> {phoneNumber}</p>}
                  {email && <p><strong>อีเมล:</strong> {email}</p>}
                  <p><strong>ที่อยู่จัดส่ง:</strong> {shippingAddress || 'จัดส่งตามที่อยู่ที่ระบุ'}</p>
                  <p><strong>ยอดชำระ:</strong> ฿{grandTotal} {depositsTotal > 0 ? `(รวมเงินมัดจำ ฿${depositsTotal})` : ''}</p>
                  <p className="text-[11px] text-[#7c563f] pt-1">
                    สถานะการสั่งซื้อ: {memberUser ? 'สั่งซื้อในฐานะสมาชิก' : 'สั่งซื้อในฐานะบุคคลทั่วไป (Guest Order ไม่ต้องล็อกอิน)'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCheckoutComplete(false);
                    setIsCheckingOut(false);
                    onClearCart();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#914724] text-white text-xs font-medium rounded hover:bg-[#793a1c] transition-colors cursor-pointer"
                >
                  กลับไปอ่านหนังสือต่อ
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-[#87736b]">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#7c563f]" />
                <p className="text-sm font-medium">ไม่มีหนังสือในตะกร้า</p>
                <p className="text-xs mt-1 text-[#54433c]">เลือกหนังสือเล่มที่ถูกใจแล้วกด ยืมอ่าน หรือ ซื้อเล่มนี้ได้ทันที (ไม่ต้องล็อกอิน)</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-3.5 rounded border border-[#dac1b8] flex gap-3 shadow-xs">
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-14 h-20 object-cover rounded shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-editorial-serif text-xs font-semibold text-[#211a18] line-clamp-1">
                            {item.book.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#87736b] hover:text-[#ba1a1a] transition-colors p-0.5 cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#7c563f]">
                          {item.type === 'rent' ? (
                            <span className="text-[#914724] font-medium">
                              ยืมอ่าน ({item.weeks || 2} สัปดาห์) · มัดจำ ฿{item.book.depositAmount}
                            </span>
                          ) : (
                            <span>สั่งซื้อเป็นเจ้าของ ({item.book.format})</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#dac1b8]/40">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded bg-[#f3e5e2] text-[#211a18] text-xs font-bold hover:bg-[#ede0dc] flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded bg-[#914724] text-white text-xs font-bold hover:bg-[#793a1c] flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-xs font-bold font-mono text-[#211a18]">
                          ฿{item.type === 'buy' 
                              ? item.book.buyPrice * item.quantity 
                              : item.book.rentPricePerWeek * (item.weeks || 2) * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Checkout Mode Toggle */}
                {isCheckingOut ? (
                  <form onSubmit={handleCheckoutSubmit} className="bg-white p-4 rounded border border-[#dac1b8] space-y-3 mt-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#dac1b8]/70 pb-2">
                      <h4 className="font-semibold text-xs text-[#211a18] font-editorial-serif flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#914724]" />
                        <span>ข้อมูลจัดส่งพัสดุถึงบ้าน</span>
                      </h4>
                      <span className="text-[10px] bg-[#f9ebe7] text-[#914724] px-2 py-0.5 rounded border border-[#dac1b8] font-medium">
                        {memberUser ? 'สมาชิก' : 'สั่งซื้อแบบ Guest (ไม่ต้องล็อกอิน)'}
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#54433c] block mb-1">
                        ชื่อ-นามสกุล ผู้รับ <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ระบุชื่อและนามสกุลสำหรับจ่าหน้าพัสดุ"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-[#fff8f6] text-xs text-[#211a18] focus:outline-none focus:border-[#914724]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-[#54433c] block mb-1">
                          เบอร์โทรติดต่อ <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="08X-XXX-XXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-[#fff8f6] text-xs text-[#211a18] focus:outline-none focus:border-[#914724]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#54433c] block mb-1">
                          อีเมล (สำหรับส่งใบเสร็จ & เลขพัสดุ)
                        </label>
                        <input
                          type="email"
                          placeholder="reader@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-[#fff8f6] text-xs text-[#211a18] focus:outline-none focus:border-[#914724]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#54433c] block mb-1">
                        ที่อยู่จัดส่งหนังสือ <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#dac1b8] rounded bg-[#fff8f6] text-xs text-[#211a18] focus:outline-none focus:border-[#914724]"
                      />
                    </div>

                    <div className="text-[11px] text-[#7c563f] flex items-center gap-1.5 bg-[#f9ebe7] p-2 rounded">
                      <Truck className="w-3.5 h-3.5 text-[#914724] shrink-0" />
                      <span>ห่อด้วยซองผ้าฝ้ายถนอมหนังสือ จัดส่งถึงบ้านภายใน 7 วันทำการ</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="py-2 px-3 bg-white border border-[#dac1b8] text-[#54433c] rounded text-xs hover:bg-[#fff8f6] cursor-pointer"
                      >
                        ย้อนกลับ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#914724] hover:bg-[#793a1c] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
                      >
                        ยืนยันคำสั่งซื้อ & ชำระเงิน (฿{grandTotal})
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-[#f9ebe7] p-3 rounded text-[11px] text-[#54433c] space-y-1.5 border border-[#dac1b8]/70">
                    <div className="flex items-center gap-1 font-medium text-[#914724]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>เงื่อนไขการบริการ & การคืนมัดจำ</span>
                    </div>
                    {depositsTotal > 0 ? (
                      <p>
                        เงินมัดจำหนังสือยืม ฿{depositsTotal} จะถูกโอนคืนเต็มจำนวนทันทีเมื่อหนังสือถูกส่งคืนถึงจุดคืนหนังสือสาขาหรือส่งพัสดุกลับถึงคลัง
                      </p>
                    ) : (
                      <p>
                        หนังสือสั่งซื้อเป็นสินค้ามือหนึ่งสภาพสมบูรณ์ พร้อมรับประกันความพึงพอใจ 100%
                      </p>
                    )}
                    <p className="text-[10px] text-[#7c563f] pt-0.5">
                      ✓ ไม่จำเป็นต้องมีบัญชีสมาชิกหรือล็อกอินก่อนซื้อ/เช่า
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Totals */}
          {items.length > 0 && !checkoutComplete && (
            <div className="p-4 sm:p-5 border-t border-[#dac1b8] bg-[#f9ebe7] space-y-2 text-xs">
              <div className="flex justify-between text-[#54433c]">
                <span>ค่าบริการยืม / ราคาหนังสือ</span>
                <span className="font-mono">฿{booksSubtotal}</span>
              </div>

              {depositsTotal > 0 && (
                <div className="flex justify-between text-[#7c563f]">
                  <span>เงินมัดจำหนังสือยืม (ได้คืน 100% เมื่อส่งกลับ)</span>
                  <span className="font-mono">฿{depositsTotal}</span>
                </div>
              )}

              <div className="flex justify-between text-[#54433c]">
                <span>ค่าจัดส่งถึงบ้าน</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">ฟรี</strong> : `฿${shippingFee}`}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#211a18] pt-2 border-t border-[#dac1b8]">
                <span>ยอดชำระสุทธิ</span>
                <span className="text-[#914724] font-mono text-base">฿{grandTotal}</span>
              </div>

              {!isCheckingOut && (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full mt-2 py-3 bg-[#914724] hover:bg-[#793a1c] text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>ดำเนินการชำระเงิน</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

