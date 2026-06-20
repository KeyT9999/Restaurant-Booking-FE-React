import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import StepperBar from '../../components/owner/restaurant-form/StepperBar';
import BasicInfoStep from '../../components/owner/restaurant-form/BasicInfoStep';
import ContactInfoStep from '../../components/owner/restaurant-form/ContactInfoStep';
import AddressStep from '../../components/owner/restaurant-form/AddressStep';
import OperatingHoursStep from '../../components/owner/restaurant-form/OperatingHoursStep';
import AdditionalInfoStep from '../../components/owner/restaurant-form/AdditionalInfoStep';
import ConfirmStep from '../../components/owner/restaurant-form/ConfirmStep';
import { createRestaurant } from '../../api/restaurantApi';
import { Button } from '../../components/ui/button';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { AlertTriangle } from 'lucide-react';

// ─── Validation helpers ───
const PHONE_REGEX = /^(\+84|0)[35789][0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep1(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = 'Tên nhà hàng là bắt buộc';
  else if (data.name.trim().length > 200) errors.name = 'Tối đa 200 ký tự';

  if (!data.description || !data.description.trim()) errors.description = 'Mô tả là bắt buộc';
  else if (data.description.trim().length < 10) errors.description = 'Mô tả tối thiểu 10 ký tự';
  else if (data.description.trim().length > 2000) errors.description = 'Tối đa 2000 ký tự';

  if (data.capacity !== undefined && data.capacity !== '' && (isNaN(data.capacity) || Number(data.capacity) < 0)) {
    errors.capacity = 'Sức chứa phải là số không âm';
  }
  return errors;
}

function validateStep2(data) {
  const errors = {};
  if (!data.phoneNumber || !data.phoneNumber.trim()) errors.phoneNumber = 'Số điện thoại là bắt buộc';
  else if (!PHONE_REGEX.test(data.phoneNumber.trim())) errors.phoneNumber = 'Số điện thoại không đúng định dạng';

  if (!data.email || !data.email.trim()) errors.email = 'Email là bắt buộc';
  else if (!EMAIL_REGEX.test(data.email.trim().toLowerCase())) errors.email = 'Email không đúng định dạng';

  return errors;
}

function validateStep3(data) {
  const errors = {};
  const addr = data.address || {};
  if (!addr.city || !addr.city.trim()) errors['address.city'] = 'Tỉnh/Thành phố là bắt buộc';
  if (!addr.district || !addr.district.trim()) errors['address.district'] = 'Quận/Huyện là bắt buộc';
  if (!addr.ward || !addr.ward.trim()) errors['address.ward'] = 'Phường/Xã là bắt buộc';
  if (!addr.street || !addr.street.trim()) errors['address.street'] = 'Địa chỉ chi tiết là bắt buộc';

  const coords = data.coordinates || {};
  if (coords.latitude !== null && coords.latitude !== undefined && coords.latitude !== '') {
    const lat = Number(coords.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) errors['coordinates.latitude'] = 'Vĩ độ: -90 đến 90';
  }
  if (coords.longitude !== null && coords.longitude !== undefined && coords.longitude !== '') {
    const lng = Number(coords.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) errors['coordinates.longitude'] = 'Kinh độ: -180 đến 180';
  }
  return errors;
}

function validateStep4(data) {
  const errors = {};
  const hours = data.operatingHours || {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const d = hours[day];
    if (d && !d.closed) {
      if (d.open && d.close && d.open >= d.close) {
        errors[day] = 'Giờ mở cửa phải trước giờ đóng cửa';
      }
    }
  }
  return errors;
}

function validateStep5(data) {
  const errors = {};
  if (data.averagePrice !== undefined && data.averagePrice !== '' && (isNaN(data.averagePrice) || Number(data.averagePrice) < 0)) {
    errors.averagePrice = 'Giá trung bình phải không âm';
  }
  if (data.priceRangeMin !== undefined && data.priceRangeMin !== '' && (isNaN(data.priceRangeMin) || Number(data.priceRangeMin) < 0)) {
    errors.priceRangeMin = 'Giá thấp nhất phải không âm';
  }
  if (data.priceRangeMax !== undefined && data.priceRangeMax !== '' && (isNaN(data.priceRangeMax) || Number(data.priceRangeMax) < 0)) {
    errors.priceRangeMax = 'Giá cao nhất phải không âm';
  }
  if (data.priceRangeMin && data.priceRangeMax && Number(data.priceRangeMin) > Number(data.priceRangeMax)) {
    errors.priceRangeMin = 'Giá thấp nhất phải ≤ giá cao nhất';
  }
  return errors;
}

const VALIDATORS = [null, validateStep1, validateStep2, validateStep3, validateStep4, validateStep5];

const INITIAL_DATA = {
  name: '',
  description: '',
  cuisineTypes: [],
  priceRange: 'moderate',
  capacity: '',
  phoneNumber: '',
  email: '',
  address: { street: '', ward: '', district: '', city: '', fullAddress: '' },
  coordinates: { latitude: null, longitude: null },
  operatingHours: {},
  logo: '',
  coverImage: '',
  galleryImages: [],
  averagePrice: '',
  priceRangeMin: '',
  priceRangeMax: '',
  statusMessage: '',
  summaryHighlights: '',
  suitableFor: [],
  signatureDishes: [],
  amenities: [],
  policyRules: [],
  bookingNotes: '',
};

export default function CreateRestaurantPage() {
  const navigate = useNavigate();
  const { restaurantQuota } = useRestaurantContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [stepErrors, setStepErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataChange = useCallback((newData) => {
    setFormData(newData);
    setStepErrors({});
  }, []);

  const goToStep = (step) => {
    setStepErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const validator = VALIDATORS[currentStep];
    if (validator) {
      const errors = validator(formData);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setStepErrors({});
    setCurrentStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStepErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditFromConfirm = (step) => {
    goToStep(step);
  };

  const handleSkipStep5 = () => {
    if (!completedSteps.includes(5)) {
      setCompletedSteps([...completedSteps, 5]);
    }
    setStepErrors({});
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.capacity === '') delete payload.capacity;
      else payload.capacity = Number(payload.capacity);

      if (payload.averagePrice === '') delete payload.averagePrice;
      else payload.averagePrice = Number(payload.averagePrice);

      if (payload.priceRangeMin === '') delete payload.priceRangeMin;
      else payload.priceRangeMin = Number(payload.priceRangeMin);

      if (payload.priceRangeMax === '') delete payload.priceRangeMax;
      else payload.priceRangeMax = Number(payload.priceRangeMax);

      const optionalStrings = [
        'logo', 'coverImage', 'statusMessage', 'summaryHighlights', 'bookingNotes',
      ];
      for (const key of optionalStrings) {
        if (!payload[key] || !payload[key].trim()) delete payload[key];
      }

      const arrayFields = ['galleryImages', 'suitableFor', 'signatureDishes', 'amenities', 'policyRules'];
      for (const key of arrayFields) {
        if (Array.isArray(payload[key])) {
          const cleaned = payload[key].map(s => s.trim()).filter(Boolean);
          if (cleaned.length > 0) {
            payload[key] = cleaned;
          } else {
            delete payload[key];
          }
        } else {
          delete payload[key];
        }
      }

      if (!payload.coordinates?.latitude && !payload.coordinates?.longitude) {
        delete payload.coordinates;
      }

      if (payload.operatingHours && Object.keys(payload.operatingHours).length === 0) {
        delete payload.operatingHours;
      }

      const response = await createRestaurant(payload);
      toast.success(response.message || 'Tạo nhà hàng thành công! 🎉', { duration: 3000 });

      setTimeout(() => {
        navigate('/owner/restaurants');
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo nhà hàng';
      toast.error(msg, { duration: 5000 });
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={formData} onChange={handleDataChange} errors={stepErrors} />;
      case 2:
        return <ContactInfoStep data={formData} onChange={handleDataChange} errors={stepErrors} />;
      case 3:
        return <AddressStep data={formData} onChange={handleDataChange} errors={stepErrors} />;
      case 4:
        return <OperatingHoursStep data={formData} onChange={handleDataChange} errors={stepErrors} />;
      case 5:
        return <AdditionalInfoStep data={formData} onChange={handleDataChange} errors={stepErrors} />;
      case 6:
        return (
          <ConfirmStep
            data={formData}
            onEdit={handleEditFromConfirm}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const planCode = restaurantQuota?.planCode || 'free';
  const planNames = { free: 'Free', plus: 'Plus', pro: 'Pro' };
  const planName = planNames[planCode] || planCode;
  const currentCount = restaurantQuota?.currentCount || 0;
  const limit = restaurantQuota?.limit || 1;

  if (restaurantQuota && restaurantQuota.remaining === 0) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-white">Hết Quota Tạo Nhà Hàng</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gói hiện tại (<span className="text-primary font-semibold">{planName}</span>) chỉ cho phép đăng ký tối đa <span className="text-white font-semibold">{limit}</span> nhà hàng. Bạn đã sử dụng hết hạn mức ({currentCount}/{limit}).
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                className="w-full bg-primary text-background hover:bg-primary/90 py-2.5 font-bold"
                onClick={() => navigate('/owner/billing')}
              >
                Nâng cấp gói ngay
              </Button>
              <Button
                variant="outline"
                className="w-full border-border bg-background hover:bg-secondary text-white py-2.5 font-bold"
                onClick={() => navigate('/owner/restaurants')}
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Đăng ký nhà hàng mới</h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Điền đầy đủ thông tin chi tiết để đăng ký kinh doanh nhà hàng trên hệ thống BookEat.
            Nhà hàng sẽ chờ phê duyệt từ ban quản trị.
          </p>
        </div>

        {/* Stepper Bar */}
        <StepperBar
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {/* Form Card Content */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-350 mt-6">
          {renderStep()}

          {/* Navigation Controls */}
          {currentStep < 6 && (
            <div className="flex items-center justify-between border-t border-border/40 pt-6 mt-8 gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="border-border text-xs h-10 px-5 shrink-0"
                >
                  ← Quay lại
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex items-center gap-2">
                {currentStep === 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipStep5}
                    className="border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60 text-xs h-10 px-4"
                  >
                    Bỏ qua bước này →
                  </Button>
                )}
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-10 px-6"
                >
                  Tiếp tục →
                </Button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="flex items-center justify-start border-t border-border/40 pt-6 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="border-border text-xs h-10 px-5"
              >
                ← Quay lại điều chỉnh
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
