import './StepperBar.css';

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
    <div className="stepper-bar" id="stepper-bar">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = completedSteps.includes(stepNum);
        const isClickable = isCompleted || stepNum < currentStep;

        return (
          <div
            key={stepNum}
            className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
            onClick={() => isClickable && onStepClick(stepNum)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && isClickable && onStepClick(stepNum)}
          >
            <div className="stepper-circle">
              {isCompleted && !isActive ? (
                <span className="stepper-check">✓</span>
              ) : (
                <span className="stepper-num">{stepNum}</span>
              )}
            </div>
            <span className="stepper-label">{step.label}</span>
            {idx < STEPS.length - 1 && <div className={`stepper-connector ${isCompleted ? 'filled' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
