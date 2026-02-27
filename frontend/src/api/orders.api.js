import { apiFetch } from "./client";

export function fetchOrders(options = {}) {
  const { limit } = options;
  const query = limit ? `?limit=${limit}` : "";
  return apiFetch(`/orders${query}`);
}

export function fetchDueOrders() {
  return apiFetch("/orders/due");
}

export function createOrder(payload) {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function addOrderPayment(orderId, amount) {
  return apiFetch(`/orders/${orderId}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ amount }),
  });
}

export function clearOrderPayment(orderId) {
  return apiFetch(`/orders/${orderId}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ clear: true }),
  });
}

export function updateOrderStatus(orderId, status) {
  return apiFetch(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateOrder(orderId, payload) {
  return apiFetch(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteOrder(orderId) {
  return apiFetch(`/orders/${orderId}`, {
    method: "DELETE",
  });
}
