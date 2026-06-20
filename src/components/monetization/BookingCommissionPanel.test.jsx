import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookingCommissionPanel from './BookingCommissionPanel';
import {
  adminGetBookingCommissions,
  getOwnerBookingCommissions,
} from '../../api/paymentApi';

vi.mock('../../api/paymentApi', () => ({
  adminGetBookingCommissions: vi.fn(),
  getOwnerBookingCommissions: vi.fn(),
}));

const response = {
  data: {
    summary: {
      totalPending: 0,
      totalBillable: 5000,
      totalWaived: 0,
      totalCancelled: 0,
      projectedCommission: 5000,
      billableCommission: 5000,
      waivedCommission: 0,
      cancelledCommission: 0,
      counts: { pending: 0, billable: 1, waived: 0, cancelled: 0 },
    },
    items: [
      {
        id: 'ledger-1',
        bookingId: '507f1f77bcf86cd799439013',
        restaurantId: 'restaurant-1',
        restaurantName: 'Bếp Mùa Hạ',
        ownerId: 'owner-1',
        ownerName: 'Nguyễn An',
        bookingDate: '2026-06-20T00:00:00.000Z',
        bookingTime: '18:30',
        planCodeAtBooking: 'free',
        commissionAmount: 5000,
        status: 'billable',
        reason: 'Phí cố định cho booking hoàn thành theo gói FREE.',
        createdAt: '2026-06-20T12:00:00.000Z',
      },
    ],
    pagination: { page: 1, totalPages: 1, total: 1 },
  },
};

beforeEach(() => {
  getOwnerBookingCommissions.mockResolvedValue(response);
  adminGetBookingCommissions.mockResolvedValue(response);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('BookingCommissionPanel', () => {
  it('renders owner summary, ledger data and sends restaurant/status filters', async () => {
    render(
      <BookingCommissionPanel
        mode="owner"
        restaurants={[{ id: 'restaurant-1', name: 'Bếp Mùa Hạ' }]}
        initialRestaurantId="restaurant-1"
      />
    );

    expect(await screen.findAllByText('Bếp Mùa Hạ')).not.toHaveLength(0);
    expect(screen.getAllByText((content) => content.includes('5.000')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Có thể tính').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'billable' } });
    await waitFor(() => {
      expect(getOwnerBookingCommissions).toHaveBeenLastCalledWith(expect.objectContaining({
        restaurantId: 'restaurant-1',
        status: 'billable',
      }));
    });
  });

  it('renders admin owner details and uses the admin endpoint', async () => {
    render(<BookingCommissionPanel mode="admin" />);

    expect(await screen.findAllByText('Nguyễn An')).not.toHaveLength(0);
    expect(adminGetBookingCommissions).toHaveBeenCalled();
    expect(getOwnerBookingCommissions).not.toHaveBeenCalled();
  });

  it('shows a designed empty state', async () => {
    getOwnerBookingCommissions.mockResolvedValue({
      data: { ...response.data, items: [], pagination: { page: 1, totalPages: 1, total: 0 } },
    });
    render(<BookingCommissionPanel mode="owner" />);
    expect(await screen.findByText('Chưa có phí booking')).toBeTruthy();
  });
});
