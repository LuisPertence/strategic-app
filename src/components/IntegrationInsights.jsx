import { calculateGUTScore, getGUTScoreColor, getImpactLevel } from '../utils/scoring';

export default function IntegrationInsights({
  companyData,
  companyPestelData,
  portersForces,
  internalIssues,
  swotData,
  customerSegments,
}) {
  const pestelSummary = () => {
    let totalFactors = 0;
    let highRiskFactors = 0;
    let totalScore = 0;

    Object.values(companyPestelData).forEach(category => {
      category.factors.forEach(factor => {
        const score = calculateGUTScore(factor);
        totalFactors++;
        totalScore += score;
        if (score >= 40) highRiskFactors++;
      });
    });

    return { totalFactors, highRiskFactors, avgScore: totalFactors > 0 ? Math.round(totalScore / totalFactors) : 0 };
  };

  const portersSummary = () => {
    const forces = Object.entries(portersForces).map(([key, data]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      score: calculateGUTScore(data),
    }));
    const avgScore = forces.length > 0
      ? Math.round(forces.reduce((sum, f) => sum + f.score, 0) / forces.length)
      : 0;
    const highestForce = forces.reduce((max, f) => f.score > max.score ? f : max, { score: 0 });
    return { forces, avgScore, highestForce };
  };

  const pestel = pestelSummary();
  const porters = portersSummary();
  const hasCompanyData = companyData.name && companyData.industry;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">Integration & Insights Dashboard</h3>
        <p className="text-indigo-100">
          A consolidated view of all your strategic analysis data.
          {!hasCompanyData && ' Fill in Company Info to get started.'}
        </p>
      </div>

      {/* Company Overview */}
      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          <i className="fas fa-building mr-2 text-blue-500"></i> Company Overview
        </h4>
        {hasCompanyData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Company</div>
              <div className="font-semibold">{companyData.name}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Industry</div>
              <div className="font-semibold">{companyData.industry}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Market</div>
              <div className="font-semibold">{companyData.primaryMarket || 'Not set'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Products</div>
              <div className="font-semibold">{companyData.keyProducts.length}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No company data entered yet.</p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-section">
          <h4 className="font-semibold text-gray-800 mb-3">
            <i className="fas fa-globe mr-2 text-green-500"></i> PESTEL Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Factors</span>
              <span className="font-bold">{pestel.totalFactors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">High-Risk Factors</span>
              <span className="font-bold text-red-600">{pestel.highRiskFactors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg GUT Score</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGUTScoreColor(pestel.avgScore)}`}>
                {pestel.avgScore}
              </span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="font-semibold text-gray-800 mb-3">
            <i className="fas fa-chess mr-2 text-purple-500"></i> Porter's Forces Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Force Score</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGUTScoreColor(porters.avgScore)}`}>
                {porters.avgScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Highest Threat</span>
              <span className="font-bold text-sm text-right max-w-[60%] truncate">{porters.highestForce.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Impact Level</span>
              <span className="text-sm font-semibold">{getImpactLevel(porters.avgScore)}</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="font-semibold text-gray-800 mb-3">
            <i className="fas fa-chart-line mr-2 text-blue-500"></i> Internal & SWOT
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Strengths</span>
              <span className="font-bold text-green-600">{internalIssues.strengths.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weaknesses</span>
              <span className="font-bold text-red-600">{internalIssues.weaknesses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Opportunities</span>
              <span className="font-bold text-blue-600">{swotData.opportunities.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Threats</span>
              <span className="font-bold text-yellow-600">{swotData.threats.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer Segments</span>
              <span className="font-bold">{customerSegments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Porter's Forces Breakdown */}
      <div className="form-section">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          <i className="fas fa-chess mr-2 text-purple-500"></i> Competitive Forces Breakdown
        </h4>
        <div className="space-y-3">
          {porters.forces.map((force, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 w-56 capitalize">{force.name}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    force.score >= 80 ? 'bg-red-500' : force.score >= 40 ? 'bg-orange-400' : force.score >= 20 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min((force.score / 125) * 100, 100)}%` }}
                ></div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold min-w-[50px] text-center ${getGUTScoreColor(force.score)}`}>
                {force.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      {hasCompanyData && (
        <div className="form-section">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-lightbulb mr-2 text-yellow-500"></i> Key Observations
          </h4>
          <div className="space-y-3">
            {pestel.highRiskFactors > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                <div>
                  <div className="font-medium text-red-800">High-Risk External Factors</div>
                  <div className="text-sm text-red-700">
                    {pestel.highRiskFactors} PESTEL factor{pestel.highRiskFactors !== 1 ? 's' : ''} scored above the high-risk threshold (GUT &ge; 40). Review and develop mitigation strategies.
                  </div>
                </div>
              </div>
            )}
            {internalIssues.weaknesses.length > internalIssues.strengths.length && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <i className="fas fa-balance-scale text-yellow-500 mt-0.5"></i>
                <div>
                  <div className="font-medium text-yellow-800">Strength-Weakness Imbalance</div>
                  <div className="text-sm text-yellow-700">
                    You have more weaknesses ({internalIssues.weaknesses.length}) than strengths ({internalIssues.strengths.length}). Consider strategies to address key weaknesses.
                  </div>
                </div>
              </div>
            )}
            {porters.avgScore >= 40 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <i className="fas fa-chess-knight text-orange-500 mt-0.5"></i>
                <div>
                  <div className="font-medium text-orange-800">High Competitive Pressure</div>
                  <div className="text-sm text-orange-700">
                    Average Porter's Forces score is {porters.avgScore} ({getImpactLevel(porters.avgScore)}). Consider differentiation strategies to strengthen your competitive position.
                  </div>
                </div>
              </div>
            )}
            {customerSegments.length === 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                <div>
                  <div className="font-medium text-blue-800">Customer Segments Missing</div>
                  <div className="text-sm text-blue-700">
                    Define your customer segments to complete the strategic picture and identify growth opportunities.
                  </div>
                </div>
              </div>
            )}
            {pestel.highRiskFactors === 0 && internalIssues.strengths.length >= internalIssues.weaknesses.length && porters.avgScore < 40 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                <div>
                  <div className="font-medium text-green-800">Positive Strategic Position</div>
                  <div className="text-sm text-green-700">
                    Your analysis indicates a favourable strategic position with manageable external risks and strong internal capabilities.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
