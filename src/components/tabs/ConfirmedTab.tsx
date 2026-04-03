import { useState } from 'react';
import { Order, AppAction, DeliveryAgent } from '@/types/order';
import CustomerDetail from '@/components/CustomerDetail';
import StepDots from '@/components/StepDots';

interface ConfirmedTabProps {
  orders: Order[];
  deliveryAgents: DeliveryAgent[];
  dispatch: React.Dispatch<AppAction>;
}

const ConfirmedTab = ({ orders, deliveryAgents, dispatch }: ConfirmedTabProps) => {
  const [selectedRider, setSelectedRider] = useState<Record<string, string>>({});

  const handleAssign = (orderId: string) => {
    const riderId = selectedRider[orderId];
    if (!riderId) return;
    const agent = deliveryAgents.find(a => a.id === riderId);
    if (!agent) return;
    dispatch({ type: 'ASSIGN_RIDER', orderId, riderId, riderName: agent.name });
  };

  return (
    <div className="space-y-3">
      <div className="bg-accent/10 border border-accent p-3 text-floor text-foreground">
        Customers confirmed. Assign a rider to each order below.
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-dim">
          <div className="text-floor font-bold">No confirmed orders</div>
          <div className="text-sm">Confirmed orders will appear here</div>
        </div>
      )}

      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border">
          <div className="p-3 flex justify-between items-start">
            <div>
              <div className="font-mono text-floor text-dim">{order.id}</div>
              <div className="font-bold text-card-name text-foreground">{order.customerName}</div>
              <div className="text-floor text-mid">{order.packageName}</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-card-amount text-accent">
                {order.amount ? `₦${order.amount.toLocaleString()}` : '—'}
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 text-[12px] font-bold border border-accent text-accent">
                {order.attempts || 0} attempt{(order.attempts || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="mx-3 mb-3">
            <CustomerDetail order={order} />
          </div>

          <div className="mx-3 mb-3 space-y-1">
            <StepDots label="Commitment" total={3} filled={order.commitmentStep || 0} />
            <StepDots label="Recovery" total={4} filled={order.recoveryStep || 0} />
            <StepDots label="Post-Delivery" total={4} filled={order.postDeliveryStep || 0} />
          </div>

          {/* Rider assignment */}
          <div className="mx-3 mb-3 border border-border p-3 space-y-2">
            <div className="text-floor font-bold text-foreground">Choose a Rider</div>
            <select
              value={selectedRider[order.id] || ''}
              onChange={e => setSelectedRider(prev => ({ ...prev, [order.id]: e.target.value }))}
              className="w-full border border-border p-2 text-floor bg-card text-foreground"
            >
              <option value="">Select a rider...</option>
              {deliveryAgents.map(da => (
                <option key={da.id} value={da.id}>
                  {da.name} — {da.region || da.state || '—'} — {da.successRate || da.dsr || 0}% — {da.stock || da.currentStock || 0} units
                </option>
              ))}
            </select>
            <div className="text-[12px] text-dim italic">
              🔒 Rider only receives: "You have a new order. Log in to view details." No customer contact information is shared.
            </div>
            <button
              onClick={() => handleAssign(order.id)}
              disabled={!selectedRider[order.id]}
              className="w-full py-3 bg-accent text-accent-foreground font-bold text-floor disabled:opacity-40"
            >
              Assign Rider
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfirmedTab;