import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import { getPublicRestaurants, getPublicCuisineTypes } from '../../api/restaurantApi';
import { Search, Star, MapPin, Compass, RefreshCw, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useChatWidget } from '../../context/useChatWidget';
import './RestaurantsPage.css';
import toast from 'react-hot-toast';

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openCustomerRestaurantChat } = useChatWidget();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [restaurants, setRestaurants] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisineType, setCuisineType] = useState(searchParams.get('cuisineType') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load cuisine types once
  useEffect(() => {
    const loadCuisineTypes = async () => {
      try {
        const res = await getPublicCuisineTypes();
        setCuisineTypes(res.data || []);
      } catch (err) {
        console.error('Failed to load cuisine types:', err.message);
      }
    };
    loadCuisineTypes();
  }, []);

  // Fetch restaurants function
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search,
        cuisineType,
        priceRange,
        sortBy,
        sortDir,
      };

      const res = await getPublicRestaurants(params);
      if (res && res.success) {
        setRestaurants(res.data.restaurants || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  }, [page, search, cuisineType, priceRange, sortBy, sortDir]);

  // Sync state with URL params
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchRestaurants();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchRestaurants]);

  // Handle filter changes
  const updateURLParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const combined = { ...currentParams, ...newParams };

    // Clean empty values
    Object.keys(combined).forEach(key => {
      if (!combined[key]) delete combined[key];
    });

    setSearchParams(combined);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateURLParams({ search, page: 1 });
  };

  const handleCuisineChange = (e) => {
    const val = e.target.value;
    setCuisineType(val);
    setPage(1);
    updateURLParams({ cuisineType: val, page: 1 });
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    setPriceRange(val);
    setPage(1);
    updateURLParams({ priceRange: val, page: 1 });
  };

  const handleSortChange = (e) => {
    const [field, dir] = e.target.value.split('-');
    setSortBy(field);
    setSortDir(dir);
    setPage(1);
    updateURLParams({ sortBy: field, sortDir: dir, page: 1 });
  };

  const clearFilters = () => {
    setSearch('');
    setCuisineType('');
    setPriceRange('');
    setSortBy('name');
    setSortDir('asc');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURLParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChatRestaurant = async (restaurantId) => {
    if (!isAuthenticated) {
      toast.error('Vui long dang nhap de chat voi nha hang');
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (user?.role !== 'customer') {
      toast.error('Chi tai khoan customer co the bat dau chat voi nha hang tu trang nay');
      return;
    }

    try {
      await openCustomerRestaurantChat(restaurantId);
    } catch (err) {
      toast.error(err.message || 'Khong the mo chat voi nha hang');
    }
  };

  const renderStars = (rating) => {
    const filledStars = Math.round(rating || 0);
    return (
      <div className="res-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= filledStars ? 'star-filled' : 'star-empty'}
            fill={s <= filledStars ? 'var(--color-amber-glow)' : 'transparent'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="public-res-page">
      <Header />

      <main className="public-res-main">
        <div className="public-res-container">

          {/* Header section */}
          <div className="public-res-header">
            <h1 className="public-res-title">Khám phá nhà hàng</h1>
            <p className="public-res-subtitle">
              Tìm kiếm và đặt bàn tại các địa điểm ẩm thực hàng đầu được chứng nhận bởi BookEat
            </p>
          </div>

          {/* Filters Panel */}
          <div className="public-res-filters-card">
            <form onSubmit={handleSearchSubmit} className="filters-row">
              {/* Search input */}
              <div className="filter-item search-box-wrap">
                <label className="filter-label">Tìm kiếm</label>
                <div className="search-input-container">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tên nhà hàng, mô tả..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-input-search"
                  />
                  {search && (
                    <button type="button" onClick={() => { setSearch(''); updateURLParams({ search: '', page: 1 }); }} className="clear-search-btn">
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Cuisine dropdown */}
              <div className="filter-item dropdown-wrap">
                <label className="filter-label">Loại ẩm thực</label>
                <select
                  value={cuisineType}
                  onChange={handleCuisineChange}
                  className="filter-select"
                >
                  <option value="">Tất cả ẩm thực</option>
                  {cuisineTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range dropdown */}
              <div className="filter-item dropdown-wrap">
                <label className="filter-label">Khoảng giá</label>
                <select
                  value={priceRange}
                  onChange={handlePriceChange}
                  className="filter-select"
                >
                  <option value="">Tất cả khoảng giá</option>
                  <option value="low">Tiết kiệm (Dưới 200k)</option>
                  <option value="medium">Tầm trung (200k - 500k)</option>
                  <option value="high">Cao cấp (Trên 500k)</option>
                </select>
              </div>

              {/* Sort dropdown */}
              <div className="filter-item dropdown-wrap">
                <label className="filter-label">Sắp xếp</label>
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={handleSortChange}
                  className="filter-select"
                >
                  <option value="name-asc">Tên nhà hàng (A-Z)</option>
                  <option value="name-desc">Tên nhà hàng (Z-A)</option>
                  <option value="averageRating-desc">Đánh giá tốt nhất</option>
                  <option value="averagePrice-asc">Giá từ thấp đến cao</option>
                  <option value="averagePrice-desc">Giá từ cao đến thấp</option>
                  <option value="totalBookings-desc">Đặt bàn nhiều nhất</option>
                </select>
              </div>

              {/* Actions */}
              <div className="filter-actions-col">
                <button type="submit" className="btn-search-apply">
                  Áp dụng
                </button>
                {(search || cuisineType || priceRange || sortBy !== 'name' || sortDir !== 'asc') && (
                  <button type="button" onClick={clearFilters} className="btn-filter-reset" title="Xóa bộ lọc">
                    <RefreshCw size={14} /> Xóa lọc
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Statistics summary */}
          <div className="results-stats">
            Tìm thấy <strong>{total}</strong> nhà hàng phù hợp
          </div>

          {/* Restaurants Grid */}
          {loading ? (
            <div className="public-loading-section">
              <div className="public-spinner" />
              <p>Đang tải danh sách nhà hàng...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="public-empty-section">
              <Compass size={48} className="empty-icon" />
              <h3>Không tìm thấy nhà hàng nào</h3>
              <p>Hiện không có nhà hàng nào được duyệt hoạt động trùng khớp với tiêu chí của bạn.</p>
              {(search || cuisineType || priceRange) && (
                <button onClick={clearFilters} className="btn-empty-reset">
                  Xóa bộ lọc và thử lại
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="public-res-grid">
                {restaurants.map((res) => (
                  <article key={res.id} className="res-card">
                    {/* Image Area */}
                    <div className="res-card-image">
                      {res.coverImageUrl || res.logo ? (
                        <img src={res.coverImageUrl || res.logo} alt={res.name} loading="lazy" />
                      ) : (
                        <div className="res-image-placeholder">
                          <span>🍽️</span>
                        </div>
                      )}

                      {res.featured && (
                        <span className="res-featured-badge">
                          ★ NỔI BẬT
                        </span>
                      )}
                    </div>

                    {/* Body Area */}
                    <div className="res-card-body">
                      <div className="res-card-header">
                        <h2 className="res-name" title={res.name}>{res.name}</h2>

                        <div className="res-rating-wrap">
                          {renderStars(res.averageRating)}
                          <span className="res-rating-number">
                            {res.averageRating ? res.averageRating.toFixed(1) : '0.0'}
                          </span>
                          <span className="res-reviews-count">
                            ({res.reviewCount || 0})
                          </span>
                        </div>
                      </div>

                      <p className="res-description">
                        {res.description || 'Chưa có mô tả chi tiết cho nhà hàng này.'}
                      </p>

                      <div className="res-metadata">
                        <div className="meta-line">
                          <span className="meta-cuisine">{res.cuisineType}</span>
                          <span className="meta-dot">•</span>
                          <span className="meta-price">
                            {res.averagePrice
                              ? `~ ${res.averagePrice.toLocaleString('vi-VN')} đ`
                              : 'Giá liên hệ'}
                          </span>
                        </div>
                        <div className="meta-address" title={res.address}>
                          <MapPin size={13} />
                          <span>{res.address}</span>
                        </div>
                      </div>

                      <div className="res-card-footer">
                        <Link to={`/restaurants/${res.id}`} className="btn-res-detail">
                          Chi tiết
                        </Link>
                        <button type="button" className="btn-res-chat" onClick={() => handleChatRestaurant(res.id)}>
                          <MessageCircle size={14} />
                          Chat
                        </button>
                        <Link to={`/restaurants/${res.id}/booking`} className="btn-res-book">
                          Đặt bàn ngay
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="public-pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="pagi-btn"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`pagi-btn ${p === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="pagi-btn"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Basic Custom Footer matching mahogany layout */}
      <footer className="public-res-footer">
        <div className="public-footer-container">
          <span>BookEat — Nền tảng đặt bàn ẩm thực hàng đầu</span>
          <span>© 2026 BookEat. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
