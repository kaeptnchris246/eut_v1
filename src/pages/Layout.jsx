

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Store,
  Wallet,
  Briefcase,
  Shield,
  Users,
  Building2,
  LogOut,
  Menu,
  FileText,
  Scale,
  Settings,
  Code
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const investorNav = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, key: 'dashboard' },
  { title: "Investments entdecken", url: createPageUrl("Marketplace"), icon: Store, key: 'marketplace' },
  { title: "Investor Insights", url: createPageUrl("InvestorInsights"), icon: FileText, key: 'insights' },
  { title: "EUT kaufen", url: createPageUrl("BuyEUT"), icon: Wallet, key: 'buyEUT' },
  { title: "Portfolio", url: createPageUrl("Portfolio"), icon: Briefcase, key: 'portfolio' },
  { title: "AI Trading Bot", url: createPageUrl("TradingBot"), icon: Users, key: 'tradingBot' },
  { title: "KYC Verifizierung", url: createPageUrl("KYC"), icon: Shield, key: 'kyc' },
];

const adminNav = [
  { title: "SPV Emittent", url: createPageUrl("IssuerDashboard"), icon: Building2 },
  { title: "Investor Relations", url: createPageUrl("InvestorRelations"), icon: Users },
  { title: "Smart Contract Info", url: createPageUrl("SmartContractInfo"), icon: FileText },
  { title: "Production Setup", url: createPageUrl("ProductionSetup"), icon: Settings },
  { title: "Backend Guide", url: createPageUrl("BACKEND_GUIDE"), icon: Code },
  { title: "🔒 App Status & Security", url: createPageUrl("APP_STATUS_SECURITY"), icon: Shield },
];

