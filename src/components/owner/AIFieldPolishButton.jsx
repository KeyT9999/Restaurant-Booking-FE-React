import { useState } from 'react';
import { Sparkles, Check, RotateCcw, X, AlertCircle } from 'lucide-react';
import { polishRestaurantField } from '../../api/aiApi';

const ERROR_MESSAGES = {
  AI_DISABLED: 'Tính năng AI đang tạm tắt.',
  RATE_LIMITED: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
  BUDGET_LIMITED: 'Hạn mức AI hôm nay đã hết.',
  AI_UNAVAILABLE: 'AI đang bận, vui lòng thử lại sau.',
  INVALID_REQUEST: 'Nội dung không hợp lệ hoặc quá ngắn.',
};

export default function AIFieldPolishButton({
  fieldKey,
  value,
  onApply,
  context = {},
  maxLength = 2000,
  disabled = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState(null);

  const handlePolish = async () => {
    if (!value || value.trim().length < 3) {
      setError('Vui lòng nhập nội dung trước khi dùng tối ưu.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion('');

    try {
      const response = await polishRestaurantField({
        fieldKey,
        text: value,
        context,
        maxLength,
      });

      if (response && response.success && response.data?.polishedText) {
        setSuggestion(response.data.polishedText);
      } else {
        setError('AI đang bận, vui lòng thử lại sau.');
      }
    } catch (err) {
      const errCode = err.response?.data?.code || err.code;
      const displayMsg = ERROR_MESSAGES[errCode] || err.response?.data?.message || 'AI đang bận, vui lòng thử lại sau.';
      setError(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply(suggestion);
    setSuggestion('');
  };

  const handleCancel = () => {
    setSuggestion('');
    setError(null);
  };

  const isBtnDisabled = disabled || !value || value.trim().length < 3 || isLoading;

  return (
    <div className="relative inline-block text-left">
      {/* AI Optimize Button */}
      <button
        type="button"
        onClick={handlePolish}
        disabled={isBtnDisabled}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border transition-all duration-200 ${
          isBtnDisabled
            ? 'bg-secondary/40 text-muted-foreground/50 border-transparent opacity-50 cursor-not-allowed'
            : isLoading
            ? 'bg-secondary text-muted-foreground border-transparent cursor-not-allowed animate-pulse'
            : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 cursor-pointer shadow-sm active:scale-95'
        }`}
      >
        <Sparkles className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Đang tối ưu...' : '✨ Tối ưu bằng AI'}</span>
      </button>

      {/* Suggestion & Error Box */}
      {(suggestion || error) && (
        <div className="absolute right-0 mt-1 z-50 w-72 sm:w-80 md:w-96 p-3 bg-[#1A1D24] border border-[#2C313C] rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
          {error ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-1.5 text-red-500 text-[11px] leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-[#20242D] rounded transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                <Sparkles className="w-3 h-3" />
                <span>Gợi ý từ AI:</span>
              </div>
              <p className="text-[11px] text-foreground italic leading-relaxed bg-[#0F1115] p-2 rounded border border-[#2C313C] max-h-24 overflow-y-auto whitespace-pre-line select-text">
                "{suggestion}"
              </p>
              <div className="flex items-center justify-between border-t border-[#2C313C] pt-2 mt-0.5">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-primary text-background rounded hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="w-2.5 h-2.5" />
                    Áp dụng
                  </button>
                  <button
                    type="button"
                    onClick={handlePolish}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold border border-[#2C313C] hover:bg-[#20242D] text-foreground rounded transition-colors active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Thử lại
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
