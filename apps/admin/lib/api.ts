const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: (token: string) =>
    apiFetch<{ id: number; username: string }>("/api/auth/me", { token }),
};

// Menus
export const menuApi = {
  list: (token: string) => apiFetch<any[]>("/api/admin/menus", { token }),
  create: (token: string, data: any) =>
    apiFetch("/api/admin/menus", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  update: (token: string, id: number, data: any) =>
    apiFetch(`/api/admin/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  delete: (token: string, id: number) =>
    apiFetch(`/api/admin/menus/${id}`, { method: "DELETE", token }),
};

// Categories
export const categoryApi = {
  list: (token: string) => apiFetch<any[]>("/api/admin/categories", { token }),
  create: (token: string, data: any) =>
    apiFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  update: (token: string, id: number, data: any) =>
    apiFetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  delete: (token: string, id: number) =>
    apiFetch(`/api/admin/categories/${id}`, { method: "DELETE", token }),
};

// Articles
export const articleApi = {
  list: (token: string, params?: Record<string, any>) => {
    const query = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiFetch<{
      items: any[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>(`/api/admin/articles${query}`, { token });
  },
  get: (token: string, id: number) =>
    apiFetch<any>(`/api/admin/articles/${id}`, { token }),
  create: (token: string, data: any) =>
    apiFetch("/api/admin/articles", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  update: (token: string, id: number, data: any) =>
    apiFetch(`/api/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  delete: (token: string, id: number) =>
    apiFetch(`/api/admin/articles/${id}`, { method: "DELETE", token }),
};

// Banners
export const bannerApi = {
  list: (token: string) => apiFetch<any[]>("/api/admin/banners", { token }),
  create: (token: string, data: any) =>
    apiFetch("/api/admin/banners", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  update: (token: string, id: number, data: any) =>
    apiFetch(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  delete: (token: string, id: number) =>
    apiFetch(`/api/admin/banners/${id}`, { method: "DELETE", token }),
};

// Settings
export const settingsApi = {
  get: (token: string) =>
    apiFetch<Record<string, string>>("/api/admin/settings", { token }),
  update: (token: string, settings: { key: string; value: string }[]) =>
    apiFetch("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
      token,
    }),
};

// Stats
export const statsApi = {
  get: (token: string) => apiFetch<any>("/api/admin/stats", { token }),
};

// Upload
export async function uploadFile(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

