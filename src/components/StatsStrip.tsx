interface StatsStripProps {
  earnings: number;
  closedCount: number;
  target: number;
  rate: number;
}

const StatsStrip = ({ earnings, closedCount, target, rate }: StatsStripProps) => {
  return (
    <div className="bg-card border-b border-border2 flex">
      <div className="flex-1 text-center py-2 border-r border-border">
        <div className="text-dim text-floor">Earned Today</div>
        <div className="font-mono text-stat font-bold text-accent">
          ₦{earnings.toLocaleString()}
        </div>
      </div>
      <div className="flex-1 text-center py-2 border-r border-border">
        <div className="text-dim text-floor">Closed</div>
        <div className="font-mono text-stat font-bold text-foreground">
          {closedCount} <span className="text-dim text-floor font-normal">/ target {target}</span>
        </div>
      </div>
      <div className="flex-1 text-center py-2">
        <div className="text-dim text-floor">My Rate</div>
        <div className="font-mono text-stat font-bold text-accent">{rate}%</div>
      </div>
    </div>
  );
};

export default StatsStrip;
