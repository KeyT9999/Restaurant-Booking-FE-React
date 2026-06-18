import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelPendingAction,
  confirmPendingAction,
  getOrCreateConfirmIdempotencyKey,
  streamAIMessage,
} from '../../api/aiApi';
import CustomerAIWidget from './CustomerAIWidget';

vi.mock('../../api/aiApi', () => ({
  cancelPendingAction: vi.fn(),
  confirmPendingAction: vi.fn(),
  getOrCreateConfirmIdempotencyKey: vi.fn(),
  streamAIMessage: vi.fn(),
}));

const renderWidget = (path = '/') => render(
  <MemoryRouter initialEntries={[path]}>
    <CustomerAIWidget />
  </MemoryRouter>,
);

const openWidget = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Mở Trợ lý BookEat' }));
};

const sendDraft = (message) => {
  const textarea = screen.getByLabelText('Tin nhắn cho Trợ lý BookEat');
  fireEvent.change(textarea, { target: { value: message } });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi tin nhắn' }));
};

const emitSuccessfulStream = async (onEvent, text = 'Xin chào') => {
  onEvent({ event: 'start', data: { sequence: 0 } });
  onEvent({ event: 'delta', data: { sequence: 1, text } });
  onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
  onEvent({ event: 'done', data: { sequence: 3 } });
};

const restaurantListResult = {
  type: 'restaurant_list',
  version: 1,
  payload: {
    sourceLabel: 'BookEat public restaurants',
    total: 1,
    restaurants: [{
      id: '507f1f77bcf86cd799439011',
      name: 'Pho BookEat',
      description: 'Quán phở public',
      address: 'Quận 1, TP.HCM',
      cuisineType: 'Việt Nam',
      averageRating: 4.6,
      reviewCount: 12,
      averagePrice: 120000,
      detailUrl: '/restaurants/507f1f77bcf86cd799439011',
    }],
  },
};

const availabilityResult = {
  type: 'availability_result',
  version: 1,
  payload: {
    status: 'available',
    available: true,
    restaurant: {
      id: '507f1f77bcf86cd799439011',
      name: 'Pho BookEat',
      detailUrl: '/restaurants/507f1f77bcf86cd799439011',
    },
    bookingDate: '2026-06-25',
    bookingTime: '19:00',
    numberOfGuests: 4,
    timezone: 'Asia/Ho_Chi_Minh',
    suggestedTables: [{ tableNumber: 'A1', capacity: 4, zone: 'Main' }],
    conflicts: [],
    checkedAt: '2026-06-18T03:00:00.000Z',
    disclaimer: 'K\u1ebft qu\u1ea3 s\u1ebd \u0111\u01b0\u1ee3c ki\u1ec3m tra l\u1ea1i khi \u0111\u1eb7t b\u00e0n.',
    bookingUrl: '/restaurants/507f1f77bcf86cd799439011?bookingDate=2026-06-25&bookingTime=19%3A00&guests=4',
  },
};

const voucherLoginResult = {
  type: 'voucher_result',
  version: 1,
  payload: {
    valid: false,
    status: 'auth_required',
    authRequired: true,
    code: 'BOOKEAT10',
    reason: 'B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp t\u00e0i kho\u1ea3n kh\u00e1ch h\u00e0ng \u0111\u1ec3 ki\u1ec3m tra voucher.',
    loginUrl: '/auth/login',
    discountAmountEstimate: 0,
    orderAmountEstimate: null,
    disclaimer: 'Voucher s\u1ebd \u0111\u01b0\u1ee3c ki\u1ec3m tra l\u1ea1i trong lu\u1ed3ng \u0111\u1eb7t b\u00e0n.',
  },
};

