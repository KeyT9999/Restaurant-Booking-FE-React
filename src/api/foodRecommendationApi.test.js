import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import { getFoodRecommendation } from './foodRecommendationApi';

vi.mock('./axiosInstance', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('foodRecommendationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the food recommendation endpoint and returns data', async () => {
    const mockResponse = {
      success: true,
      data: {
        question: 'Tôi tập gym nên ăn gì?',
        nutritionAdvice: 'Ăn ức gà và cá hồi',
        suggestedDishes: [],
        restaurants: []
      }
    };
    axiosInstance.post.mockResolvedValue({ data: mockResponse });

    const payload = { question: 'Tôi tập gym nên ăn gì?', context: { goal: 'muscle_gain' } };
    const response = await getFoodRecommendation(payload);

    expect(axiosInstance.post).toHaveBeenCalledWith('/openai/food-recommendation', payload);
    expect(response).toEqual(mockResponse);
  });
});
