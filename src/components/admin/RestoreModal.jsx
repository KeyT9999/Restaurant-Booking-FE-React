
export default function RestoreModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  if (!isOpen || !restaurant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-zinc-150 mb-2">Khôi phục nhà hàng</h3>
        <p className="text-sm text-zinc-400 mb-2">Bạn có chắc chắn muốn khôi phục hoạt động cho nhà hàng <strong className="text-zinc-200">{restaurant.name}</strong>?</p>
        <p className="text-xs text-zinc-500 mb-4">Nhà hàng sẽ được khôi phục trở lại danh sách hoạt động bình thường.</p>
        
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
            type="button" 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-amber-500/10" 
            onClick={() => onConfirm(restaurant.id)}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận khôi phục'}
          </button>
        </div>
      </div>
    </div>
  );
}
