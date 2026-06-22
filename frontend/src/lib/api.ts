import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ---- Sessão anônima (carrinho sem login) ----
const SESSION_KEY = 'rl_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ---- Token de autenticação ----
const TOKEN_KEY = 'rl_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: BASE_URL,
});

// Injeta token (se houver) e sempre o sessionId anônimo
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-session-id'] = getSessionId();
  return config;
});

// Desempacota { success, data } e normaliza erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Algo deu errado. Tente novamente.';

    // Em requests de download (blob), o corpo do erro vem como Blob — extrai o JSON
    if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        /* mantém a mensagem padrão */
      }
    }

    return Promise.reject(new Error(message));
  }
);

// Helper que já retorna o `data` interno
export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const { data } = await api.get(url, { params });
  return data.data as T;
}

export async function apiPost<T>(url: string, body?: object): Promise<T> {
  const { data } = await api.post(url, body);
  return data.data as T;
}

export async function apiPatch<T>(url: string, body?: object): Promise<T> {
  const { data } = await api.patch(url, body);
  return data.data as T;
}

export async function apiPut<T>(url: string, body?: object): Promise<T> {
  const { data } = await api.put(url, body);
  return data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  return data?.data as T;
}
