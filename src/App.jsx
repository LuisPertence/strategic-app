import { useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { generateCompanyData, generateCompanyPestelData, generateCompetitors, generatePortersForces } from './utils/generators';
import CompanyInfo from './components/CompanyInfo';
import PestelAnalysis from './components/PestelAnalysis';
import PortersSixForces from './components/PortersSixForces';
import InternalIssues from './components/InternalIssues';
import SwotAnalysis from './components/SwotAnalysis';
import CustomerSegmentation from './components/CustomerSegmentation';
import IntegrationInsights from './components/IntegrationInsights';

const defaultCompanyData = {
  name: '', industry: '', primaryMarket: '', businessModel: '', size: '', revenue: '',
  description: '', foundedYear: '', headquarters: '', website: '',
  keyProducts: [], missionStatement: '', visionStatement: '', coreValues: [], keyExecutives: []
};

const defaultPestelData = {
  political: { factors: [], isCollapsed: false },
  economic: { factors: [], isCollapsed: false },
  social: { factors: [], isCollapsed: false },
  technological: { factors: [], isCollapsed: false },
  environmental: { factors: [], isCollapsed: false },
  legal: { factors: [], isCollapsed: false }
};

const defaultPortersForces = {
  threatOfNewEntrants: { description: '', gravity: 3, urgency: 3, tendency: 3 },
  bargainingPowerOfBuyers: { description: '', gravity: 3, urgency: 3, tendency: 3 },
  bargainingPowerOfSuppliers: { description: '', gravity: 3, urgency: 3, tendency: 3 },
  threatOfSubstituteProductsOrServices: { description: '', gravity: 3, urgency: 3, tendency: 3 },
  rivalryAmongExistingCompetitors: { description: '', gravity: 3, urgency: 3, tendency: 3 },
  relativePowerOfNewComplementors: { description: '', gravity: 3, urgency: 3, tendency: 3 }
};

export default function App() {
  const [currentPhase, setCurrentPhase] = useLocalStorage('sps-currentPhase', 'company-info');
  const [companyData, setCompanyData] = useLocalStorage('sps-companyData', defaultCompanyData);
  const [companyPestelData, setCompanyPestelData] = useLocalStorage('sps-companyPestelData', defaultPestelData);
  const [productPestels, setProductPestels] = useLocalStorage('sps-productPestels', {});
  const [selectedPestelScope, setSelectedPestelScope] = useLocalStorage('sps-selectedPestelScope', 'company');
  const [competitors, setCompetitors] = useLocalStorage('sps-competitors', []);
  const [portersForces, setPortersForces] = useLocalStorage('sps-portersForces', defaultPortersForces);
  const [internalIssues, setInternalIssues] = useLocalStorage('sps-internalIssues', { strengths: [], weaknesses: [] });
  const [swotData, setSwotData] = useLocalStorage('sps-swotData', { strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [customerSegments, setCustomerSegments] = useLocalStorage('sps-customerSegments', []);

  useEffect(() => {
    if (companyData.industry || companyData.primaryMarket) {
      setPortersForces(generatePortersForces(companyData.industry, companyData.primaryMarket));
    }
  }, [companyData.industry, companyData.primaryMarket]);

  const phases = [
    { id: 'company-info', name: 'Company Info', icon: 'fas fa-building' },
    { id: 'pestel', name: 'PESTEL Analysis', icon: 'fas fa-globe' },
    { id: 'porter', name: "Porter's Six Forces", icon: 'fas fa-chess' },
    { id: 'internal-issues', name: 'Internal Issues', icon: 'fas fa-cogs' },
    { id: 'swot', name: 'SWOT Analysis', icon: 'fas fa-chart-line' },
    { id: 'customer', name: 'Customer Segmentation', icon: 'fas fa-user-friends' },
    { id: 'integration', name: 'Integration & Insights', icon: 'fas fa-link' }
  ];

  const initializeProductPestel = (productName) => {
    if (!productPestels[productName]) {
      const initialProductPestel = {};
      Object.entries(companyPestelData).forEach(([category, data]) => {
        initialProductPestel[category] = {
          factors: data.factors.map(factor => ({ ...factor })),
          isCollapsed: false
        };
      });
      setProductPestels(prev => ({ ...prev, [productName]: initialProductPestel }));
    }
  };

  const handleProductAdded = (productName) => {
    initializeProductPestel(productName);
  };

  const handleProductRemoved = (productName) => {
    setProductPestels(prev => {
      const updated = { ...prev };
      delete updated[productName];
      return updated;
    });
    if (selectedPestelScope === productName) {
      setSelectedPestelScope('company');
    }
  };

  const researchCompany = async () => {
    const companyName = companyData.name.trim();
    if (!companyName) return;

    try {
      setCompanyData(prev => ({ ...prev, description: 'Researching company information...' }));
      await new Promise(resolve => setTimeout(resolve, 1500));

      const researchedData = generateCompanyData(companyName);
      const companyPestelAnalysis = generateCompanyPestelData(companyName, researchedData.industry);
      const generatedCompetitors = generateCompetitors(companyName);
      const generatedPortersForces = generatePortersForces(researchedData.industry, researchedData.primaryMarket);

      setCompanyData(prev => ({ ...prev, ...researchedData, name: companyName }));
      setCompanyPestelData(companyPestelAnalysis);
      setCompetitors(generatedCompetitors);
      setPortersForces(generatedPortersForces);

      const newProductPestels = {};
      researchedData.keyProducts.forEach(product => {
        const initialProductPestel = {};
        Object.entries(companyPestelAnalysis).forEach(([category, data]) => {
          initialProductPestel[category] = {
            factors: data.factors.map(factor => ({ ...factor })),
            isCollapsed: false
          };
        });
        newProductPestels[product] = initialProductPestel;
      });
      setProductPestels(newProductPestels);
    } catch (error) {
      console.error('Research error:', error);
      setCompanyData(prev => ({ ...prev, description: '' }));
    }
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'company-info':
        return (
          <CompanyInfo
            companyData={companyData}
            setCompanyData={setCompanyData}
            onProductAdded={handleProductAdded}
            onProductRemoved={handleProductRemoved}
            researchCompany={researchCompany}
          />
        );
      case 'pestel':
        return (
          <PestelAnalysis
            companyData={companyData}
            companyPestelData={companyPestelData}
            setCompanyPestelData={setCompanyPestelData}
            productPestels={productPestels}
            setProductPestels={setProductPestels}
            selectedPestelScope={selectedPestelScope}
            setSelectedPestelScope={setSelectedPestelScope}
          />
        );
      case 'porter':
        return (
          <PortersSixForces
            companyData={companyData}
            portersForces={portersForces}
            setPortersForces={setPortersForces}
          />
        );
      case 'internal-issues':
        return (
          <InternalIssues
            companyData={companyData}
            internalIssues={internalIssues}
            setInternalIssues={setInternalIssues}
          />
        );
      case 'swot':
        return (
          <SwotAnalysis
            internalIssues={internalIssues}
            companyPestelData={companyPestelData}
            swotData={swotData}
            setSwotData={setSwotData}
          />
        );
      case 'customer':
        return (
          <CustomerSegmentation
            segments={customerSegments}
            setSegments={setCustomerSegments}
          />
        );
      case 'integration':
        return (
          <IntegrationInsights
            companyData={companyData}
            companyPestelData={companyPestelData}
            portersForces={portersForces}
            internalIssues={internalIssues}
            swotData={swotData}
            customerSegments={customerSegments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="strategic-planning-suite">
      <div className="header">
        <h1 className="text-2xl font-bold">Strategic Planning Suite</h1>
      </div>
      <div className="nav-tabs">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setCurrentPhase(phase.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPhase === phase.id ? 'active-tab' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className={`${phase.icon} mr-2`}></i>
            {phase.name}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {renderCurrentPhase()}
      </div>
    </div>
  );
}
