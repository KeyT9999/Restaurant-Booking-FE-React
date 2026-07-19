import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CancellationModal from './CancellationModal';

const preview = {
  canCancel: true,
  depositPaid: 300000,
  cancellationFeeRateBasisPoints: 3000,
  cancellationFeeAmount: 90000,
  refundAmount: 210000,
  message: 'Hủy trước giờ hẹn dưới 2 giờ.',
};

afterEach(cleanup);

const renderModal = (overrides = {}) => {
  const props = {
    open: true,
    preview,
    loading: false,
    reason: '',
    onReasonChange: vi.fn(),
    accepted: false,
    onAcceptedChange: vi.fn(),
    submitting: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    booking: { id: '0000000000000000BE123456' },
    ...overrides,
  };
  render(<CancellationModal {...props} />);
  return props;
};

describe('CancellationModal', () => {
  it('shows deposit, fee and server-calculated wallet refund', () => {
    renderModal();
    expect(screen.getByText('300.000đ')).toBeTruthy();
    expect(screen.getByText('90.000đ')).toBeTruthy();
    expect(screen.getAllByText('210.000đ').length).toBeGreaterThan(0);
    expect(screen.getByText(/không tự động hoàn về tài khoản ngân hàng/i)).toBeTruthy();
  });

  it('requires acknowledgement and prevents submit while pending', () => {
    const first = renderModal();
    expect(screen.getByRole('button', { name: /Hủy và nhận lại/i }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(first.onAcceptedChange).toHaveBeenCalledWith(true);

    cleanup();
    const pending = renderModal({ accepted: true, submitting: true });
    const pendingButton = screen.getByRole('button', { name: /Đang hủy/i });
    fireEvent.click(pendingButton);
    expect(pendingButton.disabled).toBe(true);
    expect(pending.onConfirm).not.toHaveBeenCalled();
  });
});
