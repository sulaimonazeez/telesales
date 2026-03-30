import { Order } from '@/types/order';
import { packages } from '@/data/initialData';
import { useState } from 'react';

interface UpsellPanelProps {
  order: Order;
  onAccept: (packageName: string, amount: number) => void;
  onSkip: () => void;
}

const UpsellPanel = ({ order, onAccept, onSkip }: UpsellPanelProps) => {
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const otherPackages = packages.filter(p => p.name !== order.packageName);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-card w-full max-w-[480px] max-h-[80vh] overflow-y-auto border-t border-border2">
        <div className="p-4">
          <h3 className="font-bold text-card-name text-foreground">Upsell Opportunity</h3>
          <p className="text-floor text-mid mt-1">
            {order.customerName} ordered {order.packageName}. What else did they agree to?
          </p>

          <div className="mt-4 space-y-2">
            {otherPackages.map(pkg => (
              <button
                key={pkg.name}
                onClick={() => onAccept(pkg.name, pkg.price)}
                className="w-full text-left p-3 border border-border hover:border-accent transition-colors"
              >
                <div className="font-bold text-floor text-foreground">{pkg.name}</div>
                <div className="text-floor text-mid">{pkg.contents}</div>
                <div className="font-mono text-floor text-accent font-bold mt-1">
                  ₦{pkg.price.toLocaleString()}
                </div>
              </button>
            ))}

            <div className="border border-border p-3 space-y-2">
              <div className="font-bold text-floor text-foreground">Custom package...</div>
              <input
                type="text"
                placeholder="Package name"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full border border-border p-2 text-floor bg-card text-foreground"
              />
              <input
                type="text"
                placeholder="Price (₦)"
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                className="w-full border border-border p-2 text-floor bg-card text-foreground font-mono"
              />
              {customName && customPrice && (
                <button
                  onClick={() => onAccept(customName, parseInt(customPrice) || 0)}
                  className="w-full bg-accent text-accent-foreground py-2 font-bold text-floor"
                >
                  They Took It
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                if (otherPackages.length > 0) {
                  // Just skip without upsell
                }
                onSkip();
              }}
              className="flex-1 py-3 bg-raised text-mid font-bold text-floor border border-border"
            >
              No Thanks / Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellPanel;
