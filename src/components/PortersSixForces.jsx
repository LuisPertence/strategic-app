import { calculateGUTScore, getGUTScoreColor, getImpactLevel } from '../utils/scoring';

export default function PortersSixForces({ companyData, portersForces, setPortersForces }) {
  const updatePorterForce = (forceKey, field, value) => {
    setPortersForces(prev => ({
      ...prev,
      [forceKey]: {
        ...prev[forceKey],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Porter's Six Forces Analysis</h3>
        <p className="text-gray-600 mb-6">
          Analyze the competitive intensity and attractiveness of your industry based on the industry and primary market you entered in Company Info.
          Use the G.U.T. (Gravity, Urgency, Tendency) scoring system to assess the impact of each force.
        </p>

        {(!companyData.industry && !companyData.primaryMarket) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <i className="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-1"></i>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Missing Information</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Please fill in the "Industry" and "Primary Market" fields in the "Company Info" tab to auto-populate this section.
                </p>
              </div>
            </div>
          </div>
        )}

        {Object.entries(portersForces).map(([forceKey, forceData]) => {
          const gutScore = calculateGUTScore(forceData);
          const impactLevel = getImpactLevel(gutScore);

          return (
            <div key={forceKey} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {forceKey.replace(/([A-Z])/g, ' $1').replace('Of', 'of ').replace('Or', 'or ')}
              </label>
              <textarea
                value={forceData.description}
                onChange={(e) => updatePorterForce(forceKey, 'description', e.target.value)}
                className="input-field mb-3"
                rows="3"
                placeholder={`Analysis for ${forceKey.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
              ></textarea>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {['gravity', 'urgency', 'tendency'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field} (1-5)</label>
                    <select
                      value={forceData[field]}
                      onChange={(e) => updatePorterForce(forceKey, field, parseInt(e.target.value))}
                      className="input-field text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-3 py-1 rounded text-sm font-bold ${getGUTScoreColor(gutScore)}`}>
                  G.U.T. Score: {gutScore}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  Impact: {impactLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
