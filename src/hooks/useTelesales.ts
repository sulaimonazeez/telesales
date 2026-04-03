import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppAction, Order } from '@/types/order';
import { 
  getMyQueue, 
  getMyStats, 
  getAvailableDAs, 
  loadCloser,
  getMyCloser,
  updateOrderStatus,
  assignDAtoOrder
} from '@/services/api';
import { mapApiOrder, mapApiDA } from '@/utils/mapOrder';
import { useToast } from '@/hooks/use-toast';

export function useTelesales(state: AppState, dispatch: React.Dispatch<AppAction>) {
  const { toast } = useToast();
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // ── Load initial data ──────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });

    try {
      const closerInfo = await getMyCloser();  // ✅ Wait for async closer info

      if (closerInfo) {
        dispatch({
          type: 'SET_CLOSER',
          closer: closerInfo.name,
          agentName: closerInfo.closer_name || closerInfo.name
        });
      }

      const closerName = closerInfo?.name;

      // Load orders, stats, and agents in parallel
      await Promise.all([
        refreshOrders(closerName),
        refreshStats(closerName),
        refreshDeliveryAgents(),
      ]);

    } catch (error) {
      console.error('Failed to load initial data:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load data' });
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [dispatch, toast]);

  // ── Refresh orders ────────────────────────────────────────
  const refreshOrders = useCallback(async (closer?: string) => {
    const user = closer || state.currentCloser;
    if (!user) return;

    try {
      const rawOrders = await getMyQueue(user);
      const orders = rawOrders.map(mapApiOrder);
      dispatch({ type: 'SET_ORDERS', orders });
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      toast({ title: 'Error', description: 'Failed to refresh orders', variant: 'destructive' });
    }
  }, [state.currentCloser, dispatch, toast]);

  // ── Refresh stats ─────────────────────────────────────────
  const refreshStats = useCallback(async (closer?: string) => {
    const user = closer || state.currentCloser;
    if (!user) return;

    try {
      const stats = await getMyStats(user, state.period);
      if (stats.success) {
        dispatch({
          type: 'SET_STATS',
          stats: {
            earnings: stats.earnings,
            closed: stats.closed,
            rate: stats.rate,
            assigned: stats.assigned,
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  }, [state.currentCloser, state.period, dispatch]);

  // ── Refresh delivery agents ───────────────────────────────
  const refreshDeliveryAgents = useCallback(async () => {
    try {
      const rawAgents = await getAvailableDAs('');
      const agents = rawAgents.map(mapApiDA);
      dispatch({ type: 'SET_DELIVERY_AGENTS', agents });
    } catch (error) {
      console.error('Failed to refresh delivery agents:', error);
    }
  }, [dispatch]);

  // ── API action handlers ───────────────────────────────────
  const confirmOrderApi = useCallback(async (orderId: string, upsellPackage?: string, upsellAmount?: number) => {
    try {
      const result = await updateOrderStatus(orderId, 'Confirmed', '', '');
      if (result.success) {
        dispatch({ type: 'CONFIRM_ORDER', orderId, upsellPackage, upsellAmount });
        toast({ title: 'Success', description: 'Order confirmed' });
        await refreshOrders();
      } else {
        throw new Error(result.error || 'Failed to confirm');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to confirm order', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  const cancelOrderApi = useCallback(async (orderId: string) => {
    try {
      const result = await updateOrderStatus(orderId, 'Cancelled', 'Cancelled by telesales', '');
      if (result.success) {
        dispatch({ type: 'CANCEL_ORDER', orderId });
        toast({ title: 'Success', description: 'Order cancelled' });
        await refreshOrders();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel order', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  const noAnswerApi = useCallback(async (orderId: string) => {
    try {
      const result = await updateOrderStatus(orderId, 'Pending', `No answer — ${new Date().toLocaleString()}`, '');
      if (result.success) {
        dispatch({ type: 'NO_ANSWER', orderId });
        toast({ title: 'Success', description: 'No answer recorded' });
        await refreshOrders();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to record', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  const scheduleCallbackApi = useCallback(async (orderId: string, date: string, time: string, reason: string) => {
    try {
      const note = `Call back: ${date} at ${time}${reason ? ' — ' + reason : ''}`;
      const result = await updateOrderStatus(orderId, 'Rescheduled', note, date);
      if (result.success) {
        dispatch({ type: 'SCHEDULE_CALLBACK', orderId, date, time, reason });
        toast({ title: 'Success', description: 'Call-back scheduled' });
        await refreshOrders();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to schedule', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  const assignRiderApi = useCallback(async (orderId: string, riderId: string, riderName: string) => {
    try {
      const result = await assignDAtoOrder(orderId, riderId);
      if (result.success) {
        dispatch({ type: 'ASSIGN_RIDER', orderId, riderId, riderName });
        toast({ title: 'Success', description: `${riderName} assigned` });
        await refreshOrders();
        await refreshDeliveryAgents();
      } else {
        throw new Error(result.error || 'Failed to assign');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to assign rider', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, refreshDeliveryAgents, toast]);

  const updateDeliveryStatusApi = useCallback(async (orderId: string, status: string) => {
    const statusMap: Record<string, string> = {
      'assigned': 'Assigned',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'rescheduled': 'Rescheduled',
      'cancelled': 'Cancelled',
    };
    
    try {
      const result = await updateOrderStatus(orderId, statusMap[status] || status, '', '');
      if (result.success) {
        dispatch({ type: 'UPDATE_DELIVERY_STATUS', orderId, status });
        toast({ title: 'Success', description: 'Status updated' });
        await refreshOrders();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  const markDeliveredApi = useCallback(async (orderId: string) => {
    try {
      const result = await updateOrderStatus(orderId, 'Delivered', '', '');
      if (result.success) {
        dispatch({ type: 'MARK_DELIVERED', orderId });
        toast({ title: 'Success', description: 'Marked as delivered' });
        await refreshOrders();
        await refreshStats();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to mark delivered', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, refreshStats, toast]);

  const rescheduleDeliveryApi = useCallback(async (orderId: string, date: string, time: string) => {
    try {
      const note = `Delivery rescheduled: ${date} at ${time}`;
      const result = await updateOrderStatus(orderId, 'Rescheduled', note, date);
      if (result.success) {
        dispatch({ type: 'RESCHEDULE_DELIVERY', orderId, date, time });
        toast({ title: 'Success', description: 'Delivery rescheduled' });
        await refreshOrders();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to reschedule', variant: 'destructive' });
    }
  }, [dispatch, refreshOrders, toast]);

  // ── Setup auto-refresh ─────────────────────────────────────
  useEffect(() => {
    loadInitialData();

    refreshInterval.current = setInterval(() => {
      refreshOrders();
      refreshStats();
    }, 60000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [loadInitialData, refreshOrders, refreshStats]);

  // Refresh stats when period changes
  useEffect(() => {
    refreshStats();
  }, [state.period, refreshStats]);

  return {
    refreshOrders,
    refreshStats,
    refreshDeliveryAgents,
    confirmOrderApi,
    cancelOrderApi,
    noAnswerApi,
    scheduleCallbackApi,
    assignRiderApi,
    updateDeliveryStatusApi,
    markDeliveredApi,
    rescheduleDeliveryApi,
  };
}