import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import { getPublicRestaurants, getPublicCuisineTypes } from '../../api/restaurantApi';
import { Search, Star, MapPin, Compass, RotateCcw, MessageSquare, Utensils, AlertTriangle, ArrowUpDown, DollarSign, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useChatWidget } from '../../context/useChatWidget';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';
import { getFavoriteIds, addFavorite, removeFavorite } from '../../api/favoriteApi';

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openCustomerRestaurantChat } = useChatWidget();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [restaurants, setRestaurants] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Tải danh sách ID yêu thích nếu đã đăng nhập và là customer
  const loadFavoriteIds = async () => {
    if (isAuthenticated && user?.role === 'customer') {
      try {
        const res = await getFavoriteIds();
        if (res && res.success) {
          setFavoriteIds(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi tải ID yêu thích:', err);
      }
    }
  };

  useEffect(() => {
    loadFavoriteIds();
  }, [isAuthenticated, user]);

  const handleToggleFavorite = async (restaurantId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu nhà hàng yêu thích');
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (user?.role !== 'customer') {
      toast.error('Chỉ khách hàng mới có thể lưu nhà hàng yêu thích');
      return;
    }

    const isFav = favoriteIds.includes(restaurantId);
    try {
      if (isFav) {
        const res = await removeFavorite(restaurantId);
        if (res && res.success) {
          setFavoriteIds(prev => prev.filter(id => id !== restaurantId));
          toast.success('Đã xóa khỏi danh sách yêu thích');
        }
      } else {
        const res = await addFavorite(restaurantId);
        if (res && res.success) {
          setFavoriteIds(prev => [...prev, restaurantId]);
          toast.success('Đã thêm vào danh sách yêu thích');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thao tác yêu thích');
    }
  };

  // Filter states from URL
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
        if (res && res.success) {
          setCuisineTypes(res.data || []);
        }
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
        limit: 9,
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

  // Handle URL updates
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

  const handleCuisineChange = (val) => {
    setCuisineType(val);
    setPage(1);
    updateURLParams({ cuisineType: val, page: 1 });
  };

  const handlePriceChange = (val) => {
    setPriceRange(val);
    setPage(1);
    updateURLParams({ priceRange: val, page: 1 });
  };

  const handleSortChange = (val) => {
    const [field, dir] = val.split('-');
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
      toast.error('Vui lòng đăng nhập để chat với nhà hàng');
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (user?.role !== 'customer') {
      toast.error('Chỉ tài khoản khách hàng mới có thể chat với nhà hàng');
      return;
    }

    try {
      await openCustomerRestaurantChat(restaurantId);
    } catch (err) {
      toast.error(err.message || 'Không thể mở chat với nhà hàng');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Listing Title */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Khám phá nhà hàng
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tìm kiếm và đặt chỗ tại các địa điểm ẩm thực chất lượng hàng đầu được đối tác BookEat kiểm chứng.
          </p>
        </div>

        {/* Layout with Sidebar filter on Desktop and Grid on the Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar Filter */}
          <Card className="lg:col-span-1 p-5 bg-card border-border flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Compass className="h-4 w-4 text-primary" /> Bộ lọc tìm kiếm
              </h3>
              {(search || cuisineType || priceRange || sortBy !== 'name' || sortDir !== 'asc') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="h-3 w-3" /> Thiết lập lại
                </button>
              )}
            </div>

            {/* Keyword Search form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Từ khóa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tên nhà hàng, mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-secondary/40 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/95 text-background font-semibold w-full text-xs">
                Tìm kiếm
              </Button>
            </form>

            {/* Cuisine type list filter */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Loại hình ẩm thực</label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCuisineChange('')}
                  className={`text-left text-xs py-1.5 px-2.5 rounded transition ${
                    !cuisineType ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
                  }`}
                >
                  Tất cả ẩm thực
                </button>
                {cuisineTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleCuisineChange(type)}
                    className={`text-left text-xs py-1.5 px-2.5 rounded transition truncate ${
                      cuisineType === type ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Level filter */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Khoảng giá</label>
              <div className="flex flex-col gap-1">
                {[
                  { value: '', label: 'Tất cả khoảng giá' },
                  { value: 'low', label: 'Tiết kiệm (Dưới 200k)' },
                  { value: 'medium', label: 'Tầm trung (200k - 500k)' },
                  { value: 'high', label: 'Cao cấp (Trên 500k)' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handlePriceChange(item.value)}
                    className={`text-left text-xs py-1.5 px-2.5 rounded transition ${
                      priceRange === item.value ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sắp xếp theo</label>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="name-asc" className="bg-card">Tên nhà hàng (A-Z)</option>
                <option value="name-desc" className="bg-card">Tên nhà hàng (Z-A)</option>
                <option value="averageRating-desc" className="bg-card">Đánh giá tốt nhất</option>
                <option value="averagePrice-asc" className="bg-card">Giá từ thấp đến cao</option>
                <option value="averagePrice-desc" className="bg-card">Giá từ cao đến thấp</option>
                <option value="totalBookings-desc" className="bg-card">Đặt bàn nhiều nhất</option>
              </select>
            </div>
          </Card>

          {/* Right Grid Content */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Topbar statistics info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Tìm thấy <strong className="text-white font-bold">{total}</strong> nhà hàng phù hợp
              </span>
              {cuisineType && (
                <Badge variant="secondary" className="text-xs text-primary border-primary/20 bg-primary/5 capitalize px-2 py-0.5">
                  {cuisineType}
                </Badge>
              )}
            </div>

            {/* Dynamic Content Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Card key={n} className="overflow-hidden bg-card border-border animate-pulse h-[340px]" />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-4">
                <Compass size={48} className="text-muted-foreground animate-bounce" />
                <h3 className="text-lg font-bold text-white">Không tìm thấy nhà hàng nào</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Không có nhà hàng nào hoạt động khớp với bộ lọc tìm kiếm hiện tại của bạn.
                </p>
                {(search || cuisineType || priceRange) && (
                  <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90 text-background text-xs font-semibold">
                    Xóa các bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {restaurants.map((res) => (
                    <Card
                      key={res.id}
                      className="overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-300 group flex flex-col"
                    >
                      {/* Image block */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        {res.coverImageUrl || res.logo ? (
                          <img
                            src={res.coverImageUrl || res.logo}
                            alt={res.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                        )}
                        {res.featured && (
                          <Badge className="absolute top-3.5 left-3.5 bg-primary text-background border-none py-1 font-semibold">
                            NỔI BẬT
                          </Badge>
                        )}
                        {/* Favorite Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(res.id, e)}
                          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/55 hover:bg-black/70 border border-white/10 text-white transition-colors cursor-pointer z-10 flex items-center justify-center"
                          aria-label={favoriteIds.includes(res.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                          <Heart
                            size={16}
                            className={`transition duration-300 ${
                              favoriteIds.includes(res.id)
                                ? 'fill-rose-500 text-rose-500 scale-110'
                                : 'text-zinc-300 hover:text-rose-455'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Info details block */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors" title={res.name}>
                              {res.name}
                            </h3>
                            <div className="flex items-center gap-0.5 text-xs text-primary shrink-0 font-semibold">
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                              <span>{res.averageRating ? res.averageRating.toFixed(1) : '0.0'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                            <span className="text-primary font-medium">{res.cuisineType}</span>
                            <span>·</span>
                            <span className="font-semibold">
                              {res.averagePrice ? `~ ${res.averagePrice.toLocaleString('vi-VN')} đ` : 'Giá liên hệ'}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                            {res.description || 'Chưa có mô tả chi tiết cho nhà hàng này.'}
                          </p>

                          <div className="mt-3.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="truncate" title={res.address}>{res.address}</span>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-5 pt-3 border-t border-border/40 grid grid-cols-3 gap-2">
                          <Link
                            to={`/restaurants/${res.id}`}
                            className="flex items-center justify-center h-8 text-xs font-semibold rounded bg-secondary hover:bg-secondary/80 text-white transition-colors"
                          >
                            Chi tiết
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleChatRestaurant(res.id)}
                            className="flex items-center justify-center gap-1 h-8 text-xs font-semibold rounded bg-secondary hover:bg-secondary/80 text-white transition-colors"
                          >
                            <MessageSquare size={13} />
                            Chat
                          </button>
                          <Link
                            to={`/restaurants/${res.id}/booking`}
                            className="flex items-center justify-center h-8 text-xs font-bold rounded bg-primary hover:bg-primary/95 text-background transition-colors"
                          >
                            Đặt bàn
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-1.5">
                    <Button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      variant="outline"
                      size="sm"
                      className="border-border text-xs text-white"
                    >
                      Trước
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'outline'}
                        size="icon"
                        className={`h-8 w-8 text-xs ${
                          p === page ? 'bg-primary text-background font-bold' : 'border-border text-white'
                        }`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      variant="outline"
                      size="sm"
                      className="border-border text-xs text-white"
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#090B0E] py-8 text-center text-xs text-muted-foreground mt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold text-white tracking-wider">BookEat</span>
          <span>© 2026 BookEat. Mọi quyền được bảo lưu.</span>
        </div>
      </footer>
    </div>
  );
}
