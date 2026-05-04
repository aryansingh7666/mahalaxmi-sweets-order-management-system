export function calculateKgPrice(grams, pricePerKg) {
  return (grams / 1000) * pricePerKg;
}

export function calculatePiecePrice(quantity, pricePerPiece) {
  return quantity * pricePerPiece;
}

export function gramsToKg(grams) {
  return grams / 1000;
}

export function kgToGrams(kg) {
  return kg * 1000;
}

export function priceToGrams(price, pricePerKg) {
  if (pricePerKg <= 0) return 0;
  return (price / pricePerKg) * 1000;
}

export function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatWeight(grams) {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return Number.isInteger(kg) ? `${kg} kg` : `${parseFloat(kg.toFixed(3))} kg`;
  }
  return `${grams}g`;
}
