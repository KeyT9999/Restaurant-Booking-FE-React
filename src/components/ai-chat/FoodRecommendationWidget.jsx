import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoodRecommendation } from '../../api/foodRecommendationApi';
import { Sparkles, Bot, ChevronRight, Star, MapPin, Utensils, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const PRESETS = [
  { label: 'Tăng cơ giảm mỡ 💪', question: 'Tôi đang tập gym cần thực đơn tăng cơ giảm mỡ tốt nhất.', goal: 'muscle_gain' },
  { label: 'Ăn chay lành mạnh 🥗', question: 'Gợi ý món ăn chay healthy đủ chất dinh dưỡng.', goal: 'general' },
  { label: 'Giảm cân Keto 🏃‍♂️', question: 'Thực đơn Keto ít calo và carb để giảm cân nhanh.', goal: 'weight_loss' },
  { label: 'Món ăn dưỡng nhan 🌸', question: 'Đồ ăn giúp đẹp da, chống lão hóa và thanh lọc cơ thể.', goal: 'general' }
];

export default function FoodRecommendationWidget() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [goal, setGoal] = useState('');
  const [dietary, setDietary] = useState([]);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const DIETARY_OPTIONS = [
    { value: 'không ăn thịt bò', label: 'Kiêng bò' },
    { value: 'không ăn hải sản', label: 'Kiêng hải sản' },
    { value: 'ăn chay', label: 'Ăn chay' },
    { value: 'ít đường', label: 'Ít đường' }
  ];

  const handleDietaryToggle = (val) => {
    if (dietary.includes(val)) {
      setDietary(dietary.filter(item => item !== val));
    } else {
      setDietary([...dietary, val]);
    }
  };

  const handlePresetClick = (preset) => {
    setQuestion(preset.question);
    setGoal(preset.goal);
    handleSubmit(null, preset.question, preset.goal);
  };

  const handleSubmit = async (e, customQuestion, customGoal) => {
    if (e) e.preventDefault();

    const activeQuestion = customQuestion || question;
    const activeGoal = customGoal || goal;

    if (!activeQuestion.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        question: activeQuestion.trim(),
        context: {
          goal: activeGoal || undefined,
          dietaryRestrictions: dietary.length > 0 ? dietary : undefined,
          maxBudget: budget || undefined
        }
      };

      const response = await getFoodRecommendation(payload);
      if (response && response.success) {
        setResult(response.data);
      } else {
        setError(response?.message || 'Không thể lấy đề xuất. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Có lỗi kết nối hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Widget */}
      <Card className="p-6 bg-[#1A1D24] border-[#2C313C] relative overflow-hidden shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              Trợ lý Dinh Dưỡng AI <Badge className="bg-primary/20 text-primary border-none">Độc quyền</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">Tư vấn sức khỏe, đề xuất món ăn & tìm nhà hàng phù hợp tức thì</p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ví dụ: Tôi đang tập gym nên ăn gì? Hoặc nhập nhu cầu ăn kiêng của bạn..."
              className="w-full min-h-[100px] p-4 bg-[#0F1115] border border-[#2C313C] rounded-xl text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 resize-none"
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground">
              {question.length}/500
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Gợi ý nhanh:</span>
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/10 border border-white/10 text-xs text-muted-foreground hover:text-white transition duration-200"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              {showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao (Mục tiêu, Ăn kiêng, Ngân sách)'}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-[#0F1115] border border-[#2C313C]/60 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                {/* Goal Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Mục tiêu sức khỏe</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-[#1A1D24] border border-[#2C313C] rounded-lg text-xs p-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Không bắt buộc</option>
                    <option value="muscle_gain">Tăng cơ (High-protein)</option>
                    <option value="weight_loss">Giảm cân (Low-carb/Keto)</option>
                    <option value="general">Khỏe mạnh tổng thể</option>
                  </select>
                </div>

                {/* Dietary restrictions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Chế độ ăn kiêng</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleDietaryToggle(opt.value)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[10px] border transition-all duration-200",
                          dietary.includes(opt.value)
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget restriction */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Mức chi phí</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#1A1D24] border border-[#2C313C] rounded-lg text-xs p-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Không giới hạn</option>
                    <option value="budget">Bình dân (Dưới 150k)</option>
                    <option value="moderate">Trung bình (150k - 500k)</option>
                    <option value="expensive">Cao cấp (Trên 500k)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-primary hover:bg-[#E0A968] text-background font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Đang phân tích dinh dưỡng...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Đề xuất món & nhà hàng
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Result presentation */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Nutrition advice card */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-[#1A1D24] border-[#2C313C]">
            <div className="flex gap-3">
              <div className="p-2.5 bg-primary/20 text-primary rounded-xl h-fit">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Tư vấn dinh dưỡng từ AI</h4>
                <p className="text-sm text-white leading-relaxed whitespace-pre-line">{result.nutritionAdvice}</p>
              </div>
            </div>
          </Card>

          {/* Suggested dishes list */}
          {result.suggestedDishes && result.suggestedDishes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                <Utensils className="h-4 w-4" /> Món ăn dinh dưỡng được đề xuất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.suggestedDishes.map((dish, i) => (
                  <Card key={i} className="p-4 bg-[#1A1D24] border-[#2C313C] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white text-base">{dish.name}</h4>
                        <Badge className="bg-primary/20 text-primary border-none text-[10px]">
                          {dish.nutritionHighlights}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{dish.reason}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {dish.tags && dish.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-semibold bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Matching Restaurants */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Nhà hàng phù hợp trong hệ thống
            </h3>
            {result.restaurants && result.restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.restaurants.map((res) => (
                  <Card
                    key={res.id}
                    onClick={() => navigate(`/restaurants/${res.id}`)}
                    className="overflow-hidden bg-[#1A1D24] border-[#2C313C] hover:border-primary/45 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                        {res.coverImage ? (
                          <img
                            src={res.coverImage}
                            alt={res.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#0F1115]">
                            <Utensils className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0F1115]/80 text-[10px] text-white flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{res.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors truncate">
                          {res.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{res.address?.fullAddress || `${res.address?.district}, ${res.address?.city}`}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 py-1">
                          {res.cuisineTypes && res.cuisineTypes.slice(0, 2).map((c) => (
                            <span key={c} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Matched Dishes section */}
                    {res.matchedDishes && res.matchedDishes.length > 0 && (
                      <div className="p-4 pt-0 border-t border-[#2C313C]/40 bg-[#0F1115]/30">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 mt-2">
                          Món ăn trong thực đơn:
                        </div>
                        <div className="space-y-1.5">
                          {res.matchedDishes.map((dish) => (
                            <div key={dish.id} className="flex justify-between items-center text-xs">
                              <span className="text-white font-medium truncate max-w-[70%]">{dish.name}</span>
                              <span className="text-primary font-semibold flex-shrink-0">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dish.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-end text-[10px] text-primary font-semibold group-hover:translate-x-1 transition-transform">
                          Đặt bàn ngay <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-[#2C313C] rounded-xl bg-[#1A1D24]">
                <p className="text-xs text-muted-foreground">AI không tìm thấy nhà hàng nào phục vụ các món ăn cụ thể này trong khu vực của bạn.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
