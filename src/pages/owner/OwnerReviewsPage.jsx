import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Loader2, AlertCircle, X } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getRestaurantReviews, replyReview } from '../../api/reviewApi';
import { RatingStars } from '../../components/ui/RatingStars';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

export default function OwnerReviewsPage() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurantContext();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Reply inputs state
  const [replyInputs, setReplyInputs] = useState({}); // mapping reviewId -> string
  const [replyingStates, setReplyingStates] = useState({}); // mapping reviewId -> boolean
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRestaurantReviews(selectedRestaurantId, {
        page,
        limit: 10,
      });
      if (res.data?.success) {
        setReviews(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalReviews(res.data.pagination?.total || 0);
      } else {
        setError(res.data?.message || 'Không thể tải danh sách đánh giá');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page khi chọn nhà hàng khác
  useEffect(() => {
    setPage(1);
  }, [selectedRestaurantId]);

  const handleReplyChange = (reviewId, text) => {
    setReplyInputs((prev) => ({
      ...prev,
      [reviewId]: text,
    }));
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyInputs[reviewId] || '';
    if (text.trim().length < 5) {
      toast.error('Nội dung phản hồi phải từ 5 ký tự trở lên');
      return;
    }
    if (text.trim().length > 500) {
      toast.error('Nội dung phản hồi không được vượt quá 500 ký tự');
      return;
    }

    setReplyingStates((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const res = await replyReview(reviewId, text.trim());
      if (res.data?.success) {
        toast.success('Gửi phản hồi đánh giá thành công');
        // Cập nhật reviews state cục bộ thay vì reload toàn bộ
        setReviews((prev) =>
          prev.map((rev) =>
            rev._id === reviewId
              ? {
                  ...rev,
                  ownerReply: {
                    comment: text.trim(),
                    repliedAt: new Date().toISOString(),
                  },
                }
              : rev
          )
        );
        // Clear input
        setReplyInputs((prev) => {
          const updated = { ...prev };
          delete updated[reviewId];
          return updated;
        });
      } else {
        toast.error(res.data?.message || 'Gửi phản hồi thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi gửi phản hồi');
    } finally {
      setReplyingStates((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <OwnerLayout
      title="Đánh giá & Phản hồi"
      subtitle="Quản lý và phản hồi các đánh giá của thực khách dành cho nhà hàng."
    >
      {!selectedRestaurantId ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <Star size={40} className="text-primary mb-4" />
          <h2 className="font-serif text-lg font-bold text-white mb-2">Chọn nhà hàng để quản lý</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Vui lòng chọn một nhà hàng trong Restaurant Switcher ở thanh bên để hiển thị các đánh giá.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header Summary */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Nhà hàng đang chọn</span>
              <strong className="font-serif text-lg font-bold text-white tracking-tight mt-0.5">
                {selectedRestaurant?.name}
              </strong>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tổng số đánh giá</span>
              <strong className="text-xl font-bold text-white">{totalReviews} đánh giá</strong>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Đang tải danh sách đánh giá...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed max-w-lg mx-auto my-10">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-3 my-6">
              <Star size={36} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-white">Chưa có đánh giá nào</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Nhà hàng chưa nhận được đánh giá nào từ các đơn đặt bàn hoàn tất.
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="flex flex-col gap-5 text-left">
              {reviews.map((rev) => {
                const isReplying = replyingStates[rev._id] || false;
                const replyText = replyInputs[rev._id] || '';

                return (
                  <Card key={rev._id} className="p-5 bg-card border-border flex flex-col gap-4">
                    {/* Header */}
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

                    {/* Comment content */}
                    <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>

                    {/* Images preview */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rev.images.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Review thumbnail ${idx + 1}`}
                            onClick={() => setActiveLightboxImage(imgUrl)}
                            className="h-16 w-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-85 transition"
                          />
                        ))}
                      </div>
                    )}

                    {/* Reply Block */}
                    {rev.ownerReply && rev.ownerReply.comment ? (
                      // Show Existing Reply
                      <div className="ml-4 md:ml-6 mt-1 p-4 bg-[#20242D] border-l-2 border-[#D49653] rounded-lg">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-[#D49653]">
                            Đã phản hồi
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(rev.ownerReply.repliedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#A5ADBA] leading-relaxed whitespace-pre-line">
                          {rev.ownerReply.comment}
                        </p>
                      </div>
                    ) : (
                      // Show Reply Form Input
                      <div className="ml-4 md:ml-6 mt-1 p-4 bg-[#0F1115]/60 border border-[#2C313C]/50 rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#A5ADBA] flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Gửi phản hồi của nhà hàng
                          </span>
                          <span className={replyText.trim().length < 5 ? 'text-[#A5ADBA]' : replyText.trim().length > 500 ? 'text-[#EF4444]' : 'text-emerald-500 font-bold'}>
                            {replyText.trim().length}/500 ký tự (tối thiểu 5)
                          </span>
                        </div>
                        <Textarea
                          value={replyText}
                          onChange={(e) => handleReplyChange(rev._id, e.target.value)}
                          placeholder="Viết phản hồi chi tiết của nhà hàng tới khách hàng tại đây..."
                          className="min-h-[70px] bg-[#0F1115] border-[#2C313C] focus:border-[#D49653] focus:ring-1 focus:ring-[#D49653] text-white text-xs rounded-lg resize-none p-2.5"
                          disabled={isReplying}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            disabled={isReplying || replyText.trim().length < 5 || replyText.trim().length > 500}
                            onClick={() => handleReplySubmit(rev._id)}
                            className="bg-[#D49653] hover:bg-[#D49653]/90 text-[#0F1115] font-semibold text-xs h-8 px-4 border-none"
                          >
                            {isReplying ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Đang gửi...
                              </>
                            ) : (
                              'Gửi phản hồi'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-1.5">
                  <Button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    variant="outline"
                    size="sm"
                    className="border-border text-xs text-white"
                  >
                    Trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="icon"
                      className={`h-8 w-8 text-xs ${
                        p === page ? 'bg-primary text-background font-bold' : 'border-border text-white'
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
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
        </div>
      )}

      {/* Lightbox Image Preview */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeLightboxImage}
            alt="Review enlarged preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </OwnerLayout>
  );
}
