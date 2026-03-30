import { useEffect } from 'react';
import { Order, AppAction } from '@/types/order';

interface CallBackTabProps {
  orders: Order[];
  dispatch: React.Dispatch<AppAction>;
}

const formatTimer = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const CallBackTab = ({ orders, dispatch }: CallBackTabProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach(order => {
        if (order.callBackTimerSeconds && order.callBackTimerSeconds > 0) {
          dispatch({
            type: 'UPDATE_TIMER',
            orderId: order.id,
            seconds: order.callBackTimerSeconds - 1,
          });
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orders, dispatch]);

  return (
    <div className="space-y-3">
      <div className="bg-amber/10 border border-amber p-3 text-floor text-foreground">
        These customers asked you to call back. Call when the timer hits zero.
      </div>

      {orders.map(order => {
        const seconds = order.callBackTimerSeconds || 0;
        const isUrgent = seconds > 0 && seconds < 300;

        return (
          <div key={order.id} className="bg-card border border-border p-4">
            <div className="text-center mb-3">
              <div className={`font-mono text-big-stat font-bold ${
                isUrgent ? 'text-danger blink-red' : 'text-dim'
              }`}>
                {formatTimer(seconds)}
              </div>
            </div>

            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-card-name text-foreground">{order.customerName}</div>
                <div className="text-floor text-mid">
                  {order.callBackDate} · {order.callBackTime}
                </div>
              </div>
              <div className="font-mono font-bold text-card-amount text-accent">
                ₦{order.amount.toLocaleString()}
              </div>
            </div>

            {order.callBackReason && (
              <div className="text-floor text-mid italic mb-3">
                "{order.callBackReason}"
              </div>
            )}

            <button
              onClick={() => dispatch({ type: 'START_CALLBACK_CALL', orderId: order.id })}
              className="w-full py-3 bg-danger text-danger-foreground font-bold text-floor uppercase"
            >
              CALL {order.customerName.split(' ')[0]}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CallBackTab;
