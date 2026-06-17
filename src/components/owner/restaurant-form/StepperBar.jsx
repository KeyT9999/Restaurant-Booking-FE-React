const STEPS = [
  { label: 'Thông tin cơ bản', icon: '📋' },
  { label: 'Liên hệ', icon: '📞' },
  { label: 'Địa chỉ', icon: '📍' },
  { label: 'Giờ hoạt động', icon: '🕐' },
  { label: 'Hình ảnh & Bổ sung', icon: '🖼️' },
  { label: 'Xác nhận', icon: '✅' },
];

export default function StepperBar({ currentStep, onStepClick, completedSteps = [] }) {
  return (
    <div className="flex items-start justify-center overflow-x-auto py-7 gap-0" id="stepper-bar">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = completedSteps.includes(stepNum);
        const isClickable = isCompleted || stepNum < currentStep;

        return (
          <div
            key={stepNum}
            className={`flex flex-col items-center relative flex-1 min-w-[70px] sm:min-w-[100px] select-none ${isClickable ? 'cursor-pointer' : ''}`}
            onClick={() => isClickable && onStepClick(stepNum)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && isClickable && onStepClick(stepNum)}
          >
            {/* Step Circle */}
            <div 
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-350 relative z-10 border-2 ${
                isActive 
                  ? 'bg-primary border-primary text-[#0F1115] scale-105 shadow-[0_0_0_4px_rgba(212,150,83,0.15),0_4px_12px_rgba(212,150,83,0.25)]' 
                  : isCompleted 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : 'bg-[#1A1D24] border-border text-muted-foreground'
              }`}
            >
              {isCompleted && !isActive ? (
                <span className="text-sm font-bold">✓</span>
              ) : (
                <span>{stepNum}</span>
              )}
            </div>

            {/* Step Label */}
            <span 
              className={`mt-2 text-[9px] sm:text-[10px] font-medium text-center max-w-[80px] sm:max-w-[90px] leading-tight transition-colors duration-300 ${
                isActive 
                  ? 'text-primary font-bold' 
                  : isCompleted 
                    ? 'text-emerald-500' 
                    : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>

            {/* Connector Line */}
            {idx < STEPS.length - 1 && (
              <div 
                className={`absolute top-4.5 sm:top-5 left-[calc(50%+18px)] sm:left-[calc(50%+20px)] w-[calc(100%-36px)] sm:w-[calc(100%-40px)] h-0.5 z-0 transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-border'
                }`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
