import api from "./client";

export async function listNotifications({ page = 1, perPage = 20 } = {}) {
  const { data } = await api.get("/notifications", { params: { page, per_page: perPage } });
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all");
}
