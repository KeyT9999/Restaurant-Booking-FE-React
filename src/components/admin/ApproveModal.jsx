import { useState } from 'react';

export default function ApproveModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  const [commissionRate, setCommissionRate] = useState(10);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(restaurant.id, commissionRate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-zinc-150 mb-2">Duyệt nhà hàng</h3>
        <p className="text-sm text-zinc-400 mb-4">Bạn có chắc chắn muốn phê duyệt hoạt động cho nhà hàng <strong className="text-zinc-200">{restaurant.name}</strong>?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-amber-500/95 tracking-wide uppercase">Tỷ lệ hoa hồng (%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full bg-[#13161C] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              required
            />
            <span className="text-[11px] text-zinc-500">Thiết lập phần trăm hoa hồng thu từ đặt bàn (mặc định 10%).</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-medium text-xs rounded-lg transition duration-150" 
              onClick={onClose} 
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-amber-500/10" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
