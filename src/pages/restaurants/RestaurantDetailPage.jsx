import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Utensils, 
  Armchair, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  DollarSign, 
  Clock, 
  Search, 
  MessageCircle, 
  CalendarDays, 
  ArrowLeft,
  Tag
} from 'lucide-react';
import Header from '../../components/Header';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import * as menuApi from '../../api/menuApi';
import * as tableApi from '../../api/tableApi';
import { useAuth } from '../../context/useAuth';
import { useChatWidget } from '../../context/useChatWidget';
import toast from 'react-hot-toast';
import './RestaurantDetailPage.css';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openCustomerRestaurantChat } = useChatWidget();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'tables' | 'info'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch details, menu and tables concurrently
      const [detailRes, menuRes, tableRes] = await Promise.all([
        getPublicRestaurantDetail(id),
        menuApi.getPublicMenu(id),
        tableApi.getPublicTables(id)
      ]);

      if (detailRes?.success) {
        setRestaurant(detailRes.data);
      } else {
        throw new Error('Không thể tải thông tin chi tiết nhà hàng');
      }

      if (menuRes?.success) {
        setMenuItems(menuRes.data?.items || []);
        setCategories(menuRes.data?.categories || []);
      }

      if (tableRes?.success) {
        setTables(tableRes.data?.tables || []);
      }

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi tải dữ liệu nhà hàng');
      navigate('/restaurants');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleChatRestaurant = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với nhà hàng');
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user?.role !== 'customer') {
      toast.error('Chỉ tài khoản khách hàng mới có thể chat với nhà hàng');
      return;
    }

    try {
      await openCustomerRestaurantChat(id);
    } catch (err) {
      toast.error(err.message || 'Không thể mở chat với nhà hàng');
    }
  };

  if (loading) {
    return (
      <div className="res-detail-page">
        <Header />
        <div className="res-detail-loading">
          <div className="res-detail-spinner" />
          <p>Đang tải thông tin nhà hàng...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="res-detail-page">
        <Header />
        <div className="res-detail-error">
          <p>Không tìm thấy thông tin nhà hàng</p>
          <Link to="/restaurants" className="res-detail-btn-back">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getPriceRangeText = (range) => {
    if (range === 'low') return 'Tiết kiệm (Dưới 200k)';
    if (range === 'medium') return 'Tầm trung (200k - 500k)';
    if (range === 'high') return 'Cao cấp (Trên 500k)';
    return 'Chưa cập nhật';
  };

  // Group tables by status
  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
  };

  return (
    <div className="res-detail-page">
      <Header />
      
      {/* Banner & Breadcrumbs */}
      <div className="res-detail-banner-section">
        <div className="res-detail-banner-overlay" />
        {restaurant.coverImageUrl ? (
          <img className="res-detail-banner-img" src={restaurant.coverImageUrl} alt={restaurant.name} />
        ) : (
          <div className="res-detail-banner-placeholder">🍽️</div>
        )}

        <div className="res-detail-banner-content">
          <div className="res-detail-container">
            <div className="res-detail-breadcrumbs">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/restaurants">Nhà hàng</Link>
              <span>/</span>
              <span className="active">{restaurant.name}</span>
            </div>

            <div className="res-detail-header-info">
              {restaurant.logo && (
                <img className="res-detail-logo" src={restaurant.logo} alt="Logo" />
              )}
              <div className="res-detail-title-wrapper">
                <h1 className="res-detail-name">{restaurant.name}</h1>
                <div className="res-detail-badges">
                  {restaurant.cuisineTypes?.map((c, i) => (
                    <span key={i} className="res-detail-badge-cuisine">{c}</span>
                  ))}
                  {restaurant.featured && (
                    <span className="res-detail-badge-featured">★ NỔI BẬT</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="res-detail-main">
        <div className="res-detail-container res-detail-grid">
          
          {/* Left Column: Details & Tabs */}
          <div className="res-detail-left">
            
            {/* Quick Info Grid */}
            <div className="res-detail-quick-info">
              <div className="quick-info-item">
                <MapPin className="info-icon" size={18} />
                <div>
                  <span className="info-label">Địa chỉ</span>
                  <span className="info-value">{restaurant.address?.fullAddress || 'Đang cập nhật'}</span>
                </div>
              </div>
              <div className="quick-info-item">
                <Clock className="info-icon" size={18} />
                <div>
                  <span className="info-label">Giờ hoạt động</span>
                  <span className="info-value">
                    {restaurant.operatingHours?.open || '08:00'} - {restaurant.operatingHours?.close || '22:00'}
                  </span>
                </div>
              </div>
              <div className="quick-info-item">
                <DollarSign className="info-icon" size={18} />
                <div>
                  <span className="info-label">Khoảng giá</span>
                  <span className="info-value">
                    {restaurant.averagePrice ? `~ ${restaurant.averagePrice.toLocaleString('vi-VN')}đ` : getPriceRangeText(restaurant.priceRange)}
                  </span>
                </div>
              </div>
              {restaurant.stats?.averageRating > 0 && (
                <div className="quick-info-item">
                  <Star className="info-icon text-amber" size={18} fill="currentColor" />
                  <div>
                    <span className="info-label">Đánh giá</span>
                    <span className="info-value">
                      <strong>{restaurant.stats.averageRating.toFixed(1)}</strong> ({restaurant.stats.totalReviews || 0} đánh giá)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="res-detail-tabs">
              <button 
                className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <Utensils size={16} /> Thực đơn
              </button>
              <button 
                className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                onClick={() => setActiveTab('tables')}
              >
                <Armchair size={16} /> Danh sách bàn ({tableStats.available}/{tableStats.total})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <Globe size={16} /> Thông tin chi tiết
              </button>
            </div>

            {/* Tab Panels */}
            <div className="res-detail-tab-content">
              
              {/* Tab: Menu */}
              {activeTab === 'menu' && (
                <div className="tab-panel-menu">
                  
                  {/* Menu Toolbar */}
                  <div className="menu-toolbar-public">
                    <div className="menu-search-public">
                      <Search size={16} />
                      <input 
                        type="text"
                        placeholder="Tìm món ăn trong thực đơn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {categories.length > 0 && (
                      <div className="menu-categories-public">
                        <button 
                          className={`cat-pill ${!selectedCategory ? 'active' : ''}`}
                          onClick={() => setSelectedCategory('')}
                        >
                          Tất cả
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Menu List */}
                  {filteredMenuItems.length > 0 ? (
                    <div className="menu-list-public">
                      {filteredMenuItems.map(item => (
                        <div key={item.id} className="menu-item-public">
                          <div className="menu-item-public-image">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <div className="menu-item-public-placeholder">🍽️</div>
                            )}
                          </div>
                          <div className="menu-item-public-details">
                            <div className="menu-item-public-header">
                              <h3 className="menu-item-public-name">{item.name}</h3>
                              <span className="menu-item-public-price">{formatPrice(item.price)}</span>
                            </div>
                            {item.description && (
                              <p className="menu-item-public-desc">{item.description}</p>
                            )}
                            <div className="menu-item-public-meta">
                              {item.categoryName && (
                                <span className="menu-item-public-cat">{item.categoryName}</span>
                              )}
                              <span className={`menu-item-public-avail ${item.isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                                {item.isAvailable ? 'Còn món' : 'Hết món'}
                              </span>
                            </div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="menu-item-public-tags">
                                {item.tags.map((t, idx) => (
                                  <span key={idx} className="menu-item-public-tag">
                                    <Tag size={10} /> {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="menu-empty-public">
                      <Utensils size={40} />
                      <p>Không tìm thấy món ăn nào phù hợp</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Tables */}
              {activeTab === 'tables' && (
                <div className="tab-panel-tables">
                  <p className="tables-intro">
                    Xem danh sách sơ đồ bàn của nhà hàng để lựa chọn khi đặt bàn. Bàn trống có thể thay đổi tùy thuộc vào thời gian cụ thể bạn đặt.
                  </p>
                  
                  {tables.length > 0 ? (
                    <div className="tables-grid-public">
                      {tables.map(table => (
                        <div key={table.id} className={`table-card-public table-card-public--${table.status}`}>
                          <div className="table-card-public-header">
                            <h4 className="table-card-public-number">{table.tableNumber}</h4>
                            <span className={`table-card-public-badge badge--${table.status}`}>
                              {table.status === 'available' ? 'Trống' : 
                               table.status === 'occupied' ? 'Bận' : 
                               table.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'}
                            </span>
                          </div>
                          <div className="table-card-public-body">
                            <p>Sức chứa: <strong>{table.capacity} người</strong></p>
                            {table.zone && <p>Khu vực: <strong>{table.zone}</strong></p>}
                            {table.depositAmount > 0 && (
                              <p className="table-deposit">Cọc bàn: <strong>{formatPrice(table.depositAmount)}</strong></p>
                            )}
                            {table.note && <p className="table-note">💡 {table.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="tables-empty-public">
                      <Armchair size={40} />
                      <p>Nhà hàng chưa cập nhật sơ đồ bàn</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Info */}
              {activeTab === 'info' && (
                <div className="tab-panel-info">
                  <div className="info-block">
                    <h3>Giới thiệu</h3>
                    <p className="restaurant-desc">{restaurant.description || 'Chưa có bài giới thiệu chi tiết.'}</p>
                  </div>

                  {restaurant.signatureDishes && restaurant.signatureDishes.length > 0 && (
                    <div className="info-block">
                      <h3>Món ăn đặc trưng</h3>
                      <div className="signature-tags">
                        {restaurant.signatureDishes.map((dish, i) => (
                          <span key={i} className="signature-tag">{dish}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {restaurant.amenities && restaurant.amenities.length > 0 && (
                    <div className="info-block">
                      <h3>Tiện ích</h3>
                      <div className="amenity-grid">
                        {restaurant.amenities.map((item, i) => (
                          <div key={i} className="amenity-item">
                            ✓ {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {restaurant.policyRules && restaurant.policyRules.length > 0 && (
                    <div className="info-block">
                      <h3>Chính sách & Quy định</h3>
                      <ul className="policy-list">
                        {restaurant.policyRules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="info-block contact-info-block">
                    <h3>Thông tin liên hệ</h3>
                    {restaurant.phoneNumber && (
                      <p><Phone size={14} /> Điện thoại: {restaurant.phoneNumber}</p>
                    )}
                    {restaurant.email && (
                      <p><Globe size={14} /> Email: {restaurant.email}</p>
                    )}
                    {restaurant.websiteUrl && (
                      <p>
                        <Globe size={14} /> Website:{' '}
                        <a href={restaurant.websiteUrl} target="_blank" rel="noopener noreferrer">
                          {restaurant.websiteUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Reservation / Actions Widget */}
          <div className="res-detail-right">
            <div className="booking-widget-card">
              <h3>Đặt bàn ngay</h3>
              <p className="widget-desc">Đảm bảo chỗ ngồi lý tưởng của bạn tại {restaurant.name} chỉ trong vài thao tác.</p>
              
              <Link 
                to={`/bookings/create?restaurantId=${restaurant.id}`} 
                className="btn-widget-book"
              >
                <CalendarDays size={18} /> Đặt bàn online
              </Link>

              <button 
                type="button" 
                className="btn-widget-chat" 
                onClick={handleChatRestaurant}
              >
                <MessageCircle size={18} /> Chat với nhà hàng
              </button>

              <div className="widget-policies">
                <span className="policy-title">Lưu ý đặt bàn:</span>
                <p>{restaurant.bookingNotes || 'Vui lòng đến đúng giờ đặt bàn. Chỗ ngồi được giữ tối đa 15 phút so với giờ hẹn.'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
