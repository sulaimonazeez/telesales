// ═══════════════════════════════════════════════════════════
// VitalVida API Service
// All requests go through /api — Vite proxy forwards to ERPNext
// ═══════════════════════════════════════════════════════════

const BASE = '/api/method';
const TELE = `${BASE}/vitalvida.api.telesales`;

// ── CSRF token ──────────────────────────────────────────────
export function getCsrfToken(): string {
  // Try frappe global first (when embedded in ERPNext desk)
  const w = window as any;
  if (w.frappe?.csrf_token) return w.frappe.csrf_token;
  // Fall back to cookie
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// ── Generic POST wrapper ────────────────────────────────────
async function post<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',      // ← sends session cookie on every request
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': getCsrfToken(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Frappe always wraps response in { message: ... }
  return (data.message ?? data) as T;
}

// ── AUTH ────────────────────────────────────────────────────

export async function login(
  usr: string,
  pwd: string
): Promise<{ success: boolean; full_name?: string; error?: string }> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usr, pwd }),
  });

  const data = await res.json();

  if (data.message === 'Logged In') {
    return { success: true, full_name: data.full_name };
  }

  // Frappe returns { message: "Incorrect Login" } for bad creds
  if (data.message === 'Incorrect Login') {
    return { success: false, error: 'Wrong email or password.' };
  }

  return { success: false, error: data.message || 'Login failed.' };
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  window.location.href = '/login';
}

export async function checkSession(): Promise<{ authenticated: boolean; portal?: string; roles?: string[] }> {
  // FIX: Use VitalVida auth endpoint to verify telesales role
  try {
    const res = await fetch(`${BASE}/vitalvida.api.auth.check_session`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': getCsrfToken() },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const session = data.message ?? data;
    return session?.authenticated ? session : { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

// ── TELESALES APIs ──────────────────────────────────────────

// API 0 — Get current telesales closer (replaces frappe.client.get_list)
export interface CloserInfo {
  name: string;
  closer_name: string;
  phone: string;
}

export async function getMyCloser(): Promise<CloserInfo | null> {
  return post<CloserInfo | null>(`${TELE}.get_my_closer`);
}

// API 1 — Fetch all orders for this closer
export interface RawOrder {
  name: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  landmark: string;
  state: string;
  lga: string;
  order_status: string;
  package_name: string;
  total_payable: number;
  product_amount: number;
  delivery_fee: number;
  delivery_agent: string;
  brand: string;
  creation: string;
  modified: string;
  delivered_at: string;
  paid_at: string;
  reschedule_note: string;
  expected_delivery_date: string;
  cancellation_source: string;
  attempt_count: number;
  call_back_time: string;
}

export async function getMyQueue(closer: string): Promise<RawOrder[]> {
  return post<RawOrder[]>(`${TELE}.get_my_queue`, { closer });
}

// API 2 — Update order status
export async function updateOrderStatus(
  order: string,
  status: string,
  note = '',
  reschedule_date = ''
): Promise<{ success: boolean; error?: string }> {
  return post(`${TELE}.update_order_status`, {
    order,
    status,
    note,
    reschedule_date,
  });
}

// API 3 — Get performance stats
export interface StatsResult {
  success: boolean;
  assigned: number;
  closed: number;
  delivered: number;
  paid_today: number;
  earnings: number;
  rate: number;
  period: string;
  breakdown: Array<{
    label: string;
    count: number;
    color: string;
  }>;
}

export async function getMyStats(
  closer: string,
  period: 'd' | 'w' | 'm'
): Promise<StatsResult> {
  return post<StatsResult>(`${TELE}.get_my_stats`, { closer, period });
}

// API 4 — Get available delivery agents
export interface RawDA {
  name: string;
  agent_name: string;
  state: string;
  current_stock: number;
  dsr: number;
  phone: string;
}

export async function getAvailableDAs(state = ''): Promise<RawDA[]> {
  return post<RawDA[]>(`${TELE}.get_available_das`, { state });
}

// API 5 — Assign DA to order
export async function assignDAtoOrder(
  order: string,
  da: string
): Promise<{ success: boolean; error?: string }> {
  return post(`${TELE}.assign_da_to_order`, { order, da });
}
