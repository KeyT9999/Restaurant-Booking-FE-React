import { Sparkles, TrendingUp } from 'lucide-react';
import { Section } from '../bookeat/Section';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export default function RecommendationSection({
  title,
  subtitle,
  note,
  action,
  personalized = false,
  children,
}) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      action={action}
    >
      <Card className="border-border bg-card/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge
              className={personalized
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-border bg-secondary text-secondary-foreground'}
              variant="outline"
            >
              {personalized ? <Sparkles size={12} aria-hidden="true" /> : <TrendingUp size={12} aria-hidden="true" />}
              {personalized ? 'Cá nhân hóa' : 'Phổ biến'}
            </Badge>
            {note ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
      {children}
    </Section>
  );
}
