import { Star, ThumbsUp, Flag, MessageSquare, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../context/useAuth';
import * as reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-border'}
      />
    ))}
  </div>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function ReviewCard({ review, onUpdate }) {
  const { isAuthenticated, user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh dấu hữu ích');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await reviewApi.toggleHelpful(review.id || review._id);
      if (res?.success) {
        setIsHelpful(res.data.helpful);
        setHelpfulCount(res.data.helpfulCount);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể thực hiện');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await reviewApi.reportReview(review.id || review._id);
      if (res?.success) {
        if (res.data.alreadyReported) {
          toast('Bạn đã báo cáo đánh giá này trước đó', { icon: '⚠️' });
        } else {
          toast.success('Đã báo cáo đánh giá');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Không thể báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3.5 hover:border-primary/15 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {review.customer?.avatarUrl ? (
              <img src={review.customer.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={16} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {review.customer?.fullName || 'Khách hàng'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="text-sm font-bold text-white">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>

      {/* Media */}
      {(review.images || review.mediaUrls) && (review.images || review.mediaUrls).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(review.images || review.mediaUrls).map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Review media ${i + 1}`}
              className="h-16 w-16 rounded-lg object-cover border border-border"
            />
          ))}
        </div>
      )}

      {/* Owner Reply */}
      {review.ownerReply && (
        <div className="bg-secondary/50 border border-border/60 rounded-lg p-3.5 ml-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare size={12} className="text-primary" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Phản hồi từ nhà hàng</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{review.ownerReply.comment || review.ownerReply.content}</p>
          {review.ownerReply.repliedAt && (
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatDate(review.ownerReply.repliedAt)}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/40">
        <button
          onClick={handleHelpful}
          disabled={loading}
          className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
            isHelpful
              ? 'text-primary'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          <ThumbsUp size={13} className={isHelpful ? 'fill-primary' : ''} />
          Hữu ích{helpfulCount > 0 ? ` (${helpfulCount})` : ''}
        </button>

        {isAuthenticated && user?._id !== (review.userId || review.customerId) && (
          <button
            onClick={handleReport}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-rose-400 font-medium transition-colors"
          >
            <Flag size={13} />
            Báo cáo
          </button>
        )}

        {review.status === 'hidden' && (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold uppercase ml-auto">
            Đã ẩn
          </Badge>
        )}
      </div>
    </div>
  );
}

export { StarDisplay };
