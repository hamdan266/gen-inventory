const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

export const getDashboard = (period = "month") =>
  api(`/api/reports/dashboard?period=${period}`);

export const getProfitLoss = (year = new Date().getFullYear()) =>
  api(`/api/reports/profit-loss?year=${year}`);

export const getInventoryReport = () => api(`/api/reports/inventory`);

export const getProducts = (params = "") => api(`/api/products${params}`);

export const getCategories = () => api(`/api/categories`);

export const getTransactions = (params = "") =>
  api(`/api/transactions${params}`);

export const getExpenses = (params = "") => api(`/api/expenses${params}`);

export const createProduct = (data: unknown) =>
  api(`/api/products`, { method: "POST", body: JSON.stringify(data) });

export const createTransaction = (data: unknown) =>
  api(`/api/transactions`, { method: "POST", body: JSON.stringify(data) });

export const createExpense = (data: unknown) =>
  api(`/api/expenses`, { method: "POST", body: JSON.stringify(data) });
