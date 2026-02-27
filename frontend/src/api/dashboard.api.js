import { apiFetch } from "./client";

export function fetchDashboardStats() {
  return apiFetch("/dashboard/stats");
}

export function fetchRevenueStats() {
  return apiFetch("/dashboard/revenue");
}
