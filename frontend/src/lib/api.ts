const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:4000";

type RequestOptions = { method?: string; body?: unknown; token?: string | null };

export async function api(path: string, { method = "GET", body, token }: RequestOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }
  return data;
}
