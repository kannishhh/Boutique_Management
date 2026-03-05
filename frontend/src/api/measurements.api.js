import { apiFetch } from "./client";

export function fetchMeasurements() {
  return apiFetch("/measurements");
}

export function fetchMeasurementTemplates() {
  return apiFetch("/api/templates");
}

export function createMeasurement(payload) {
  return apiFetch("/measurements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMeasurement(measurementId, payload) {
  return apiFetch(`/measurements/${measurementId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMeasurement(measurementId) {
  return apiFetch(`/measurements/${measurementId}`, {
    method: "DELETE",
  });
}
