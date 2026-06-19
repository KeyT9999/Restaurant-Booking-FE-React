import ChatWorkspace from '../../components/chat/ChatWorkspace';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { MessageSquare } from 'lucide-react';

export default function OwnerChatPage() {
  const { selectedRestaurantId, restaurants, loading } = useRestaurantContext();

  return (
    <OwnerLayout
      title="Inbox nhà hàng"
      subtitle="Trò chuyện và hỗ trợ khách hàng trực tiếp."
    >
      {!loading && restaurants.length > 0 && !selectedRestaurantId ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 text-primary">
            <MessageSquare size={28} />
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-2">Chọn nhà hàng để xem hộp thư</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Hộp thư thoại và danh tính trả lời sẽ tự động thay đổi theo nhà hàng bạn chọn trong Restaurant Switcher ở thanh bên.
          </p>
        </div>
      ) : (
        <ChatWorkspace mode="owner" restaurantId={selectedRestaurantId} />
      )}
    </OwnerLayout>
  );
}
