import { useState } from 'react';

export default function DeleteModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(restaurant.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-zinc-150 mb-2">Xóa nhà hàng</h3>
        <p className="text-sm text-rose-400 mb-2 font-medium">Cảnh báo: Bạn đang thực hiện xóa nhà hàng <strong className="text-zinc-100">{restaurant.name}</strong>.</p>
        <p className="text-xs text-zinc-500 mb-4">Hành động này là soft delete (xóa tạm thời). Bạn vẫn có thể khôi phục lại nhà hàng này từ bộ lọc "Đã xóa".</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Lý do xóa (không bắt buộc)</label>
            <textarea
              className="w-full bg-[#13161C] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xóa nhà hàng..."
            />
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-rose-600/10 disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận xóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
