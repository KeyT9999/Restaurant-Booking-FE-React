import { useState, useEffect, useRef, useCallback } from 'react';
import { holdTables, releaseHolds } from '../api/bookingApi';

export default function useTableHold(restaurantId) {
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [holdLoading, setHoldLoading] = useState(false);
  const [holdError, setHoldError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const activeRef = useRef({ restaurantId: null, date: null, time: null, tables: [] });
  const intervalRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (!holdExpiresAt) {
      setCountdown(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setHoldExpiresAt(null);
        setCountdown(null);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        activeRef.current = { restaurantId: null, date: null, time: null, tables: [] };
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [holdExpiresAt]);

  const hold = useCallback(async ({ bookingDate, bookingTime, tableNumbers }) => {
    if (!restaurantId || !bookingDate || !bookingTime || !tableNumbers?.length) return;

    setHoldLoading(true);
    setHoldError(null);

    try {
      await releaseHolds({
        restaurantId,
        bookingDate: activeRef.current.date,
        bookingTime: activeRef.current.time,
      });

      const res = await holdTables({ restaurantId, bookingDate, bookingTime, tableNumbers });
      if (res.success) {
        setHoldExpiresAt(res.data.expiresAt);
        activeRef.current = { restaurantId, date: bookingDate, time: bookingTime, tables: [...tableNumbers] };
      } else {
        setHoldError(res.message || 'Không thể giữ bàn');
      }
    } catch (err) {
      setHoldError(err.response?.data?.message || 'Lỗi giữ bàn');
    } finally {
      setHoldLoading(false);
    }
  }, [restaurantId]);

  const release = useCallback(async () => {
    const { date, time } = activeRef.current;
    if (date && time) {
      try {
        await releaseHolds({ restaurantId, bookingDate: date, bookingTime: time });
      } catch {
        // Silent cleanup
      }
    }
    setHoldExpiresAt(null);
    setCountdown(null);
    setHoldError(null);
    activeRef.current = { restaurantId: null, date: null, time: null, tables: [] };
  }, [restaurantId]);

  // Release on unmount
  useEffect(() => {
    return () => { release(); };
  }, [release]);

  return { hold, release, holdLoading, holdError, holdExpiresAt, countdown };
}
