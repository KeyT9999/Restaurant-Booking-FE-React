import { MapPin, Navigation, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const LocationPermissionPrompt = ({ 
  onRequestPermission, 
  error, 
  loading,
  permissionStatus 
}) => {
  const isDenied = permissionStatus === 'denied';

  if (isDenied) {
    return (
      <Card className="p-8 bg-card border-border text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Quyền truy cập vị trí bị từ chối
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Bạn đã từ chối quyền truy cập vị trí. Để sử dụng tính năng này, 
          vui lòng bật định vị trong cài đặt trình duyệt.
        </p>
        
        <div className="bg-muted/30 rounded-lg p-4 text-left mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Hướng dẫn bật định vị:</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Chrome: Cài đặt → Bảo mật → Vị trí</li>
            <li>• Firefox: Options → Privacy → Vị trí</li>
            <li>• Safari: Preferences → Security → Vị trí</li>
            <li>• Edge: Settings → Cookies and site permissions → Vị trí</li>
          </ul>
        </div>
        
        <Button
          onClick={() => window.open('https://support.google.com/chrome/answer/142065', '_blank')}
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          Tìm hiểu thêm
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-card border-border text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Navigation className="h-8 w-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Tìm nhà hàng gần bạn
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Chúng tôi cần quyền truy cập vị trí của bạn để đề xuất 
        những nhà hàng ngon nhất trong khu vực.
      </p>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      <Button
        onClick={onRequestPermission}
        disabled={loading}
        className="bg-primary hover:bg-[#E0A968] text-background font-semibold gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Đang lấy vị trí...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Cho phép truy cập vị trí
          </>
        )}
      </Button>
      
      <p className="mt-4 text-xs text-muted-foreground">
        Vị trí của bạn sẽ không được lưu trữ
      </p>
    </Card>
  );
};

export default LocationPermissionPrompt;