const knowledgeAnswerResult = {
  type: 'knowledge_answer',
  version: 1,
  payload: {
    found: true,
    title: 'Chính sách hủy bàn BookEat',
    answer: 'Khách có thể xem lựa chọn hủy trong trang booking. Điều kiện hủy phụ thuộc nhà hàng và trạng thái booking.',
    matchedSources: [{
      title: 'Chính sách hủy bàn BookEat',
      sourceLabel: 'BookEat Knowledge Base',
      category: 'policy',
      version: 1,
      updatedAt: '2026-06-10T00:00:00.000Z',
    }],
    category: 'policy',
    updatedAt: '2026-06-10T00:00:00.000Z',
    disclaimer: 'Thông tin này được lấy từ knowledge base đã published của BookEat.',
  },
};

const createBookingPreviewResult = () => ({
  type: 'booking_preview',
  version: 1,
  payload: {
    pendingActionId: '507f1f77bcf86cd799439012',
    actionType: 'prepare_booking',
    status: 'pending',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    confirmEnabled: true,
    preview: {
      restaurant: {
        id: '507f1f77bcf86cd799439011',
        name: 'Pho BookEat',
        address: 'Quận 1, TP.HCM',
      },
      bookingDate: '2026-06-25',
      bookingTime: '19:00',
      numberOfGuests: 4,
      tableNumbers: ['A1'],
      contact: {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'a@example.com',
      },
      occasion: 'birthday',
      specialRequests: 'Gần cửa sổ',
      depositAmount: 200000,
      voucher: {
        code: 'BOOKEAT10',
        discountAmount: 20000,
      },
      discountAmount: 20000,
      amountDue: 180000,
      disclaimer: 'Đây là bản xem trước, chưa phải booking thật.',
    },
  },
});

