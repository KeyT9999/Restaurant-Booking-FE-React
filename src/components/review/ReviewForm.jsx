import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import * as reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

export default function ReviewForm({ bookingId, onSuccess, onCancel, existingReview }) {
  const isEditing = !!existingReview;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  const displayRating = hoverRating || rating;

  const ratingLabels = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Tuyệt vời',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    try {
      const payload = { rating, title: title.trim() || null, comment: comment.trim() };

      let res;
      if (isEditing) {
        res = await reviewApi.updateReview(existingReview.id, payload);
      } else {
        res = await reviewApi.createReview({ ...payload, bookingId });
      }

      if (res?.success) {
        toast.success(isEditing ? 'Cập nhật đánh giá thành công!' : 'Đánh giá đã được gửi!');
        onSuccess?.(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </h3>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-white transition">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Đánh giá của bạn
          </label>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= displayRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-border hover:text-amber-400/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <span className="text-xs font-semibold text-amber-400">
                {ratingLabels[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Tiêu đề <span className="text-muted-foreground/50">(tùy chọn)</span>
          </label>
          <Input
            type="text"
            placeholder="Ví dụ: Trải nghiệm tuyệt vời!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="bg-secondary/40 border-border text-sm h-10 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Nội dung đánh giá <span className="text-rose-400">*</span>
          </label>
          <textarea
            placeholder="Chia sẻ trải nghiệm của bạn về nhà hàng (tối thiểu 10 ký tự)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>{comment.length < 10 ? `Tối thiểu ${10 - comment.length} ký tự nữa` : '✓ Đủ độ dài'}</span>
            <span>{comment.length}/2000</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border text-muted-foreground hover:bg-secondary hover:text-white text-xs h-10 px-5"
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || rating === 0 || comment.trim().length < 10}
            className="bg-primary hover:bg-primary/90 text-background font-bold text-xs h-10 px-6 gap-2 shadow-lg shadow-primary/15"
          >
            <Send size={14} />
            {loading ? 'Đang gửi...' : isEditing ? 'Cập nhật' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
