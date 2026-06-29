import axiosInstance from './axiosInstance';

/**
 * Fetch food recommendations based on user's nutrition question and optional context.
 * 
 * @param {Object} payload
 * @param {string} payload.question - The question asked by the user.
 * @param {Object} [payload.context] - Optional context filters (e.g. goal, dietaryRestrictions, maxBudget).
 * @returns {Promise<Object>} The API response containing nutritionAdvice, suggestedDishes, and matching restaurants.
 */
export const getFoodRecommendation = async ({ question, context }) => {
  const response = await axiosInstance.post('/openai/food-recommendation', {
    question,
    context
  });
  return response.data;
};
