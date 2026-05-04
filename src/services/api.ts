// ═══════════════════════════════════════════════════════════
// VitalVida API Service
// All requests go through /api — Vite proxy forwards to ERPNext
// ═══════════════════════════════════════════════════════════

const BASE = '/api/method';
const TELE = `${BASE}/vitalvida.api.telesales`;

// ── CSRF token ──────────────────────────────────────────────
export function getCsrfToken(): string {
  const w = window as any;
  if (w.frappe?.csrf_token) return w.frappe.csrf_token;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// ── Generic POST wrapper ────────────────────────────────────
async function post<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
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

  // FIX: Frappe 500-level errors may still return HTTP 200 with an
  // 'exception' key in the body. Surface these as real errors so the
  // calling code gets a proper catch instead of silently receiving undefined.
  if (data.exception) {
    const errMsg = data.exc_type
      ? `${data.exc_type}: ${data.exception.replace(/\n/g, ' ').slice(0, 200)}`
      : String(data.exception).slice(0, 200);
    throw new Error(errMsg);
  }

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

export interface CloserInfo {
  name: string;
  closer_name: string;
  phone: string;
}

export async function getMyCloser(): Promise<CloserInfo | null> {
  return post<CloserInfo | null>(`${TELE}.get_my_closer`);
}

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

export async function updateOrderStatus(
  order: string,
  status: string,
  note = '',
  reschedule_date = '',
  cancellation_source = ''   // FIX: was string|null — backend requires a string value when status=Cancelled
): Promise<{ success: boolean; error?: string }> {
  return post(`${TELE}.update_order_status`, {
    order,
    status,
    note,
    reschedule_date,
    // Only send cancellation_source when it has a value — avoids passing empty string unnecessarily
    ...(cancellation_source ? { cancellation_source } : {}),
  });
}

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

// ── FIX: RawDA now matches the actual API response fields ──────────────────
// API returns: {success, das: [{id, name, phone, state, dsr, frozen,
//   total_stock, stock_shampoo, stock_pomade, stock_conditioner}]}
// getAvailableDAs now extracts the .das array from the envelope correctly.
export interface RawDA {
  id: string;
  name: string;
  phone: string;
  state: string;
  dsr: number;
  frozen: boolean;
  total_stock: number;
  stock_shampoo: number;
  stock_pomade: number;
  stock_conditioner: number;
}

export async function getAvailableDAs(state = ''): Promise<RawDA[]> {
  // API returns { success: true, das: [...] } — unwrap the das array
  const response = await post<{ success: boolean; das: RawDA[]; error?: string }>(
    `${TELE}.get_available_das`,
    { state }
  );

  if (!response || !Array.isArray(response.das)) {
    console.warn('getAvailableDAs: unexpected response shape', response);
    return [];
  }

  return response.das;
}

export async function assignDAtoOrder(
  order: string,
  da: string
): Promise<{ success: boolean; error?: string }> {
  return post(`${TELE}.assign_da_to_order`, { order, da });
}
