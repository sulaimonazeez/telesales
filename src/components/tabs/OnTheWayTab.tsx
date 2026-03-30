import { useState } from 'react';
import { Order, AppAction } from '@/types/order';
import CustomerDetail from '@/components/CustomerDetail';
import WhatsAppPreview from '@/components/WhatsAppPreview';

interface OnTheWayTabProps {
  orders: Order[];
  dispatch: React.Dispatch<AppAction>;
}

const statusSteps = ['assigned', 'out_for_delivery', 'delivered', 'rescheduled', 'cancelled'];
const statusLabels: Record<string, string> = {
  assigned: 'Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  rescheduled: 'Reschedule',
  cancelled: 'Cancel',
};

const OnTheWayTab = ({ orders, dispatch }: OnTheWayTabProps) => {
  const [showWa, setShowWa] = useState<{ orderId: string; action: string } | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [showReschedule, setShowReschedule] = useState<string | null>(null);

  const handleStatusTap = (orderId: string, status: string) => {
    if (status === 'rescheduled') {
      setShowReschedule(orderId);
      return;
    }
    if (status === 'cancelled') {
      setShowWa({ orderId, action: 'cancel' });
      return;
    }
    if (status === 'delivered') {
      setShowWa({ orderId, action: 'delivered' });
      return;
    }
    // assigned or out_for_delivery
    setShowWa({ orderId, action: status });
  };

  const handleRescheduleSave = (orderId: string) => {
    setShowReschedule(null);
    setShowWa({ orderId, action: 'reschedule' });
  };

  const waOrder = showWa ? orders.find(o => o.id === showWa.orderId) : null;

  return (
    <div className="space-y-3">
      <div className="bg-accent/10 border border-accent p-3 text-floor text-foreground">
        Rider dispatched. Update the status as the delivery progresses.
      </div>

      {orders.map(order => {
        const currentIdx = statusSteps.indexOf(order.deliveryStatus || 'assigned');

        return (
          <div key={order.id} className="bg-card border border-border">
            <div className="p-3 flex justify-between items-start">
              <div>
                <div className="font-mono text-floor text-dim">{order.id}</div>
                <div className="font-bold text-card-name text-foreground">{order.customerName}</div>
                <div className="text-floor text-mid">{order.packageName}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-card-amount text-accent">
                  ₦{order.amount.toLocaleString()}
                </div>
                {order.riderName && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[12px] font-bold bg-raised text-foreground">
                    🛵 {order.riderName}
                  </span>
                )}
              </div>
            </div>

            <div className="mx-3 mb-3">
              <CustomerDetail order={order} />
            </div>

            {/* Status flow bar */}
            <div className="mx-3 mb-3 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {statusSteps.map((step, idx) => {
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isDanger = step === 'rescheduled' || step === 'cancelled';

                  let cls = 'px-3 py-2 text-[12px] font-bold whitespace-nowrap ';
                  if (isDone) cls += 'bg-accent text-accent-foreground';
                  else if (isCurrent) cls += 'bg-foreground text-card';
                  else if (isDanger) cls += 'border border-danger text-danger bg-card';
                  else cls += 'border border-border text-mid bg-card';

                  return (
                    <button
                      key={step}
                      onClick={() => handleStatusTap(order.id, step)}
                      className={cls}
                    >
                      {statusLabels[step]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reschedule picker */}
            {showReschedule === order.id && (
              <div className="mx-3 mb-3 border border-border p-3 space-y-2">
                <div className="text-floor font-bold text-foreground">Reschedule Delivery</div>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full border border-border p-2 text-floor bg-card text-foreground"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full border border-border p-2 text-floor bg-card text-foreground"
                />
                <button
                  onClick={() => handleRescheduleSave(order.id)}
                  className="w-full py-3 bg-accent text-accent-foreground font-bold text-floor"
                >
                  Reschedule & Preview Messages
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* WA Preview */}
      {waOrder && showWa && (
        <WhatsAppPreview
          order={waOrder}
          action={showWa.action}
          onConfirm={() => {
            if (showWa.action === 'delivered') {
              dispatch({ type: 'MARK_DELIVERED', orderId: waOrder.id });
            } else if (showWa.action === 'reschedule') {
              dispatch({ type: 'RESCHEDULE_DELIVERY', orderId: waOrder.id, date: rescheduleDate, time: rescheduleTime });
            } else if (showWa.action === 'cancel') {
              dispatch({ type: 'CANCEL_ORDER', orderId: waOrder.id });
            } else {
              dispatch({ type: 'UPDATE_DELIVERY_STATUS', orderId: waOrder.id, status: showWa.action });
            }
            setShowWa(null);
          }}
          onCancel={() => setShowWa(null)}
        />
      )}
    </div>
  );
};

export default OnTheWayTab;
