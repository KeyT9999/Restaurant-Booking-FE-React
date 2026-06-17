import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import ChatWorkspace from '../../components/chat/ChatWorkspace';

export default function CustomerChatPage() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="font-sans text-xs font-semibold tracking-widest text-primary uppercase block mb-2">
            Tin nhắn
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-tight">
            Hội thoại
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
            Trò chuyện trực tiếp với nhà hàng trên BookEat để nhận hỗ trợ nhanh nhất.
          </p>
        </div>
        <ChatWorkspace mode="customer" autoRestaurantId={restaurantId} />
      </main>
    </div>
  );
}
