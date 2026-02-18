import { useRef } from 'react';
import { calculateGUTScore } from '../utils/scoring';

export default function SwotAnalysis({
  internalIssues,
  companyPestelData,
  swotData,
  setSwotData,
}) {
  const opportunityRef = useRef(null);
  const threatRef = useRef(null);

  const autoPopulate = () => {
    const opportunities = [];
    const threats = [];

    Object.entries(companyPestelData).forEach(([category, data]) => {
      data.factors.forEach(factor => {
        const score = calculateGUTScore(factor);
        if (score >= 40) {
          threats.push(`${factor.name} (${category}, GUT: ${score})`);
        } else {
          opportunities.push(`${factor.name} (${category}, GUT: ${score})`);
        }
      });
    });

    setSwotData({
      strengths: [...internalIssues.strengths],
      weaknesses: [...internalIssues.weaknesses],
      opportunities: opportunities.length > 0 ? opportunities : ['Market expansion potential', 'Emerging technology adoption', 'Strategic partnerships'],
      threats: threats.length > 0 ? threats : ['Increasing competition', 'Regulatory changes', 'Economic uncertainty'],
    });
  };

  const addItem = (quadrant, value) => {
    if (value.trim()) {
      setSwotData(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], value.trim()]
      }));
    }
  };

  const removeItem = (quadrant, index) => {
    setSwotData(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((_, i) => i !== index)
    }));
  };

  const quadrants = [
    { key: 'strengths', label: 'Strengths', icon: 'fa-arrow-up', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800', btnColor: 'text-green-600 hover:text-green-800' },
    { key: 'weaknesses', label: 'Weaknesses', icon: 'fa-arrow-down', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800', btnColor: 'text-red-600 hover:text-red-800' },
    { key: 'opportunities', label: 'Opportunities', icon: 'fa-lightbulb', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-800', btnColor: 'text-blue-600 hover:text-blue-800' },
    { key: 'threats', label: 'Threats', icon: 'fa-exclamation-triangle', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800', btnColor: 'text-yellow-600 hover:text-yellow-800' },
  ];

  const refs = { opportunities: opportunityRef, threats: threatRef };

  return (
    <div className="space-y-6">
      <div className="form-section">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">SWOT Analysis</h3>
            <p className="text-gray-600">
              Strengths & Weaknesses are pulled from Internal Issues. Opportunities & Threats are derived from PESTEL factors.
            </p>
          </div>
          <button
            onClick={autoPopulate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i> Auto-populate from Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quadrants.map(q => (
            <div key={q.key} className={`p-4 rounded-lg border ${q.borderColor} ${q.bgColor}`}>
              <h4 className={`text-md font-semibold mb-3 flex items-center gap-2 ${q.textColor}`}>
                <i className={`fas ${q.icon}`}></i> {q.label}
              </h4>
              <div className="space-y-2 mb-4">
                {swotData[q.key].length === 0 && (
                  <p className="text-gray-500 text-sm">No {q.label.toLowerCase()} added yet. Click "Auto-populate" to fill from your analysis data.</p>
                )}
                {swotData[q.key].map((item, index) => (
                  <div key={index} className={`flex items-center gap-2 bg-white p-2 rounded border ${q.borderColor}`}>
                    <span className={`flex-1 text-sm ${q.textColor}`}>{item}</span>
                    <button onClick={() => removeItem(q.key, index)} className={`p-1 ${q.btnColor}`}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={refs[q.key] || null}
                  type="text"
                  placeholder={`Add ${q.label.toLowerCase().slice(0, -1)}...`}
                  className="input-field flex-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addItem(q.key, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const ref = refs[q.key];
                    if (ref?.current) {
                      addItem(q.key, ref.current.value);
                      ref.current.value = '';
                    }
                  }}
                  className="button-primary text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
