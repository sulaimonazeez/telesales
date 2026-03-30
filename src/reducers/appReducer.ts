import { AppState, AppAction } from '@/types/order';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab, showOutcomes: null, showUpsell: null, showWaPreview: null, callingOrderId: null, showCallbackPicker: null };

    case 'SET_PERIOD':
      return { ...state, period: action.period };

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
        commitmentStep: 1,
        upsellPackage: action.upsellPackage,
        upsellAmount: action.upsellAmount,
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
            o.id === action.orderId ? { ...o, lastNote: 'No answer' } : o
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
        callBackDate: action.date,
        callBackTime: action.time,
        callBackReason: action.reason,
        callBackTimerSeconds: 3600,
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

    case 'UPDATE_DELIVERY_STATUS': {
      return {
        ...state,
        orders: {
          ...state.orders,
          onTheWay: state.orders.onTheWay.map(o =>
            o.id === action.orderId
              ? { ...o, deliveryStatus: action.status as any }
              : o
          ),
        },
        showWaPreview: null,
      };
    }

    case 'MARK_DELIVERED': {
      const order = state.orders.onTheWay.find(o => o.id === action.orderId);
      if (!order) return state;
      const done = {
        ...order,
        paidStatus: 'delivered' as const,
        deliveryStatus: 'delivered' as const,
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
      const moved = { ...order, callBackTimerSeconds: undefined };
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
