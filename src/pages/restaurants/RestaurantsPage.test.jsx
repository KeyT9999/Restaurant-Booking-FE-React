import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRestaurantRecommendations } from '../../api/recommendationApi';
import { getPublicCuisineTypes, getPublicRestaurants } from '../../api/restaurantApi';
import { getFavoriteIds } from '../../api/favoriteApi';
import { useAuth } from '../../context/useAuth';
import { useChatWidget } from '../../context/useChatWidget';
import RestaurantsPage from './RestaurantsPage';

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../../api/restaurantApi', () => ({
  getPublicCuisineTypes: vi.fn(),
  getPublicRestaurants: vi.fn(),
}));

vi.mock('../../api/recommendationApi', () => ({
  getRestaurantRecommendations: vi.fn(),
}));

vi.mock('../../api/favoriteApi', () => ({
  getFavoriteIds: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../context/useChatWidget', () => ({
  useChatWidget: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const guestAuthState = {
  isAuthenticated: false,
  user: null,
};

const customerAuthState = {
  isAuthenticated: true,
  user: {
    id: 'customer-1',
    role: 'customer',
    fullName: 'Khách BookEat',
  },
};

const sampleRestaurant = {
  id: 'list-1',
  name: 'Nhà hàng Danh Sách',
  image: '/list.jpg',
  averageRating: 4.7,
  averagePrice: 250000,
  cuisineType: 'Việt Nam',
  description: 'Một nhà hàng đáng thử trong danh sách chính.',
  address: 'Quận 1, TP.HCM',
  featured: true,
};

const createRecommendationRestaurant = () => ({
  id: 'rec-1',
  restaurantId: 'rec-1',
  name: 'Nhà hàng Hợp Gu',
  image: '/rec.jpg',
  ratingAverage: 4.9,
  priceRange: 'Tầm trung',
  cuisineTypes: ['Việt Nam'],
  reasons: ['Phù hợp với sở thích ẩm thực của bạn', 'Có đánh giá tốt'],
  detailUrl: '/restaurants/rec-1',
  bookingUrl: '/restaurants/rec-1/booking',
  voucherActive: true,
  scoreBreakdown: {
    hybrid: 0.94,
  },
});

const createPersonalizedRecommendationResponse = () => ({
  success: true,
  personalized: true,
  fallbackUsed: false,
  items: [createRecommendationRestaurant()],
});

const createFallbackRecommendationResponse = () => ({
  success: true,
  personalized: false,
  fallbackUsed: true,
  items: [
    {
      ...createRecommendationRestaurant(),
      reasons: ['Được nhiều khách hàng yêu thích', 'Đang có ưu đãi phù hợp'],
    },
  ],
});

const createEmptyRecommendationResponse = () => ({
  success: true,
  personalized: false,
  fallbackUsed: true,
  items: [],
});

const renderPage = (initialEntries = ['/restaurants']) => render(
  <MemoryRouter initialEntries={initialEntries}>
    <RestaurantsPage />
  </MemoryRouter>,
);

const mockBaseApis = () => {
  getPublicCuisineTypes.mockResolvedValue({
    success: true,
    data: ['Việt Nam', 'Nhật Bản'],
  });
  getPublicRestaurants.mockResolvedValue({
    success: true,
    data: {
      restaurants: [sampleRestaurant],
      totalPages: 1,
      total: 1,
    },
  });
  getFavoriteIds.mockResolvedValue({
    success: true,
    data: [],
  });
  useChatWidget.mockReturnValue({
    openCustomerRestaurantChat: vi.fn(),
  });
};

describe('RestaurantsPage recommendations', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.scrollTo = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBaseApis();
    useAuth.mockReturnValue(guestAuthState);
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
    vi.useRealTimers();
  });

  it('renders fallback recommendation wording for guests without breaking the main restaurant list', async () => {
    getRestaurantRecommendations.mockResolvedValue(createFallbackRecommendationResponse());

    renderPage();

    expect(await screen.findByText('Được nhiều khách hàng yêu thích')).toBeTruthy();
    expect(screen.getByText('Gợi ý phổ biến')).toBeTruthy();
    expect(screen.getByText('Những nhà hàng được nhiều khách hàng quan tâm')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Đăng nhập để nhận gợi ý cá nhân hóa hơn' }).getAttribute('href')).toContain('/auth/login?redirect=');
    expect(screen.getByText('Được nhiều khách hàng yêu thích')).toBeTruthy();
    expect(screen.getByText('Nhà hàng Danh Sách')).toBeTruthy();
    expect(screen.queryByText('Dựa trên sở thích và hoạt động gần đây của bạn')).toBeNull();
  });

  it('renders personalized recommendation copy and reason chips for customers', async () => {
    useAuth.mockReturnValue(customerAuthState);
    getRestaurantRecommendations.mockResolvedValue(createPersonalizedRecommendationResponse());

    renderPage();

    expect(await screen.findByText('Nhà hàng phù hợp với bạn')).toBeTruthy();
    expect(screen.getByText('Dựa trên sở thích và hoạt động gần đây của bạn')).toBeTruthy();
    expect(screen.getByText('Phù hợp với bạn')).toBeTruthy();
    expect(screen.getByText('Phù hợp với sở thích ẩm thực của bạn')).toBeTruthy();
    expect(screen.queryByText('scoreBreakdown')).toBeNull();
  });

  it('debounces filter updates and only sends safe params to the recommendation API', async () => {
    vi.useFakeTimers();
    getRestaurantRecommendations.mockResolvedValue(createFallbackRecommendationResponse());

    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(getRestaurantRecommendations).toHaveBeenCalledTimes(1);
    expect(getRestaurantRecommendations).toHaveBeenLastCalledWith({ limit: 3 });

    fireEvent.click(screen.getByRole('button', { name: 'Nhật Bản' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cao cấp (Trên 500k)' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });

    expect(getRestaurantRecommendations).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(getRestaurantRecommendations).toHaveBeenCalledTimes(2);
    expect(getRestaurantRecommendations).toHaveBeenLastCalledWith({
      limit: 3,
      cuisine: 'Nhật Bản',
      priceRange: 'high',
    });
  });

  it('shows recommendation error UI while keeping the main list usable', async () => {
    getRestaurantRecommendations.mockRejectedValue(new Error('recommendation failed'));

    renderPage();

    expect(await screen.findByText('Chưa thể tải gợi ý lúc này.')).toBeTruthy();
    expect(screen.getByText('Danh sách nhà hàng chính vẫn sẵn sàng để bạn tiếp tục khám phá.')).toBeTruthy();
    expect(screen.getByText('Nhà hàng Danh Sách')).toBeTruthy();
  });

  it('shows the explore empty state when the recommendation list is empty', async () => {
    getRestaurantRecommendations.mockResolvedValue(createEmptyRecommendationResponse());

    renderPage(['/restaurants?cuisineType=Nhật%20Bản']);

    expect(await screen.findByText('Chưa có gợi ý phù hợp với bộ lọc hiện tại.')).toBeTruthy();
    expect(screen.getByText('Hãy thử nới lỏng bộ lọc ẩm thực hoặc khoảng giá để xem thêm nhà hàng phù hợp.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href')).toContain('/auth/login?redirect=');
  });
});
