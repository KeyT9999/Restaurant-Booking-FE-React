import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  getHomeRecommendations,
  getMenuItemRecommendations,
  getRestaurantRecommendations,
} from './recommendationApi';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('recommendationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the home endpoint and normalizes the payload safely', async () => {
    axiosInstance.get.mockResolvedValue({
      success: true,
      data: {
        personalized: true,
        fallbackUsed: false,
        restaurantsForYou: [
          {
            restaurantId: 'restaurant-1',
            name: 'Bún AI',
            priceRange: 'budget',
            cuisineTypes: ['Việt Nam'],
            ratingAverage: 4.8,
            voucherActive: true,
            reasons: ['Hợp gu', 'Có đánh giá tốt', 'Đang có ưu đãi', 'Dư'],
            scoreBreakdown: { hybrid: 0.92 },
          },
        ],
        menuItemsForYou: [
          {
            menuItemId: 'menu-1',
            restaurantId: 'restaurant-1',
            name: 'Bún bò đặc biệt',
            restaurantName: 'Bún AI',
            price: 89000,
            tags: ['Best seller'],
            reasons: ['Phù hợp với sở thích ẩm thực của bạn'],
          },
        ],
        popularRestaurants: [],
      },
    });

    const response = await getHomeRecommendations({ limit: 3 });

    expect(axiosInstance.get).toHaveBeenCalledWith('/recommendations/home', expect.objectContaining({
      params: { limit: 3 },
      timeout: expect.any(Number),
    }));
    expect(response.personalized).toBe(true);
    expect(response.restaurantsForYou[0]).toMatchObject({
      id: 'restaurant-1',
      priceRange: 'Bình dân',
      detailUrl: '/restaurants/restaurant-1',
      bookingUrl: '/restaurants/restaurant-1/booking',
      reasons: ['Hợp gu', 'Có đánh giá tốt', 'Đang có ưu đãi'],
      voucherActive: true,
    });
    expect(response.restaurantsForYou[0].scoreBreakdown).toBeUndefined();
    expect(response.menuItemsForYou[0]).toMatchObject({
      id: 'menu-1',
      restaurantName: 'Bún AI',
      menuUrl: '/restaurants/restaurant-1#menu',
    });
  });

  it('normalizes list endpoints and tolerates missing optional fields', async () => {
    axiosInstance.get
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            {
              restaurantId: 'restaurant-2',
              name: 'Phở BookEat',
              priceRange: 'luxury',
              reasons: null,
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            {
              menuItemId: 'menu-2',
              restaurantId: 'restaurant-2',
              tags: null,
              cuisineTypes: ['Nhật Bản'],
              reasons: ['  Có đánh giá tốt  '],
            },
          ],
        },
      });

    const restaurantResponse = await getRestaurantRecommendations({ limit: 2 });
    const menuResponse = await getMenuItemRecommendations();

    expect(axiosInstance.get).toHaveBeenNthCalledWith(1, '/recommendations/restaurants', expect.objectContaining({
      params: { limit: 2 },
      timeout: expect.any(Number),
    }));
    expect(axiosInstance.get).toHaveBeenNthCalledWith(2, '/recommendations/menu-items', expect.objectContaining({
      params: {},
      timeout: expect.any(Number),
    }));
    expect(restaurantResponse.items[0]).toMatchObject({
      id: 'restaurant-2',
      priceRange: 'Sang trọng',
      reasons: [],
    });
    expect(menuResponse.items[0]).toMatchObject({
      id: 'menu-2',
      name: 'Món ăn gợi ý',
      restaurantName: 'Nhà hàng BookEat',
      reasons: ['Có đánh giá tốt'],
      menuUrl: '/restaurants/restaurant-2#menu',
    });
  });
});
