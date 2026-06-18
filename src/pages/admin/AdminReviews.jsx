import { useEffect, useState, useCallback } from 'react';
import { Star, Shield, Eye, EyeOff, Flag, AlertTriangle, MessageSquareText } from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import * as reviewApi from '../../api/reviewApi';
import { StarDisplay } from '../../components/review/ReviewCard';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all'); // all, visible, hidden
  const [hideModalId, setHideModalId] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;

      const res = await reviewApi.getReportedReviews(params);
      if (res?.success) {
        setReviews(res.data.reviews);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHide = async (reviewId) => {
    if (!hideReason.trim()) {
      toast.error('Vui lòng nhập lý do ẩn đánh giá');
      return;
    }
    setActionLoading(true);
    try {
      const res = await reviewApi.hideReview(reviewId, hideReason.trim());
      if (res?.success) {
        toast.success('Đã ẩn đánh giá');
        setHideModalId(null);
        setHideReason('');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Không thể ẩn đánh giá');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (reviewId) => {
    setActionLoading(true);
    try {
      const res = await reviewApi.restoreReview(reviewId);
      if (res?.success) {
        toast.success('Đã khôi phục đánh giá');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Không thể khôi phục');
    } finally {
      setActionLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'visible', label: 'Đang hiển thị' },
    { value: 'hidden', label: 'Đã ẩn' },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Shield size={20} className="text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Kiểm duyệt đánh giá
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {total} đánh giá bị báo cáo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilter(opt.value); setPage(1); }}
                className={`text-[11px] px-3 py-1.5 rounded-full transition font-medium ${
                  filter === opt.value
                    ? 'bg-primary text-background'
                    : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Đang tải...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-card/10 border border-dashed border-border rounded-xl">
            <MessageSquareText className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="text-muted-foreground text-sm font-medium">Không có đánh giá bị báo cáo nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5 bg-card border-border">
                {/* Review Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">
                        {review.customer?.fullName?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.customer?.fullName || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {review.customer?.email} • {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    <Badge className={`text-[9px] font-bold uppercase border ${
                      review.status === 'hidden'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {review.status === 'hidden' ? 'Đã ẩn' : 'Hiển thị'}
                    </Badge>
                  </div>
                </div>

                {/* Restaurant name */}
                {review.restaurant && (
                  <p className="text-[11px] text-primary font-semibold mb-2">
                    📍 {review.restaurant.name}
                  </p>
                )}

                {/* Content */}
                {review.title && <h4 className="text-sm font-bold text-white mb-1">{review.title}</h4>}
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{review.comment}</p>

                {/* Report Info */}
                <div className="flex items-center gap-4 p-3 bg-rose-500/5 border border-rose-500/15 rounded-lg mb-3">
                  <div className="flex items-center gap-1.5">
                    <Flag size={13} className="text-rose-400" />
                    <span className="text-[11px] text-rose-400 font-bold">{review.reportCount} báo cáo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-400" />
                    <span className="text-[11px] text-muted-foreground">Helpful: {review.helpfulCount}</span>
                  </div>
                </div>

                {/* Hide reason if hidden */}
                {review.status === 'hidden' && review.hideReason && (
                  <div className="bg-secondary/50 border border-border/60 rounded-lg p-3 mb-3">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Lý do ẩn:</span>
                    <p className="text-xs text-muted-foreground mt-1">{review.hideReason}</p>
                    {review.hiddenAt && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Ẩn lúc: {formatDate(review.hiddenAt)}</p>
                    )}
                  </div>
                )}

                {/* Hide Modal */}
                {hideModalId === review.id && (
                  <div className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-lg border border-border mb-3">
                    <label className="text-[11px] text-muted-foreground font-semibold">Lý do ẩn đánh giá:</label>
                    <Input
                      type="text"
                      value={hideReason}
                      onChange={(e) => setHideReason(e.target.value)}
                      placeholder="Nhập lý do (bắt buộc)..."
                      className="bg-secondary/40 border-border text-xs h-9"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setHideModalId(null); setHideReason(''); }} className="border-border text-xs h-8">
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleHide(review.id)}
                        disabled={actionLoading || !hideReason.trim()}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-8 gap-1.5"
                      >
                        <EyeOff size={12} />
                        {actionLoading ? 'Đang xử lý...' : 'Xác nhận ẩn'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/40">
                  {review.status === 'visible' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setHideModalId(review.id); setHideReason(''); }}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-8 gap-1.5"
                    >
                      <EyeOff size={12} />
                      Ẩn đánh giá
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(review.id)}
                      disabled={actionLoading}
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs h-8 gap-1.5"
                    >
                      <Eye size={12} />
                      Khôi phục
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-border text-xs h-8">Trước</Button>
                <span className="text-xs text-muted-foreground font-medium px-3">Trang {page}/{totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-border text-xs h-8">Sau</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
