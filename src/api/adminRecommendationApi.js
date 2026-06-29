import axiosInstance from './axiosInstance';

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_ADMIN_RECOMMENDATION_TIMEOUT_MS) || 15000;

const normalizeStringList = (value) => (Array.isArray(value) ? value : [])
  .filter((item) => typeof item === 'string')
  .map((item) => item.trim())
  .filter(Boolean);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const requestConfig = (params = undefined) => ({
  ...(params ? { params } : {}),
  timeout: REQUEST_TIMEOUT_MS,
});

const normalizeStatusPayload = (response = {}) => {
  const payload = response?.data || {};
  return {
    success: response?.success !== false,
    data: {
      algorithmVersion: payload.algorithmVersion || 'hybrid_v1',
      dataset: {
        interactions: toNumber(payload?.dataset?.interactions),
        userProfiles: toNumber(payload?.dataset?.userProfiles),
        restaurantItemProfiles: toNumber(payload?.dataset?.restaurantItemProfiles),
        menuItemProfiles: toNumber(payload?.dataset?.menuItemProfiles),
        latestRunStatus: payload?.dataset?.latestRunStatus || null,
        latestRunAt: payload?.dataset?.latestRunAt || null,
      },
      cache: {
        totalEntries: toNumber(payload?.cache?.totalEntries),
        activeEntries: toNumber(payload?.cache?.activeEntries),
        expiredEntries: toNumber(payload?.cache?.expiredEntries),
        staleAlgorithmEntries: toNumber(payload?.cache?.staleAlgorithmEntries),
      },
      health: {
        status: payload?.health?.status || 'warning',
        warnings: normalizeStringList(payload?.health?.warnings),
      },
    },
  };
};

const normalizeRunsPayload = (response = {}) => {
  const payload = response?.data || {};
  return {
    success: response?.success !== false,
    data: {
      items: (Array.isArray(payload.items) ? payload.items : []).map((item) => ({
        id: item.id || null,
        runType: item.runType || 'unknown',
        status: item.status || 'unknown',
        startedAt: item.startedAt || null,
        finishedAt: item.finishedAt || null,
        durationMs: Number.isFinite(Number(item.durationMs)) ? Number(item.durationMs) : null,
        algorithmVersion: item.algorithmVersion || null,
        stats: {
          interactionsCreated: toNumber(item?.stats?.interactionsCreated),
          userProfilesGenerated: toNumber(item?.stats?.userProfilesGenerated),
          itemProfilesGenerated: toNumber(item?.stats?.itemProfilesGenerated),
          cacheInvalidated: toNumber(item?.stats?.cacheInvalidated),
        },
        summary: item?.summary || null,
        warnings: normalizeStringList(item?.warnings),
      })),
    },
  };
};

const normalizeEvaluationPayload = (response = {}) => {
  const payload = response?.data || {};
  return {
    success: response?.success !== false,
    data: {
      available: payload.available === true,
      warning: payload.warning || null,
      message: payload.message || null,
      hitRateAtK: payload.hitRateAtK == null ? null : toNumber(payload.hitRateAtK, null),
      coverage: payload.coverage == null ? null : toNumber(payload.coverage, null),
      evaluatedUsers: toNumber(payload.evaluatedUsers),
      skippedUsers: toNumber(payload.skippedUsers),
      averageRecommendations: toNumber(payload.averageRecommendations),
      fallbackRate: payload.fallbackRate == null ? 0 : toNumber(payload.fallbackRate),
      generatedAt: payload.generatedAt || null,
      algorithmVersion: payload.algorithmVersion || 'hybrid_v1',
      sampleLimit: toNumber(payload.sampleLimit, 100),
      k: toNumber(payload.k, 10),
      limitations: normalizeStringList(payload.limitations),
      warnings: normalizeStringList(payload.warnings),
    },
  };
};

const normalizeDryRunPayload = (response = {}) => {
  const payload = response?.data || {};
  return {
    success: response?.success !== false,
    data: {
      dryRun: payload.dryRun === true,
      startedAt: payload.startedAt || null,
      completedAt: payload.completedAt || null,
      durationMs: toNumber(payload.durationMs),
      interactionsBuilt: toNumber(payload.interactionsBuilt),
      userProfilesBuilt: toNumber(payload.userProfilesBuilt),
      itemProfilesBuilt: toNumber(payload.itemProfilesBuilt),
      cacheInvalidated: toNumber(payload.cacheInvalidated),
    },
  };
};

export const getRecommendationStatus = async () => (
  normalizeStatusPayload(await axiosInstance.get('/admin/recommendations/status', requestConfig()))
);

export const getRecommendationRuns = async (params = {}) => (
  normalizeRunsPayload(await axiosInstance.get('/admin/recommendations/runs', requestConfig(params)))
);

export const getRecommendationEvaluation = async () => (
  normalizeEvaluationPayload(await axiosInstance.get('/admin/recommendations/evaluation', requestConfig()))
);

export const runRecommendationEvaluation = async ({ sampleLimit = 100, k = 10 } = {}) => (
  normalizeEvaluationPayload(await axiosInstance.post(
    '/admin/recommendations/evaluate',
    { sampleLimit, k },
    requestConfig()
  ))
);

export const runRecommendationRebuildDryRun = async () => (
  normalizeDryRunPayload(await axiosInstance.post(
    '/admin/recommendations/rebuild-dry-run',
    {},
    requestConfig()
  ))
);
