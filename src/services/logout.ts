export async function logout(): Promise<void> {
  await fetch('/api/method/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': getCsrfToken(),
    },
  });
}