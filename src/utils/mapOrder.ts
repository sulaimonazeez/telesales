import { Order } from '@/types/order';

export function parseAddress(address: string): {
  street: string;
  landmark: string;
  lga: string;
  state: string;
} {
  if (!address) return { street: '', landmark: '', lga: '', state: '' };

  const parts = address.split(',').map(p => p.trim()).filter(Boolean);

  const states = ['Lagos', 'FCT', 'Abuja', 'Rivers', 'Oyo', 'Imo', 'Delta', 'Kano', 'Kaduna'];
  let state = '';
  let stateIndex = -1;

  parts.forEach((part, idx) => {
    states.forEach(s => {
      if (part.toLowerCase().includes(s.toLowerCase())) {
        state = s === 'fct' ? 'FCT' : s;
        stateIndex = idx;
      }
    });
  });

  if (!state && parts.length > 0) {
    state = parts[parts.length - 1];
    stateIndex = parts.length - 1;
  }

  return {
    street: parts[0] || '',
    landmark: parts.length > 2 ? parts[1] : '',
    lga: stateIndex > 0 ? parts[stateIndex - 1] : parts[parts.length - 2] || '',
    state: state,
  };
}

export function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}hr ago`;
}

export function fmtDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function fmtMoney(amount: number): string {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + amount.toLocaleString('en-NG');
}

export function mapApiOrder(raw: any): Order {
  const parsed = parseAddress(raw.address);

  let timerSeconds = 0;
  if (raw.expected_delivery_date) {
    const target = new Date(raw.expected_delivery_date + 'T09:00:00');
    const diff = target.getTime() - Date.now();
    timerSeconds = Math.max(0, Math.floor(diff / 1000));
  }

  return {
    id: raw.name,
    customerName: raw.customer_name || '—',
    phone: raw.customer_phone || '',
    email: raw.email || '',
    address: raw.address || '',
    landmark: raw.landmark || parsed.landmark,
    state: raw.state || parsed.state,
    lga: raw.lga || parsed.lga,
    packageName: raw.package_name || '—',
    packageContents: '',
    amount: raw.total_payable || 0,
    totalPayable: raw.total_payable,
    deliveryFee: raw.delivery_fee || 0,
    deliveryDate: raw.expected_delivery_date ? fmtDate(raw.expected_delivery_date) : '',
    expectedDeliveryDate: raw.expected_delivery_date,
    timeWindow: raw.delivery_time_window || '9AM - 6PM',
    deliveryTimeWindow: raw.delivery_time_window,
    paymentMethod: 'Pay on Delivery',
    heardFrom: raw.brand || raw.heard || '',
    brand: raw.brand,

    orderStatus: raw.order_status,
    deliveryStatus: mapDeliveryStatus(raw.order_status),
    paidStatus: mapPaidStatus(raw.order_status),

    attempts: raw.attempt_count || 0,
    attemptCount: raw.attempt_count,
    commitmentStep: 0,
    recoveryStep: 0,
    postDeliveryStep: 0,

    callBackDate: raw.expected_delivery_date ? fmtDate(raw.expected_delivery_date) : '',
    callBackTime: '',
    callBackReason: raw.reschedule_note || '',
    callBackTimerSeconds: timerSeconds,
    rescheduleNote: raw.reschedule_note,

    rider: raw.delivery_agent,
    riderName: raw.delivery_agent_name || raw.delivery_agent,
    deliveryAgent: raw.delivery_agent,

    createdAt: raw.creation,
    creation: raw.creation,
    modified: raw.modified,
    age: timeAgo(raw.creation),
    timeAgo: timeAgo(raw.creation),

    raw: raw,
  };
}

function mapDeliveryStatus(status: string): Order['deliveryStatus'] {
  switch (status) {
    case 'Assigned': return 'assigned';
    case 'Out for Delivery': return 'out_for_delivery';
    case 'Delivered': return 'delivered';
    case 'Rescheduled': return 'rescheduled';
    case 'Cancelled': return 'cancelled';
    default: return undefined;
  }
}

function mapPaidStatus(status: string): Order['paidStatus'] {
  switch (status) {
    case 'Paid': return 'paid';
    case 'Delivered': return 'delivered';
    default: return 'pending';
  }
}

// ── FIX: mapApiDA now reads correct field names from updated API response ──
// API now returns: {id, name, phone, state, dsr, frozen,
//   total_stock, stock_shampoo, stock_pomade, stock_conditioner}
// Previously read current_stock (no longer returned) and agent_name (now name).
export function mapApiDA(raw: any) {
  return {
    // Identity
    id:           raw.id   || raw.name,
    name:         raw.name || raw.agent_name || raw.id,
    phone:        raw.phone || '',

    // Location
    region:       raw.state || '',
    state:        raw.state || '',

    // Performance
    successRate:  raw.dsr || 0,
    dsr:          raw.dsr || 0,

    // Freeze status
    frozen:       raw.frozen || false,

    // Stock — total and per-product breakdown
    stock:        raw.total_stock || 0,
    currentStock: raw.total_stock || 0,
    totalStock:   raw.total_stock || 0,
    stockShampoo:     raw.stock_shampoo    || 0,
    stockPomade:      raw.stock_pomade     || 0,
    stockConditioner: raw.stock_conditioner || 0,
  };
}
