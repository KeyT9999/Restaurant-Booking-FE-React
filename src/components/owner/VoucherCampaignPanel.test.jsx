import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VoucherCampaignPanel from './VoucherCampaignPanel';

afterEach(cleanup);

const data = {
  vouchers: [
    {
      _id: 'voucher-1',
      code: 'SAVE15',
      discountType: 'percentage',
      discountValue: 15,
      isCampaignEligible: true,
    },
    {
      _id: 'voucher-disabled',
      code: 'PAUSED',
      discountType: 'percentage',
      discountValue: 5,
      isCampaignEligible: false,
    },
  ],
  packages: [
    {
      code: 'VOUCHER_HOME_7D',
      placement: 'homepage',
      amount: 79000,
      durationDays: 7,
      priorityWeight: 10,
      benefits: ['Noi bat tren trang chu'],
    },
    {
      code: 'VOUCHER_SEARCH_7D',
      placement: 'search_boost',
      amount: 69000,
      durationDays: 7,
      priorityWeight: 10,
      benefits: ['Uu tien tim kiem'],
    },
    {
      code: 'VOUCHER_AI_7D',
      placement: 'ai_suggestion',
      amount: 99000,
      durationDays: 7,
      priorityWeight: 10,
      benefits: ['Uu tien goi y AI'],
    },
  ],
  pendingPayment: {
    orderCode: 178188530001,
    targetType: 'voucher_campaign',
    description: 'QC voucher SAVE15',
    amount: 79000,
  },
  campaigns: [
    {
      _id: 'campaign-1',
      voucherId: { code: 'SAVE15' },
      paymentId: { status: 'paid' },
      packageCode: 'VOUCHER_HOME_7D',
      placement: 'homepage',
      status: 'active',
      startAt: '2026-06-20T00:00:00.000Z',
      endAt: '2026-06-27T00:00:00.000Z',
    },
  ],
};

const renderPanel = (props = {}) => render(
  <MemoryRouter>
    <VoucherCampaignPanel
      data={data}
      loading={false}
      error={null}
      canBuy
      paymentLoading={false}
      onCheckout={vi.fn()}
      onContinuePayment={vi.fn()}
      {...props}
    />
  </MemoryRouter>
);

describe('VoucherCampaignPanel', () => {
  it('shows eligible vouchers, all placements, pending payment and history', () => {
    renderPanel();

    expect(screen.getByRole('option', { name: 'SAVE15 - Giảm 15%' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'PAUSED - Giảm 5%' })).toBeNull();
    expect(screen.getAllByText('Trang chủ')).toHaveLength(2);
    expect(screen.getByText('Search boost')).toBeTruthy();
    expect(screen.getByText('AI suggestion')).toBeTruthy();
    expect(screen.getByText('Chiến dịch đang chờ thanh toán')).toBeTruthy();
    expect(screen.getByText('VOUCHER_HOME_7D')).toBeTruthy();
    expect(screen.getByText('paid')).toBeTruthy();
  });

  it('checks out the selected voucher with the backend package code', () => {
    const onCheckout = vi.fn();
    renderPanel({ onCheckout });

    fireEvent.change(screen.getByLabelText('Voucher sẽ được quảng bá'), {
      target: { value: 'voucher-1' },
    });
    const buttons = screen.getAllByRole('button', { name: 'Mua chiến dịch' });
    fireEvent.click(buttons[0]);

    expect(onCheckout).toHaveBeenCalledWith({
      voucherId: 'voucher-1',
      packageCode: 'VOUCHER_HOME_7D',
    });
  });
});
