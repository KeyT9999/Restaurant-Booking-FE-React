import { useState } from 'react';
import { Star, Loader2, X, ImagePlus } from 'lucide-react';
import { createReview } from '../../api/reviewApi';
import { uploadImage } from '../../api/uploadApi';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import toast from 'react-hot-toast';

export default function ReviewForm({ bookingId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh cho mỗi đánh giá');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadImage(formData);
        return res.data?.url || res.data?.data?.url;
      });
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls.filter(Boolean)]);
    } catch {
      toast.error('Lỗi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId,
        rating,
        comment: comment.trim(),
      };
      if (images.length > 0) {
        payload.images = images;
      }
      const res = await createReview(payload);
      if (res.data?.success) {
        toast.success('Đánh giá đã được gửi thành công!');
        onSuccess?.();
      } else {
        toast.error(res.data?.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 bg-card border-border flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          <Star size={16} className="text-primary" /> Viết đánh giá
        </h4>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded text-muted-foreground hover:text-white hover:bg-secondary transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Star Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-semibold">Đánh giá sao *</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-primary font-semibold ml-2 self-center">
                {rating === 5 ? 'Xuất sắc' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Tốt' : rating === 2 ? 'Tạm được' : 'Kém'}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-semibold">Nhận xét của bạn *</label>
          <textarea
            rows="4"
            maxLength="1000"
            placeholder="Chia sẻ trải nghiệm ẩm thực của bạn tại nhà hàng..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
          />
          <span className="text-[10px] text-muted-foreground text-right">{comment.length}/1000</span>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-semibold">Hình ảnh (tối đa 5)</label>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border group">
                <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="h-16 w-16 rounded-lg border border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
                {uploading ? (
                  <Loader2 size={16} className="animate-spin text-primary" />
                ) : (
                  <ImagePlus size={16} className="text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="border-border text-white hover:bg-secondary h-9 text-xs font-semibold">
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="bg-primary hover:bg-primary/95 text-background h-9 text-xs font-bold px-5"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
