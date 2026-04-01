import { apiFetch } from "./client";

export const getPayments = (orderId) => apiFetch(`/orders/${orderId}/payments`);

export const addPayments = (orderId, body) =>
  apiFetch(`/orders/${orderId}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
