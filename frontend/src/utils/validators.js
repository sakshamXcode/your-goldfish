// frontend/src/utils/validators.js
export function isPhoneValid(phone) {
  if (!phone) return false;
  // basic international phone check (very permissive)
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 16;
}
