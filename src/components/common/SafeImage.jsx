import { useState } from 'react';

export default function SafeImage({
  src,
  alt = '',
  className = '',
  fallback = null,
  onError,
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const safeSrc = typeof src === 'string' ? src.trim() : src;

  if (!safeSrc || failedSrc === safeSrc) {
    return fallback;
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(safeSrc);
      }}
      {...props}
    />
  );
}
