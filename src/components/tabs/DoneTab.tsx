import { Order } from '@/types/order';
import CustomerDetail from '@/components/CustomerDetail';

interface DoneTabProps {
  orders: Order[];
}

const DoneTab = ({ orders }: DoneTabProps) => {
  return (
    <div className="space-y-3">
      <div className="bg-raised border border-border p-3 text-floor text-foreground">
        Only Moniepoint can mark an order Paid. Delivered orders wait here until payment is confirmed automatically.
      </div>

      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border">
          <div className="p-3 flex justify-between items-start">
            <div>
              <div className="font-bold text-card-name text-foreground">{order.customerName}</div>
              <div className="text-floor text-mid">{order.packageName}</div>
              {order.riderName && (
                <div className="text-floor text-dim">{order.riderName} · {order.timeAgo}</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-card-amount text-accent">
                ₦{order.amount.toLocaleString()}
              </div>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[12px] font-bold ${
                order.paidStatus === 'paid'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-raised text-mid'
              }`}>
                {order.paidStatus === 'paid' ? 'Paid' : 'Delivered'}
              </span>
            </div>
          </div>

          <div className="mx-3 mb-3 text-floor italic text-mid">
            {order.paidStatus === 'paid'
              ? '🔒 Payment confirmed by Moniepoint'
              : '⏳ Waiting for Moniepoint payment confirmation'}
          </div>

          <div className="mx-3 mb-3">
            <CustomerDetail order={order} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoneTab;
