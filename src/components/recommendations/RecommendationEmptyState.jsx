import { Link } from 'react-router-dom';
import { AlertTriangle, LogIn, RefreshCcw, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const ICONS = {
  empty: Sparkles,
  error: AlertTriangle,
};

export default function RecommendationEmptyState({
  variant = 'empty',
  title,
  description,
  retryLabel = 'Thử lại',
  onRetry,
  loginCta = false,
  loginHref = `/auth/login?redirect=${encodeURIComponent('/')}`,
}) {
  const Icon = ICONS[variant] || Sparkles;

  return (
    <Card className="border-dashed border-border bg-card/40 p-6 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col items-center gap-2 pt-2 sm:flex-row">
          {typeof onRetry === 'function' ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RefreshCcw size={14} aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : null}
          {loginCta ? (
            <Button asChild size="sm">
              <Link to={loginHref}>
                <LogIn size={14} aria-hidden="true" />
                Đăng nhập
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
