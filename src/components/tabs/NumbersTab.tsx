import { AppState } from '@/types/order';

interface NumbersTabProps {
  state: AppState;
  period: 'd' | 'w' | 'm';
  onPeriodChange: (p: 'd' | 'w' | 'm') => void;
}

const NumbersTab = ({ state, period, onPeriodChange }: NumbersTabProps) => {
  const allOrders = [
    ...state.orders.callNow,
    ...state.orders.confirmed,
    ...state.orders.onTheWay,
    ...state.orders.callBack,
    ...state.orders.done,
  ];
  const total = allOrders.length;
  const confirmed = state.orders.confirmed.length;
  const onTheWay = state.orders.onTheWay.length;
  const delivered = state.orders.done.filter(o => o.paidStatus === 'delivered').length;
  const paid = state.orders.done.filter(o => o.paidStatus === 'paid').length;
  const callBack = state.orders.callBack.length;
  const callNow = state.orders.callNow.length;
  const closed = state.closedCount;
  const successRate = total > 0 ? Math.round((closed / total) * 100) : 0;
  const deliveryRate = 74; // static for demo

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-accent';
    if (rate >= 70) return 'text-mid';
    return 'text-danger';
  };

  const getRateBg = (rate: number) => {
    if (rate >= 80) return 'bg-accent';
    if (rate >= 70) return 'bg-mid';
    return 'bg-danger';
  };

  const breakdownRows = [
    { label: 'Sent to me', count: total, color: 'bg-blue' },
    { label: 'Confirmed', count: confirmed, color: 'bg-accent' },
    { label: 'Out for Delivery', count: onTheWay, color: 'bg-amber' },
    { label: 'Delivered', count: delivered, color: 'bg-foreground' },
    { label: 'Paid', count: paid, color: 'bg-accent' },
    { label: 'Rescheduled / Call Back', count: callBack, color: 'bg-amber' },
    { label: 'Cancelled', count: 0, color: 'bg-danger' },
    { label: 'Call Now', count: callNow, color: 'bg-blue' },
  ];

  const getVerdict = () => {
    if (deliveryRate >= 80) return { bg: 'bg-accent/10 border-accent', text: `Your rate is ${deliveryRate}%. Above target. Keep closing.` };
    if (deliveryRate >= 70) return { bg: 'bg-raised border-border', text: `Your rate is ${deliveryRate}%. You need +${80 - deliveryRate}% to reach the bonus.` };
    return { bg: 'bg-danger/10 border-danger', text: `Your rate is ${deliveryRate}%. Below 70%. Focus on following up call-backs.` };
  };

  const verdict = getVerdict();

  return (
    <div className="space-y-4">
      {/* Period toggle */}
      <div className="flex border border-border bg-card">
        {(['d', 'w', 'm'] as const).map(p => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`flex-1 py-2.5 text-floor font-bold ${
              period === p ? 'bg-foreground text-card' : 'text-mid'
            }`}
          >
            {p === 'd' ? 'Today' : p === 'w' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border p-4 border-t-4 border-t-blue">
          <div className="text-floor text-mid">Sent to Me</div>
          <div className="font-mono text-big-stat font-bold text-blue">{total}</div>
        </div>
        <div className="bg-card border border-border p-4 border-t-4 border-t-accent">
          <div className="text-floor text-mid">Closed</div>
          <div className="font-mono text-big-stat font-bold text-accent">{closed}</div>
        </div>
        <div className="bg-foreground p-4">
          <div className="text-floor text-dim">Delivered</div>
          <div className="font-mono text-big-stat font-bold text-card">{delivered + paid}</div>
        </div>
        <div className="bg-foreground p-4">
          <div className="text-floor text-amber">Success Rate</div>
          <div className="font-mono text-big-stat font-bold text-amber">{successRate}%</div>
        </div>
      </div>

      {/* Delivery rate bar */}
      <div className="bg-card border border-border p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-floor font-bold text-foreground">Delivery Rate</span>
          <span className={`font-mono text-stat font-bold ${getRateColor(deliveryRate)}`}>
            {deliveryRate}%
          </span>
        </div>
        <div className="w-full h-2 bg-raised">
          <div
            className={`h-full ${getRateBg(deliveryRate)}`}
            style={{ width: `${deliveryRate}%` }}
          />
        </div>
        <div className="text-floor text-mid mt-2">
          {deliveryRate >= 80
            ? '🎉 Above 80% bonus tier!'
            : `+${80 - deliveryRate}% to reach 80% bonus tier`}
        </div>
      </div>

      {/* Order breakdown */}
      <div className="bg-card border border-border">
        <div className="p-3 border-b border-border">
          <span className="text-floor font-bold text-foreground">Order Breakdown</span>
        </div>
        {breakdownRows.map(row => (
          <div key={row.label} className="px-3 py-2 flex items-center justify-between border-b border-border last:border-0">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
              <span className="text-floor text-foreground">{row.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-floor font-bold text-foreground">{row.count}</span>
              <span className="text-floor text-dim">
                {total > 0 ? `${Math.round((row.count / total) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div className={`border p-4 ${verdict.bg}`}>
        <div className="text-floor font-bold text-foreground">{verdict.text}</div>
      </div>
    </div>
  );
};

export default NumbersTab;
