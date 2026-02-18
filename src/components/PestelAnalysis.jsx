import { useState } from 'react';
import { calculateGUTScore, getGUTScoreColor } from '../utils/scoring';

export default function PestelAnalysis({
  companyData,
  companyPestelData,
  setCompanyPestelData,
  productPestels,
  setProductPestels,
  selectedPestelScope,
  setSelectedPestelScope,
}) {
  const [editingFactor, setEditingFactor] = useState(null);

  const addEnhancedFactor = (category, factorData, isProductSpecific = false, productName = '') => {
    const newFactor = {
      name: factorData.name || '',
      gravity: factorData.gravity || 3,
      urgency: factorData.urgency || 3,
      tendency: factorData.tendency || 3,
      description: factorData.description || ''
    };

    if (isProductSpecific && productName) {
      setProductPestels(prev => ({
        ...prev,
        [productName]: {
          ...prev[productName],
          [category]: {
            ...prev[productName][category],
            factors: [...prev[productName][category].factors, newFactor]
          }
        }
      }));
    } else {
      setCompanyPestelData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          factors: [...prev[category].factors, newFactor]
        }
      }));
    }
  };

  const updateFactor = (category, index, updatedFactor, isProductSpecific = false, productName = '') => {
    if (isProductSpecific && productName) {
      const updatedFactors = [...productPestels[productName][category].factors];
      updatedFactors[index] = updatedFactor;
      setProductPestels(prev => ({
        ...prev,
        [productName]: {
          ...prev[productName],
          [category]: {
            ...prev[productName][category],
            factors: updatedFactors
          }
        }
      }));
    } else {
      const updatedFactors = [...companyPestelData[category].factors];
      updatedFactors[index] = updatedFactor;
      setCompanyPestelData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          factors: updatedFactors
        }
      }));
    }
  };

  const removeFactor = (category, index, isProductSpecific = false, productName = '') => {
    if (isProductSpecific && productName) {
      const updatedFactors = productPestels[productName][category].factors.filter((_, i) => i !== index);
      setProductPestels(prev => ({
        ...prev,
        [productName]: {
          ...prev[productName],
          [category]: { ...prev[productName][category], factors: updatedFactors }
        }
      }));
    } else {
      const updatedFactors = companyPestelData[category].factors.filter((_, i) => i !== index);
      setCompanyPestelData(prev => ({
        ...prev,
        [category]: { ...prev[category], factors: updatedFactors }
      }));
    }
  };

  const toggleCategoryCollapse = (category, isProductSpecific = false, productName = '') => {
    if (isProductSpecific && productName) {
      setProductPestels(prev => ({
        ...prev,
        [productName]: {
          ...prev[productName],
          [category]: {
            ...prev[productName][category],
            isCollapsed: !prev[productName][category].isCollapsed
          }
        }
      }));
    } else {
      setCompanyPestelData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          isCollapsed: !prev[category].isCollapsed
        }
      }));
    }
  };

  const calculateProductRiskScore = (productName) => {
    if (!productPestels[productName]) return 0;
    let totalScore = 0;
    Object.values(productPestels[productName]).forEach(category => {
      if (category.factors) {
        category.factors.forEach(factor => {
          totalScore += calculateGUTScore(factor);
        });
      }
    });
    const maxPossibleScore = Object.values(productPestels[productName]).reduce(
      (sum, cat) => sum + (cat.factors ? cat.factors.length : 0), 0
    ) * 125;
    if (maxPossibleScore === 0) return 0;
    return Math.round((totalScore / maxPossibleScore) * 5);
  };

  const getProductRiskLevel = (productName) => {
    const score = calculateProductRiskScore(productName);
    if (score >= 4) return { color: 'risk-high', label: 'High Risk' };
    if (score >= 3) return { color: 'risk-medium', label: 'Medium Risk' };
    if (score >= 2) return { color: 'risk-medium', label: 'Medium Risk' };
    if (score >= 1) return { color: 'risk-low', label: 'Low Risk' };
    return { color: 'text-gray-600 bg-gray-100', label: 'No Analysis Yet' };
  };

  const renderPestelFactors = (pestelData, isProductSpecific = false, productName = '') => {
    return Object.entries(pestelData).map(([category, data]) => (
      <div key={category} className="mb-6 border border-gray-200 rounded-lg">
        <div
          className="collapsible-header"
          onClick={() => toggleCategoryCollapse(category, isProductSpecific, productName)}
        >
          <h4 className="font-semibold text-gray-800 capitalize">{category} Factors</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {data.factors.length} factor{data.factors.length !== 1 ? 's' : ''}
            </span>
            <i className={`fas ${data.isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
          </div>
        </div>

        <div className={`collapsible-content ${data.isCollapsed ? '' : 'open'}`}>
          <div className="collapsible-content-inner">
            <div className="mb-4">
              <button
                onClick={() => addEnhancedFactor(category, { name: `New ${category} factor` }, isProductSpecific, productName)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <i className="fas fa-plus mr-1"></i>Add Factor
              </button>
            </div>

            <div className="space-y-3">
              {data.factors.map((factor, index) => {
                const gutScore = calculateGUTScore(factor);
                const isEditing = editingFactor === `${productName || 'company'}-${category}-${index}`;

                return (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={factor.name}
                          onChange={(e) => updateFactor(category, index, { ...factor, name: e.target.value }, isProductSpecific, productName)}
                          className="input-field"
                          placeholder="Factor name..."
                        />
                        <textarea
                          value={factor.description}
                          onChange={(e) => updateFactor(category, index, { ...factor, description: e.target.value }, isProductSpecific, productName)}
                          className="input-field"
                          rows="2"
                          placeholder="Detailed description..."
                        ></textarea>

                        <div className="grid grid-cols-3 gap-3">
                          {['gravity', 'urgency', 'tendency'].map(field => (
                            <div key={field}>
                              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field} (1-5)</label>
                              <select
                                value={factor[field]}
                                onChange={(e) => updateFactor(category, index, { ...factor, [field]: parseInt(e.target.value) }, isProductSpecific, productName)}
                                className="input-field text-sm"
                              >
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setEditingFactor(null)} className="button-primary">Save</button>
                          <button onClick={() => setEditingFactor(null)} className="button-secondary">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium text-gray-800">{factor.name}</h6>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getGUTScoreColor(gutScore)}`}>
                              G.U.T: {gutScore}
                            </span>
                            <button
                              onClick={() => setEditingFactor(`${productName || 'company'}-${category}-${index}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => removeFactor(category, index, isProductSpecific, productName)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-600">G: {factor.gravity}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-600">U: {factor.urgency}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-600">T: {factor.tendency}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="form-section">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">PESTEL Analysis</h3>
            <p className="text-gray-600">Analyze external macro-environmental factors using G.U.T scoring</p>
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="pestel-scope-select" className="text-sm font-medium text-gray-700">View:</label>
            <select
              id="pestel-scope-select"
              value={selectedPestelScope}
              onChange={(e) => setSelectedPestelScope(e.target.value)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <option value="company">Company PESTEL</option>
              {companyData.keyProducts.map((product, index) => (
                <option key={index} value={product}>{product} PESTEL</option>
              ))}
            </select>
          </div>
        </div>

        {companyData.keyProducts.length === 0 && selectedPestelScope !== 'company' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <i className="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-1"></i>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">No Products Added</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Add products in the Company Info section to enable product-specific PESTEL analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPestelScope === 'company' ? (
        <div className="form-section">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Company-Wide PESTEL Analysis</h4>
            <p className="text-gray-600 text-sm">
              Analyze macro-environmental factors that affect your entire company across all products and services.
            </p>
          </div>
          {renderPestelFactors(companyPestelData)}
        </div>
      ) : (
        <div className="form-section">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{selectedPestelScope}</h4>
              <p className="text-gray-600">Product-Specific PESTEL Analysis</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded text-sm font-bold ${getProductRiskLevel(selectedPestelScope).color}`}>
                {getProductRiskLevel(selectedPestelScope).label}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Risk Score: {calculateProductRiskScore(selectedPestelScope)}/5
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">
              <i className="fas fa-lightbulb mr-2"></i>
              Analysis Guidance
            </h5>
            <p className="text-sm text-blue-700">
              Focus on factors that specifically impact <strong>{selectedPestelScope}</strong>.
              Consider how each environmental factor affects this product's development, marketing,
              distribution, and customer adoption differently from your other products.
            </p>
          </div>

          {productPestels[selectedPestelScope] ? (
            renderPestelFactors(productPestels[selectedPestelScope], true, selectedPestelScope)
          ) : (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-spinner fa-spin text-2xl mb-4"></i>
              <p>Loading product PESTEL data...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
