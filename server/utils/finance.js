const roundCurrency = (value) => Number((value || 0).toFixed(2));

const calculateEarnings = (views, payoutPer1000Views) =>
  roundCurrency((Number(views) / 1000) * Number(payoutPer1000Views));

module.exports = {
  roundCurrency,
  calculateEarnings,
};
