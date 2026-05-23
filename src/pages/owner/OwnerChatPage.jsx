import ChatWorkspace from '../../components/chat/ChatWorkspace';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';

export default function OwnerChatPage() {
  const { selectedRestaurantId, restaurants, loading } = useRestaurantContext();

  return (
    <OwnerLayout
      title="Inbox nhà hàng"
      subtitle="Trả lời với danh nghĩa nhà hàng đang active."
    >
      {!loading && restaurants.length > 1 && !selectedRestaurantId ? (
        <div className="owner-panel empty-context">
          <h2>Chọn nhà hàng trước khi mở inbox</h2>
          <p>Inbox và danh tính trả lời sẽ đổi theo nhà hàng bạn chọn trong Restaurant Switcher.</p>
        </div>
      ) : (
        <ChatWorkspace mode="owner" restaurantId={selectedRestaurantId} />
      )}
    </OwnerLayout>
  );
}
