import { useState, useEffect } from 'react';
import { getPlatformVouchers, saveVoucher } from '../../api/voucherApi';
import VoucherCard from '../../components/voucher/VoucherCard';
import './VoucherCenter.css';

export default function VoucherCenter() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, percentage, fixed, new_user, vip
  const [toastMessage, setToastMessage] = useState(null);

  const loadVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPlatformVouchers();
      if (res?.success) {
        setVouchers(res.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải trung tâm voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [activeTab]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleClaimVoucher = async (voucher) => {
    try {
      const res = await saveVoucher({ voucherId: voucher._id });
      if (res?.success) {
        showToast(`🎟️ Đã lưu mã "${voucher.code}" vào ví của bạn thành công!`);
        // Update local state to show saved status
        setVouchers(prev => prev.map(v => v._id === voucher._id ? { ...v, isSaved: true } : v));
      }
    } catch (err) {
      showToast(`❌ Lỗi: ${err.response?.data?.message || err.message || 'Không thể lưu mã'}`);
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    // Search query match
    const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Tab filter match
    if (activeTab === 'percentage') return v.discountType === 'percentage';
    if (activeTab === 'fixed') return v.discountType === 'fixed_amount';
    if (activeTab === 'new_user') return v.customerSegments.includes('new_user');
    if (activeTab === 'vip') return v.customerSegments.includes('vip');
    return true; // 'all'
  });

  const tabs = [
    { key: 'all', label: 'Tất Cả Ưu Đãi' },
    { key: 'percentage', label: 'Giảm Phần Trăm' },
    { key: 'fixed', label: 'Giảm Tiền Mặt' },
    { key: 'new_user', label: 'Dành Cho Bạn Mới' },
    { key: 'vip', label: 'Khách Hàng Thân Thiết' }
  ];

  return (
    <div className="voucher-center-page">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="voucher-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="voucher-center-hero">
        <span className="hero-eyebrow">CHƯƠNG TRÌNH KHUYẾN MẠI BOOKEAT</span>
        <h1 className="hero-title">Trung Tâm Ưu Đãi</h1>
        <p className="hero-sub">Sưu tầm các voucher giảm giá đặt bàn giá trị cao nhất từ hệ thống BookEat.</p>
        
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="voucher-search-input"
            placeholder="Tìm kiếm mã hoặc tên ưu đãi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="voucher-center-container">
        <div className="vouchers-center-tab-filters">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-filter-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="voucher-center-loading">
            <div className="gold-spinner"></div>
            <p>Đang tìm nạp danh sách ưu đãi...</p>
          </div>
        ) : error ? (
          <div className="voucher-center-error">
            <p>{error}</p>
            <button className="retry-btn" onClick={loadVouchers}>Thử lại</button>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="voucher-center-empty">
            <div className="empty-ticket-center-icon">🎟️</div>
            <p>Không tìm thấy ưu đãi nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="voucher-center-grid">
            {filteredVouchers.map(item => (
              <VoucherCard
                key={item._id}
                voucher={item}
                isSaved={item.isSaved}
                onAction={handleClaimVoucher}
                actionText="Nhận mã"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
