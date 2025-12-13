// frontend/src/utils/formatDate.js
export function formatDateISO(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}
