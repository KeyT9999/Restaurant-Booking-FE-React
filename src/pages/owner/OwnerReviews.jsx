import { useEffect, useState, useCallback } from 'react';
import { Star, MessageSquare, Send, Filter, MessageSquareText } from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/useAuth';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as reviewApi from '../../api/reviewApi';
import { StarDisplay } from '../../components/review/ReviewCard';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function OwnerReviews() {
  const { user } = useAuth();
  const { selectedRestaurant } = useRestaurantContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all'); // all, replied, unreplied
  const [replyingId, setReplyingId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const params = {
        restaurantId: selectedRestaurant._id || selectedRestaurant.id,
        page,
        limit: 10,
      };
      if (filter === 'replied') params.replied = 'true';
      else if (filter === 'unreplied') params.replied = 'false';

      const res = await reviewApi.getOwnerReviews(params);
      if (res?.success) {
        setReviews(res.data.reviews);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, page, filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReply = async (reviewId) => {
    if (!replyContent.trim()) {
      toast.error('Nội dung phản hồi không được để trống');
      return;
    }
    setReplyLoading(true);
    try {
      const res = await reviewApi.replyToReview(reviewId, replyContent.trim());
      if (res?.success) {
        toast.success('Phản hồi thành công!');
        setReplyingId(null);
        setReplyContent('');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Không thể gửi phản hồi');
    } finally {
      setReplyLoading(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'unreplied', label: 'Chưa phản hồi' },
    { value: 'replied', label: 'Đã phản hồi' },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quản lý đánh giá
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {total} đánh giá từ khách hàng
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-card/10 border border-dashed border-border rounded-xl">
            <MessageSquareText className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="text-muted-foreground text-sm font-medium">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5 bg-card border-border">
                {/* Review Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      {review.customer?.avatarUrl ? (
                        <img src={review.customer.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {review.customer?.fullName?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.customer?.fullName || 'Khách hàng'}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    {review.ownerReply?.content ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold uppercase">
                        Đã phản hồi
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold uppercase">
                        Chờ phản hồi
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                {review.title && <h4 className="text-sm font-bold text-white mb-1">{review.title}</h4>}
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{review.comment}</p>

                {/* Existing Reply */}
                {review.ownerReply?.content && (
                  <div className="bg-secondary/50 border border-border/60 rounded-lg p-3.5 mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare size={12} className="text-primary" />
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Phản hồi của bạn</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{review.ownerReply.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatDate(review.ownerReply.repliedAt)}</p>
                  </div>
                )}

                {/* Reply Form */}
                {replyingId === review.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Viết phản hồi cho khách hàng..."
                      rows={3}
                      className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setReplyingId(null); setReplyContent(''); }}
                        className="border-border text-xs h-8 text-muted-foreground"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        disabled={replyLoading || !replyContent.trim()}
                        className="bg-primary hover:bg-primary/90 text-background text-xs h-8 gap-1.5 font-semibold"
                      >
                        <Send size={12} />
                        {replyLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setReplyingId(review.id); setReplyContent(review.ownerReply?.content || ''); }}
                    className="border-border text-xs h-8 text-muted-foreground hover:text-white hover:bg-secondary gap-1.5 mt-1"
                  >
                    <MessageSquare size={12} />
                    {review.ownerReply?.content ? 'Chỉnh sửa phản hồi' : 'Phản hồi'}
                  </Button>
                )}
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
