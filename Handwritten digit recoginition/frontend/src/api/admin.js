import api from "./client";

export async function listAllUsers({ page = 1, perPage = 20, q } = {}) {
  const { data } = await api.get("/admin/users", { params: { page, per_page: perPage, q } });
  return data;
}

export async function updateUser(userId, updates) {
  const { data } = await api.patch(`/admin/users/${userId}`, updates);
  return data.user;
}

export async function deleteUser(userId) {
  await api.delete(`/admin/users/${userId}`);
}

export async function listAllPredictions({ page = 1, perPage = 20 } = {}) {
  const { data } = await api.get("/admin/predictions", { params: { page, per_page: perPage } });
  return data;
}

export async function adminDeletePrediction(id) {
  await api.delete(`/admin/predictions/${id}`);
}

export async function getPlatformAnalytics() {
  const { data } = await api.get("/admin/analytics");
  return data;
}

export async function getModelStats() {
  const { data } = await api.get("/admin/model-stats");
  return data;
}

export async function listSystemLogs({ page = 1, perPage = 30, level } = {}) {
  const { data } = await api.get("/admin/logs", { params: { page, per_page: perPage, level } });
  return data;
}
