import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RefreshCw, Compass } from 'lucide-react';
import { cancelWaitlist, getMyWaitlists } from '../../api/waitlistApi';
import WaitlistCard from '../../components/waitlist/WaitlistCard';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'expired', label: 'Hết hạn' },
];

export default function MyWaitlistsPage() {
  const navigate = useNavigate();
  const [waitlists, setWaitlists] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWaitlists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyWaitlists({ status: status || undefined, page: 1, limit: 30 });
      if (res.success) {
        setWaitlists(res.data.waitlists || []);
      } else {
        toast.error(res.message || 'Không thể tải danh sách chờ');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách chờ');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWaitlists();
  }, [fetchWaitlists]);

  useEffect(() => {
    const handler = () => fetchWaitlists();
    window.addEventListener('bookeat:waitlist-event', handler);
    return () => window.removeEventListener('bookeat:waitlist-event', handler);
  }, [fetchWaitlists]);

  // Reset filter is handled via effect or directly inside handler

  const handleCancel = async (waitlist) => {
    const reason = window.prompt('Lý do hủy danh sách chờ?', 'Khách hàng chủ động hủy');
    if (reason === null) return;

    try {
      const res = await cancelWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Đã hủy yêu cầu danh sách chờ');
        fetchWaitlists();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể hủy yêu cầu');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8 text-left">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Danh sách chờ của tôi
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi vị trí hàng chờ dự kiến, món ăn dịch vụ đặt trước và trạng thái realtime.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWaitlists}
            className="border-border text-white hover:bg-secondary text-xs font-semibold self-start sm:self-auto gap-1.5 h-9"
          >
            <RefreshCw size={14} /> Làm mới
          </Button>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1 bg-[#20242D] border border-border p-1 rounded-lg w-fit mb-8 justify-start text-xs font-semibold">
          {STATUSES.map((item) => (
            <button
              key={item.value}
              role="tab"
              onClick={() => setStatus(item.value)}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                status === item.value
                  ? 'bg-primary text-background font-bold'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Waitlists Grid */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => (
              <Card key={n} className="h-36 bg-card border-border animate-pulse" />
            ))}
          </div>
        ) : waitlists.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-4">
            <Compass size={48} className="text-muted-foreground animate-bounce" />
            <h3 className="text-lg font-bold text-white">Chưa có yêu cầu danh sách chờ nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Khi nhà hàng đã hết bàn trống, bạn có thể đăng ký hàng chờ xếp hàng trực tuyến để nhận vị trí sớm nhất.
            </p>
            <Button onClick={() => navigate('/restaurants')} className="bg-primary hover:bg-primary/95 text-background text-xs font-bold gap-1.5 h-10 px-5">
              Khám phá nhà hàng ngay
            </Button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 text-left">
            {waitlists.map((waitlist) => (
              <WaitlistCard
                key={waitlist.id}
                waitlist={waitlist}
                onView={() => navigate(`/waitlists/${waitlist.id}`)}
                onCancel={handleCancel}
              />
            ))}
          </section>
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
