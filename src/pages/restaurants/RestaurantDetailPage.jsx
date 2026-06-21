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
  Check,
  ChevronRight,
  ShieldAlert,
  Info,
  Image as ImageIcon,
  Images,
  TicketPercent,
} from 'lucide-react';
import ReviewSection from '../../components/review/ReviewSection';
import Header from '../../components/Header';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import * as menuApi from '../../api/menuApi';
import * as tableApi from '../../api/tableApi';
import { useAuth } from '../../context/useAuth';
import { useChatWidget } from '../../context/useChatWidget';
import toast from 'react-hot-toast';
import { getRestaurantVouchers, saveVoucher } from '../../api/voucherApi';
import VoucherCard from '../../components/voucher/VoucherCard';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import SafeImage from '../../components/common/SafeImage';
import {
  getRestaurantCoverImage,
  getRestaurantGalleryImages,
  getRestaurantLogoImage,
} from '../../utils/restaurantImages';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openCustomerRestaurantChat } = useChatWidget();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'tables' | 'info'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');



  const fetchVouchers = useCallback(async () => {
    try {
      const res = await getRestaurantVouchers(id);
      if (res?.success) {
        setVouchers(res.data || []);
      }
    } catch (e) {
      console.warn('Lỗi tải voucher nhà hàng:', e.message);
    }
  }, [id]);

  const handleSaveVoucher = async (voucher) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu voucher');
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      const res = await saveVoucher({ voucherId: voucher._id });
      if (res?.success) {
        toast.success(`Đã lưu mã ${voucher.code} vào ví thành công!`);
        setVouchers(prev => prev.map(v => v._id === voucher._id ? { ...v, isSaved: true } : v));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu voucher');
    }
  };

  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    try {
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
    fetchVouchers();
  }, [fetchRestaurantData, fetchVouchers]);

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
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải thông tin chi tiết nhà hàng...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <ShieldAlert className="h-12 w-12 text-rose-500" />
          <p className="text-muted-foreground text-sm">Không tìm thấy thông tin chi tiết của nhà hàng này.</p>
          <Button onClick={() => navigate('/restaurants')} className="bg-primary hover:bg-primary/95 text-background font-semibold">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

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

  const formatAddress = (address) => {
    if (!address) return 'Chưa cập nhật';
    if (typeof address === 'string') return address;
    return address.fullAddress || [address.street, address.ward, address.district, address.city].filter(Boolean).join(', ') || 'Chưa cập nhật';
  };

  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
  };
  const heroImage = getRestaurantCoverImage(restaurant);
  const logoImage = getRestaurantLogoImage(restaurant);
  const galleryImages = getRestaurantGalleryImages(restaurant);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      {/* Banner Area */}
      <section className="relative h-80 sm:h-[400px] bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/35 z-10" />
        <SafeImage
          className="w-full h-full object-cover"
          src={heroImage}
          alt={restaurant.name}
          fallback={(
            <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(212,150,83,0.18),transparent_30%),linear-gradient(135deg,#20242D,#0F1115)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <ImageIcon className="h-9 w-9" />
              </div>
            </div>
          )}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-8 flex flex-col justify-end h-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link to="/restaurants" className="hover:text-white transition">Nhà hàng</Link>
            <ChevronRight size={12} />
            <span className="text-white truncate max-w-[200px]">{restaurant.name}</span>
          </div>

          {/* Title and details block */}
          <div className="flex items-end gap-5">
            <SafeImage
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-card border border-border/80 shadow-2xl flex-shrink-0"
              src={logoImage}
              alt={`${restaurant.name} logo`}
              fallback={(
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-card border border-border/80 shadow-2xl flex-shrink-0 flex items-center justify-center text-primary">
                  <ImageIcon className="h-7 w-7" />
                </div>
              )}
            />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3.5 items-center">
                {restaurant.cuisineType && (
                  <Badge className="bg-primary text-background border-none font-semibold">
                    {restaurant.cuisineType}
                  </Badge>
                )}
                {(restaurant.isFeatured || restaurant.featured) && (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">
                    ★ NỔI BẬT
                  </Badge>
                )}
                {restaurant.hasVoucherCampaign && (
                  <Badge className="bg-primary/10 text-primary border border-primary/25 font-bold text-[10px] gap-1">
                    <TicketPercent size={12} />
                    Voucher nổi bật · Được tài trợ
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Layout */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Block: Infos, vouchers, tabs */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Quick Info Grid */}
            <Card className="p-5 bg-card border-border grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Địa chỉ</span>
                  <span className="text-xs text-white leading-relaxed line-clamp-2 mt-1">{formatAddress(restaurant.address)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Giờ hoạt động</span>
                  <span className="text-xs text-white font-semibold mt-1 block">
                    {restaurant.operatingHours?.open || '08:00'} - {restaurant.operatingHours?.close || '22:00'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Khoảng giá trung bình</span>
                  <span className="text-xs text-white font-semibold mt-1 block">
                    {restaurant.averagePrice ? `${restaurant.averagePrice.toLocaleString('vi-VN')} đ` : getPriceRangeText(restaurant.priceRange)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Voucher offers list */}
            {vouchers.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="text-left">
                  <span className="text-xs text-primary uppercase font-bold tracking-wider">Ưu đãi hấp dẫn</span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-white mt-1">Khuyến mại độc quyền</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vouchers.map(v => (
                    <VoucherCard
                      key={v._id}
                      voucher={v}
                      isSaved={v.isSaved}
                      onAction={handleSaveVoucher}
                      actionText="Lưu mã"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tab navigation workspace */}
            <div className="flex flex-col gap-5">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-[#20242D] border border-border p-1 w-full justify-start rounded-lg h-11">
                  <TabsTrigger value="menu" className="flex items-center gap-1.5 text-xs font-semibold px-4 rounded-md h-9 data-[state=active]:bg-primary data-[state=active]:text-background transition-all">
                    <Utensils size={14} /> Thực đơn
                  </TabsTrigger>
                  <TabsTrigger value="tables" className="flex items-center gap-1.5 text-xs font-semibold px-4 rounded-md h-9 data-[state=active]:bg-primary data-[state=active]:text-background transition-all">
                    <Armchair size={14} /> Sơ đồ bàn ({tableStats.available}/{tableStats.total})
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs font-semibold px-4 rounded-md h-9 data-[state=active]:bg-primary data-[state=active]:text-background transition-all">
                    <Globe size={14} /> Giới thiệu chi tiết
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="flex items-center gap-1.5 text-xs font-semibold px-4 rounded-md h-9 data-[state=active]:bg-primary data-[state=active]:text-background transition-all">
                    <Star size={14} /> Đánh giá ({restaurant.stats?.totalReviews || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Tab content area */}
                <div className="mt-6">
                  {/* Menu Panel */}
                  <TabsContent value="menu" className="flex flex-col gap-5 focus-visible:outline-none">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-lg border border-border">
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Tìm món ăn trong thực đơn..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-secondary/40 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary h-9"
                        />
                      </div>

                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto items-center">
                          <button
                            onClick={() => setSelectedCategory('')}
                            className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
                              !selectedCategory ? 'bg-primary text-background' : 'bg-secondary hover:bg-[#2C313C] text-muted-foreground hover:text-white'
                            }`}
                          >
                            Tất cả
                          </button>
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
                                selectedCategory === cat.id ? 'bg-primary text-background' : 'bg-secondary hover:bg-[#2C313C] text-muted-foreground hover:text-white'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {filteredMenuItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredMenuItems.map(item => (
                          <Card key={item.id} className="p-4 bg-card border-border flex gap-4 hover:border-primary/20 transition group">
                            <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-secondary text-muted-foreground">🍽️</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{item.name}</h4>
                                  <span className="text-xs text-primary font-bold">{formatPrice(item.price)}</span>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                                )}
                              </div>
                              <div className="mt-3.5 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="bg-secondary px-2 py-0.5 rounded font-medium">{item.categoryName || 'Món ăn'}</span>
                                <span className={`font-semibold ${item.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {item.isAvailable ? 'Còn món' : 'Hết món'}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-card/10 border border-dashed border-border rounded-xl">
                        <Utensils className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">Không tìm thấy món ăn nào phù hợp với tìm kiếm.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Sơ đồ bàn Panel */}
                  <TabsContent value="tables" className="flex flex-col gap-4 focus-visible:outline-none">
                    <div className="flex gap-2 items-center bg-primary/5 border border-primary/20 p-3.5 rounded-lg text-xs text-primary/95 leading-relaxed mb-1">
                      <Info className="h-4.5 w-4.5 flex-shrink-0" />
                      <span>Xem danh sách sơ đồ bàn của nhà hàng. Trạng thái bàn trống thực tế có thể thay đổi tùy thuộc vào thời gian cụ thể bạn đăng ký đặt bàn.</span>
                    </div>

                    {tables.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {tables.map(table => (
                          <Card
                            key={table.id}
                            className={`p-4 bg-card border transition ${
                              table.status === 'available' ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-border'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-white">Bàn {table.tableNumber}</h4>
                              <Badge
                                className={`text-[9px] uppercase border font-bold ${
                                  table.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  table.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  table.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-secondary text-muted-foreground border-border'
                                }`}
                              >
                                {table.status === 'available' ? 'Trống' :
                                 table.status === 'occupied' ? 'Bận' :
                                 table.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'}
                              </Badge>
                            </div>
                            <div className="mt-3.5 flex flex-col gap-1 text-[11px] text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Sức chứa:</span>
                                <span className="font-semibold text-white">{table.capacity} người</span>
                              </div>
                              {table.zone && (
                                <div className="flex justify-between">
                                  <span>Khu vực:</span>
                                  <span className="font-semibold text-white">{table.zone}</span>
                                </div>
                              )}
                              {table.depositAmount > 0 && (
                                <div className="flex justify-between text-primary">
                                  <span>Tiền đặt cọc:</span>
                                  <span className="font-bold">{formatPrice(table.depositAmount)}</span>
                                </div>
                              )}
                              {table.note && (
                                <p className="text-[10px] italic border-t border-border/40 pt-1.5 mt-1.5 text-muted-foreground/80 leading-relaxed">
                                  💡 {table.note}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-card/10 border border-dashed border-border rounded-xl">
                        <Armchair className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">Nhà hàng chưa cập nhật sơ đồ bàn chính thức.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Info Panel */}
                  <TabsContent value="info" className="flex flex-col gap-6 focus-visible:outline-none">
                    <div className="bg-card p-6 border border-border rounded-xl flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-bold text-white border-l-2 border-primary pl-2 uppercase tracking-wide">Giới thiệu về chúng tôi</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{restaurant.description || 'Chưa có bài viết giới thiệu chi tiết cho nhà hàng này.'}</p>
                      </div>

                      {galleryImages.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Images className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wide">Thư viện ảnh</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {galleryImages.slice(0, 6).map((url, index) => (
                              <div key={`${url}-${index}`} className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary">
                                <SafeImage
                                  src={url}
                                  alt={`${restaurant.name} anh ${index + 1}`}
                                  className="h-full w-full object-cover hover:scale-105 transition duration-300"
                                  loading="lazy"
                                  fallback={<div className="h-full w-full flex items-center justify-center bg-secondary"><Images className="h-6 w-6 text-muted-foreground/70" /></div>}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {restaurant.signatureDishes && restaurant.signatureDishes.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-sm font-bold text-white border-l-2 border-primary pl-2 uppercase tracking-wide">Món ăn đặc trưng nổi tiếng</h4>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {restaurant.signatureDishes.map((dish, i) => (
                              <Badge key={i} variant="secondary" className="text-xs text-white border-border px-3 py-1 font-semibold">
                                {dish}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {restaurant.amenities && restaurant.amenities.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-sm font-bold text-white border-l-2 border-primary pl-2 uppercase tracking-wide">Tiện ích phục vụ</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            {restaurant.amenities.map((item, i) => (
                              <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Check size={14} className="text-primary" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {restaurant.policyRules && restaurant.policyRules.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-sm font-bold text-white border-l-2 border-primary pl-2 uppercase tracking-wide">Chính sách & Quy định</h4>
                          <ul className="list-disc pl-4 text-xs text-muted-foreground leading-relaxed space-y-1.5 mt-1.5">
                            {restaurant.policyRules.map((rule, i) => (
                              <li key={i}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-col gap-2.5 pt-4 border-t border-border/60">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">Thông tin liên hệ trực tiếp</h4>
                        <div className="flex flex-col gap-2 mt-1.5 text-xs text-muted-foreground">
                          {restaurant.phoneNumber && (
                            <p className="flex items-center gap-2">
                              <Phone size={14} className="text-primary" />
                              <span>Điện thoại: <strong className="text-white">{restaurant.phoneNumber}</strong></span>
                            </p>
                          )}
                          {restaurant.email && (
                            <p className="flex items-center gap-2">
                              <Globe size={14} className="text-primary" />
                              <span>Email: <strong className="text-white">{restaurant.email}</strong></span>
                            </p>
                          )}
                          {restaurant.websiteUrl && (
                            <p className="flex items-center gap-2">
                              <Globe size={14} className="text-primary" />
                              <span>Website:{' '}
                                <a href={restaurant.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                  {restaurant.websiteUrl}
                                </a>
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Reviews Panel */}
                  <TabsContent value="reviews" className="focus-visible:outline-none">
                    <ReviewSection restaurantId={id} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right Block: Actions / Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border sticky top-24 flex flex-col gap-5 shadow-xl">
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold text-white">Đặt bàn online</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đảm bảo chỗ ngồi lý tưởng của bạn tại nhà hàng {restaurant.name} chỉ trong vài thao tác trực tuyến đơn giản.
              </p>

              <Button
                onClick={() => navigate(`/restaurants/${restaurant.id}/booking`)}
                className="bg-primary hover:bg-primary/95 text-background font-bold h-11 w-full gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/15"
              >
                <CalendarDays size={16} /> Đặt bàn ngay lập tức
              </Button>

              <Button
                variant="outline"
                onClick={handleChatRestaurant}
                className="border-border text-white hover:bg-secondary/65 hover:text-white h-11 w-full gap-2 text-xs font-semibold"
              >
                <MessageCircle size={16} className="text-primary" /> Chat với nhà hàng
              </Button>

              {restaurant.bookingNotes && (
                <div className="bg-secondary/40 border border-border rounded-lg p-3.5 mt-2">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Lưu ý đặt bàn:</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{restaurant.bookingNotes}</p>
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>

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
