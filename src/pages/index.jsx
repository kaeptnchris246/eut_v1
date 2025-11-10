import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Marketplace from "./Marketplace";

import SPVDetails from "./SPVDetails";

import Wallet from "./Wallet";

import Portfolio from "./Portfolio";

import IssuerWizard from "./IssuerWizard";

import KYC from "./KYC";

import Impressum from "./Impressum";

import Datenschutz from "./Datenschutz";

import AGB from "./AGB";

import Risikohinweise from "./Risikohinweise";

import ManageSPV from "./ManageSPV";

import SmartContractInfo from "./SmartContractInfo";

import IssuerDashboard from "./IssuerDashboard";

import TradingBot from "./TradingBot";

import BuyEUT from "./BuyEUT";

import ProductionSetup from "./ProductionSetup";

import BACKEND_GUIDE from "./BACKEND_GUIDE";

import SecurityDashboard from "./SecurityDashboard";

import InvestorRelations from "./InvestorRelations";

import APP_STATUS_SECURITY from "./APP_STATUS_SECURITY";

import InvestorInsights from "./InvestorInsights";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Marketplace: Marketplace,
    
    SPVDetails: SPVDetails,
    
    Wallet: Wallet,
    
    Portfolio: Portfolio,
    
    IssuerWizard: IssuerWizard,
    
    KYC: KYC,
    
    Impressum: Impressum,
    
    Datenschutz: Datenschutz,
    
    AGB: AGB,
    
    Risikohinweise: Risikohinweise,
    
    ManageSPV: ManageSPV,
    
    SmartContractInfo: SmartContractInfo,
    
    IssuerDashboard: IssuerDashboard,
    
    TradingBot: TradingBot,
    
    BuyEUT: BuyEUT,
    
    ProductionSetup: ProductionSetup,
    
    BACKEND_GUIDE: BACKEND_GUIDE,
    
    SecurityDashboard: SecurityDashboard,
    
    InvestorRelations: InvestorRelations,
    
    APP_STATUS_SECURITY: APP_STATUS_SECURITY,
    
    InvestorInsights: InvestorInsights,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/SPVDetails" element={<SPVDetails />} />
                
                <Route path="/Wallet" element={<Wallet />} />
                
                <Route path="/Portfolio" element={<Portfolio />} />
                
                <Route path="/IssuerWizard" element={<IssuerWizard />} />
                
                <Route path="/KYC" element={<KYC />} />
                
                <Route path="/Impressum" element={<Impressum />} />
                
                <Route path="/Datenschutz" element={<Datenschutz />} />
                
                <Route path="/AGB" element={<AGB />} />
                
                <Route path="/Risikohinweise" element={<Risikohinweise />} />
                
                <Route path="/ManageSPV" element={<ManageSPV />} />
                
                <Route path="/SmartContractInfo" element={<SmartContractInfo />} />
                
                <Route path="/IssuerDashboard" element={<IssuerDashboard />} />
                
                <Route path="/TradingBot" element={<TradingBot />} />
                
                <Route path="/BuyEUT" element={<BuyEUT />} />
                
                <Route path="/ProductionSetup" element={<ProductionSetup />} />
                
                <Route path="/BACKEND_GUIDE" element={<BACKEND_GUIDE />} />
                
                <Route path="/SecurityDashboard" element={<SecurityDashboard />} />
                
                <Route path="/InvestorRelations" element={<InvestorRelations />} />
                
                <Route path="/APP_STATUS_SECURITY" element={<APP_STATUS_SECURITY />} />
                
                <Route path="/InvestorInsights" element={<InvestorInsights />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}