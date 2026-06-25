import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Database,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getRecommendationEvaluation,
  getRecommendationRuns,
  getRecommendationStatus,
  runRecommendationEvaluation,
  runRecommendationRebuildDryRun,
} from '../../api/adminRecommendationApi';

const DEFAULT_FORM = {
  sampleLimit: 100,
  k: 10,
};

const formatDateTime = (value) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (value) => {
  const durationMs = Number(value);
  if (!Number.isFinite(durationMs) || durationMs < 0) return '-';
  if (durationMs < 1000) return `${durationMs} ms`;
  if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)} giây`;
  return `${Math.round(durationMs / 60000)} phút`;
};

const formatPercent = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '-';
  return `${(numericValue * 100).toFixed(1)}%`;
};

const HEALTH_META = {
  healthy: {
    label: 'Ổn định',
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  },
  warning: {
    label: 'Cần theo dõi',
    className: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  },
  critical: {
    label: 'Cảnh báo',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
};

const RUN_STATUS_META = {
  success: {
    label: 'Thành công',
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  },
  failed: {
    label: 'Thất bại',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
  running: {
    label: 'Đang chạy',
    className: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
  },
};

const RUN_TYPE_LABELS = {
  full_rebuild: 'Full rebuild',
  incremental_rebuild: 'Incremental rebuild',
  evaluation: 'Evaluation',
};

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <strong className="mt-2 block text-xl font-bold text-white">{value}</strong>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
      {note ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p> : null}
    </article>
  );
}

function StatusBadge({ status, type = 'health' }) {
  const meta = type === 'run'
    ? (RUN_STATUS_META[status] || { label: status || 'Không rõ', className: 'border-border bg-secondary/30 text-muted-foreground' })
    : (HEALTH_META[status] || { label: status || 'Không rõ', className: 'border-border bg-secondary/30 text-muted-foreground' });

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function InlineNotice({ tone = 'info', title, description }) {
  const toneClass = tone === 'success'
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
    : tone === 'warning'
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-200'
      : 'border-border bg-secondary/20 text-white';

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5">{description}</p>
    </div>
  );
}

export default function AdminRecommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState(null);
  const [runsData, setRunsData] = useState({ items: [] });
  const [evaluationData, setEvaluationData] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeAction, setActiveAction] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const loadPageData = useCallback(async ({ showLoader = true, resetError = true } = {}) => {
    if (showLoader) setLoading(true);
    if (resetError) setError('');

    try {
      const [statusResponse, runsResponse, evaluationResponse] = await Promise.all([
        getRecommendationStatus(),
        getRecommendationRuns({ limit: 8 }),
        getRecommendationEvaluation(),
      ]);

      setStatusData(statusResponse.data);
      setRunsData(runsResponse.data);
      setEvaluationData(evaluationResponse.data);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu recommendation admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPageData({ showLoader: false, resetError: false });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadPageData]);

  const syncStatusAndRuns = async () => {
    const [statusResponse, runsResponse] = await Promise.all([
      getRecommendationStatus(),
      getRecommendationRuns({ limit: 8 }),
    ]);
    setStatusData(statusResponse.data);
    setRunsData(runsResponse.data);
  };

  const handleRetry = () => {
    void loadPageData({ showLoader: true, resetError: true });
  };

  const handleRunEvaluation = async () => {
    setActiveAction('evaluate');
    setActionNotice(null);

    try {
      const response = await runRecommendationEvaluation({
        sampleLimit: form.sampleLimit,
        k: form.k,
      });

      setEvaluationData(response.data);
      await syncStatusAndRuns();

      if (response.data.available) {
        setActionNotice({
          tone: 'success',
          title: 'Đã chạy đánh giá recommendation',
          description: `HitRate@K hiện tại là ${formatPercent(response.data.hitRateAtK)} với ${response.data.evaluatedUsers} user được đánh giá.`,
        });
      } else {
        setActionNotice({
          tone: 'warning',
          title: 'Đánh giá đã chạy nhưng chưa đủ dữ liệu',
          description: response.data.message || 'Recommendation hiện chưa có đủ dữ liệu để tạo metric đáng tin cậy.',
        });
      }
    } catch (requestError) {
      setActionNotice({
        tone: 'warning',
        title: 'Không thể chạy đánh giá nhanh',
        description: requestError.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setActiveAction('');
    }
  };

  const handleDryRun = async () => {
    setActiveAction('dry-run');
    setActionNotice(null);

    try {
      const response = await runRecommendationRebuildDryRun();
      await syncStatusAndRuns();

      setActionNotice({
        tone: 'success',
        title: 'Dry-run rebuild đã hoàn tất',
        description: `Mô phỏng xây lại dataset trong ${formatDuration(response.data.durationMs)}. Interactions: ${response.data.interactionsBuilt}, profiles user: ${response.data.userProfilesBuilt}, profiles item: ${response.data.itemProfilesBuilt}.`,
      });
    } catch (requestError) {
      setActionNotice({
        tone: 'warning',
        title: 'Không thể chạy dry-run rebuild',
        description: requestError.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setActiveAction('');
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Recommendation System"
        subtitle="Theo dõi dataset, cache, thuật toán và chất lượng gợi ý."
      >
        <div className="space-y-6" data-testid="admin-recommendations-loading">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Recommendation System"
        subtitle="Theo dõi dataset, cache, thuật toán và chất lượng gợi ý."
      >
        <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="text-sm font-bold text-destructive">Không thể tải dữ liệu recommendation admin.</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-destructive/30 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  const status = statusData || {
    algorithmVersion: 'hybrid_v1',
    dataset: {},
    cache: {},
    health: { status: 'warning', warnings: [] },
  };
  const evaluation = evaluationData || {
    available: false,
    message: 'Chưa có dữ liệu đánh giá recommendation.',
    warning: null,
    warnings: [],
    limitations: [],
    sampleLimit: DEFAULT_FORM.sampleLimit,
    k: DEFAULT_FORM.k,
  };
  const runs = Array.isArray(runsData?.items) ? runsData.items : [];

  return (
    <AdminLayout
      title="Recommendation System"
      subtitle="Theo dõi dataset, cache, thuật toán và chất lượng gợi ý."
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={16} aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wide">Recommendation Health</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-white">Recommendation System</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Theo dõi dataset, cache, thuật toán và chất lượng gợi ý.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-secondary/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary/35"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Làm mới
              </button>
              <button
                type="button"
                onClick={handleDryRun}
                disabled={activeAction !== '' && activeAction !== 'dry-run'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-60"
              >
                {activeAction === 'dry-run' ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={15} aria-hidden="true" />}
                Dry-run rebuild
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={status.health.status} />
            <span className="text-xs text-muted-foreground">
              Thuật toán hiện tại: <strong className="text-white">{status.algorithmVersion}</strong>
            </span>
            <span className="text-xs text-muted-foreground">
              Lần rebuild gần nhất: <strong className="text-white">{formatDateTime(status.dataset.latestRunAt)}</strong>
            </span>
          </div>
        </section>

        {actionNotice ? (
          <InlineNotice
            tone={actionNotice.tone}
            title={actionNotice.title}
            description={actionNotice.description}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={BrainCircuit}
            label="Thuật toán"
            value={status.algorithmVersion}
            note={status.dataset.latestRunStatus ? `Run gần nhất: ${status.dataset.latestRunStatus}` : 'Chưa có rebuild gần nhất'}
          />
          <MetricCard
            icon={Database}
            label="Interactions"
            value={status.dataset.interactions}
            note="Tổng interaction đã chuẩn hóa cho recommendation."
          />
          <MetricCard
            icon={Zap}
            label="User Profiles"
            value={status.dataset.userProfiles}
            note="Số hồ sơ người dùng hiện có cho hybrid recommender."
          />
          <MetricCard
            icon={BarChart3}
            label="Item Profiles"
            value={status.dataset.restaurantItemProfiles + status.dataset.menuItemProfiles}
            note={`Nhà hàng: ${status.dataset.restaurantItemProfiles}, món ăn: ${status.dataset.menuItemProfiles}.`}
          />
          <MetricCard
            icon={ShieldCheck}
            label="Cache Active"
            value={status.cache.activeEntries}
            note={`Tổng cache: ${status.cache.totalEntries}, hết hạn: ${status.cache.expiredEntries}.`}
          />
          <MetricCard
            icon={TriangleAlert}
            label="Cache Cũ"
            value={status.cache.staleAlgorithmEntries}
            note="Số cache entry còn active nhưng thuộc phiên bản thuật toán khác."
          />
          <MetricCard
            icon={AlertTriangle}
            label="Health"
            value={HEALTH_META[status.health.status]?.label || status.health.status}
            note={status.health.warnings[0] || 'Không có cảnh báo vận hành nổi bật.'}
          />
          <MetricCard
            icon={Loader2}
            label="Latest Run"
            value={status.dataset.latestRunStatus || 'Chưa có'}
            note={formatDateTime(status.dataset.latestRunAt)}
          />
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <AlertTriangle size={18} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Warnings</h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  Chỉ hiển thị thống kê tổng hợp để theo dõi rủi ro dataset, cache và run gần nhất.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {status.health.warnings.length ? (
              <ul className="space-y-3">
                {status.health.warnings.map((warning) => (
                  <li key={warning} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {warning}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                Hệ recommendation hiện chưa có cảnh báo vận hành nổi bật.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Offline Evaluation</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Đánh giá aggregate, không hiển thị profile cá nhân, history thô hay holdout của từng khách hàng.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Mẫu user
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={form.sampleLimit}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    sampleLimit: Number(event.target.value || DEFAULT_FORM.sampleLimit),
                  }))}
                  className="h-10 w-24 rounded-md border border-input bg-secondary/20 px-3 text-sm font-normal text-white outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Top K
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.k}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    k: Number(event.target.value || DEFAULT_FORM.k),
                  }))}
                  className="h-10 w-20 rounded-md border border-input bg-secondary/20 px-3 text-sm font-normal text-white outline-none transition-colors focus:border-primary"
                />
              </label>
              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={activeAction !== '' && activeAction !== 'evaluate'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {activeAction === 'evaluate' ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
                Chạy đánh giá nhanh
              </button>
            </div>
          </div>

          <div className="p-5">
            {evaluation.available ? (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard icon={BarChart3} label="HitRate@K" value={formatPercent(evaluation.hitRateAtK)} note={`Top ${evaluation.k} recommendation mới nhất.`} />
                  <MetricCard icon={Database} label="Coverage" value={formatPercent(evaluation.coverage)} note="Tỷ lệ nhà hàng candidate từng xuất hiện trong sample đánh giá." />
                  <MetricCard icon={Sparkles} label="Evaluated Users" value={evaluation.evaluatedUsers} note={`Skipped: ${evaluation.skippedUsers}`} />
                  <MetricCard icon={AlertTriangle} label="Fallback Rate" value={formatPercent(evaluation.fallbackRate)} note="Tỷ lệ request phải fallback trong sample đánh giá." />
                  <MetricCard icon={Zap} label="Avg Recommendations" value={evaluation.averageRecommendations} note={`Sinh lúc ${formatDateTime(evaluation.generatedAt)}`} />
                </div>

                {evaluation.warnings.length ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-sm font-bold text-amber-100">Cảnh báo khi đánh giá</p>
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-amber-50">
                      {evaluation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {evaluation.limitations.length ? (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4">
                    <p className="text-sm font-bold text-white">Giới hạn hiện tại</p>
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                      {evaluation.limitations.map((limitation) => (
                        <li key={limitation}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-secondary/15 p-6">
                <p className="text-sm font-bold text-white">
                  {evaluation.warning === 'INSUFFICIENT_EVALUATION_DATA'
                    ? 'Chưa đủ dữ liệu evaluation'
                    : 'Chưa có dữ liệu evaluation'}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {evaluation.message || 'Recommendation hiện chưa có đủ dữ liệu để tạo metric aggregate đáng tin cậy.'}
                </p>
                {evaluation.limitations.length ? (
                  <ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
                    {evaluation.limitations.map((limitation) => (
                      <li key={limitation}>{limitation}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-white">Latest Runs</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Theo dõi rebuild và evaluation gần nhất, chỉ giữ aggregate stats thay vì dữ liệu người dùng thô.
            </p>
          </div>

          {runs.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3">Run</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Started</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3 text-right">Interactions</th>
                      <th className="px-5 py-3 text-right">Profiles</th>
                      <th className="px-5 py-3">Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {runs.map((run) => (
                      <tr key={run.id} className="align-top transition-colors hover:bg-secondary/20">
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{RUN_TYPE_LABELS[run.runType] || run.runType}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{run.algorithmVersion || 'Không rõ version'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={run.status} type="run" />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDateTime(run.startedAt)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDuration(run.durationMs)}</td>
                        <td className="px-5 py-4 text-right text-white">{run.stats.interactionsCreated}</td>
                        <td className="px-5 py-4 text-right text-white">
                          {run.stats.userProfilesGenerated + run.stats.itemProfilesGenerated}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {run.warnings.length ? run.warnings.join(' | ') : 'Không có'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden" data-testid="recommendation-runs-mobile">
                {runs.map((run) => (
                  <article key={run.id} className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{RUN_TYPE_LABELS[run.runType] || run.runType}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(run.startedAt)}</p>
                      </div>
                      <StatusBadge status={run.status} type="run" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg border border-border bg-secondary/20 p-3">
                        <p className="text-muted-foreground">Duration</p>
                        <p className="mt-1 font-bold text-white">{formatDuration(run.durationMs)}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/20 p-3">
                        <p className="text-muted-foreground">Interactions</p>
                        <p className="mt-1 font-bold text-white">{run.stats.interactionsCreated}</p>
                      </div>
                    </div>
                    {run.warnings.length ? (
                      <p className="text-xs leading-5 text-amber-100">{run.warnings.join(' | ')}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              Chưa có lịch sử rebuild hoặc evaluation recommendation.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck size={18} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Privacy Note</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dashboard chỉ hiển thị thống kê tổng hợp, không hiển thị lịch sử cá nhân hay dữ liệu nhạy cảm của khách hàng.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
