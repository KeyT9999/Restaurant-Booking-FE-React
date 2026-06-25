import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminRecommendations from './AdminRecommendations';
import {
  getRecommendationEvaluation,
  getRecommendationRuns,
  getRecommendationStatus,
  runRecommendationEvaluation,
  runRecommendationRebuildDryRun,
} from '../../api/adminRecommendationApi';

vi.mock('../../components/admin/AdminLayout', () => ({
  default: ({ title, subtitle, children }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}));

vi.mock('../../api/adminRecommendationApi', () => ({
  getRecommendationStatus: vi.fn(),
  getRecommendationRuns: vi.fn(),
  getRecommendationEvaluation: vi.fn(),
  runRecommendationEvaluation: vi.fn(),
  runRecommendationRebuildDryRun: vi.fn(),
}));

const createStatusResponse = () => ({
  success: true,
  data: {
    algorithmVersion: 'hybrid_v1',
    dataset: {
      interactions: 1200,
      userProfiles: 250,
      restaurantItemProfiles: 80,
      menuItemProfiles: 600,
      latestRunStatus: 'success',
      latestRunAt: '2026-06-24T09:00:00.000Z',
    },
    cache: {
      totalEntries: 320,
      activeEntries: 280,
      expiredEntries: 40,
      staleAlgorithmEntries: 2,
    },
    health: {
      status: 'warning',
      warnings: ['Lần rebuild recommendation gần nhất đang ở trạng thái thất bại.'],
    },
    rawProfile: 'customer@example.com',
  },
});

const createRunsResponse = () => ({
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
        algorithmVersion: 'phase2-dataset-builder-v1',
        stats: {
          interactionsCreated: 100,
          userProfilesGenerated: 20,
          itemProfilesGenerated: 80,
        },
        warnings: [],
      },
    ],
  },
});

const createEvaluationResponse = () => ({
  success: true,
  data: {
    available: true,
    warning: null,
    message: null,
    hitRateAtK: 0.32,
    coverage: 0.45,
    evaluatedUsers: 80,
    skippedUsers: 20,
    averageRecommendations: 8.7,
    fallbackRate: 0.18,
    generatedAt: '2026-06-24T10:00:00.000Z',
    algorithmVersion: 'hybrid_v1',
    sampleLimit: 100,
    k: 10,
    limitations: ['Holdout mới nhất hiện chưa được loại khỏi profile khi chấm điểm, nên hit rate có thể lạc quan hơn thực tế.'],
    warnings: [],
    rawHistory: 'restaurant-a, restaurant-b',
  },
});

const mockResolvedDashboard = () => {
  getRecommendationStatus.mockResolvedValue(createStatusResponse());
  getRecommendationRuns.mockResolvedValue(createRunsResponse());
  getRecommendationEvaluation.mockResolvedValue(createEvaluationResponse());
  runRecommendationEvaluation.mockResolvedValue(createEvaluationResponse());
  runRecommendationRebuildDryRun.mockResolvedValue({
    success: true,
    data: {
      dryRun: true,
      durationMs: 1200,
      interactionsBuilt: 100,
      userProfilesBuilt: 20,
      itemProfilesBuilt: 80,
    },
  });
};

describe('AdminRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolvedDashboard();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders status cards, runs, evaluation panel, and privacy note without raw profile or history strings', async () => {
    render(<AdminRecommendations />);

    expect(await screen.findByText('Recommendation System')).toBeTruthy();
    expect((await screen.findAllByText('hybrid_v1')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1200')).toBeTruthy();
    expect(screen.getAllByText('Lần rebuild recommendation gần nhất đang ở trạng thái thất bại.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Full rebuild').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('HitRate@K')).toBeTruthy();
    expect(screen.getByText('Dashboard chỉ hiển thị thống kê tổng hợp, không hiển thị lịch sử cá nhân hay dữ liệu nhạy cảm của khách hàng.')).toBeTruthy();
    expect(screen.queryByText('customer@example.com')).toBeNull();
    expect(screen.queryByText('restaurant-a, restaurant-b')).toBeNull();
  });

  it('shows loading skeleton while recommendation admin data is loading', () => {
    getRecommendationStatus.mockImplementation(() => new Promise(() => {}));
    getRecommendationRuns.mockImplementation(() => new Promise(() => {}));
    getRecommendationEvaluation.mockImplementation(() => new Promise(() => {}));

    render(<AdminRecommendations />);

    expect(screen.getByTestId('admin-recommendations-loading')).toBeTruthy();
  });

  it('shows error state and retries successfully', async () => {
    getRecommendationStatus
      .mockRejectedValueOnce(new Error('status failed'))
      .mockResolvedValueOnce(createStatusResponse());

    render(<AdminRecommendations />);

    expect(await screen.findByText('Không thể tải dữ liệu recommendation admin.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('1200')).toBeTruthy();
    expect(getRecommendationStatus).toHaveBeenCalledTimes(2);
  });

  it('runs quick evaluation from the action button and refreshes the summary data', async () => {
    render(<AdminRecommendations />);

    expect(await screen.findByText('HitRate@K')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Chạy đánh giá nhanh' }));

    await waitFor(() => {
      expect(runRecommendationEvaluation).toHaveBeenCalledWith({ sampleLimit: 100, k: 10 });
    });

    expect(await screen.findByText(/Đã chạy đánh giá recommendation/)).toBeTruthy();
  });

  it('runs rebuild dry-run and keeps a mobile-safe runs container available', async () => {
    render(<AdminRecommendations />);

    expect((await screen.findAllByText('Full rebuild')).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole('button', { name: 'Dry-run rebuild' }));

    await waitFor(() => {
      expect(runRecommendationRebuildDryRun).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('recommendation-runs-mobile')).toBeTruthy();
    expect(await screen.findByText(/Dry-run rebuild đã hoàn tất/)).toBeTruthy();
  });
});