describe('CustomerAIWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cancelPendingAction.mockResolvedValue({
      success: true,
      data: { status: 'cancelled' },
    });
    getOrCreateConfirmIdempotencyKey.mockReturnValue('confirm-key-12345678');
    confirmPendingAction.mockResolvedValue({
      success: true,
      data: {
        pendingAction: {
          id: '507f1f77bcf86cd799439012',
          status: 'confirmed',
        },
        booking: {
          id: '507f1f77bcf86cd799439099',
          status: 'pending',
          restaurantId: '507f1f77bcf86cd799439011',
          bookingDate: '2026-06-25',
          bookingTime: '19:00',
          numberOfGuests: 4,
          tableNumbers: ['A1'],
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('opens and closes independently', () => {
    renderWidget();
    openWidget();

    expect(screen.getByRole('region', { name: 'Trợ lý BookEat' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng Trợ lý BookEat' }));
    expect(screen.queryByRole('region', { name: 'Trợ lý BookEat' })).toBeNull();
  });

  it('does not render on owner and admin routes', () => {
    const { unmount } = renderWidget('/owner/dashboard');
    expect(screen.queryByRole('button', { name: 'Mở Trợ lý BookEat' })).toBeNull();
    unmount();

    renderWidget('/admin/dashboard');
    expect(screen.queryByRole('button', { name: 'Mở Trợ lý BookEat' })).toBeNull();
  });

  it('does not send an empty draft', () => {
    renderWidget();
    openWidget();

    expect(screen.getByRole('button', { name: 'Gửi tin nhắn' }).disabled).toBe(true);
    expect(streamAIMessage).not.toHaveBeenCalled();
  });

  it('renders loading, appends deltas, and completes the assistant message', async () => {
    let streamControl;
    streamAIMessage.mockImplementation(({ onEvent }) => new Promise((resolve) => {
      streamControl = { onEvent, resolve };
    }));
    renderWidget();
    openWidget();
    sendDraft('  Xin chào  ');

    expect(screen.getByText('Xin chào')).toBeTruthy();
    expect(screen.getByText('Đang phản hồi...')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dừng phản hồi' })).toBeTruthy();
    expect(streamAIMessage).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Xin chào',
      history: [],
      pageContext: null,
    }));

    await act(async () => {
      streamControl.onEvent({ event: 'start', data: { sequence: 0 } });
      streamControl.onEvent({ event: 'delta', data: { sequence: 1, text: 'BookEat ' } });
      streamControl.onEvent({ event: 'delta', data: { sequence: 2, text: 'xin chào' } });
      streamControl.onEvent({ event: 'completed', data: { sequence: 3, usage: {} } });
      streamControl.onEvent({ event: 'done', data: { sequence: 4 } });
      streamControl.resolve();
    });

    expect(await screen.findByText('BookEat xin chào')).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Dừng phản hồi' })).toBeNull());
  });

  it('renders restaurant result cards and sends restaurants page context', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'search_restaurants', label: 'Đang tìm nhà hàng...' },
      });
      onEvent({
        event: 'tool_completed',
        data: { sequence: 2, tool: 'search_restaurants', status: 'success' },
      });
      onEvent({ event: 'result', data: { sequence: 3, result: restaurantListResult } });
      onEvent({ event: 'delta', data: { sequence: 4, text: 'Tìm thấy một nhà hàng phù hợp.' } });
      onEvent({ event: 'completed', data: { sequence: 5, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 6 } });
    });

    renderWidget('/restaurants');
    openWidget();
    sendDraft('Tìm phở');

    expect(await screen.findByText('Pho BookEat')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Xem chi tiết/i }).getAttribute('href')).toBe(
      '/restaurants/507f1f77bcf86cd799439011',
    );
    expect(streamAIMessage).toHaveBeenCalledWith(expect.objectContaining({
      pageContext: { route: '/restaurants' },
    }));
  });

  it('renders availability result cards with suggested tables', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'check_table_availability', label: '\u0110ang ki\u1ec3m tra b\u00e0n tr\u1ed1ng...' },
      });
      onEvent({
        event: 'tool_completed',
        data: { sequence: 2, tool: 'check_table_availability', status: 'success' },
      });
      onEvent({ event: 'result', data: { sequence: 3, result: availabilityResult } });
      onEvent({ event: 'delta', data: { sequence: 4, text: 'Khung gi\u1edd n\u00e0y c\u00f2n b\u00e0n.' } });
      onEvent({ event: 'completed', data: { sequence: 5, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 6 } });
    });

    renderWidget('/restaurants/507f1f77bcf86cd799439011');
    openWidget();
    sendDraft('T\u1ed1i nay 19h c\u00f2n b\u00e0n cho 4 ng\u01b0\u1eddi kh\u00f4ng?');

    expect(await screen.findByText('Còn bàn phù hợp')).toBeTruthy();
    expect(screen.getByText('Bàn A1')).toBeTruthy();
    expect(screen.getAllByText(/4 người/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Mở trang đặt bàn/i }).getAttribute('href')).toContain(
      '/restaurants/507f1f77bcf86cd799439011',
    );
  });

  it('renders voucher login-required cards without a retry alert', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'validate_voucher', label: '\u0110ang ki\u1ec3m tra voucher...' },
      });
      onEvent({
        event: 'tool_completed',
        data: {
          sequence: 2,
          tool: 'validate_voucher',
          status: 'forbidden',
          errorCode: 'AUTH_REQUIRED',
          message: 'B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 ki\u1ec3m tra d\u1eef li\u1ec7u n\u00e0y.',
        },
      });
      onEvent({ event: 'result', data: { sequence: 3, result: voucherLoginResult } });
      onEvent({ event: 'delta', data: { sequence: 4, text: 'B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 ki\u1ec3m tra voucher.' } });
      onEvent({ event: 'completed', data: { sequence: 5, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 6 } });
    });

    renderWidget();
    openWidget();
    sendDraft('Voucher BOOKEAT10 có dùng được không?');

    expect(await screen.findByText('Cần đăng nhập')).toBeTruthy();
    expect(screen.getByText(/Voucher BOOKEAT10/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Đăng nhập để kiểm tra/i }).getAttribute('href')).toBe('/auth/login');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders knowledge answers with internal source citations', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'search_knowledge', label: 'Đang tìm tài liệu hỗ trợ...' },
      });
      onEvent({
        event: 'tool_completed',
        data: { sequence: 2, tool: 'search_knowledge', status: 'success' },
      });
      onEvent({ event: 'result', data: { sequence: 3, result: knowledgeAnswerResult } });
      onEvent({ event: 'delta', data: { sequence: 4, text: 'Đây là chính sách từ nguồn nội bộ BookEat.' } });
      onEvent({ event: 'completed', data: { sequence: 5, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 6 } });
    });

    renderWidget();
    openWidget();
    sendDraft('Chính sách hủy bàn là gì?');

    expect((await screen.findAllByText('Chính sách hủy bàn BookEat')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Điều kiện hủy phụ thuộc nhà hàng/)).toBeTruthy();
    expect(screen.getByText('Nguồn nội bộ')).toBeTruthy();
    expect(screen.getByText(/BookEat Knowledge Base/)).toBeTruthy();
    expect(screen.getByText(/knowledge base đã published/)).toBeTruthy();
  });

  it('renders booking preview with confirm enabled and cancels only the pending action', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'prepare_booking', label: 'Đang tạo bản xem trước đặt bàn...' },
      });
      onEvent({
        event: 'tool_completed',
        data: { sequence: 2, tool: 'prepare_booking', status: 'success' },
      });
      onEvent({ event: 'result', data: { sequence: 3, result: bookingPreviewResult } });
      onEvent({ event: 'delta', data: { sequence: 4, text: 'Mời bạn kiểm tra bản xem trước.' } });
      onEvent({ event: 'completed', data: { sequence: 5, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 6 } });
    });

    renderWidget('/restaurants/507f1f77bcf86cd799439011');
    openWidget();
    sendDraft('Đặt bàn 4 người ngày 25/06 lúc 19h ở nhà hàng này');

    expect(await screen.findByText('Chưa đặt bàn')).toBeTruthy();
    expect(screen.getByText('Pho BookEat')).toBeTruthy();
    expect(screen.getByText('Bàn A1')).toBeTruthy();
    expect(screen.getByText(/Voucher BOOKEAT10/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Xác nhận đặt bàn' }).disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    await waitFor(() => expect(cancelPendingAction).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
    ));
    expect(await screen.findByText('Đã hủy bản xem trước')).toBeTruthy();
  });

  it('confirms once on double click, shows progress, then renders booking success links', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({ event: 'result', data: { sequence: 1, result: bookingPreviewResult } });
      onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 3 } });
    });

    let resolveConfirm;
    confirmPendingAction.mockImplementation(() => new Promise((resolve) => {
      resolveConfirm = resolve;
    }));

    renderWidget();
    openWidget();
    sendDraft('Tạo preview để xác nhận');

    const confirmButton = await screen.findByRole('button', { name: 'Xác nhận đặt bàn' });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(confirmPendingAction).toHaveBeenCalledTimes(1);
    expect(confirmPendingAction).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
      'confirm-key-12345678',
    );
    expect(await screen.findByText('Đang xác nhận đặt bàn')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hủy' }).disabled).toBe(true);

    await act(async () => {
      resolveConfirm({
        success: true,
        data: {
          pendingAction: {
            id: '507f1f77bcf86cd799439012',
            status: 'confirmed',
          },
          booking: {
            id: '507f1f77bcf86cd799439099',
            status: 'pending',
            restaurantId: '507f1f77bcf86cd799439011',
            bookingDate: '2026-06-25',
            bookingTime: '19:00',
            numberOfGuests: 4,
            tableNumbers: ['A1'],
          },
        },
      });
    });

    expect(await screen.findByText('Đã tạo booking')).toBeTruthy();
    expect(screen.getByText('507f1f77bcf86cd799439099')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Xem booking' }).getAttribute('href')).toBe(
      '/bookings/507f1f77bcf86cd799439099',
    );
    expect(screen.getByRole('link', { name: 'My Bookings' }).getAttribute('href')).toBe(
      '/my-bookings',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đóng Trợ lý BookEat' }));
    openWidget();
    expect(screen.getByText('Đã tạo booking')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xác nhận đặt bàn' })).toBeNull();
  });

  it('shows a clear table conflict and offers preparing a new preview', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({ event: 'result', data: { sequence: 1, result: bookingPreviewResult } });
      onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 3 } });
    });
    confirmPendingAction.mockRejectedValue({
      message: 'Bàn không còn trống',
      raw: {
        response: {
          data: {
            code: 'TABLE_NO_LONGER_AVAILABLE',
          },
        },
      },
    });

    renderWidget();
    openWidget();
    sendDraft('Tạo preview xung đột');
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận đặt bàn' }));

    expect(await screen.findByText(/Bàn vừa hết trong lúc bạn kiểm tra/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chuẩn bị lại' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Xác nhận đặt bàn' }).disabled).toBe(true);
  });

  it('shows a clear voucher-invalid state and offers preparing a new preview', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({ event: 'result', data: { sequence: 1, result: bookingPreviewResult } });
      onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 3 } });
    });
    confirmPendingAction.mockRejectedValue({
      message: 'Voucher đã hết hạn',
      raw: {
        response: {
          data: {
            code: 'VOUCHER_NO_LONGER_VALID',
          },
        },
      },
    });

    renderWidget();
    openWidget();
    sendDraft('Tạo preview có voucher hết hạn');
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận đặt bàn' }));

    expect(await screen.findByText(/Voucher không còn hợp lệ/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chuẩn bị lại' })).toBeTruthy();
  });

  it('returns booking preview editing to the conversation composer', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({ event: 'result', data: { sequence: 1, result: bookingPreviewResult } });
      onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 3 } });
    });

    renderWidget();
    openWidget();
    sendDraft('Tạo preview');

    fireEvent.click(await screen.findByRole('button', { name: 'Chỉnh sửa' }));
    expect(screen.getByRole('textbox').value).toContain(
      'Tôi muốn chỉnh sửa bản xem trước đặt bàn tại Pho BookEat',
    );
  });

  it('marks an expired preview and disables cancel controls', async () => {
    const bookingPreviewResult = createBookingPreviewResult();
    bookingPreviewResult.payload.expiresAt = new Date(Date.now() - 1000).toISOString();
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({ event: 'result', data: { sequence: 1, result: bookingPreviewResult } });
      onEvent({ event: 'completed', data: { sequence: 2, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 3 } });
    });

    renderWidget();
    openWidget();
    sendDraft('Tạo preview hết hạn');

    expect(await screen.findByText('Bản xem trước đã hết hạn')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hủy' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Xác nhận đặt bàn' }).disabled).toBe(true);
  });

  it('sends restaurant detail page context without auto-sending a prompt', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => emitSuccessfulStream(onEvent, 'Menu đang được tải'));
    renderWidget('/restaurants/507f1f77bcf86cd799439011');
    openWidget();

    expect(streamAIMessage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cho tôi xem menu nhà hàng này' }));
    sendDraft('Cho tôi xem menu nhà hàng này');

    await waitFor(() => expect(streamAIMessage).toHaveBeenCalledWith(expect.objectContaining({
      pageContext: {
        route: '/restaurants/507f1f77bcf86cd799439011',
        restaurantId: '507f1f77bcf86cd799439011',
      },
    })));
  });

  it('shows a retryable tool error for the current message', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => {
      onEvent({ event: 'start', data: { sequence: 0 } });
      onEvent({
        event: 'tool_started',
        data: { sequence: 1, tool: 'get_booking_policy', label: 'Đang kiểm tra chính sách...' },
      });
      onEvent({
        event: 'tool_completed',
        data: {
          sequence: 2,
          tool: 'get_booking_policy',
          status: 'failed',
          errorCode: 'POLICY_NOT_FOUND',
          message: 'Không tìm thấy nguồn chính sách công khai phù hợp.',
        },
      });
      onEvent({ event: 'delta', data: { sequence: 3, text: 'Chưa có nguồn public cho chính sách này.' } });
      onEvent({ event: 'completed', data: { sequence: 4, usage: {} } });
      onEvent({ event: 'done', data: { sequence: 5 } });
    });

    renderWidget();
    openWidget();
    sendDraft('Chính sách hủy bàn?');

    expect(await screen.findByText('Không tìm thấy nguồn chính sách công khai phù hợp.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeTruthy();
  });

  it('keeps partial text, marks failure, and retries without duplicating the user message', async () => {
    streamAIMessage
      .mockImplementationOnce(async ({ onEvent }) => {
        onEvent({ event: 'start', data: { sequence: 0 } });
        onEvent({ event: 'delta', data: { sequence: 1, text: 'Phần đầu' } });
        throw Object.assign(new Error('Backend đang gián đoạn'), { code: 'AI_UNAVAILABLE' });
      })
      .mockImplementationOnce(async ({ onEvent }) => emitSuccessfulStream(onEvent, 'Đã kết nối lại'));

    renderWidget();
    openWidget();
    sendDraft('Kiểm tra kết nối');

    expect(await screen.findByText('BookEat: AI assistant is temporarily unavailable.')).toBeTruthy();
    expect(screen.getByText('Phần đầu')).toBeTruthy();
    expect(screen.getByText('Phản hồi bị gián đoạn')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('Đã kết nối lại')).toBeTruthy();
    expect(screen.getAllByText('Kiểm tra kết nối')).toHaveLength(1);
    expect(streamAIMessage).toHaveBeenCalledTimes(2);
  });

  it('shows a non-retryable disabled state when the AI kill switch is off', async () => {
    const disabledError = new Error('raw disabled detail');
    disabledError.code = 'AI_DISABLED';
    disabledError.retryable = false;
    streamAIMessage.mockRejectedValueOnce(disabledError);

    renderWidget();
    openWidget();
    sendDraft('AI disabled?');

    expect(await screen.findByText('BookEat: AI assistant is temporarily disabled.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Thá»­ láº¡i' })).toBeNull();
  });

  it('stops the active stream and marks the message cancelled', async () => {
    streamAIMessage.mockImplementation(({ signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        reject(Object.assign(new Error('Stopped'), { code: 'AI_CANCELLED' }));
      }, { once: true });
    }));
    renderWidget();
    openWidget();
    sendDraft('Dừng thử');

    fireEvent.click(screen.getByRole('button', { name: 'Dừng phản hồi' }));

    expect(await screen.findByText('Phản hồi đã được dừng.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('closing the widget does not abort an active stream', async () => {
    let streamControl;
    streamAIMessage.mockImplementation(({ signal, onEvent }) => new Promise((resolve) => {
      streamControl = { signal, onEvent, resolve };
    }));
    renderWidget();
    openWidget();
    sendDraft('Tiếp tục chạy');

    fireEvent.click(screen.getByRole('button', { name: 'Đóng Trợ lý BookEat' }));
    expect(streamControl.signal.aborted).toBe(false);
    openWidget();
    expect(screen.getByText('Đang phản hồi...')).toBeTruthy();

    await act(async () => {
      await emitSuccessfulStream(streamControl.onEvent, 'Hoàn tất');
      streamControl.resolve();
    });
    expect(await screen.findByText('Hoàn tất')).toBeTruthy();
  });

  it('renders model output as text instead of HTML', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => (
      emitSuccessfulStream(onEvent, '<script>alert("x")</script>')
    ));
    const { container } = renderWidget();
    openWidget();
    sendDraft('HTML');

    expect(await screen.findByText('<script>alert("x")</script>')).toBeTruthy();
    expect(container.querySelector('script')).toBeNull();
  });

  it('uses Shift+Enter for a new line and Enter to send', async () => {
    streamAIMessage.mockImplementation(async ({ onEvent }) => emitSuccessfulStream(onEvent, 'Đã nhận'));
    renderWidget();
    openWidget();

    const textarea = screen.getByLabelText('Tin nhắn cho Trợ lý BookEat');
    fireEvent.change(textarea, { target: { value: 'Dòng một' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(streamAIMessage).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    await waitFor(() => expect(streamAIMessage).toHaveBeenCalledTimes(1));
  });
});
