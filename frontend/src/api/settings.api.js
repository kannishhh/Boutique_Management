import { apiFetch } from "./client";

export function fetchSettings() {
  return apiFetch("/settings");
}

export function updateProfile(payload) {
  return apiFetch("/settings/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateBoutique(payload) {
  return apiFetch("/settings/boutique", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateNotifications(payload) {
  return apiFetch("/settings/notifications", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateAppearance(payload) {
  return apiFetch("/settings/appearance", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return apiFetch("/settings/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadProfilePhoto(formData) {
  return apiFetch("/settings/upload/profile", {
    method: "PUT",
    body: formData,
  });
}
