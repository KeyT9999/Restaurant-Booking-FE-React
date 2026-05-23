import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import ChatWorkspace from '../../components/chat/ChatWorkspace';
import './CustomerChatPage.css';

export default function CustomerChatPage() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  return (
    <div className="customer-chat-page">
      <Header />
      <main className="customer-chat-main">
        <div className="customer-chat-heading">
          <span className="customer-chat-eyebrow">Tin nhắn</span>
          <h1>Hội thoại</h1>
          <p>Chat trực tiếp với nhà hàng trên BookEat.</p>
        </div>
        <ChatWorkspace mode="customer" autoRestaurantId={restaurantId} />
      </main>
    </div>
  );
}