const legalNav = [
  { title: "Impressum", url: createPageUrl("Impressum"), icon: FileText },
  { title: "Datenschutz", url: createPageUrl("Datenschutz"), icon: Scale },
  { title: "AGB", url: createPageUrl("AGB"), icon: FileText },
  { title: "Risikohinweise", url: createPageUrl("Risikohinweise"), icon: Shield },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple translation helper
  const t = (key) => {
    const translations = {
      dashboard: 'Dashboard',
      marketplace: 'Investments entdecken',
      insights: 'Investor Insights',
      buyEUT: 'EUT kaufen',
      portfolio: 'Portfolio',
      tradingBot: 'AI Trading Bot',
      kyc: 'KYC Verifizierung'
    };
    return translations[key] || key;
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not logged in");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const isAdmin = user?.role === 'admin';
  const navigationItems = investorNav; // This variable is declared but not used, perhaps intended for future use or was part of previous logic.
  const adminNavigationItems = isAdmin ? adminNav : [];

  const getKYCBadge = () => {
    if (!user) return null;
    const status = user.kyc_status || 'nicht_verifiziert';
    const badges = {
      'verifiziert': { label: 'Verifiziert', color: 'bg-[#D4AF37]' },
      'in_prüfung': { label: 'In Prüfung', color: 'bg-yellow-500' },
      'abgelehnt': { label: 'Abgelehnt', color: 'bg-red-500' },
      'nicht_verifiziert': { label: 'Nicht verifiziert', color: 'bg-gray-500' },
    };
    const badge = badges[status];
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${badge.color}`} />
        <span className="text-gray-400">{badge.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-width: 280px;
          --gold: #D4AF37;
          --gold-dark: #B8941F;
          --gold-light: #F4E4B0;
        }
        
        * {
          box-sizing: border-box;
        }
        
        html {
          margin: 0;
          padding: 0;
          background-color: #000 !important;
          min-height: 100vh;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000 !important;
          min-height: 100vh;
        }
        
        #root {
          min-height: 100vh;
          background-color: #000 !important;
          margin: 0;
          padding: 0;
        }
        
        .main-content {
          background-color: #000 !important;
          min-height: 100vh;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .text-4xl { font-size: 2rem; }
          .text-3xl { font-size: 1.75rem; }
          .text-2xl { font-size: 1.5rem; }
          .text-xl { font-size: 1.25rem; }
          .p-8 { padding: 1rem; }
          .p-6 { padding: 1rem; }
          .gap-6 { gap: 1rem; }
          
          /* Prevent text overflow */
          .break-words { word-break: break-word; }
          .truncate { 
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* Fix sidebar on mobile */
          .sidebar-menu-button {
            padding: 0.75rem 1rem;
          }
          
          /* Ensure cards don't overflow */
          .max-w-7xl,
          .max-w-6xl,
          .max-w-4xl {
            max-width: 100%;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        
        /* RTL Support */
        [dir="rtl"] .sidebar {
          border-right: none;
          border-left: 2px solid #374151;
        }
        
        [dir="rtl"] .mr-2 {
          margin-right: 0;
          margin-left: 0.5rem;
        }
        
        [dir="rtl"] .ml-2 {
          margin-left: 0;
          margin-right: 0.5rem;
        }
        
        .font-arabic {
          font-family: 'Tajawal', 'Noto Sans Arabic', sans-serif;
        }
        
        body.rtl {
          font-family: 'Tajawal', 'Noto Sans Arabic', sans-serif;
        }
        
        /* Menu hover fixes */
        .sidebar-menu-button:hover {
          color: #fff !important;
        }
        
        .sidebar-menu-button:hover svg {
          color: #D4AF37 !important;
        }
        
        /* Ensure buttons have good contrast */
        .button-gold {
          background: #D4AF37;
          color: #000;
        }
        
        .button-gold:hover {
          background: #B8941F;
          color: #000;
        }
        
        .gold-border {
          border: 2px solid var(--gold);
        }
        .gold-text {
          color: var(--gold);
        }
        .gold-bg {
          background: var(--gold);
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-black overflow-x-hidden">
        <Sidebar className="border-r-2 border-gray-700 bg-black">
          <SidebarHeader className="border-b-2 border-gray-700 p-6 bg-gradient-to-br from-gray-900 to-black">
            <div className="flex items-center gap-3">
              <div className="gold-border rounded-xl p-2.5 bg-black">
                <Building2 className="w-7 h-7 gold-text" />
              </div>
              <div>
                <h2 className="font-bold text-2xl gold-text tracking-tight">EUPHENA</h2>
                <p className="text-xs text-white font-medium">Asset Network</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4 bg-black">
            {user && (
              <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-black gold-border shadow-xl">
                <div className="text-xs text-gray-300 mb-2 font-semibold uppercase tracking-wide">Wallet Balance</div>
                <div className="text-3xl font-bold text-white mb-2">
                  {(user.wallet_balance || 0).toLocaleString('de-DE')}
                  <span className="text-lg gold-text ml-2 font-semibold">EUT</span>
                </div>
                {getKYCBadge()}
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-gray-300 uppercase tracking-widest px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {investorNav.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        className={`sidebar-menu-button hover:bg-gray-900 transition-all duration-200 rounded-xl mb-2 border-2 ${
                          location.pathname === item.url
                            ? 'gold-border gold-text bg-[#D4AF37]/10 shadow-lg'
                            : 'border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3.5">
                          <item.icon className="w-5 h-5" />
                          <span className="font-semibold">{t(item.key)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && adminNavigationItems.length > 0 && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-bold text-red-400 uppercase tracking-widest px-3 py-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Tools
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`sidebar-menu-button hover:bg-gray-900 transition-all duration-200 rounded-xl mb-2 border-2 ${
                            location.pathname === item.url
                              ? 'border-red-500 text-red-400 bg-red-500/10 shadow-lg'
                              : 'border-gray-800 text-gray-400 hover:border-red-500/50 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3.5">
                            <item.icon className="w-5 h-5" />
                            <span className="font-semibold">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-bold text-gray-300 uppercase tracking-widest px-3 py-3">
                Rechtliches
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {legalNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-gray-900 text-gray-400 hover:text-white transition-all duration-200 rounded-xl mb-1.5 text-xs border border-gray-800 hover:border-gray-700"
                      >
                        <Link to={item.url} className="flex items-center gap-2 px-4 py-2.5">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t-2 border-gray-700 p-4 bg-gradient-to-t from-gray-900 to-black sidebar-footer-container">
            <div className="mb-3">
              <LanguageSwitcher />
            </div>

            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-3 p-4 rounded-xl bg-gray-900 border-2 border-gray-700">
                  <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-black font-bold text-lg">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {isAdmin && (
                      <Badge className="mt-1 gold-bg text-black border-none font-bold text-xs">
                        ADMIN
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-2 border-gray-700 hover:bg-gray-900 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] font-semibold transition-all"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="w-full gold-bg hover:bg-[#B8941F] text-black font-bold shadow-lg transition-all"
              >
                Anmelden
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-black main-content min-w-0">
          <header className="bg-black border-b-2 border-gray-700 px-4 md:px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-gray-900 p-2 rounded-lg transition-colors duration-200 text-white">
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </SidebarTrigger>
              <h1 className="text-lg md:text-xl font-bold gold-text">EUPHENA</h1>
              <div className="w-9" />
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-black">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

