import api from "./client";

export async function predictDigit({ image, source }) {
  const { data } = await api.post("/predictions/predict", { image, source });
  return data.prediction;
}

export async function listPredictions({ page = 1, perPage = 20, q, source, sortBy, order } = {}) {
  const { data } = await api.get("/predictions", {
    params: { page, per_page: perPage, q, source, sort_by: sortBy, order },
  });
  return data;
}

export async function deletePrediction(id) {
  await api.delete(`/predictions/${id}`);
}

export async function getAnalyticsSummary() {
  const { data } = await api.get("/predictions/analytics/summary");
  return data;
}
