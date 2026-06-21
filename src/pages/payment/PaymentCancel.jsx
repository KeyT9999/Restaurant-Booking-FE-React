import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetType = searchParams.get('targetType');
  const isOwnerMonetization = ['subscription', 'featured_restaurant', 'voucher_campaign'].includes(targetType);

  return (
    <div className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[480px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
          <XCircle size={36} />
        </div>
        
        <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Giao dịch đã hủy</h1>
        <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
          Bạn đã hủy giao dịch thanh toán. Không có khoản tiền nào bị khấu trừ khỏi tài khoản của bạn.
        </p>

        <div className="w-full border-t border-border/40 pt-6 mt-2">
          {isOwnerMonetization ? (
            <button 
              className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/owner/billing')}
            >
              <ArrowLeft size={16} /> 
              <span>Về trang tài chính owner</span>
            </button>
          ) : (
            <button 
              className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/my-bookings')}
            >
              <ArrowLeft size={16} /> 
              <span>Về danh sách đặt bàn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
