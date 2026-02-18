import { useState } from 'react';

const emptySegment = {
  name: '',
  description: '',
  demographics: '',
  needs: '',
  size: '',
  revenueContribution: '',
  growthPotential: 'medium',
};

export default function CustomerSegmentation({ segments, setSegments }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState({ ...emptySegment });

  const startAdd = () => {
    setDraft({ ...emptySegment });
    setEditingIndex(-1);
  };

  const startEdit = (index) => {
    setDraft({ ...segments[index] });
    setEditingIndex(index);
  };

  const save = () => {
    if (!draft.name.trim()) return;
    if (editingIndex === -1) {
      setSegments(prev => [...prev, { ...draft, name: draft.name.trim() }]);
    } else {
      setSegments(prev => prev.map((s, i) => i === editingIndex ? { ...draft, name: draft.name.trim() } : s));
    }
    setEditingIndex(null);
    setDraft({ ...emptySegment });
  };

  const cancel = () => {
    setEditingIndex(null);
    setDraft({ ...emptySegment });
  };

  const remove = (index) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  };

  const growthColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="form-section">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Customer Segmentation</h3>
            <p className="text-gray-600">Define and analyze your target customer segments</p>
          </div>
          {editingIndex === null && (
            <button onClick={startAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <i className="fas fa-plus mr-2"></i> Add Segment
            </button>
          )}
        </div>

        {editingIndex !== null && (
          <div className="border border-blue-200 rounded-lg p-4 mb-6 bg-blue-50">
            <h4 className="font-semibold text-blue-800 mb-4">
              {editingIndex === -1 ? 'New Customer Segment' : 'Edit Segment'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name *</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Enterprise Clients"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Size</label>
                <input
                  type="text"
                  value={draft.size}
                  onChange={(e) => setDraft(prev => ({ ...prev, size: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 500,000 users"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows="2"
                  placeholder="Describe this customer segment..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demographics</label>
                <input
                  type="text"
                  value={draft.demographics}
                  onChange={(e) => setDraft(prev => ({ ...prev, demographics: e.target.value }))}
                  className="input-field"
                  placeholder="Age, location, income level..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Needs</label>
                <input
                  type="text"
                  value={draft.needs}
                  onChange={(e) => setDraft(prev => ({ ...prev, needs: e.target.value }))}
                  className="input-field"
                  placeholder="What problems do they need solved?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Contribution</label>
                <input
                  type="text"
                  value={draft.revenueContribution}
                  onChange={(e) => setDraft(prev => ({ ...prev, revenueContribution: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 40% of total revenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Potential</label>
                <select
                  value={draft.growthPotential}
                  onChange={(e) => setDraft(prev => ({ ...prev, growthPotential: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="button-primary">
                <i className="fas fa-check mr-1"></i> Save
              </button>
              <button onClick={cancel} className="button-secondary">Cancel</button>
            </div>
          </div>
        )}

        {segments.length === 0 && editingIndex === null && (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-user-friends text-4xl mb-4"></i>
            <p className="text-lg mb-2">No customer segments defined yet</p>
            <p className="text-sm">Click "Add Segment" to start defining your target customer groups.</p>
          </div>
        )}

        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">{segment.name}</h4>
                  {segment.description && <p className="text-gray-600 text-sm mt-1">{segment.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${growthColors[segment.growthPotential]}`}>
                    {segment.growthPotential.charAt(0).toUpperCase() + segment.growthPotential.slice(1)} Growth
                  </span>
                  <button onClick={() => startEdit(index)} className="text-blue-600 hover:text-blue-800">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {segment.demographics && (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500 mb-1">Demographics</div>
                    <div className="text-gray-700">{segment.demographics}</div>
                  </div>
                )}
                {segment.needs && (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500 mb-1">Key Needs</div>
                    <div className="text-gray-700">{segment.needs}</div>
                  </div>
                )}
                {segment.size && (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500 mb-1">Estimated Size</div>
                    <div className="text-gray-700">{segment.size}</div>
                  </div>
                )}
                {segment.revenueContribution && (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500 mb-1">Revenue Share</div>
                    <div className="text-gray-700">{segment.revenueContribution}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
