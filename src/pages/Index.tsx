import { useReducer } from 'react';
import { AppState, TabKey } from '@/types/order';
import { initialOrders } from '@/data/initialData';
import { appReducer } from '@/reducers/appReducer';
import AppHeader from '@/components/AppHeader';
import StatsStrip from '@/components/StatsStrip';
import TabBar from '@/components/TabBar';
import CallNowTab from '@/components/tabs/CallNowTab';
import ConfirmedTab from '@/components/tabs/ConfirmedTab';
import OnTheWayTab from '@/components/tabs/OnTheWayTab';
import CallBackTab from '@/components/tabs/CallBackTab';
import DoneTab from '@/components/tabs/DoneTab';
import NumbersTab from '@/components/tabs/NumbersTab';

const initialState: AppState = {
  orders: initialOrders,
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
  earnings: 3800,
  closedCount: 8,
  totalAssigned: 16,
};

const Index = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const tabs = [
    { key: 'callNow' as TabKey, label: 'CALL NOW', count: state.orders.callNow.length, urgent: true },
    { key: 'confirmed' as TabKey, label: 'CONFIRMED', count: state.orders.confirmed.length },
    { key: 'onTheWay' as TabKey, label: 'ON THE WAY', count: state.orders.onTheWay.length },
    { key: 'callBack' as TabKey, label: 'CALL BACK', count: state.orders.callBack.length, urgent: true },
    { key: 'done' as TabKey, label: 'DONE', count: state.orders.done.length },
    { key: 'numbers' as TabKey, label: 'NUMBERS' },
  ];

  const rate = state.totalAssigned > 0 ? Math.round((state.closedCount / state.totalAssigned) * 100) : 74;

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-background flex flex-col">
      {/* Fixed header area */}
      <div className="sticky top-0 z-40 bg-background">
        <AppHeader />
        <StatsStrip
          earnings={state.earnings}
          closedCount={state.closedCount}
          target={12}
          rate={rate}
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
            dispatch={dispatch}
          />
        )}
        {state.activeTab === 'confirmed' && (
          <ConfirmedTab orders={state.orders.confirmed} dispatch={dispatch} />
        )}
        {state.activeTab === 'onTheWay' && (
          <OnTheWayTab orders={state.orders.onTheWay} dispatch={dispatch} />
        )}
        {state.activeTab === 'callBack' && (
          <CallBackTab orders={state.orders.callBack} dispatch={dispatch} />
        )}
        {state.activeTab === 'done' && (
          <DoneTab orders={state.orders.done} />
        )}
        {state.activeTab === 'numbers' && (
          <NumbersTab
            state={state}
            period={state.period}
            onPeriodChange={(p) => dispatch({ type: 'SET_PERIOD', period: p })}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
