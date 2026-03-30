import { Order } from '@/types/order';

interface WhatsAppPreviewProps {
  order: Order;
  action: string;
  upsellPackage?: string;
  upsellAmount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const WhatsAppPreview = ({ order, action, upsellPackage, upsellAmount, onConfirm, onCancel }: WhatsAppPreviewProps) => {
  const firstName = order.customerName.split(' ')[0];

  const getCustomerMessage = () => {
    switch (action) {
      case 'confirm':
        return `Hi ${firstName}! 🎉\n\nThank you for ordering ${order.packageName} (${order.packageContents})!\n\nYour order ${order.id} for ₦${order.amount.toLocaleString()} has been confirmed.\n\nDelivery: ${order.deliveryDate}, ${order.timeWindow}\nAddress: ${order.address}\n\nOur delivery agent will contact you before arrival. Please have ₦${order.amount.toLocaleString()} ready for payment on delivery.\n\nThank you for choosing VitalVida! 💚`;
      case 'cancel':
        return `Hi ${firstName},\n\nYour order ${order.id} has been cancelled as requested.\n\nIf you change your mind, feel free to reach out anytime.\n\nThank you,\nVitalVida Team`;
      case 'reschedule':
        return `Hi ${firstName},\n\nYour order ${order.id} has been rescheduled.\n\nWe'll call you back at the agreed time to confirm.\n\nThank you,\nVitalVida Team`;
      case 'no_answer':
        return `Hi ${firstName},\n\nWe tried reaching you about your order ${order.id} but couldn't get through.\n\nWe'll try again soon. If you'd like to reach us, just reply to this message.\n\nVitalVida Team`;
      case 'delivered':
        return `Hi ${firstName}! 🎉\n\nYour order ${order.id} (${order.packageName}) has been delivered!\n\nThank you for choosing VitalVida. We hope you love your products! 💚\n\nIf you have any questions, just reply here.`;
      case 'assign_rider':
        return `Hi ${firstName},\n\nGreat news! Your order ${order.id} is on its way. Our delivery agent will contact you shortly.\n\nDelivery: ${order.deliveryDate}, ${order.timeWindow}\n\nVitalVida Team 💚`;
      default:
        return '';
    }
  };

  const getOwnerMessage = () => {
    const upsellLine = upsellPackage ? `\nUpsell: ${upsellPackage} — ₦${(upsellAmount || 0).toLocaleString()}` : '';
    switch (action) {
      case 'confirm':
        return `ORDER CONFIRMED ✅\n\n${order.id} — ${order.customerName}\n${order.packageName} — ₦${order.amount.toLocaleString()}${upsellLine}\n${order.state} / ${order.lga}\nDelivery: ${order.deliveryDate}`;
      case 'cancel':
        return `ORDER CANCELLED ❌\n\n${order.id} — ${order.customerName}\n${order.packageName} — ₦${order.amount.toLocaleString()}\nReason: Customer cancelled`;
      case 'delivered':
        return `ORDER DELIVERED ✅\n\n${order.id} — ${order.customerName}\n${order.packageName} — ₦${order.amount.toLocaleString()}\nRider: ${order.riderName}`;
      default:
        return `ORDER UPDATE\n\n${order.id} — ${order.customerName}\nStatus: ${action}\n${order.packageName} — ₦${order.amount.toLocaleString()}`;
    }
  };

  const getAgentMessage = () => {
    // Agent copy never contains customer phone or address
    switch (action) {
      case 'confirm':
        return `✅ Confirmed ${order.id}\n${order.customerName} — ${order.packageName}\n₦${order.amount.toLocaleString()}\n${order.state}`;
      case 'cancel':
        return `❌ Cancelled ${order.id}\n${order.customerName} — ${order.packageName}`;
      default:
        return `📋 ${action.toUpperCase()} ${order.id}\n${order.customerName} — ${order.packageName}\n₦${order.amount.toLocaleString()}`;
    }
  };

  const getButtonColor = () => {
    if (action === 'confirm' || action === 'delivered' || action === 'assign_rider') return 'bg-accent text-accent-foreground';
    if (action === 'cancel') return 'bg-danger text-danger-foreground';
    return 'bg-raised text-foreground';
  };

  const getButtonLabel = () => {
    switch (action) {
      case 'confirm': return 'Confirm & Send Messages';
      case 'cancel': return 'Cancel & Send Messages';
      case 'reschedule': return 'Reschedule & Send Messages';
      case 'no_answer': return 'Log No Answer & Send Messages';
      case 'delivered': return 'Mark Delivered & Send Messages';
      case 'assign_rider': return 'Assign & Send Messages';
      default: return 'Confirm & Send';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-card w-full max-w-[480px] max-h-[85vh] overflow-y-auto border-t border-border2">
        <div className="p-4 space-y-4">
          <h3 className="font-bold text-card-name text-foreground">Message Preview</h3>

          <div className="border-l-4 border-accent p-3 bg-raised">
            <div className="text-floor font-bold text-foreground mb-1">Customer receives:</div>
            <pre className="text-floor text-foreground whitespace-pre-wrap font-sans">{getCustomerMessage()}</pre>
          </div>

          <div className="border-l-4 border-border2 p-3 bg-raised">
            <div className="text-floor font-bold text-foreground mb-1">Owner receives:</div>
            <pre className="text-floor text-foreground whitespace-pre-wrap font-sans">{getOwnerMessage()}</pre>
          </div>

          <div className="border-l-4 border-dim p-3 bg-raised">
            <div className="text-floor font-bold text-foreground mb-1">Your notification:</div>
            <pre className="text-floor text-foreground whitespace-pre-wrap font-sans">{getAgentMessage()}</pre>
          </div>

          <div className="text-floor text-mid italic border border-border p-2">
            🔒 Your copy never contains the customer's phone number or address
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-border text-floor font-bold text-mid bg-card"
            >
              Back
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-floor font-bold ${getButtonColor()}`}
            >
              {getButtonLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreview;
