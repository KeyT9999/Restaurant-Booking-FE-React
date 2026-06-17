import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyVouchers, unsaveVoucher } from '../../api/voucherApi';
import VoucherCard from '../../components/voucher/VoucherCard';
import './SavedVouchers.css';

export default function SavedVouchers() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unused'); // unused, used, expired
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadSavedVouchers();
  }, [activeTab]);

  const loadSavedVouchers = async () => {
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
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUnsave = async (voucherId) => {
    try {
      const res = await unsaveVoucher(voucherId);
      if (res?.success) {
        showToast('🎟️ Đã bỏ lưu voucher khỏi ví.');
        // Remove from list directly without full reload
        setVouchers(prev => prev.filter(item => item.voucherId?._id !== voucherId && item.voucherId !== voucherId));
      }
    } catch (err) {
      showToast(`❌ Lỗi: ${err.message || 'Không thể bỏ lưu'}`);
    }
  };

  const tabs = [
    { key: 'unused', label: 'Chưa sử dụng' },
    { key: 'used', label: 'Đã sử dụng' },
    { key: 'expired', label: 'Hết hạn' },
  ];

  return (
    <div className="saved-vouchers-page">
      {toastMessage && (
        <div className="voucher-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="saved-vouchers-container">
        <span className="section-eyebrow">Ưu đãi cá nhân</span>
        <h2 className="section-title">Ví Voucher Của Tôi</h2>
        <p className="section-sub">Lưu trữ và theo dõi các mã giảm giá đặt bàn bạn đã thu thập từ các nhà hàng</p>

        {/* Tabs Filter */}
        <div className="vouchers-tab-filters">
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

        {/* Content */}
        {loading ? (
          <div className="vouchers-loading-state">
            <div className="gold-spinner"></div>
            <p>Đang mở ví voucher...</p>
          </div>
        ) : error ? (
          <div className="vouchers-error-state">{error}</div>
        ) : vouchers.length === 0 ? (
          <div className="vouchers-empty-state">
            <div className="empty-ticket-icon">🎟️</div>
            <p>Không có voucher nào trong mục này.</p>
            {activeTab === 'unused' && (
              <p className="empty-tip">Hãy ghé thăm trang chi tiết của các nhà hàng hoặc Trung tâm ưu đãi để thu thập mã nhé!</p>
            )}
          </div>
        ) : (
          <div className="saved-vouchers-list">
            {vouchers.map(item => {
              const v = item.voucherId;
              if (!v) return null;

              const restaurantObj = v.restaurantId;
              const restaurantName = restaurantObj ? restaurantObj.name : 'Platform Voucher (Toàn Hệ Thống)';

              return (
                <div key={item._id} className="saved-voucher-item-wrapper">
                  <div className="saved-voucher-restaurant-header">
                    <span>📍 {restaurantName}</span>
                  </div>
                  <div className="saved-voucher-card-row">
                    <VoucherCard
                      voucher={v}
                      disabled={activeTab !== 'unused'}
                      isSaved={false} // Avoid disabled state inside wallet card button
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
                      <div className="saved-voucher-extra-actions">
                        <button 
                          className="wallet-action-unsave-btn" 
                          onClick={() => handleUnsave(v._id)}
                        >
                          Bỏ lưu ví
                        </button>
                      </div>
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
