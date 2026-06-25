import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { getPublicRestaurants, getPublicCuisineTypes } from '../../api/restaurantApi';
import { getHomepageVoucherCampaigns } from '../../api/voucherApi';
import { getHomeRecommendations } from '../../api/recommendationApi';
import { Search, MapPin, Users, Star, Heart, ChevronRight, Utensils, Sparkles, AlertTriangle, TicketPercent } from 'lucide-react';
import { Section, PhaseLabel } from '../../components/bookeat/Section';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getRestaurantCardImage } from '../../utils/restaurantImages';
import SafeImage from '../../components/common/SafeImage';
import { useAuth } from '../../context/useAuth';
import RecommendationSection from '../../components/recommendations/RecommendationSection';
import RecommendedRestaurantCard from '../../components/recommendations/RecommendedRestaurantCard';
import RecommendedMenuItemCard from '../../components/recommendations/RecommendedMenuItemCard';
import RecommendationSkeleton from '../../components/recommendations/RecommendationSkeleton';
import RecommendationEmptyState from '../../components/recommendations/RecommendationEmptyState';

const formatVoucherDiscount = (voucher) => {
  if (!voucher) return '';
  if (voucher.discountType === 'percentage') return `Giam ${voucher.discountValue}%`;
  return `Giam ${new Intl.NumberFormat('vi-VN').format(voucher.discountValue || 0)}d`;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // API Data states
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [tonightRestaurants, setTonightRestaurants] = useState([]);
  const [voucherCampaigns, setVoucherCampaigns] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationState, setRecommendationState] = useState({
    loading: true,
    error: false,
    data: null,
  });
  const [recommendationReloadKey, setRecommendationReloadKey] = useState(0);

  // Search Fields states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch cuisine types
        const cuisineRes = await getPublicCuisineTypes();
        if (cuisineRes && cuisineRes.success) {
          setCuisines(cuisineRes.data.slice(0, 6) || []);
        }

        // Fetch featured restaurants (highest rating)
        const featuredRes = await getPublicRestaurants({ limit: 3, sortBy: 'averageRating', sortDir: 'desc' });
        if (featuredRes && featuredRes.success) {
          setFeaturedRestaurants(featuredRes.data.restaurants || []);
        }

        // Fetch tonight's restaurants (most bookings/active)
        const tonightRes = await getPublicRestaurants({ limit: 4, sortBy: 'totalBookings', sortDir: 'desc' });
        if (tonightRes && tonightRes.success) {
          setTonightRestaurants(tonightRes.data.restaurants || []);
        }

        const campaignRes = await getHomepageVoucherCampaigns({ limit: 6 });
        if (campaignRes && campaignRes.success) {
          setVoucherCampaigns(campaignRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;

    let active = true;

    const loadRecommendations = async () => {
      try {
        setRecommendationState((current) => ({
          ...current,
          loading: true,
          error: false,
        }));

        const response = await getHomeRecommendations({ limit: 3 });
        if (!active) return;

        setRecommendationState({
          loading: false,
          error: false,
          data: response,
        });
      } catch (err) {
        if (!active) return;
        console.error('Failed to load recommendations:', err?.message || err);
        setRecommendationState({
          loading: false,
          error: true,
          data: null,
        });
      }
    };

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, recommendationReloadKey, user?.role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCuisine) params.append('cuisineType', selectedCuisine);
    navigate(`/restaurants?${params.toString()}`);
  };

  const selectCuisineAndSearch = (cuisine) => {
    navigate(`/restaurants?cuisineType=${encodeURIComponent(cuisine)}`);
  };

  const recommendationData = recommendationState.data;
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const hasPersonalizedRecommendations = (
    recommendationData?.personalized === true
    && recommendationData?.fallbackUsed !== true
    && isCustomer
  );
  const recommendationTitle = hasPersonalizedRecommendations ? 'Gợi ý cho bạn' : 'Gợi ý phổ biến';
  const recommendationSubtitle = hasPersonalizedRecommendations
    ? 'Dựa trên sở thích và hoạt động gần đây của bạn'
    : 'Những lựa chọn phổ biến được nhiều khách hàng quan tâm';
  const recommendationNote = hasPersonalizedRecommendations
    ? 'BookEat chỉ hiển thị lý do gợi ý an toàn, không hiển thị lịch sử cá nhân chi tiết của bạn.'
    : isCustomer
      ? 'Bạn càng đặt bàn, đánh giá và lưu yêu thích, gợi ý sẽ càng chính xác hơn.'
      : 'Đăng nhập để nhận gợi ý cá nhân hóa hơn.';
  const restaurantRecommendations = hasPersonalizedRecommendations
    ? recommendationData?.restaurantsForYou || []
    : recommendationData?.restaurantsForYou?.length
      ? recommendationData.restaurantsForYou
      : recommendationData?.popularRestaurants || [];
  const menuRecommendations = recommendationData?.menuItemsForYou || [];
  const hasRestaurantRecommendations = restaurantRecommendations.length > 0;
  const hasMenuRecommendations = menuRecommendations.length > 0;
  const showRecommendationEmpty = (
    !recommendationState.loading
    && !recommendationState.error
    && !hasRestaurantRecommendations
    && !hasMenuRecommendations
  );
  const retryRecommendations = () => setRecommendationReloadKey((current) => current + 1);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-40" aria-label="Hero">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1800&q=80"
            alt="Hero background"
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/30 via-[#0F1115]/80 to-[#0F1115]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 text-left">
          <div className="max-w-4xl">
            <PhaseLabel>Nghệ thuật ẩm thực · từ 2026</PhaseLabel>

            <h1
              className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Đặt bàn tại những nhà hàng <br className="hidden sm:inline" />
              <span className="text-primary italic">đẳng cấp</span> nhất thế giới.
            </h1>

            <p className="mt-6 max-w-2xl text-sm md:text-base text-[#A5ADBA] leading-relaxed">
              Từ nhà hàng sao Michelin danh giá đến quán ăn quen thuộc tinh tế —
              giữ chỗ hoàn hảo chỉ trong vài giây với xác nhận tức thời từ hệ thống BookEat.
            </p>

            {/* Floating Search Card */}
            <Card className="mt-16 p-2.5 bg-card/95 border-border backdrop-blur-md max-w-4xl shadow-2xl hover:border-primary/20 transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-[1.4fr_1.1fr_1.1fr_auto] gap-2 items-center">
                {/* Search query */}
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg hover:bg-white/5 border border-border/40 md:border-none focus-within:ring-1 focus-within:ring-primary/40 focus-within:bg-white/5 transition duration-150">
                  <Search className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <label htmlFor="hero-search-input" className="block text-[10px] uppercase tracking-wider text-[#A5ADBA] font-semibold">Địa điểm / Nhà hàng</label>
                    <input
                      id="hero-search-input"
                      aria-label="Nhập tên nhà hàng hoặc thành phố"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên nhà hàng, thành phố..."
                      className="w-full bg-transparent text-xs text-white placeholder-[#A5ADBA] focus:outline-none border-none p-0 mt-0.5"
                    />
                  </div>
                </div>

                {/* Cuisine Selector */}
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg hover:bg-white/5 border border-border/40 md:border-none focus-within:ring-1 focus-within:ring-primary/40 focus-within:bg-white/5 transition duration-150">
                  <Utensils className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <label htmlFor="hero-cuisine-select" className="block text-[10px] uppercase tracking-wider text-[#A5ADBA] font-semibold">Ẩm thực</label>
                    <select
                      id="hero-cuisine-select"
                      aria-label="Chọn loại hình ẩm thực"
                      value={selectedCuisine}
                      onChange={(e) => setSelectedCuisine(e.target.value)}
                      className="w-full bg-transparent text-xs text-white focus:outline-none border-none p-0 mt-0.5 cursor-pointer focus:ring-0"
                    >
                      <option value="" className="bg-[#1A1D24] text-white">Tất cả phong cách</option>
                      {cuisines.map((c) => (
                        <option key={c} value={c} className="bg-[#1A1D24] text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg hover:bg-white/5 border border-border/40 md:border-none focus-within:ring-1 focus-within:ring-primary/40 focus-within:bg-white/5 transition duration-150">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <label htmlFor="hero-guests-select" className="block text-[10px] uppercase tracking-wider text-[#A5ADBA] font-semibold">Số khách</label>
                    <select
                      id="hero-guests-select"
                      aria-label="Chọn số lượng khách đặt bàn"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="w-full bg-transparent text-xs text-white focus:outline-none border-none p-0 mt-0.5 cursor-pointer focus:ring-0"
                    >
                      <option value="1" className="bg-[#1A1D24] text-white">1 người</option>
                      <option value="2" className="bg-[#1A1D24] text-white">2 người</option>
                      <option value="4" className="bg-[#1A1D24] text-white">4 người</option>
                      <option value="6" className="bg-[#1A1D24] text-white">6 người</option>
                      <option value="8" className="bg-[#1A1D24] text-white">8+ người</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="bg-primary hover:bg-[#E0A968] text-background font-semibold h-11 px-6 rounded-lg transition-all duration-200 focus:ring-1 focus:ring-primary/50 w-full md:w-auto">
                  Tìm kiếm bàn
                </Button>
              </form>
            </Card>

            {/* Quick Suggestions */}
            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground mr-1">Gợi ý tìm nhanh:</span>
              {['Món Việt', 'Hải sản', 'Bít tết', 'Món Pháp', 'Thuần chay'].map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => selectCuisineAndSearch(cuisine)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-muted-foreground hover:text-white transition duration-200"
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Body */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 space-y-24 flex-1 w-full">
        <div data-testid="home-recommendations">
          <RecommendationSection
            title={recommendationTitle}
            subtitle={recommendationSubtitle}
            personalized={hasPersonalizedRecommendations}
            note={recommendationNote}
            action={(
              isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/restaurants')}
                  className="text-primary hover:text-[#D49653] hover:bg-[#20242D] focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 gap-1.5 text-xs font-semibold px-3 py-2 rounded-md transition-all"
                >
                  Khám phá nhà hàng <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent('/')}`)}
                  className="border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                >
                  Đăng nhập để nhận gợi ý cá nhân hóa hơn
                </Button>
              )
            )}
          >
            {recommendationState.loading ? (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Nhà hàng phù hợp
                    </h3>
                  </div>
                  <RecommendationSkeleton testId="recommendation-loading" count={3} variant="restaurant" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Món ăn gợi ý
                    </h3>
                  </div>
                  <RecommendationSkeleton count={2} variant="menu" />
                </div>
              </div>
            ) : null}

            {!recommendationState.loading && recommendationState.error ? (
              <RecommendationEmptyState
                variant="error"
                title="Chưa thể tải gợi ý lúc này."
                description="Bạn vẫn có thể tiếp tục khám phá nhà hàng nổi bật và thử lại gợi ý sau."
                onRetry={retryRecommendations}
              />
            ) : null}

            {showRecommendationEmpty ? (
              <RecommendationEmptyState
                title="Chưa có đủ dữ liệu để cá nhân hóa."
                description="Hãy đặt bàn hoặc lưu nhà hàng yêu thích để nhận gợi ý tốt hơn."
                loginCta={!isAuthenticated}
              />
            ) : null}

            {!recommendationState.loading && !recommendationState.error && !showRecommendationEmpty ? (
              <div className="space-y-6">
                {hasRestaurantRecommendations ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {hasPersonalizedRecommendations ? 'Nhà hàng phù hợp với bạn' : 'Nhà hàng đang được quan tâm'}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {hasPersonalizedRecommendations
                            ? 'Ưu tiên nhà hàng có lý do phù hợp rõ ràng và dễ đặt bàn.'
                            : 'Danh sách phổ biến để bạn bắt đầu khám phá nhanh hơn.'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      {restaurantRecommendations.map((restaurant) => (
                        <RecommendedRestaurantCard
                          key={restaurant.id}
                          personalized={hasPersonalizedRecommendations}
                          restaurant={restaurant}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {hasMenuRecommendations ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Món ăn gợi ý
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Những món nổi bật để bạn mở rộng bữa ăn mà vẫn giữ đúng gu thưởng thức.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {menuRecommendations.map((item) => (
                        <RecommendedMenuItemCard
                          key={item.id}
                          item={item}
                          personalized={hasPersonalizedRecommendations}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </RecommendationSection>
        </div>

        {/* Featured Section */}
        <Section
          title="Nổi bật tuần này"
          subtitle="Những địa điểm ẩm thực đặc sắc do biên tập viên tuyển chọn"
          action={
            <Button
              variant="ghost"
              onClick={() => navigate('/restaurants')}
              className="text-primary hover:text-[#D49653] hover:bg-[#20242D] focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 gap-1.5 text-xs font-semibold px-3 py-2 rounded-md transition-all"
            >
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Button>
          }
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="overflow-hidden bg-card border-border animate-pulse h-[340px]" />
              ))}
            </div>
          ) : featuredRestaurants.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <AlertTriangle className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Hiện chưa có nhà hàng nào được đánh giá nổi bật.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRestaurants.map((r) => (
                <Card
                  key={r.id}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                  className="overflow-hidden bg-card border-border hover:border-primary/45 transition-all duration-300 cursor-pointer group flex flex-col focus-within:border-primary/45 focus-within:ring-1 focus-within:ring-primary/20"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-secondary">
                    <SafeImage
                      src={getRestaurantCardImage(r)}
                      alt={r.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      fallback={<div className="w-full h-full flex items-center justify-center"><Utensils className="h-9 w-9 text-muted-foreground/70" /></div>}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle wishlist
                      }}
                      className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center text-white hover:text-red-500 hover:bg-black/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                      aria-label={`Thêm ${r.name} vào mục yêu thích`}
                    >
                      <Heart className="h-4.5 w-4.5" />
                    </button>
                    {(r.isFeatured || r.featured) && (
                      <Badge className="absolute top-3.5 left-3.5 bg-primary text-background border-none gap-1 py-1 font-semibold">
                        <Sparkles className="h-3 w-3" /> Editor's pick
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold text-white leading-snug truncate group-hover:text-primary transition-colors">
                          {r.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                          {r.cuisineType} · {r.averagePrice ? `~ ${r.averagePrice.toLocaleString('vi-VN')} đ` : 'Giá liên hệ'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold shrink-0 text-primary">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{r.averageRating ? r.averageRating.toFixed(1) : '0.0'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed flex-1">
                      {r.description || 'Khám phá không gian sang trọng và các món ăn đặc sắc được chuẩn bị bởi đầu bếp tài năng.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 truncate max-w-[70%]">
                        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>
                      <Button size="sm" className="h-8 text-xs bg-primary hover:bg-[#E0A968] text-background font-semibold px-3 transition-colors duration-200">
                        Đặt chỗ
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>

        {voucherCampaigns.length > 0 && (
          <Section
            title="Voucher dang duoc tai tro"
            subtitle="Uu dai tra phi de tang hien dien, van duoc BookEat kiem tra dieu kien that khi dat ban."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {voucherCampaigns.map((campaign) => (
                <Card
                  key={campaign._id}
                  className="overflow-hidden bg-card border-border hover:border-primary/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/restaurants/${campaign.restaurant.id}`)}
                    className="w-full text-left"
                  >
                    <div className="relative aspect-[16/8] overflow-hidden bg-secondary">
                      <SafeImage
                        src={getRestaurantCardImage(campaign.restaurant)}
                        alt={campaign.restaurant.name}
                        className="w-full h-full object-cover"
                        fallback={<div className="w-full h-full grid place-items-center"><Utensils className="h-8 w-8 text-muted-foreground" /></div>}
                      />
                      <Badge className="absolute top-3 left-3 bg-[#14171D]/90 text-primary border border-primary/25 gap-1">
                        <Sparkles className="h-3 w-3" />
                        Duoc tai tro
                      </Badge>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{campaign.restaurant.name}</p>
                          <h3 className="text-lg text-white font-bold mt-1">{campaign.voucher.code}</h3>
                        </div>
                        <TicketPercent className="h-5 w-5 text-primary shrink-0" />
                      </div>
                      <p className="text-primary font-bold mt-3">{formatVoucherDiscount(campaign.voucher)}</p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {campaign.voucher.description || 'Xem dieu kien voucher tai trang nha hang.'}
                      </p>
                    </div>
                  </button>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Tonight's Reservation Section */}
        <Section title="Khám phá ẩm thực quanh bạn" subtitle="Các nhà hàng phục vụ đặt bàn ngay tối nay cực hot">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} className="overflow-hidden bg-card border-border animate-pulse h-[280px]" />
              ))}
            </div>
          ) : tonightRestaurants.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">Hiện chưa có thêm nhà hàng nào sẵn sàng.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tonightRestaurants.map((r) => (
                <Card
                  key={r.id}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                  className="overflow-hidden bg-card border-border hover:border-primary/45 transition duration-300 cursor-pointer group flex flex-col focus-within:border-primary/45 focus-within:ring-1 focus-within:ring-primary/20"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <SafeImage
                      src={getRestaurantCardImage(r)}
                      alt={r.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      fallback={<div className="w-full h-full flex items-center justify-center"><Utensils className="h-8 w-8 text-muted-foreground/70" /></div>}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="text-base font-bold text-white leading-tight truncate group-hover:text-primary transition-colors">
                      {r.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {r.cuisineType} · {r.address}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span>{r.averageRating ? r.averageRating.toFixed(1) : '0.0'}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Đang hoạt động
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>

        {/* Browse by Cuisine Category */}
        <Section title="Khám phá theo thể loại" subtitle="Tìm kiếm các trải nghiệm hương vị ẩm thực phong phú khác nhau">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {cuisines.length === 0 ? (
              ['Hải sản', 'Bít tết', 'Món Việt', 'Món Nhật', 'Món Ý', 'Thuần chay'].map((cuisine) => (
                <Card
                  key={cuisine}
                  onClick={() => selectCuisineAndSearch(cuisine)}
                  className="p-5 bg-card border-border hover:border-primary/50 transition cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3.5 group-hover:scale-110 transition duration-200">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">{cuisine}</p>
                </Card>
              ))
            ) : (
              cuisines.map((cuisine) => (
                <Card
                  key={cuisine}
                  onClick={() => selectCuisineAndSearch(cuisine)}
                  className="p-5 bg-card border-border hover:border-primary/50 transition cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3.5 group-hover:scale-110 transition duration-200">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold">{cuisine}</p>
                </Card>
              ))
            )}
          </div>
        </Section>
      </div>

      {/* Basic Custom Footer */}
      <footer className="mt-auto border-t border-border bg-[#090B0E] py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold text-white tracking-wider">BookEat</span>
            <span>— Trải nghiệm đặt bàn hoàn hảo.</span>
          </div>
          <span>© 2026 BookEat. Mọi quyền được bảo lưu.</span>
        </div>
      </footer>
    </div>
  );
}
