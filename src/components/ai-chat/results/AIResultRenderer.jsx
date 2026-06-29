import { AlertTriangle } from 'lucide-react';
import AIRestaurantDetailCard from './AIRestaurantDetailCard';
import { AIRestaurantResultList } from './AIRestaurantResultCard';
import { AIMenuResultList } from './AIMenuResultCard';
import AIPolicyAnswer from './AIPolicyAnswer';
import AIKnowledgeAnswer from './AIKnowledgeAnswer';
import AIAvailabilityResultCard from './AIAvailabilityResultCard';
import AIVoucherResultCard from './AIVoucherResultCard';
import AIBookingPreviewCard from './AIBookingPreviewCard';
import AIPersonalizedRecommendationCard from './AIPersonalizedRecommendationCard';
import {
  AIOwnerBookingSearchCard,
  AIOwnerBookingSummaryCard,
  AIOwnerRevenueSummaryCard,
  AIOwnerReviewReplySuggestionCard,
  AIOwnerReviewSummaryCard,
  AIOwnerTableAvailabilityCard,
  AIOwnerVoucherSummaryCard,
} from './AIOwnerResultCards';
import {
  AIAdminAbnormalActivityCard,
  AIAdminComplaintReplyDraftCard,
  AIAdminPendingRestaurantsCard,
  AIAdminRefundSummaryCard,
  AIAdminRevenueSummaryCard,
  AIAdminTransactionSummaryCard,
} from './AIAdminResultCards';

const RESULT_RENDERERS = {
  'restaurant_list@1': AIRestaurantResultList,
  'restaurant_detail@1': AIRestaurantDetailCard,
  'menu_list@1': AIMenuResultList,
  'policy_answer@1': AIPolicyAnswer,
  'knowledge_answer@1': AIKnowledgeAnswer,
  'personalized_recommendations@1': AIPersonalizedRecommendationCard,
  'availability_result@1': AIAvailabilityResultCard,
  'voucher_result@1': AIVoucherResultCard,
  'booking_preview@1': AIBookingPreviewCard,
  'owner_booking_summary@1': AIOwnerBookingSummaryCard,
  'owner_table_availability@1': AIOwnerTableAvailabilityCard,
  'owner_revenue_summary@1': AIOwnerRevenueSummaryCard,
  'owner_voucher_summary@1': AIOwnerVoucherSummaryCard,
  'owner_review_summary@1': AIOwnerReviewSummaryCard,
  'owner_booking_search_result@1': AIOwnerBookingSearchCard,
  'owner_review_reply_suggestion@1': AIOwnerReviewReplySuggestionCard,
  'admin_pending_restaurants@1': AIAdminPendingRestaurantsCard,
  'admin_transaction_summary@1': AIAdminTransactionSummaryCard,
  'admin_refund_summary@1': AIAdminRefundSummaryCard,
  'admin_revenue_summary@1': AIAdminRevenueSummaryCard,
  'admin_abnormal_activity@1': AIAdminAbnormalActivityCard,
  'admin_draft_reply@1': AIAdminComplaintReplyDraftCard,
  'admin_complaint_reply_draft@1': AIAdminComplaintReplyDraftCard,
};

export default function AIResultRenderer({
  result,
  onEditBookingPreview,
  onBookingConfirmed,
}) {
  const key = `${result?.type}@${result?.version}`;
  const Renderer = RESULT_RENDERERS[key];

  if (!Renderer) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-border bg-card/70 p-3 text-xs text-muted-foreground">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <span>Trợ lý nhận được kết quả có định dạng chưa được hỗ trợ.</span>
      </div>
    );
  }

  return (
    <Renderer
      payload={result.payload}
      {...(key === 'booking_preview@1' ? {
        onEdit: onEditBookingPreview,
        onConfirmed: onBookingConfirmed,
      } : {})}
    />
  );
}

export { RESULT_RENDERERS };
