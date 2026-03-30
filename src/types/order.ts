export interface Package {
  name: string;
  contents: string;
  price: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  region: string;
  successRate: number;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  state: string;
  lga: string;
  deliveryDate: string;
  timeWindow: string;
  deliveryFee: number;
  paymentMethod: string;
  heardFrom: string;
  packageName: string;
  packageContents: string;
  amount: number;
  attempts: number;
  lastNote?: string;
  commitmentStep: number;
  recoveryStep: number;
  postDeliveryStep: number;
  rider?: string;
  riderName?: string;
  deliveryStatus?: 'assigned' | 'out_for_delivery' | 'delivered' | 'rescheduled' | 'cancelled';
  paidStatus?: 'delivered' | 'paid';
  callBackDate?: string;
  callBackTime?: string;
  callBackReason?: string;
  callBackTimerSeconds?: number;
  upsellPackage?: string;
  upsellAmount?: number;
  timeAgo?: string;
  createdAt: string;
}

export type TabKey = 'callNow' | 'confirmed' | 'onTheWay' | 'callBack' | 'done' | 'numbers';

export interface AppState {
  orders: {
    callNow: Order[];
    confirmed: Order[];
    onTheWay: Order[];
    callBack: Order[];
    done: Order[];
  };
  activeTab: TabKey;
  activeOrderId: string | null;
  activeAction: string | null;
  callingOrderId: string | null;
  showOutcomes: string | null;
  showUpsell: string | null;
  showWaPreview: string | null;
  waAction: string | null;
  showCallbackPicker: string | null;
  period: 'd' | 'w' | 'm';
  earnings: number;
  closedCount: number;
  totalAssigned: number;
}

export type AppAction =
  | { type: 'SET_TAB'; tab: TabKey }
  | { type: 'SET_PERIOD'; period: 'd' | 'w' | 'm' }
  | { type: 'START_CALL'; orderId: string }
  | { type: 'CALL_DONE'; orderId: string }
  | { type: 'SHOW_OUTCOMES'; orderId: string }
  | { type: 'HIDE_OUTCOMES' }
  | { type: 'SHOW_UPSELL'; orderId: string }
  | { type: 'HIDE_UPSELL' }
  | { type: 'SHOW_WA_PREVIEW'; orderId: string; action: string }
  | { type: 'HIDE_WA_PREVIEW' }
  | { type: 'SHOW_CALLBACK_PICKER'; orderId: string }
  | { type: 'HIDE_CALLBACK_PICKER' }
  | { type: 'CONFIRM_ORDER'; orderId: string; upsellPackage?: string; upsellAmount?: number }
  | { type: 'CANCEL_ORDER'; orderId: string }
  | { type: 'NO_ANSWER'; orderId: string }
  | { type: 'SCHEDULE_CALLBACK'; orderId: string; date: string; time: string; reason: string }
  | { type: 'ASSIGN_RIDER'; orderId: string; riderId: string; riderName: string }
  | { type: 'UPDATE_DELIVERY_STATUS'; orderId: string; status: string }
  | { type: 'MARK_DELIVERED'; orderId: string }
  | { type: 'RESCHEDULE_DELIVERY'; orderId: string; date: string; time: string }
  | { type: 'UPDATE_TIMER'; orderId: string; seconds: number }
  | { type: 'START_CALLBACK_CALL'; orderId: string }
  | { type: 'SET_UPSELL'; orderId: string; packageName: string }
  | { type: 'RESET_ACTION' };
