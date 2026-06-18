import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star, EyeOff, CheckCircle, Loader2, AlertCircle, X, Shield } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetReviews, updateReviewStatus } from '../../api/reviewApi';
import { RatingStars } from '../../components/ui/RatingStars';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState(''); // '', 'approved', 'hidden', 'reported'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await adminGetReviews(params);
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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page khi thay đổi bộ lọc trạng thái
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    let reason = '';
    if (newStatus === 'hidden') {
      reason = window.prompt('Nhập lý do ẩn đánh giá này (bắt buộc):', 'Vi phạm quy chuẩn cộng đồng');
      if (reason === null) return; // User cancelled
      if (!reason.trim()) {
        toast.error('Lý do ẩn đánh giá là bắt buộc');
        return;
      }
    }

    setActionLoadingId(reviewId);
    try {
      const res = await updateReviewStatus(reviewId, newStatus, reason);
      if (res.data?.success) {
        toast.success(`Đã cập nhật trạng thái đánh giá thành công`);
        // Cập nhật reviews state cục bộ
        setReviews((prev) =>
          prev.map((rev) =>
            rev._id === reviewId ? { ...rev, status: newStatus, hideReason: newStatus === 'hidden' ? reason : null } : rev
          )
        );
      } else {
        toast.error(res.data?.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Tính thống kê nhanh trên Client
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const hiddenCount = reviews.filter(r => r.status === 'hidden').length;

  return (
    <AdminLayout
      title="Quản lý đánh giá"
      subtitle="Giám sát chất lượng bình luận, hình ảnh và xử lý báo cáo vi phạm toàn sàn."
    >
      <div className="flex flex-col gap-6 text-left">
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-card border-border flex flex-col gap-2 min-h-[110px] shadow-sm justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng số đánh giá</span>
            <div className="flex items-baseline gap-2">
              <strong className="text-3xl font-serif font-bold text-white">{totalReviews}</strong>
              <span className="text-xs text-muted-foreground">lượt</span>
            </div>
          </Card>
          <Card className="p-5 bg-card border-border flex flex-col gap-2 min-h-[110px] shadow-sm justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hiển thị công khai</span>
            <div className="flex items-baseline gap-2">
              <strong className="text-3xl font-serif font-bold text-emerald-400">
                {statusFilter === 'approved' ? totalReviews : statusFilter === '' ? (totalReviews - hiddenCount) : 0}
              </strong>
              <span className="text-xs text-muted-foreground">approved</span>
            </div>
          </Card>
          <Card className="p-5 bg-card border-border flex flex-col gap-2 min-h-[110px] shadow-sm justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bị ẩn / Vi phạm</span>
            <div className="flex items-baseline gap-2">
              <strong className="text-3xl font-serif font-bold text-rose-400">
                {statusFilter === 'hidden' ? totalReviews : statusFilter === '' ? hiddenCount : 0}
              </strong>
              <span className="text-xs text-muted-foreground">hidden</span>
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
          <div className="flex flex-wrap gap-1 bg-[#20242D] border border-border p-1 rounded-lg text-xs font-semibold">
            {[
              { value: '', label: 'Tất cả' },
              { value: 'reported', label: 'Bị báo cáo' },
              { value: 'approved', label: 'Công khai' },
              { value: 'hidden', label: 'Đã ẩn' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                  statusFilter === tab.value
                    ? 'bg-primary text-background font-bold'
                    : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Hiển thị <strong className="text-white font-bold">{reviews.length}</strong> dòng
          </span>
        </div>

        {/* Loading / Error / Empty states */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải danh sách đánh giá toàn sàn...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed max-w-lg mx-auto">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-3">
            <Shield size={36} className="text-muted-foreground" />
            <h3 className="text-base font-bold text-white">Không có đánh giá nào</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Không tìm thấy đánh giá nào tương ứng với bộ lọc trạng thái được chọn.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-[#20242D]/55">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-muted-foreground py-4 w-44">Khách hàng</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-4 w-40">Nhà hàng</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-4 w-28">Đánh giá</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-4">Bình luận & Ảnh</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-4 w-28">Trạng thái</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-4 text-right w-32">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((rev) => (
                    <TableRow key={rev._id} className="border-border hover:bg-secondary/15">
                      <TableCell className="align-top py-4">
                        <span className="block font-bold text-white text-xs">{rev.userId?.fullName || 'N/A'}</span>
                        <span className="block text-[10px] text-muted-foreground truncate mt-0.5">{rev.userId?.email || ''}</span>
                        <span className="block text-[9px] text-muted-foreground/80 mt-1">
                          {new Date(rev.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell className="align-top font-semibold text-white py-4 text-xs">
                        {rev.restaurantId?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <RatingStars rating={rev.rating} size="sm" />
                        <span className="text-[10px] font-bold text-primary mt-1 block">{rev.rating} sao</span>
                      </TableCell>
                      <TableCell className="align-top py-4 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs text-white leading-relaxed whitespace-pre-line pr-4">{rev.comment}</p>
                          {rev.reportCount > 0 && (
                            <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-bold uppercase">
                              {rev.reportCount} Báo cáo
                            </Badge>
                          )}
                        </div>
                        {rev.status === 'hidden' && rev.hideReason && (
                          <p className="text-[10px] text-rose-400 italic mt-0.5">Lý do ẩn: {rev.hideReason}</p>
                        )}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex gap-2.5 mt-1">
                            {rev.images.map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt={`Admin preview ${i}`}
                                onClick={() => setActiveLightboxImage(imgUrl)}
                                className="h-10 w-10 rounded-md object-cover border border-border cursor-pointer hover:opacity-80 transition"
                              />
                            ))}
                          </div>
                        )}
                        {rev.ownerReply && rev.ownerReply.comment && (
                          <div className="mt-2 p-2.5 bg-[#20242D]/60 border-l border-primary rounded text-[11px] text-muted-foreground leading-normal">
                            <strong className="text-primary block mb-0.5">Phản hồi của nhà hàng:</strong>
                            {rev.ownerReply.comment}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Badge
                          variant="outline"
                          className={
                            rev.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[9px] uppercase font-bold'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/25 text-[9px] uppercase font-bold'
                          }
                        >
                          {rev.status === 'approved' ? 'Công khai' : 'Đã ẩn'}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {rev.status === 'approved' ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs h-7.5 px-2.5"
                              disabled={actionLoadingId === rev._id}
                              onClick={() => handleUpdateStatus(rev._id, 'hidden')}
                            >
                              <EyeOff className="w-3.5 h-3.5 mr-1" /> Ẩn review
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs h-7.5 px-2.5"
                              disabled={actionLoadingId === rev._id}
                              onClick={() => handleUpdateStatus(rev._id, 'approved')}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Duyệt
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards Stack View */}
            <div className="flex flex-col gap-4 md:hidden">
              {reviews.map((rev) => (
                <Card key={rev._id} className="p-4 bg-card border-border flex flex-col gap-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="block text-white text-xs">{rev.userId?.fullName || 'Khách hàng'}</strong>
                      <span className="text-[10px] text-muted-foreground">{rev.restaurantId?.name || 'Nhà hàng'}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        rev.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[9px] uppercase font-bold'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/25 text-[9px] uppercase font-bold'
                      }
                    >
                      {rev.status === 'approved' ? 'Công khai' : 'Đã ẩn'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <RatingStars rating={rev.rating} size="sm" />
                    <span className="text-[10px] text-muted-foreground">({rev.rating} sao)</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-white leading-relaxed">{rev.comment}</p>
                    {rev.reportCount > 0 && (
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-500/5 p-0.5 px-1.5 rounded border border-rose-500/10 self-start">
                        ⚠️ {rev.reportCount} Báo cáo
                      </span>
                    )}
                    {rev.status === 'hidden' && rev.hideReason && (
                      <span className="text-[9px] italic text-rose-400">Lý do ẩn: {rev.hideReason}</span>
                    )}
                  </div>

                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2">
                      {rev.images.map((imgUrl, i) => (
                        <img
                          key={i}
                          src={imgUrl}
                          alt={`Mobile admin preview ${i}`}
                          onClick={() => setActiveLightboxImage(imgUrl)}
                          className="h-12 w-12 rounded-lg object-cover border border-border cursor-pointer"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-border/40 pt-3 mt-1 text-xs">
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <div>
                      {rev.status === 'approved' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-rose-500/10 text-rose-400 text-[10px] h-7 px-3"
                          disabled={actionLoadingId === rev._id}
                          onClick={() => handleUpdateStatus(rev._id, 'hidden')}
                        >
                          Ẩn
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-emerald-500/10 text-emerald-400 text-[10px] h-7 px-3"
                          disabled={actionLoadingId === rev._id}
                          onClick={() => handleUpdateStatus(rev._id, 'approved')}
                        >
                          Duyệt
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
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
          </>
        )}
      </div>

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
    </AdminLayout>
  );
}
