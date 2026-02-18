import { useRef } from 'react';

const prefillData = {
  Technology: {
    startup: {
      strengths: ["Innovative product development", "Agile and flexible team", "Strong technical expertise"],
      weaknesses: ["Limited market presence", "Resource constraints", "Lack of brand recognition"]
    },
    enterprise: {
      strengths: ["Established market leadership", "Robust R&D capabilities", "Strong customer base"],
      weaknesses: ["Bureaucratic decision-making", "Slower innovation cycles", "Legacy system dependencies"]
    }
  },
  Healthcare: {
    small: {
      strengths: ["Personalized patient care", "Strong community relationships", "Specialized medical expertise"],
      weaknesses: ["Limited funding", "Regulatory compliance challenges", "Smaller operational scale"]
    },
    medium: {
      strengths: ["Comprehensive service offerings", "Experienced medical staff", "Growing reputation"],
      weaknesses: ["Complex regulatory environment", "High operational costs", "Competition from larger providers"]
    }
  },
};

export default function InternalIssues({ companyData, internalIssues, setInternalIssues }) {
  const strengthsInputRef = useRef(null);
  const weaknessesInputRef = useRef(null);

  const prefillInternalIssues = () => {
    const industry = companyData.industry || '';
    const size = companyData.size || '';
    const industryData = prefillData[industry];
    let strengths, weaknesses;

    if (industryData && industryData[size]) {
      strengths = industryData[size].strengths;
      weaknesses = industryData[size].weaknesses;
    } else {
      strengths = ["Strong leadership", "Dedicated workforce", "Good customer relationships"];
      weaknesses = ["Limited market reach", "Resource limitations", "Need for process improvements"];
    }

    setInternalIssues({ strengths, weaknesses });
  };

  const addIssue = (type, issue) => {
    if (issue.trim()) {
      setInternalIssues(prev => ({
        ...prev,
        [type]: [...prev[type], issue.trim()]
      }));
    }
  };

  const removeIssue = (type, index) => {
    setInternalIssues(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Internal Issues</h3>
        <p className="text-gray-600 mb-6">
          Identify and manage internal strengths and weaknesses of your company.
        </p>

        <button
          onClick={prefillInternalIssues}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <i className="fas fa-magic mr-2"></i> Pre-fill Strengths & Weaknesses
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-plus-circle text-green-500"></i> Strengths
            </h4>
            <div className="space-y-2 mb-4">
              {internalIssues.strengths.length === 0 && (
                <p className="text-gray-500 text-sm">No strengths added yet.</p>
              )}
              {internalIssues.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 bg-green-50 p-2 rounded border border-green-200">
                  <span className="flex-1 text-green-800">{strength}</span>
                  <button
                    onClick={() => removeIssue('strengths', index)}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={strengthsInputRef}
                type="text"
                placeholder="Add a strength..."
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addIssue('strengths', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  if (strengthsInputRef.current) {
                    addIssue('strengths', strengthsInputRef.current.value);
                    strengthsInputRef.current.value = '';
                  }
                }}
                className="button-primary"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-minus-circle text-red-500"></i> Weaknesses
            </h4>
            <div className="space-y-2 mb-4">
              {internalIssues.weaknesses.length === 0 && (
                <p className="text-gray-500 text-sm">No weaknesses added yet.</p>
              )}
              {internalIssues.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200">
                  <span className="flex-1 text-red-800">{weakness}</span>
                  <button
                    onClick={() => removeIssue('weaknesses', index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={weaknessesInputRef}
                type="text"
                placeholder="Add a weakness..."
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addIssue('weaknesses', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  if (weaknessesInputRef.current) {
                    addIssue('weaknesses', weaknessesInputRef.current.value);
                    weaknessesInputRef.current.value = '';
                  }
                }}
                className="button-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
