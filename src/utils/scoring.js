export const calculateGUTScore = (factor) => {
  return factor.gravity * factor.urgency * factor.tendency;
};

export const getGUTScoreColor = (score) => {
  if (score >= 80) return 'gut-score-critical';
  if (score >= 40) return 'gut-score-high';
  if (score >= 20) return 'gut-score-medium';
  return 'gut-score-low';
};

export const getImpactLevel = (score) => {
  if (score >= 80) return 'Very High Impact';
  if (score >= 60) return 'High Impact';
  if (score >= 40) return 'Moderate to High Impact';
  if (score >= 20) return 'Moderate Impact';
  if (score >= 10) return 'Low Impact';
  return 'Very Low Impact';
};
