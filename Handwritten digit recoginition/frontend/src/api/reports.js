import api from "./client";

async function downloadBlob(url, params, filename) {
  const response = await api.get(url, { params, responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function downloadCsvReport(params) {
  return downloadBlob("/reports/csv", params, "digisense-predictions.csv");
}

export function downloadPdfReport(params) {
  return downloadBlob("/reports/pdf", params, "digisense-predictions.pdf");
}
