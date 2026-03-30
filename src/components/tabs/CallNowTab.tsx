import { useState, useEffect } from 'react';
import { Order, AppAction } from '@/types/order';
import { packages } from '@/data/initialData';
import CustomerDetail from '@/components/CustomerDetail';
import StepDots from '@/components/StepDots';
import UpsellPanel from '@/components/UpsellPanel';
import WhatsAppPreview from '@/components/WhatsAppPreview';

interface CallNowTabProps {
  orders: Order[];
  callingOrderId: string | null;
  showOutcomes: string | null;
  showUpsell: string | null;
  showWaPreview: string | null;
  waAction: string | null;
  showCallbackPicker: string | null;
  dispatch: React.Dispatch<AppAction>;
}

const CallNowTab = ({
  orders, callingOrderId, showOutcomes, showUpsell, showWaPreview, waAction,
  showCallbackPicker, dispatch
}: CallNowTabProps) => {
  const [selectedUpsell, setSelectedUpsell] = useState<{ pkg: string; amt: number } | null>(null);
  const [cbDate, setCbDate] = useState('');
  const [cbTime, setCbTime] = useState('');
  const [cbReason, setCbReason] = useState('');
  const [upsellSelection, setUpsellSelection] = useState<string>('');

  const handleCall = (orderId: string) => {
    dispatch({ type: 'START_CALL', orderId });
    setTimeout(() => {
      dispatch({ type: 'CALL_DONE', orderId });
    }, 1800);
  };

  const handleYes = (orderId: string) => {
    dispatch({ type: 'SHOW_UPSELL', orderId });
  };

  const handleUpsellAccept = (orderId: string, pkgName: string, amount: number) => {
    setSelectedUpsell({ pkg: pkgName, amt: amount });
    dispatch({ type: 'HIDE_UPSELL' });
    dispatch({ type: 'SHOW_WA_PREVIEW', orderId, action: 'confirm' });
  };

  const handleUpsellSkip = (orderId: string) => {
    setSelectedUpsell(null);
    dispatch({ type: 'HIDE_UPSELL' });
    dispatch({ type: 'SHOW_WA_PREVIEW', orderId, action: 'confirm' });
  };

  const handleNo = (orderId: string) => {
    dispatch({ type: 'SHOW_WA_PREVIEW', orderId, action: 'cancel' });
  };

  const handleNoAnswer = (orderId: string) => {
    dispatch({ type: 'SHOW_WA_PREVIEW', orderId, action: 'no_answer' });
  };

  const handleCallbackSave = (orderId: string) => {
    dispatch({ type: 'SHOW_WA_PREVIEW', orderId, action: 'reschedule' });
  };

  const currentWaOrder = orders.find(o => o.id === showWaPreview);
  const currentUpsellOrder = orders.find(o => o.id === showUpsell);

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const firstName = order.customerName.split(' ')[0];
        const isCalling = callingOrderId === order.id;
        const showingOutcomes = showOutcomes === order.id;
        const showingCbPicker = showCallbackPicker === order.id;
        const otherPackages = packages.filter(p => p.name !== order.packageName);

        return (
          <div key={order.id} className="bg-card border border-border">
            {/* Card header */}
            <div className="p-3 flex justify-between items-start">
              <div>
                <div className="font-mono text-floor text-dim">{order.id}</div>
                <div className="font-bold text-card-name text-foreground">{order.customerName}</div>
                <div className="text-floor text-mid">{order.packageName}</div>
                <div className="text-floor text-dim">{order.packageContents}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-card-amount text-accent">
                  ₦{order.amount.toLocaleString()}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 text-[12px] font-bold bg-accent text-accent-foreground">
                  New Order
                </span>
              </div>
            </div>

            {/* Attempt strip */}
            <div className="px-3 pb-2 flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 text-[12px] font-bold border ${
                order.attempts === 0 ? 'border-accent text-accent' : 'border-danger text-danger'
              }`}>
                {order.attempts === 0 ? '1st attempt' : `${order.attempts + 1}${order.attempts === 1 ? 'nd' : 'rd'} attempt`}
              </span>
              <span className="text-[12px] text-dim bg-raised px-2 py-0.5">
                {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min ago
              </span>
            </div>

            {/* Last note */}
            {order.lastNote && (
              <div className="mx-3 mb-2 border-l-4 border-amber bg-amber/10 p-2 text-floor text-foreground">
                {order.lastNote}
              </div>
            )}

            {/* Customer detail */}
            <div className="mx-3 mb-3">
              <CustomerDetail order={order} />
            </div>

            {/* Upsell dropdown */}
            <div className="mx-3 mb-3">
              <select
                value={upsellSelection}
                onChange={e => setUpsellSelection(e.target.value)}
                className="w-full border border-border p-2 text-floor bg-card text-foreground"
              >
                <option value="">Upsell: Select another package...</option>
                {otherPackages.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name} — ₦{p.price.toLocaleString()}
                  </option>
                ))}
                <option value="custom">Custom package...</option>
              </select>
            </div>

            {/* Step dots */}
            <div className="mx-3 mb-3 space-y-1">
              <StepDots label="Commitment" total={3} filled={order.commitmentStep} />
              <StepDots label="Recovery" total={4} filled={order.recoveryStep} />
              <StepDots label="Post-Delivery" total={4} filled={order.postDeliveryStep} />
            </div>

            {/* Call button */}
            {!isCalling && !showingOutcomes && (
              <div className="p-3">
                <button
                  onClick={() => handleCall(order.id)}
                  className="w-full py-3 bg-danger text-danger-foreground font-bold text-floor uppercase"
                >
                  CALL {firstName}
                </button>
              </div>
            )}

            {/* Calling state */}
            {isCalling && (
              <div className="p-3">
                <button className="w-full py-3 bg-danger text-danger-foreground font-bold text-floor uppercase pulse-call">
                  CALLING {firstName}...
                </button>
              </div>
            )}

            {/* Outcome buttons */}
            {showingOutcomes && (
              <div className="p-3 space-y-2">
                <div className="text-floor font-bold text-foreground mb-2">Called — what happened?</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleYes(order.id)}
                    className="py-3 border border-accent text-accent font-bold text-floor"
                  >
                    They said YES ✅
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SHOW_CALLBACK_PICKER', orderId: order.id })}
                    className="py-3 border border-border text-foreground font-bold text-floor"
                  >
                    Call back later 📅
                  </button>
                  <button
                    onClick={() => handleNoAnswer(order.id)}
                    className="py-3 border border-border text-foreground font-bold text-floor"
                  >
                    No answer 📵
                  </button>
                  <button
                    onClick={() => handleNo(order.id)}
                    className="py-3 border border-danger text-danger font-bold text-floor"
                  >
                    They said NO ❌
                  </button>
                </div>
              </div>
            )}

            {/* Callback picker */}
            {showingCbPicker && (
              <div className="p-3 border-t border-border space-y-2">
                <div className="text-floor font-bold text-foreground">Schedule Call Back</div>
                <input
                  type="date"
                  value={cbDate}
                  onChange={e => setCbDate(e.target.value)}
                  className="w-full border border-border p-2 text-floor bg-card text-foreground"
                />
                <input
                  type="time"
                  value={cbTime}
                  onChange={e => setCbTime(e.target.value)}
                  className="w-full border border-border p-2 text-floor bg-card text-foreground"
                />
                <textarea
                  placeholder="Reason..."
                  value={cbReason}
                  onChange={e => setCbReason(e.target.value)}
                  className="w-full border border-border p-2 text-floor bg-card text-foreground"
                  rows={2}
                />
                <button
                  onClick={() => handleCallbackSave(order.id)}
                  className="w-full py-3 bg-accent text-accent-foreground font-bold text-floor"
                >
                  Save Call-Back Time
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Upsell panel */}
      {currentUpsellOrder && showUpsell && (
        <UpsellPanel
          order={currentUpsellOrder}
          onAccept={(pkg, amt) => handleUpsellAccept(currentUpsellOrder.id, pkg, amt)}
          onSkip={() => handleUpsellSkip(currentUpsellOrder.id)}
        />
      )}

      {/* WA Preview */}
      {currentWaOrder && showWaPreview && waAction && (
        <WhatsAppPreview
          order={currentWaOrder}
          action={waAction}
          upsellPackage={selectedUpsell?.pkg}
          upsellAmount={selectedUpsell?.amt}
          onConfirm={() => {
            if (waAction === 'confirm') {
              dispatch({
                type: 'CONFIRM_ORDER',
                orderId: currentWaOrder.id,
                upsellPackage: selectedUpsell?.pkg,
                upsellAmount: selectedUpsell?.amt,
              });
            } else if (waAction === 'cancel') {
              dispatch({ type: 'CANCEL_ORDER', orderId: currentWaOrder.id });
            } else if (waAction === 'no_answer') {
              dispatch({ type: 'NO_ANSWER', orderId: currentWaOrder.id });
            } else if (waAction === 'reschedule') {
              dispatch({
                type: 'SCHEDULE_CALLBACK',
                orderId: currentWaOrder.id,
                date: cbDate,
                time: cbTime,
                reason: cbReason,
              });
            }
            setSelectedUpsell(null);
          }}
          onCancel={() => dispatch({ type: 'HIDE_WA_PREVIEW' })}
        />
      )}
    </div>
  );
};

export default CallNowTab;
