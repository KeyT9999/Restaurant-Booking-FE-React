import { useEffect, useState, useCallback } from 'react';
import { Star, ChevronDown, MessageSquareText } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Button } from '../ui/button';
import * as reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';

const StarBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-4 text-right font-medium">{star}</span>
      <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted-foreground w-6 text-right font-medium">{count}</span>
    </div>
  );
};

export default function ReviewSection({ restaurantId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await reviewApi.getRatingSummary(restaurantId);
      if (res?.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }, [restaurantId]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: sortBy };
      if (filterRating) params.rating = filterRating;

      const res = await reviewApi.getRestaurantReviews(restaurantId, params);
      if (res?.success) {
        setReviews(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, page, sortBy, filterRating]);

  const handleRefresh = useCallback(() => {
    fetchReviews();
    fetchSummary();
  }, [fetchReviews, fetchSummary]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFilterRating = (star) => {
    setFilterRating(filterRating === star ? null : star);
    setPage(1);
  };

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Cao nhất' },
    { value: 'lowest', label: 'Thấp nhất' },
    { value: 'helpful', label: 'Hữu ích nhất' },
  ];

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Rating Summary */}
      {summary && (
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center gap-1.5 min-w-[120px]">
            <span className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '—'}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= Math.round(summary.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-border'
                  }
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {summary.totalReviews} đánh giá
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 flex flex-col gap-1.5 justify-center">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => handleFilterRating(star)}
                className={`transition-opacity ${
                  filterRating && filterRating !== star ? 'opacity-40' : 'opacity-100'
                } hover:opacity-100`}
              >
                <StarBar
                  star={star}
                  count={summary.distribution?.[star] || 0}
                  total={summary.totalReviews}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Sắp xếp:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setPage(1); }}
              className={`text-[11px] px-3 py-1.5 rounded-full transition font-medium ${
                sortBy === opt.value
                  ? 'bg-primary text-background'
                  : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filterRating && (
          <button
            onClick={() => { setFilterRating(null); setPage(1); }}
            className="text-[11px] text-primary hover:text-primary/80 font-semibold transition"
          >
            ✕ Bỏ lọc {filterRating}★
          </button>
        )}
      </div>

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id || review._id} review={review} onUpdate={handleRefresh} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/10 border border-dashed border-border rounded-xl">
          <MessageSquareText className="mx-auto text-muted-foreground mb-3" size={36} />
          <p className="text-muted-foreground text-sm font-medium">
            {filterRating
              ? `Chưa có đánh giá ${filterRating}★ nào`
              : 'Chưa có đánh giá nào cho nhà hàng này'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Hãy là người đầu tiên chia sẻ trải nghiệm!
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="border-border text-xs h-8"
          >
            Trước
          </Button>
          <span className="text-xs text-muted-foreground font-medium px-3">
            Trang {page}/{totalPages} ({total} đánh giá)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="border-border text-xs h-8"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
