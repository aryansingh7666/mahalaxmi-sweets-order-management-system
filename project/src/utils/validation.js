export function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function validateMinOrder(subtotal, minOrderValue) {
  return subtotal >= minOrderValue;
}

export function validateCouponCode(code) {
  return /^[A-Z0-9]{4,20}$/.test(code);
}

export function validateDate(dateStr) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function getFieldError(value, rules) {
  if (rules.required && !validateRequired(value)) {
    return 'This field is required';
  }
  if (rules.phone && !validatePhone(value)) {
    return 'Enter a valid 10-digit phone number';
  }
  if (rules.minOrder && !validateMinOrder(value, rules.minOrder)) {
    return `Minimum order amount is ₹${rules.minOrder}`;
  }
  return '';
}
