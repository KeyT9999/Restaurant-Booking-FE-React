import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from './utils';

export function RatingStars({
  rating = 0,
  maxStars = 5,
  onChange = null,
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const isReadOnly = !onChange;

  // Kích thước icon
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const handleStarClick = (value) => {
    if (isReadOnly) return;
    onChange(value);
  };

  const handleStarMouseEnter = (value) => {
    if (isReadOnly) return;
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    if (isReadOnly) return;
    setHoverRating(0);
  };

  // Render các ngôi sao
  const stars = [];
  const currentRating = hoverRating || rating;

  for (let i = 1; i <= maxStars; i++) {
    const starValue = i;
    
    if (isReadOnly) {
      // Logic chỉ đọc: hỗ trợ nửa sao (ví dụ: rating = 4.5)
      const diff = rating - i + 1;
      if (diff >= 0.75) {
        // Sao đầy
        stars.push(
          <Star
            key={i}
            className={cn(currentSize, 'fill-[#D49653] text-[#D49653]')}
          />
        );
      } else if (diff >= 0.25) {
        // Nửa sao
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className={cn(currentSize, 'text-[#2C313C] fill-none')} />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className={cn(currentSize, 'fill-[#D49653] text-[#D49653]')} />
            </div>
          </div>
        );
      } else {
        // Sao rỗng
        stars.push(
          <Star
            key={i}
            className={cn(currentSize, 'text-[#2C313C] fill-none')}
          />
        );
      }
    } else {
      // Logic tương tác (chọn sao)
      const isActive = starValue <= currentRating;
      stars.push(
        <button
          key={i}
          type="button"
          aria-label={`Đánh giá ${starValue} sao`}
          className={cn(
            'focus:outline-none transition-all transform hover:scale-110 cursor-pointer',
            isReadOnly ? 'pointer-events-none' : ''
          )}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarMouseEnter(starValue)}
          onMouseLeave={handleStarMouseLeave}
        >
          <Star
            className={cn(
              currentSize,
              isActive 
                ? 'fill-[#D49653] text-[#D49653]' 
                : 'text-[#2C313C] fill-none hover:text-[#D49653]'
            )}
          />
        </button>
      );
    }
  }

  return (
    <div 
      className={cn('flex items-center gap-1', className)}
      role={isReadOnly ? 'img' : 'radiogroup'}
      aria-label={isReadOnly ? `Đánh giá: ${rating} trên ${maxStars} sao` : 'Chọn số sao đánh giá'}
    >
      {stars}
    </div>
  );
}
