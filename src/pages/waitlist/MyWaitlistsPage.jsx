import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RefreshCw, SearchX } from 'lucide-react';
import { cancelWaitlist, getMyWaitlists } from '../../api/waitlistApi';
import WaitlistCard from '../../components/waitlist/WaitlistCard';
import './MyWaitlistsPage.css';

const STATUSES = [
  { value: '', label: 'Tat ca' },
  { value: 'pending', label: 'Dang cho' },
  { value: 'confirmed', label: 'Da xac nhan' },
  { value: 'cancelled', label: 'Da huy' },
  { value: 'expired', label: 'Het han' },
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
        toast.error(res.message || 'Khong the tai danh sach cho');
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tai danh sach cho');
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

  const handleCancel = async (waitlist) => {
    const reason = window.prompt('Ly do huy danh sach cho?', 'Khach hang chu dong huy');
    if (reason === null) return;

    try {
      const res = await cancelWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Da huy yeu cau danh sach cho');
        fetchWaitlists();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the huy yeu cau');
    }
  };

  return (
    <div className="my-waitlists-page">
      <header className="my-waitlists-header">
        <div>
          <p>BookEat Waitlist</p>
          <h1>Danh sach cho cua toi</h1>
          <span>Theo doi yeu cau cho ban, mon/dich vu da chon va trang thai realtime.</span>
        </div>
        <button type="button" onClick={fetchWaitlists} className="my-waitlists-refresh" aria-label="Lam moi">
          <RefreshCw size={18} /> Lam moi
        </button>
      </header>

      <div className="my-waitlists-filter" role="tablist" aria-label="Loc trang thai danh sach cho">
        {STATUSES.map((item) => (
          <button
            key={item.value}
            type="button"
            className={status === item.value ? 'active' : ''}
            onClick={() => setStatus(item.value)}
            role="tab"
            aria-selected={status === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="my-waitlists-state">Dang tai...</div>
      ) : waitlists.length === 0 ? (
        <div className="my-waitlists-empty">
          <SearchX size={46} />
          <h2>Chua co yeu cau danh sach cho</h2>
          <p>Khi nha hang het ban, ban co the tham gia waitlist va chon mon/dich vu truoc.</p>
          <button type="button" onClick={() => navigate('/restaurants')}>Tim nha hang</button>
        </div>
      ) : (
        <section className="my-waitlists-grid">
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
    </div>
  );
}
