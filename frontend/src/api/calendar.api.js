import { apiFetch } from "./client";

export function fetchCalendarOrders() {
  return apiFetch("/calendar/orders");
}
