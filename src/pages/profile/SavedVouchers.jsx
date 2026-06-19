import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyVouchers, unsaveVoucher } from '../../api/voucherApi';
import VoucherCard from '../../components/voucher/VoucherCard';
import { Ticket, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedVouchers() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unused'); // unused, used, expired

  const loadSavedVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyVouchers({ filter: activeTab });
      if (res?.success) {
        setVouchers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải ví voucher của bạn');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadSavedVouchers();
  }, [loadSavedVouchers]);

  const handleUnsave = async (voucherId) => {
    try {
      const res = await unsaveVoucher(voucherId);
      if (res?.success) {
        toast.success('🎟️ Đã bỏ lưu voucher khỏi ví.');
        // Remove from list directly without full reload
        setVouchers(prev => prev.filter(item => item.voucherId?._id !== voucherId && item.voucherId !== voucherId));
      }
    } catch (err) {
      toast.error(`❌ Lỗi: ${err.message || 'Không thể bỏ lưu'}`);
    }
  };

  const tabs = [
    { key: 'unused', label: 'Chưa sử dụng' },
    { key: 'used', label: 'Đã sử dụng' },
    { key: 'expired', label: 'Hết hạn' },
  ];

  return (
    <div className="min-h-[80vh] py-16 bg-background">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <span className="font-sans text-xs font-semibold tracking-widest text-primary uppercase block mb-2">
            Ưu đãi cá nhân
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-bold tracking-tight mb-3">
            Ví Voucher Của Tôi
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Lưu trữ và theo dõi các mã giảm giá đặt bàn bạn đã thu thập từ các nhà hàng để nhận ưu đãi đặc quyền khi ăn uống.
          </p>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-6 border-b border-border/40 mb-8 pb-px">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang mở ví voucher...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto justify-center">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border/40 bg-card/10 rounded-2xl max-w-xl mx-auto text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Không tìm thấy voucher</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {activeTab === 'unused'
                ? 'Ví của bạn hiện tại chưa có voucher nào khả dụng.'
                : 'Không có voucher nào trong mục này.'}
            </p>
            {activeTab === 'unused' && (
              <p className="text-xs text-muted-foreground/60 mt-3 max-w-xs leading-relaxed">
                Hãy ghé thăm trang chi tiết của các nhà hàng để thu thập thêm nhiều ưu đãi hấp dẫn nhé!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map(item => {
              const v = item.voucherId;
              if (!v) return null;

              const restaurantObj = v.restaurantId;
              const restaurantName = restaurantObj ? restaurantObj.name : 'Platform Voucher (Toàn Hệ Thống)';

              return (
                <div key={item._id} className="flex flex-col bg-[#1A1D24] border border-[#2C313C] rounded-xl overflow-hidden shadow-md transition hover:border-primary/20 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-border/30 bg-[#20242D] text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                    <span>📍 {restaurantName}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <VoucherCard
                      voucher={v}
                      disabled={activeTab !== 'unused'}
                      isSaved={false}
                      actionText={activeTab === 'unused' ? 'Dùng ngay' : 'Đã lưu'}
                      onAction={activeTab === 'unused' ? () => {
                        const targetId = restaurantObj?._id || restaurantObj;
                        if (targetId) {
                          navigate(`/restaurants/${targetId}`);
                        } else {
                          navigate('/restaurants');
                        }
                      } : null}
                    />
                    
                    {activeTab === 'unused' && (
                      <button 
                        className="w-full py-2 px-3 text-center text-xs font-semibold text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/20 rounded-lg transition focus:outline-none" 
                        onClick={() => handleUnsave(v._id)}
                      >
                        Bỏ lưu khỏi ví
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
