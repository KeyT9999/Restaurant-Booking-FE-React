import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, Clock, ConciergeBell, Users, Utensils } from 'lucide-react';
import { cancelWaitlist, getWaitlistById } from '../../api/waitlistApi';
import WaitlistStatusBadge from '../../components/waitlist/WaitlistStatusBadge';
import './WaitlistDetailPage.css';

const currency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '--';

export default function WaitlistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waitlist, setWaitlist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWaitlistById(id);
      if (res.success) setWaitlist(res.data.waitlist);
      else toast.error(res.message || 'Khong the tai chi tiet');
    } catch (error) {
      toast.error(error.message || 'Khong the tai chi tiet');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    const handler = (event) => {
      const eventId = event.detail?.payload?.waitlistId;
      if (!eventId || eventId === id) fetchDetail();
    };
    window.addEventListener('bookeat:waitlist-event', handler);
    return () => window.removeEventListener('bookeat:waitlist-event', handler);
  }, [fetchDetail, id]);

  const handleCancel = async () => {
    const reason = window.prompt('Ly do huy danh sach cho?', 'Khach hang chu dong huy');
    if (reason === null) return;

    try {
      const res = await cancelWaitlist(id, reason);
      if (res.success) {
        toast.success('Da huy yeu cau');
        fetchDetail();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the huy yeu cau');
    }
  };

  if (loading) {
    return <div className="waitlist-detail-page"><div className="waitlist-detail-state">Dang tai...</div></div>;
  }

  if (!waitlist) {
    return (
      <div className="waitlist-detail-page">
        <div className="waitlist-detail-state">
          <p>Khong tim thay yeu cau danh sach cho.</p>
          <Link to="/my-waitlists">Quay lai danh sach cho</Link>
        </div>
      </div>
    );
  }

  const total = [...(waitlist.dishes || []), ...(waitlist.services || [])]
    .reduce((sum, item) => sum + Number(item.price || item.priceSnapshot || 0) * Number(item.quantity || 1), 0);

  return (
    <div className="waitlist-detail-page">
      <button type="button" className="waitlist-detail-back" onClick={() => navigate('/my-waitlists')}>
        <ArrowLeft size={18} /> Danh sach cho cua toi
      </button>

      <article className="waitlist-detail-card">
        <header>
          <div>
            <p>Yeu cau #{String(waitlist.id).slice(-6).toUpperCase()}</p>
            <h1>{waitlist.restaurant?.name || 'Nha hang'}</h1>
          </div>
          <WaitlistStatusBadge status={waitlist.status} />
        </header>

        <section className="waitlist-detail-meta">
          <span><CalendarDays size={18} /> {formatDate(waitlist.preferredDate)}</span>
          <span><Clock size={18} /> {waitlist.preferredTime}</span>
          <span><Users size={18} /> {waitlist.numberOfGuests} khach</span>
        </section>

        <section className="waitlist-detail-grid">
          <div>
            <span>Vi tri hang cho</span>
            <strong>{waitlist.queuePositionSnapshot || 'Dang tinh'}</strong>
          </div>
          <div>
            <span>Uoc tinh cho</span>
            <strong>{waitlist.estimatedWaitMinutes || 0} phut</strong>
          </div>
          <div>
            <span>Cho toi da den</span>
            <strong>{waitlist.maxWaitUntil ? new Date(waitlist.maxWaitUntil).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--'}</strong>
          </div>
          <div>
            <span>Tam tinh</span>
            <strong>{currency(total)}</strong>
          </div>
        </section>

        <section className="waitlist-detail-columns">
          <div>
            <h2>Ban uu tien</h2>
            {(waitlist.tables || []).length === 0 ? (
              <p className="waitlist-detail-muted">De nha hang xep ban phu hop.</p>
            ) : (
              <ul>
                {waitlist.tables.map((table) => (
                  <li key={table.id}>Ban {table.tableNumber} · {table.capacity} cho · {table.selectionType}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2><Utensils size={18} /> Mon da chon</h2>
            {(waitlist.dishes || []).length === 0 ? (
              <p className="waitlist-detail-muted">Chua chon mon truoc.</p>
            ) : (
              <ul>
                {waitlist.dishes.map((item) => (
                  <li key={item.id}>{item.name} x{item.quantity} · {currency(item.price)}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2><ConciergeBell size={18} /> Dich vu</h2>
            {(waitlist.services || []).length === 0 ? (
              <p className="waitlist-detail-muted">Chua chon dich vu.</p>
            ) : (
              <ul>
                {waitlist.services.map((item) => (
                  <li key={item.id}>{item.name} x{item.quantity} · {currency(item.price)}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2>Ghi chu</h2>
            <p className="waitlist-detail-muted">{waitlist.note || 'Khong co ghi chu.'}</p>
          </div>
        </section>

        {waitlist.convertedBookingId && (
          <div className="waitlist-booking-link">
            Waitlist da duoc chuyen thanh booking.
            <Link to={`/bookings/${waitlist.convertedBookingId}`}>Xem booking</Link>
          </div>
        )}

        {waitlist.status === 'pending' && (
          <footer>
            <button type="button" className="waitlist-detail-danger" onClick={handleCancel}>
              Huy yeu cau
            </button>
          </footer>
        )}
      </article>
    </div>
  );
}
