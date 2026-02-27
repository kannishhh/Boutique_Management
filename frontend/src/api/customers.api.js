import { apiFetch } from "./client";

export function fetchCustomers() {
  return apiFetch("/customers");
}

export function createCustomer(payload) {
  return apiFetch("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCustomer(customerId, payload) {
  return apiFetch(`/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomer(customerId) {
  return apiFetch(`/customers/${customerId}`, {
    method: "DELETE",
  });
}

export function fetchCustomerMeasurements(customerId) {
  return apiFetch(`/customers/${customerId}/measurements`);
}
