import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Camera, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { RatingStars } from '../ui/RatingStars';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { uploadImage } from '../../api/uploadApi';
import { createReview, updateReview, getMyReviews } from '../../api/reviewApi';

export function ReviewFormModal({ isOpen, onClose, booking, onSubmitSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const fileInputRef = useRef(null);

  const isEditMode = booking && (booking.reviewed || booking.isEdit);

  useEffect(() => {
    if (isOpen && isEditMode && booking) {
      const fetchExistingReview = async () => {
        setIsLoadingReview(true);
        try {
          const res = await getMyReviews();
          if (res?.success && res.data) {
            const bId = booking.id || booking._id;
            const existing = res.data.find(
              (r) => r.bookingId?.toString() === bId?.toString() || r.id === booking.reviewId
            );
            if (existing) {
              setReviewId(existing.id || existing._id);
              setRating(existing.rating);
              setComment(existing.comment || '');
              setImages(existing.images || []);
            } else {
              toast.error('Không tìm thấy đánh giá cũ để chỉnh sửa');
            }
          }
        } catch (err) {
          console.error('Error fetching review:', err);
          toast.error('Không thể tải thông tin đánh giá cũ');
        } finally {
          setIsLoadingReview(false);
        }
      };
      fetchExistingReview();
    }
  }, [isOpen, isEditMode, booking]);

  if (!booking) return null;

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      toast.error('Bạn chỉ được tải lên tối đa 3 hình ảnh');
      return;
    }

    setIsUploading(true);
    const uploadedUrls = [...images];

    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá giới hạn 5MB`);
        continue;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} không đúng định dạng ảnh (JPG/PNG/WebP)`);
        continue;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await uploadImage(formData);
        if (res.data?.success && res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        } else {
          toast.error(`Tải ảnh ${file.name} lên thất bại`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Lỗi tải ảnh lên: ${error.response?.data?.message || error.message}`);
      }
    }

    setImages(uploadedUrls);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input file
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Nội dung bình luận phải có ít nhất 10 ký tự');
      return;
    }

    if (comment.trim().length > 1000) {
      toast.error('Nội dung bình luận không được vượt quá 1000 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rating,
        comment: comment.trim(),
        images,
      };

      let res;
      if (isEditMode && reviewId) {
        res = await updateReview(reviewId, payload);
      } else {
        payload.bookingId = booking._id || booking.id;
        res = await createReview(payload);
      }

      if (res?.success) {
        toast.success(isEditMode ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá nhà hàng thành công! Cảm ơn bạn.');
        onSubmitSuccess?.();
        handleClose();
      } else {
        toast.error(res?.message || (isEditMode ? 'Cập nhật đánh giá thất bại' : 'Gửi đánh giá thất bại'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setRating(5);
    setComment('');
    setImages([]);
    setReviewId(null);
    onClose();
  };

  // Lấy nhãn hiển thị theo số sao
  const getRatingLabel = () => {
    switch (rating) {
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Bình thường';
      case 4: return 'Tốt';
      case 5: return 'Tuyệt vời!';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-[#1A1D24] border-[#2C313C] text-white p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white">
            Đánh giá trải nghiệm
          </DialogTitle>
          <DialogDescription className="text-[#A5ADBA] text-sm">
            Hãy chia sẻ cảm nhận thực tế của bạn tại nhà hàng{' '}
            <span className="text-[#D49653] font-medium">{booking.restaurantName || booking.restaurantId?.name}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoadingReview ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D49653]" />
            <p className="text-xs text-[#A5ADBA]">Đang tải đánh giá cũ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Rating Section */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2 bg-[#0F1115]/40 rounded-lg border border-[#2C313C]/50">
            <span className="text-xs text-[#A5ADBA] uppercase tracking-wider font-semibold">
              Mức độ hài lòng của bạn
            </span>
            <RatingStars
              rating={rating}
              onChange={setRating}
              size="lg"
            />
            <span className="text-sm font-semibold text-[#D49653]">
              {getRatingLabel()}
            </span>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#A5ADBA]">
                Bình luận chi tiết <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${comment.trim().length < 10 ? 'text-[#A5ADBA]' : comment.trim().length > 1000 ? 'text-[#EF4444]' : 'text-emerald-500'}`}>
                {comment.trim().length}/1000 ký tự (tối thiểu 10)
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={handleCommentChange}
              placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn về món ăn, không gian và thái độ phục vụ..."
              className="min-h-[120px] bg-[#0F1115] border-[#2C313C] focus:border-[#D49653] focus:ring-1 focus:ring-[#D49653] text-white rounded-lg resize-none p-3"
            />
            {comment.trim().length > 0 && comment.trim().length < 10 && (
              <p className="text-xs text-[#EF4444]">Bình luận cần ít nhất 10 ký tự để gửi.</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A5ADBA] block">
              Hình ảnh thực tế (Tối đa 3 ảnh)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Preview Images */}
              {images.map((url, index) => (
                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#2C313C] bg-[#0F1115]">
                  <img
                    src={url}
                    alt={`Review upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black rounded-full p-0.5 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {images.length < 3 && (
                <button
                  type="button"
                  disabled={isUploading || isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border border-dashed border-[#2C313C] hover:border-[#D49653] flex flex-col items-center justify-center text-[#A5ADBA] hover:text-white bg-[#0F1115]/50 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#D49653]" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px]">Thêm ảnh</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="flex gap-2 sm:justify-end border-t border-[#2C313C]/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-[#2C313C] hover:bg-[#20242D] text-white hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || comment.trim().length < 10 || comment.trim().length > 1000}
              className="bg-[#D49653] hover:bg-[#D49653]/90 text-[#0F1115] font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
