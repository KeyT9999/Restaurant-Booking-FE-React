import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublicCuisineTypes, getPublicRestaurants } from '../../api/restaurantApi';
import { getHomeRecommendations } from '../../api/recommendationApi';
import { getHomepageVoucherCampaigns } from '../../api/voucherApi';
import { useAuth } from '../../context/useAuth';
import HomePage from './HomePage';

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../../api/restaurantApi', () => ({
  getPublicCuisineTypes: vi.fn(),
  getPublicRestaurants: vi.fn(),
}));

vi.mock('../../api/voucherApi', () => ({
  getHomepageVoucherCampaigns: vi.fn(),
}));

vi.mock('../../api/recommendationApi', () => ({
  getHomeRecommendations: vi.fn(),
}));

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

const guestAuthState = {
  isAuthenticated: false,
  loading: false,
  user: null,
};

const customerAuthState = {
  isAuthenticated: true,
  loading: false,
  user: {
    id: 'customer-1',
    role: 'customer',
    fullName: 'Khách BookEat',
  },
};

const createRestaurantRecommendation = () => ({
  id: 'restaurant-1',
  name: 'Nhà hàng Hợp Gu',
  image: '/restaurant.jpg',
  ratingAverage: 4.9,
  cuisineTypes: ['Việt Nam'],
  priceRange: 'Tầm trung',
  reasons: [
    'Phù hợp với sở thích ẩm thực của bạn',
    'Có đánh giá tốt',
  ],
  detailUrl: '/restaurants/restaurant-1',
  bookingUrl: '/restaurants/restaurant-1/booking',
  voucherActive: true,
  scoreBreakdown: {
    hybrid: 0.95,
  },
});

const createMenuRecommendation = () => ({
  id: 'menu-1',
  name: 'Bún bò đặc biệt',
  image: '/menu.jpg',
  restaurantName: 'Nhà hàng Hợp Gu',
  categoryName: 'Món chính',
  price: 89000,
  reasons: ['Được nhiều khách hàng yêu thích'],
  tags: ['Best seller'],
  detailUrl: '/restaurants/restaurant-1',
  menuUrl: '/restaurants/restaurant-1#menu',
});

const createPersonalizedResponse = () => ({
  success: true,
  personalized: true,
  fallbackUsed: false,
  restaurantsForYou: [createRestaurantRecommendation()],
  menuItemsForYou: [createMenuRecommendation()],
  popularRestaurants: [],
});

const createFallbackResponse = () => ({
  success: true,
  personalized: false,
  fallbackUsed: true,
  restaurantsForYou: [],
  menuItemsForYou: [],
  popularRestaurants: [
    {
      ...createRestaurantRecommendation(),
      reasons: ['Được nhiều khách hàng yêu thích', 'Đang có ưu đãi phù hợp'],
    },
  ],
});

const createEmptyResponse = () => ({
  success: true,
  personalized: false,
  fallbackUsed: true,
  restaurantsForYou: [],
  menuItemsForYou: [],
  popularRestaurants: [],
});

const renderPage = () => render(
  <MemoryRouter>
    <HomePage />
  </MemoryRouter>,
);

const mockBaseHomepageApis = () => {
  getPublicCuisineTypes.mockResolvedValue({
    success: true,
    data: ['Việt Nam', 'Nhật Bản'],
  });
  getPublicRestaurants.mockResolvedValue({
    success: true,
    data: {
      restaurants: [],
    },
  });
  getHomepageVoucherCampaigns.mockResolvedValue({
    success: true,
    data: [],
  });
};

describe('HomePage recommendations', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBaseHomepageApis();
    useAuth.mockReturnValue(guestAuthState);
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  it('renders fallback recommendations and guest CTA on the homepage', async () => {
    getHomeRecommendations.mockResolvedValue(createFallbackResponse());

    renderPage();

    expect(await screen.findByText('Gợi ý phổ biến')).toBeTruthy();
    expect(screen.getByText('Những lựa chọn phổ biến được nhiều khách hàng quan tâm')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Đăng nhập để nhận gợi ý cá nhân hóa hơn' })).toBeTruthy();
    expect(screen.getByText('Nhà hàng Hợp Gu')).toBeTruthy();
    expect(screen.getByText('Được nhiều khách hàng yêu thích')).toBeTruthy();
    expect(screen.queryByText('Dựa trên sở thích và hoạt động gần đây của bạn')).toBeNull();
  });

  it('renders personalized restaurant and menu recommendations for customers', async () => {
    useAuth.mockReturnValue(customerAuthState);
    getHomeRecommendations.mockResolvedValue(createPersonalizedResponse());

    renderPage();

    expect(await screen.findByText('Gợi ý cho bạn')).toBeTruthy();
    expect(screen.getByText('Dựa trên sở thích và hoạt động gần đây của bạn')).toBeTruthy();
    expect(screen.getByText('Phù hợp với bạn')).toBeTruthy();
    expect(screen.getAllByText('Nhà hàng Hợp Gu').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bún bò đặc biệt')).toBeTruthy();
    expect(screen.getByText('89.000 đ')).toBeTruthy();
    expect(screen.getByText('Được nhiều khách hàng yêu thích')).toBeTruthy();
    expect(screen.queryByText('scoreBreakdown')).toBeNull();
  });

  it('shows popular wording instead of personalized copy when fallback is used for customers', async () => {
    useAuth.mockReturnValue(customerAuthState);
    getHomeRecommendations.mockResolvedValue({
      ...createFallbackResponse(),
      personalized: true,
    });

    renderPage();

    expect(await screen.findByText('Gợi ý phổ biến')).toBeTruthy();
    expect(screen.getByText('Những lựa chọn phổ biến được nhiều khách hàng quan tâm')).toBeTruthy();
    expect(screen.getByText('Bạn càng đặt bàn, đánh giá và lưu yêu thích, gợi ý sẽ càng chính xác hơn.')).toBeTruthy();
    expect(screen.queryByText('Dựa trên sở thích và hoạt động gần đây của bạn')).toBeNull();
  });

  it('shows recommendation skeletons while the recommendation request is loading', async () => {
    let resolveRecommendations;
    getHomeRecommendations.mockImplementation(() => new Promise((resolve) => {
      resolveRecommendations = resolve;
    }));

    renderPage();

    expect(screen.getByTestId('recommendation-loading')).toBeTruthy();
    await waitFor(() => expect(getHomeRecommendations).toHaveBeenCalledTimes(1));

    await act(async () => {
      resolveRecommendations(createFallbackResponse());
    });

    expect(await screen.findByText('Nhà hàng Hợp Gu')).toBeTruthy();
  });

  it('shows a retryable error state and recovers on retry', async () => {
    getHomeRecommendations
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce(createFallbackResponse());

    renderPage();

    expect(await screen.findByText('Chưa thể tải gợi ý lúc này.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('Nhà hàng Hợp Gu')).toBeTruthy();
    expect(getHomeRecommendations).toHaveBeenCalledTimes(2);
  });

  it('shows the empty state and login CTA when no recommendation data is available', async () => {
    getHomeRecommendations.mockResolvedValue(createEmptyResponse());

    renderPage();

    expect(await screen.findByText('Chưa có đủ dữ liệu để cá nhân hóa.')).toBeTruthy();
    expect(screen.getByText('Hãy đặt bàn hoặc lưu nhà hàng yêu thích để nhận gợi ý tốt hơn.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href')).toBe('/auth/login?redirect=%2F');
  });
});
