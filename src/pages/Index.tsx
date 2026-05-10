import { useReducer, useCallback } from 'react';
import { AppState, TabKey } from '@/types/order';
import { appReducer, initialState } from '@/reducers/appReducer';
import { useTelesales } from '@/hooks/useTelesales';
import AppHeader from '@/components/AppHeader';
import StatsStrip from '@/components/StatsStrip';
import TabBar from '@/components/TabBar';
import CallNowTab from '@/components/tabs/CallNowTab';
import ConfirmedTab from '@/components/tabs/ConfirmedTab';
import OnTheWayTab from '@/components/tabs/OnTheWayTab';
import CallBackTab from '@/components/tabs/CallBackTab';
import DoneTab from '@/components/tabs/DoneTab';
import NumbersTab from '@/components/tabs/NumbersTab';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const {
    confirmOrderApi,
    cancelOrderApi,
    noAnswerApi,
    scheduleCallbackApi,
    assignRiderApi,
    rescheduleDeliveryApi,
    refreshOrders,
    refreshStats,
  } = useTelesales(state, dispatch);

  // Wrap dispatch actions with API calls
  const handleConfirmOrder = useCallback(async (orderId: string, upsellPackage?: string, upsellAmount?: number) => {
    await confirmOrderApi(orderId, upsellPackage, upsellAmount);
  }, [confirmOrderApi]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    await cancelOrderApi(orderId);
  }, [cancelOrderApi]);

  const handleNoAnswer = useCallback(async (orderId: string) => {
    await noAnswerApi(orderId);
  }, [noAnswerApi]);

  const handleScheduleCallback = useCallback(async (orderId: string, date: string, time: string, reason: string) => {
    await scheduleCallbackApi(orderId, date, time, reason);
  }, [scheduleCallbackApi]);

  const handleAssignRider = useCallback(async (orderId: string, riderId: string, riderName: string) => {
    await assignRiderApi(orderId, riderId, riderName);
  }, [assignRiderApi]);

  // FIX: Delivery status updates (Assigned, Out for Delivery, Delivered) are DA
  // portal actions — telesales cannot set these via API (backend blocks them).
  // OnTheWayTab only updates local reducer state to move the card visually.
  // The actual status update happens when DA marks delivered in their portal.
  const handleUpdateDeliveryStatus = useCallback((_orderId: string, _status: string) => {
    // Local state only — no API call
  }, []);

  const handleRescheduleDelivery = useCallback(async (orderId: string, date: string, time: string) => {
    await rescheduleDeliveryApi(orderId, date, time);
  }, [rescheduleDeliveryApi]);

  const tabs = [
    { key: 'callNow' as TabKey, label: 'CALL NOW', count: state.orders.callNow.length, urgent: true },
    { key: 'confirmed' as TabKey, label: 'CONFIRMED', count: state.orders.confirmed.length },
    { key: 'onTheWay' as TabKey, label: 'ON THE WAY', count: state.orders.onTheWay.length },
    { key: 'callBack' as TabKey, label: 'CALL BACK', count: state.orders.callBack.length, urgent: true },
    { key: 'done' as TabKey, label: 'PAID', count: state.orders.done.length },
    { key: 'numbers' as TabKey, label: 'NUMBERS' },
  ];

  // Create wrapped dispatch that includes API calls
  const wrappedDispatch = useCallback((action: any) => {
    switch (action.type) {
      case 'CONFIRM_ORDER':
        handleConfirmOrder(action.orderId, action.upsellPackage, action.upsellAmount);
        break;
      case 'CANCEL_ORDER':
        handleCancelOrder(action.orderId);
        break;
      case 'NO_ANSWER':
        handleNoAnswer(action.orderId);
        break;
      case 'SCHEDULE_CALLBACK':
        handleScheduleCallback(action.orderId, action.date, action.time, action.reason);
        break;
      case 'ASSIGN_RIDER':
        handleAssignRider(action.orderId, action.riderId, action.riderName);
        break;
      case 'UPDATE_DELIVERY_STATUS':
        handleUpdateDeliveryStatus(action.orderId, action.status);
        break;
      case 'MARK_DELIVERED':
        handleUpdateDeliveryStatus(action.orderId, 'delivered');
        break;
      case 'RESCHEDULE_DELIVERY':
        handleRescheduleDelivery(action.orderId, action.date, action.time);
        break;
      default:
        dispatch(action);
    }
  }, [
    handleConfirmOrder,
    handleCancelOrder,
    handleNoAnswer,
    handleScheduleCallback,
    handleAssignRider,
    handleUpdateDeliveryStatus,
    handleRescheduleDelivery,
  ]);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-background flex flex-col">
      <Toaster />
      
      {/* Fixed header area */}
      <div className="sticky top-0 z-40 bg-background">
        <AppHeader agentName={state.agentName} />
        <StatsStrip
          earnings={state.earnings}
          closedCount={state.closedCount}
          target={0}
          rate={state.statsRate}
        />
        <TabBar
          activeTab={state.activeTab}
          onTabChange={(tab) => dispatch({ type: 'SET_TAB', tab })}
          tabs={tabs}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3">
        {state.activeTab === 'callNow' && (
          <CallNowTab
            orders={state.orders.callNow}
            callingOrderId={state.callingOrderId}
            showOutcomes={state.showOutcomes}
            showUpsell={state.showUpsell}
            showWaPreview={state.showWaPreview}
            waAction={state.waAction}
            showCallbackPicker={state.showCallbackPicker}
            dispatch={wrappedDispatch}
          />
        )}
        {state.activeTab === 'confirmed' && (
          <ConfirmedTab 
            orders={state.orders.confirmed} 
            deliveryAgents={state.deliveryAgents}
            dispatch={wrappedDispatch} 
          />
        )}
        {state.activeTab === 'onTheWay' && (
          <OnTheWayTab 
            orders={state.orders.onTheWay} 
            dispatch={wrappedDispatch} 
          />
        )}
        {state.activeTab === 'callBack' && (
          <CallBackTab 
            orders={state.orders.callBack} 
            dispatch={wrappedDispatch} 
          />
        )}
        {state.activeTab === 'done' && (
          <DoneTab orders={state.orders.done} />
        )}
        {state.activeTab === 'numbers' && (
          <NumbersTab
            state={state}
            period={state.period}
            onPeriodChange={(p) => {
              dispatch({ type: 'SET_PERIOD', period: p });
              refreshStats();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;