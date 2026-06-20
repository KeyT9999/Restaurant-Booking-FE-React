import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { getRestaurantReviews } from '../../api/reviewApi';
import { RatingStars } from '../ui/RatingStars';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function ReviewSection({ restaurantId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [avgRating, setAvgRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const params = { page: reviewsPage, limit: 5 };
      if (selectedRatingFilter) {
        params.rating = selectedRatingFilter;
      }
      const res = await getRestaurantReviews(restaurantId, params);
      if (res?.success) {
        setReviews(res.data || []);
        setReviewsTotalPages(res.pagination?.totalPages || 1);
        setReviewsTotal(res.pagination?.total || 0);
        if (res.stats?.averageRating !== undefined) {
          setAvgRating(res.stats.averageRating);
        }
      }
    } catch (e) {
      console.warn('Lỗi tải đánh giá nhà hàng:', e.message);
    } finally {
      setReviewsLoading(false);
    }
  }, [restaurantId, reviewsPage, selectedRatingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setReviewsPage(1);
  }, [selectedRatingFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Rating Summary Block */}
      <Card className="p-6 bg-card border-border flex flex-col md:flex-row gap-6 items-center">
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#2C313C]/60 pb-6 md:pb-0 md:pr-10 shrink-0 w-full md:w-auto">
          <span className="text-5xl font-extrabold text-[#D49653] font-serif">
            {Number(avgRating || 0).toFixed(1)}
          </span>
          <div className="mt-2.5">
            <RatingStars rating={avgRating || 0} size="md" />
          </div>
          <span className="text-xs text-[#A5ADBA] mt-2 block">
            Từ {reviewsTotal} đánh giá
          </span>
        </div>

        <div className="flex-1 w-full text-left">
          <span className="text-xs text-[#A5ADBA] uppercase tracking-wider font-semibold block mb-2.5">
            Lọc theo đánh giá
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'Tất cả' },
              { value: '5', label: '5 ★' },
              { value: '4', label: '4 ★' },
              { value: '3', label: '3 ★' },
              { value: '2', label: '2 ★' },
              { value: '1', label: '1 ★' },
            ].map((filterItem) => (
              <button
                key={filterItem.value}
                onClick={() => setSelectedRatingFilter(filterItem.value)}
                className={`text-xs font-semibold px-4 py-2 rounded-md border transition-all cursor-pointer ${
                  selectedRatingFilter === filterItem.value
                    ? 'bg-[#D49653] text-[#0F1115] border-[#D49653]'
                    : 'border-[#2C313C] text-[#A5ADBA] hover:text-white hover:bg-[#20242D]'
                }`}
              >
                {filterItem.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Đang tải đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-card/10 border border-dashed border-[#2C313C] rounded-xl flex flex-col items-center justify-center gap-3">
          <Star className="text-muted-foreground w-8 h-8" />
          <p className="text-muted-foreground text-sm font-medium">Chưa có đánh giá nào tương ứng với bộ lọc này.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 text-left">
          {reviews.map((rev) => (
            <Card key={rev._id} className="p-5 bg-card border-border flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-[#20242D] border border-border overflow-hidden shrink-0">
                    {rev.userId?.avatarUrl ? (
                      <img src={rev.userId.avatarUrl} alt={rev.userId.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#D49653]">
                        {rev.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-white truncate">
                      {rev.userId?.fullName || 'Khách hàng'}
                    </span>
                    <span className="block text-[10px] text-[#A5ADBA]">
                      {new Date(rev.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <RatingStars rating={rev.rating} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line">
                {rev.comment}
              </p>

              {rev.images && rev.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.images.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Review thumbnail ${i + 1}`}
                      onClick={() => setActiveLightboxImage(imgUrl)}
                      className="h-16 w-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-85 transition"
                    />
                  ))}
                </div>
              )}

              {rev.ownerReply && rev.ownerReply.comment && (
                <div className="ml-4 md:ml-6 mt-2 p-4 bg-[#20242D] border-l-2 border-[#D49653] rounded-lg">
                  <span className="block text-xs font-bold text-[#D49653] mb-1">Phản hồi từ nhà hàng</span>
                  <p className="text-xs sm:text-sm text-[#A5ADBA] leading-relaxed whitespace-pre-line">
                    {rev.ownerReply.comment}
                  </p>
                  <span className="block text-[10px] text-muted-foreground mt-2">
                    {new Date(rev.ownerReply.repliedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </Card>
          ))}

          {reviewsTotalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-1.5">
              <Button
                disabled={reviewsPage <= 1}
                onClick={() => setReviewsPage(reviewsPage - 1)}
                variant="outline"
                size="sm"
                className="border-border text-xs text-white"
              >
                Trước
              </Button>
              {Array.from({ length: reviewsTotalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === reviewsPage ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 text-xs ${
                    p === reviewsPage ? 'bg-primary text-background font-bold' : 'border-border text-white'
                  }`}
                  onClick={() => setReviewsPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                disabled={reviewsPage >= reviewsTotalPages}
                onClick={() => setReviewsPage(reviewsPage + 1)}
                variant="outline"
                size="sm"
                className="border-border text-xs text-white"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}

      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
          <img
            src={activeLightboxImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
