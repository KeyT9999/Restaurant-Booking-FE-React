import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, Star, MapPin, Loader2, Compass, RotateCcw } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/useAuth';
import { getMyFavorites, removeFavorite } from '../../api/favoriteApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';


export default function MyFavoritesPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // States
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Security guard
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem danh sách yêu thích');
      navigate('/auth/login?redirect=/my-favorites');
    }
  }, [isAuthenticated, navigate]);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'customer') return;
    try {
      setLoading(true);
      const res = await getMyFavorites({
        page,
        limit: 9,
        search: search.trim()
      });
      if (res && res.success) {
        setFavorites(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotal(res.pagination.total || 0);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, [page, search, isAuthenticated, user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFavorites();
  };

  const handleUnfavorite = async (restaurantId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await removeFavorite(restaurantId);
      if (res && res.success) {
        setFavorites(prev => prev.filter(fav => fav.restaurantId?._id !== restaurantId));
        setTotal(t => Math.max(0, t - 1));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi bỏ yêu thích');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPage(1);
  };

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Title */}
        <div className="mb-8 text-left border-b border-border/40 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart className="fill-rose-500 text-rose-500 h-8 w-8 shrink-0" />
            <span>Nhà hàng yêu thích của tôi</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý và đặt bàn nhanh chóng tại các địa điểm ẩm thực bạn đã lưu.
          </p>
        </div>

        {/* Search tool bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm tên, loại ẩm thực, địa chỉ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-card border-border text-xs focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/95 text-background font-bold px-5 h-10 text-xs cursor-pointer">
              Tìm kiếm
            </Button>
          </form>

          {search && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border hover:bg-secondary/40 text-muted-foreground hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RotateCcw size={14} /> Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải danh sách yêu thích...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-4 max-w-xl mx-auto my-10">
            <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
              <Heart size={28} className="animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Chưa tìm thấy nhà hàng nào</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {search 
                ? 'Không tìm thấy nhà hàng yêu thích nào khớp với từ khóa tìm kiếm của bạn.' 
                : 'Bạn chưa lưu nhà hàng yêu thích nào. Hãy khám phá và lưu lại những địa điểm ẩm thực tuyệt vời nhé!'}
            </p>
            <Link to="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-background text-xs font-bold px-6 h-10 cursor-pointer">
                <Compass className="h-4 w-4 mr-2" /> Khám phá nhà hàng ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="text-xs text-muted-foreground text-left">
              Đang hiển thị <strong className="text-white font-bold">{total}</strong> nhà hàng yêu thích của bạn
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const res = fav.restaurantId;
                if (!res) return null;
                return (
                  <Card
                    key={fav._id}
                    className="overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-300 group flex flex-col relative"
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
                      
                      {/* Heart Button to Unfavorite */}
                      <button
                        type="button"
                        onClick={(e) => handleUnfavorite(res._id, e)}
                        className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/55 hover:bg-black/70 border border-white/10 text-white transition-colors cursor-pointer z-10 flex items-center justify-center"
                        aria-label="Xóa khỏi yêu thích"
                      >
                        <Heart
                          size={16}
                          className="fill-rose-500 text-rose-500 scale-110"
                        />
                      </button>
                    </div>

                    {/* Info details block */}
                    <div className="p-4 flex-1 flex flex-col text-left">
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
                          <span className="text-primary font-medium">{res.cuisineTypes?.join(', ') || 'Chưa phân loại'}</span>
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
                          <span className="truncate" title={res.address?.fullAddress || res.address}>{res.address?.fullAddress || res.address}</span>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="mt-5 pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
                        <Link
                          to={`/restaurants/${res._id}`}
                          className="flex items-center justify-center h-8 text-xs font-semibold rounded bg-secondary hover:bg-secondary/80 text-white transition-colors text-center"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          to={`/restaurants/${res._id}/booking`}
                          className="flex items-center justify-center h-8 text-xs font-bold rounded bg-primary hover:bg-primary/95 text-background transition-colors text-center"
                        >
                          Đặt bàn
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-1.5">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
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
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  size="sm"
                  className="border-border text-xs text-white"
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
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
