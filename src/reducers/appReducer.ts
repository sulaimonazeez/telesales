import { AppState, AppAction, Order } from '@/types/order';
import { mapApiOrder, mapApiDA, fmtMoney } from '@/utils/mapOrder';

export const initialState: AppState = {
  orders: {
    callNow: [],
    confirmed: [],
    onTheWay: [],
    callBack: [],
    done: [],
  },
  activeTab: 'callNow',
  activeOrderId: null,
  activeAction: null,
  callingOrderId: null,
  showOutcomes: null,
  showUpsell: null,
  showWaPreview: null,
  waAction: null,
  showCallbackPicker: null,
  period: 'd',
  earnings: 0,
  closedCount: 0,
  totalAssigned: 0,
  currentCloser: null,
  agentName: 'Agent',
  statsRate: 0,
  deliveryAgents: [],
  isLoading: false,
  error: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { 
        ...state, 
        activeTab: action.tab, 
        showOutcomes: null, 
        showUpsell: null, 
        showWaPreview: null, 
        callingOrderId: null, 
        showCallbackPicker: null 
      };

    case 'SET_PERIOD':
      return { ...state, period: action.period };

    case 'SET_CLOSER':
      return { 
        ...state, 
        currentCloser: action.closer, 
        agentName: action.agentName 
      };

    case 'SET_ORDERS': {
      // Categorize orders into tabs
      const orders: Order[] = action.orders;
      const categorized = {
        callNow: orders.filter(o => o.orderStatus === 'Pending' || !o.orderStatus),
        confirmed: orders.filter(o => o.orderStatus === 'Confirmed'),
        onTheWay: orders.filter(o => ['Assigned', 'Out for Delivery'].includes(o.orderStatus)),
        callBack: orders.filter(o => o.orderStatus === 'Rescheduled'),
        done: orders.filter(o => ['Delivered', 'Paid'].includes(o.orderStatus)),
      };
      return {
        ...state,
        orders: categorized,
        totalAssigned: orders.length,
      };
    }

    case 'SET_DELIVERY_AGENTS':
      return { ...state, deliveryAgents: action.agents };

    case 'SET_STATS':
      return {
        ...state,
        earnings: action.stats.earnings,
        closedCount: action.stats.closed,
        statsRate: action.stats.rate,
        totalAssigned: action.stats.assigned,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'START_CALL':
      return { ...state, callingOrderId: action.orderId };

    case 'CALL_DONE':
      return {
        ...state,
        callingOrderId: null,
        showOutcomes: action.orderId,
        orders: {
          ...state.orders,
          callNow: state.orders.callNow.map(o =>
            o.id === action.orderId ? { ...o, attempts: o.attempts + 1 } : o
          ),
        },
      };

    case 'SHOW_OUTCOMES':
      return { ...state, showOutcomes: action.orderId };

    case 'HIDE_OUTCOMES':
      return { ...state, showOutcomes: null };

    case 'SHOW_UPSELL':
      return { ...state, showUpsell: action.orderId };

    case 'HIDE_UPSELL':
      return { ...state, showUpsell: null };

    case 'SHOW_WA_PREVIEW':
      return { ...state, showWaPreview: action.orderId, waAction: action.action };

    case 'HIDE_WA_PREVIEW':
      return { ...state, showWaPreview: null, waAction: null };

    case 'SHOW_CALLBACK_PICKER':
      return { ...state, showCallbackPicker: action.orderId };

    case 'HIDE_CALLBACK_PICKER':
      return { ...state, showCallbackPicker: null };

    case 'CONFIRM_ORDER': {
      const order = state.orders.callNow.find(o => o.id === action.orderId);
      if (!order) return state;
      const confirmed = {
        ...order,
        orderStatus: 'Confirmed',
        commitmentStep: 1,
        upsellPackage: action.upsellPackage,
        upsellAmount: action.upsellAmount,
        upsellTaken: action.upsellPackage,
        upsellTakenPrice: action.upsellAmount ? fmtMoney(action.upsellAmount) : '',
        upsellStatus: 'Accepted',
      };
      return {
        ...state,
        orders: {
          ...state.orders,
          callNow: state.orders.callNow.filter(o => o.id !== action.orderId),
          confirmed: [...state.orders.confirmed, confirmed],
        },
        showUpsell: null,
        showWaPreview: null,
        showOutcomes: null,
        closedCount: state.closedCount + 1,
      };
    }

    case 'CANCEL_ORDER':
      return {
        ...state,
        orders: {
          ...state.orders,
          callNow: state.orders.callNow.filter(o => o.id !== action.orderId),
        },
        showWaPreview: null,
        showOutcomes: null,
      };

    case 'NO_ANSWER':
      return {
        ...state,
        orders: {
          ...state.orders,
          callNow: state.orders.callNow.map(o =>
            o.id === action.orderId ? { ...o, lastNote: 'No answer', attempts: o.attempts + 1 } : o
          ),
        },
        showWaPreview: null,
        showOutcomes: null,
      };

    case 'SCHEDULE_CALLBACK': {
      const order = state.orders.callNow.find(o => o.id === action.orderId);
      if (!order) return state;
      const cb = {
        ...order,
        orderStatus: 'Rescheduled',
        callBackDate: action.date,
        callBackTime: action.time,
        callBackReason: action.reason,
        callBackTimerSeconds: 3600,
        attempts: order.attempts + 1,
      };
      return {
        ...state,
        orders: {
          ...state.orders,
          callNow: state.orders.callNow.filter(o => o.id !== action.orderId),
          callBack: [...state.orders.callBack, cb],
        },
        showWaPreview: null,
        showOutcomes: null,
        showCallbackPicker: null,
      };
    }

    case 'ASSIGN_RIDER': {
      const order = state.orders.confirmed.find(o => o.id === action.orderId);
      if (!order) return state;
      const dispatched = {
        ...order,
        rider: action.riderId,
        riderName: action.riderName,
        deliveryAgent: action.riderId,
        orderStatus: 'Assigned',
        deliveryStatus: 'assigned' as const,
        commitmentStep: 2,
      };
      return {
        ...state,
        orders: {
          ...state.orders,
          confirmed: state.orders.confirmed.filter(o => o.id !== action.orderId),
          onTheWay: [...state.orders.onTheWay, dispatched],
        },
      };
    }

    case 'UPDATE_DELIVERY_STATUS':
      return {
        ...state,
        orders: {
          ...state.orders,
          onTheWay: state.orders.onTheWay.map(o =>
            o.id === action.orderId
              ? { ...o, deliveryStatus: action.status as any, orderStatus: action.status === 'out_for_delivery' ? 'Out for Delivery' : o.orderStatus }
              : o
          ),
        },
        showWaPreview: null,
      };

    case 'MARK_DELIVERED': {
      const order = state.orders.onTheWay.find(o => o.id === action.orderId);
      if (!order) return state;
      const done = {
        ...order,
        paidStatus: 'delivered' as const,
        deliveryStatus: 'delivered' as const,
        orderStatus: 'Delivered',
        timeAgo: 'Just now',
        commitmentStep: 3,
        recoveryStep: 4,
      };
      return {
        ...state,
        orders: {
          ...state.orders,
          onTheWay: state.orders.onTheWay.filter(o => o.id !== action.orderId),
          done: [done, ...state.orders.done],
        },
        earnings: state.earnings + order.amount,
        closedCount: state.closedCount + 1,
        showWaPreview: null,
      };
    }

    case 'RESCHEDULE_DELIVERY': {
      const order = state.orders.onTheWay.find(o => o.id === action.orderId);
      if (!order) return state;
      const cb = {
        ...order,
        orderStatus: 'Rescheduled',
        callBackDate: action.date,
        callBackTime: action.time,
        callBackReason: 'Rescheduled delivery',
        callBackTimerSeconds: 3600,
        deliveryStatus: undefined,
        rider: undefined,
        riderName: undefined,
      } as any;
      return {
        ...state,
        orders: {
          ...state.orders,
          onTheWay: state.orders.onTheWay.filter(o => o.id !== action.orderId),
          callBack: [...state.orders.callBack, cb],
        },
        showWaPreview: null,
      };
    }

    case 'UPDATE_TIMER':
      return {
        ...state,
        orders: {
          ...state.orders,
          callBack: state.orders.callBack.map(o =>
            o.id === action.orderId ? { ...o, callBackTimerSeconds: action.seconds } : o
          ),
        },
      };

    case 'START_CALLBACK_CALL': {
      const order = state.orders.callBack.find(o => o.id === action.orderId);
      if (!order) return state;
      const moved = { ...order, orderStatus: 'Pending', callBackTimerSeconds: undefined };
      return {
        ...state,
        orders: {
          ...state.orders,
          callBack: state.orders.callBack.filter(o => o.id !== action.orderId),
          callNow: [...state.orders.callNow, moved],
        },
        activeTab: 'callNow',
      };
    }

    case 'RESET_ACTION':
      return {
        ...state,
        showOutcomes: null,
        showUpsell: null,
        showWaPreview: null,
        waAction: null,
        callingOrderId: null,
        showCallbackPicker: null,
      };

    default:
      return state;
  }
}