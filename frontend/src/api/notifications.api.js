import { apiFetch } from "./client";

export function fetchNotifications() {
  return apiFetch("/notifications");
}

export function markNotificationRead(notificationId) {
  return apiFetch(`/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export function markAllNotificationsRead() {
  return apiFetch("/notifications/mark-all", {
    method: "PUT",
  });
}
