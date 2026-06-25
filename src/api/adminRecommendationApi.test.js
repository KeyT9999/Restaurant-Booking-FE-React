import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  getRecommendationEvaluation,
  getRecommendationRuns,
  getRecommendationStatus,
  runRecommendationEvaluation,
  runRecommendationRebuildDryRun,
} from './adminRecommendationApi';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('adminRecommendationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads status and runs with safe normalization', async () => {
    axiosInstance.get
      .mockResolvedValueOnce({
        success: true,
        data: {
          algorithmVersion: 'hybrid_v1',
          dataset: {
            interactions: 12,
            userProfiles: 3,
            restaurantItemProfiles: 2,
            menuItemProfiles: 6,
            latestRunStatus: 'success',
            latestRunAt: '2026-06-24T09:00:00.000Z',
          },
          cache: {
            totalEntries: 7,
            activeEntries: 6,
            expiredEntries: 1,
          },
          health: {
            status: 'warning',
            warnings: ['Cache recommendation đang có tỷ lệ bản ghi hết hạn cao.', null],
          },
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          items: [
            {
              id: 'run-1',
              runType: 'full_rebuild',
              status: 'success',
              startedAt: '2026-06-24T09:00:00.000Z',
              finishedAt: '2026-06-24T09:01:00.000Z',
              durationMs: 60000,
              stats: {
                interactionsCreated: 12,
                userProfilesGenerated: 3,
                itemProfilesGenerated: 6,
              },
              warnings: [''],
            },
          ],
        },
      });

    const status = await getRecommendationStatus();
    const runs = await getRecommendationRuns({ limit: 8 });

    expect(axiosInstance.get).toHaveBeenNthCalledWith(1, '/admin/recommendations/status', expect.objectContaining({
      timeout: expect.any(Number),
    }));
    expect(axiosInstance.get).toHaveBeenNthCalledWith(2, '/admin/recommendations/runs', expect.objectContaining({
      params: { limit: 8 },
      timeout: expect.any(Number),
    }));

    expect(status.data.health.warnings).toEqual(['Cache recommendation đang có tỷ lệ bản ghi hết hạn cao.']);
    expect(runs.data.items[0]).toMatchObject({
      id: 'run-1',
      runType: 'full_rebuild',
      durationMs: 60000,
      stats: {
        interactionsCreated: 12,
      },
      warnings: [],
    });
  });

  it('loads and runs evaluation safely without leaking extra fields', async () => {
    axiosInstance.get.mockResolvedValue({
      success: true,
      data: {
        available: true,
        hitRateAtK: 0.32,
        coverage: 0.45,
        evaluatedUsers: 80,
        skippedUsers: 20,
        averageRecommendations: 8.7,
        fallbackRate: 0.18,
        generatedAt: '2026-06-24T10:00:00.000Z',
        limitations: ['Giới hạn holdout'],
        warnings: [''],
        rawProfile: 'customer@example.com',
      },
    });
    axiosInstance.post
      .mockResolvedValueOnce({
        success: true,
        data: {
          available: false,
          warning: 'INSUFFICIENT_EVALUATION_DATA',
          message: 'Không đủ dữ liệu đánh giá recommendation.',
          sampleLimit: 50,
          k: 5,
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          dryRun: true,
          durationMs: 1200,
          interactionsBuilt: 100,
          userProfilesBuilt: 20,
          itemProfilesBuilt: 80,
        },
      });

    const evaluation = await getRecommendationEvaluation();
    const evaluationRun = await runRecommendationEvaluation({ sampleLimit: 50, k: 5 });
    const dryRun = await runRecommendationRebuildDryRun();

    expect(evaluation.data.limitations).toEqual(['Giới hạn holdout']);
    expect(evaluation.data.rawProfile).toBeUndefined();
    expect(axiosInstance.post).toHaveBeenNthCalledWith(1, '/admin/recommendations/evaluate', { sampleLimit: 50, k: 5 }, expect.objectContaining({
      timeout: expect.any(Number),
    }));
    expect(axiosInstance.post).toHaveBeenNthCalledWith(2, '/admin/recommendations/rebuild-dry-run', {}, expect.objectContaining({
      timeout: expect.any(Number),
    }));
    expect(evaluationRun.data.warning).toBe('INSUFFICIENT_EVALUATION_DATA');
    expect(dryRun.data).toMatchObject({
      dryRun: true,
      durationMs: 1200,
      interactionsBuilt: 100,
    });
  });
});
