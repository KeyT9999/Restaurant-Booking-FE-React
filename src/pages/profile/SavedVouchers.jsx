import React, { useState, useEffect } from 'react';
import { getMyVouchers } from '../../api/voucherApi';
import VoucherCard from '../../components/voucher/VoucherCard';
import './SavedVouchers.css';

export default function SavedVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unused'); // unused, used, expired

  useEffect(() => {
    loadSavedVouchers();
  }, [activeTab]);

  const loadSavedVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyVouchers({ filter: activeTab });
      if (res.data?.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải ví voucher của bạn');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'unused', label: 'Chưa sử dụng' },
    { key: 'used', label: 'Đã sử dụng' },
    { key: 'expired', label: 'Hết hạn' },
  ];

  return (
    <div className="saved-vouchers-page">
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
          <div className="vouchers-loading-state">Đang mở ví voucher...</div>
        ) : error ? (
          <div className="vouchers-error-state">{error}</div>
        ) : vouchers.length === 0 ? (
          <div className="vouchers-empty-state">
            <div className="empty-ticket-icon">🎟️</div>
            <p>Không có voucher nào trong mục này.</p>
            {activeTab === 'unused' && (
              <p className="empty-tip">Hãy ghé thăm trang chi tiết của các nhà hàng để thu thập thêm nhiều ưu đãi hấp dẫn nhé!</p>
            )}
          </div>
        ) : (
          <div className="saved-vouchers-grid">
            {vouchers.map(item => (
              <VoucherCard
                key={item._id}
                voucher={item.voucherId}
                disabled={activeTab !== 'unused'}
                isSaved={activeTab === 'unused'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
