import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import StepperBar from '../../components/owner/restaurant-form/StepperBar';
import BasicInfoStep from '../../components/owner/restaurant-form/BasicInfoStep';
import ContactInfoStep from '../../components/owner/restaurant-form/ContactInfoStep';
import AddressStep from '../../components/owner/restaurant-form/AddressStep';
import OperatingHoursStep from '../../components/owner/restaurant-form/OperatingHoursStep';
import AdditionalInfoStep from '../../components/owner/restaurant-form/AdditionalInfoStep';
import ConfirmStep from '../../components/owner/restaurant-form/ConfirmStep';
import { getOwnerRestaurant, updateRestaurant } from '../../api/restaurantApi';
import '../owner/CreateRestaurantPage.css';

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
  hasMenu: false,
  hasTableLayout: false,
};

export default function EditRestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [stepErrors, setStepErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await getOwnerRestaurant(id);
        const r = res.data;
        setFormData({
          name: r.name || '',
          description: r.description || '',
          cuisineTypes: r.cuisineTypes || [],
          priceRange: r.priceRange || 'moderate',
          capacity: r.capacity ?? '',
          phoneNumber: r.phoneNumber || '',
          email: r.email || '',
          address: {
            street: r.address?.street || '',
            ward: r.address?.ward || '',
            district: r.address?.district || '',
            city: r.address?.city || '',
            fullAddress: r.address?.fullAddress || '',
          },
          coordinates: {
            latitude: r.coordinates?.latitude ?? null,
            longitude: r.coordinates?.longitude ?? null,
          },
          operatingHours: r.operatingHours || {},
          logo: r.logo || '',
          averagePrice: r.averagePrice ?? '',
          priceRangeMin: r.priceRangeMin ?? '',
          priceRangeMax: r.priceRangeMax ?? '',
          statusMessage: r.statusMessage || '',
          summaryHighlights: r.summaryHighlights || '',
          suitableFor: r.suitableFor || [],
          signatureDishes: r.signatureDishes || [],
          amenities: r.amenities || [],
          policyRules: r.policyRules || [],
          bookingNotes: r.bookingNotes || '',
          hasMenu: r.hasMenu ?? false,
          hasTableLayout: r.hasTableLayout ?? false,
        });
        
        // Mark all steps as complete initially since it is editing existing valid data
        setCompletedSteps([1, 2, 3, 4, 5]);
      } catch (err) {
        toast.error('Không thể tải thông tin nhà hàng cần chỉnh sửa');
        navigate('/owner/restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id, navigate]);

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
      if (payload.capacity === '') payload.capacity = null;
      else payload.capacity = Number(payload.capacity);

      if (payload.averagePrice === '') payload.averagePrice = null;
      else payload.averagePrice = Number(payload.averagePrice);

      if (payload.priceRangeMin === '') payload.priceRangeMin = null;
      else payload.priceRangeMin = Number(payload.priceRangeMin);

      if (payload.priceRangeMax === '') payload.priceRangeMax = null;
      else payload.priceRangeMax = Number(payload.priceRangeMax);

      const arrayFields = ['suitableFor', 'signatureDishes', 'amenities', 'policyRules'];
      for (const key of arrayFields) {
        if (Array.isArray(payload[key])) {
          payload[key] = payload[key].map(s => s.trim()).filter(Boolean);
        }
      }

      const response = await updateRestaurant(id, payload);
      toast.success(response.message || 'Cập nhật nhà hàng thành công! 🎉', { duration: 3000 });

      setTimeout(() => {
        navigate('/owner/restaurants');
      }, 1500);
    } catch (error) {
      const msg = error.message || 'Có lỗi xảy ra khi cập nhật nhà hàng';
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
            isEdit={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-restaurant-page">
      <Header />
      <main className="create-restaurant-main">
        <div className="create-restaurant-container">
          {/* Page header */}
          <div className="page-header-create">
            <h1 className="page-title-create">Chỉnh sửa nhà hàng</h1>
            <p className="page-subtitle-create">
              Chỉnh sửa thông tin chi tiết nhà hàng của bạn.
              Nếu nhà hàng từng bị từ chối duyệt, lưu lại sẽ được gửi phê duyệt lại.
            </p>
          </div>

          {/* Stepper */}
          <StepperBar
            currentStep={currentStep}
            onStepClick={goToStep}
            completedSteps={completedSteps}
          />

          {/* Form content */}
          <div className="form-card">
            {renderStep()}

            {/* Navigation buttons */}
            {currentStep < 6 && (
              <div className="form-nav-buttons">
                {currentStep > 1 && (
                  <button type="button" className="btn-prev" onClick={handlePrev}>
                    ← Quay lại
                  </button>
                )}
                <div className="nav-spacer" />
                {currentStep === 5 && (
                  <button type="button" className="btn-skip" onClick={handleSkipStep5}>
                    Bỏ qua bước này →
                  </button>
                )}
                <button type="button" className="btn-next" onClick={handleNext}>
                  Tiếp tục →
                </button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="form-nav-buttons">
                <button type="button" className="btn-prev" onClick={handlePrev}>
                  ← Quay lại
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
