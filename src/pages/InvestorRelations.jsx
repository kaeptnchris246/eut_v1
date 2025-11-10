import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Newspaper,
  Video,
  Lock
} from 'lucide-react';

export default function InvestorRelations() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Check if user is institutional investor
  const isInstitutional = user?.investor_type === 'institutional' || user?.investor_type === 'professional';

  if (!isInstitutional) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent max-w-2xl">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Investor Relations Portal</h2>
            <p className="text-gray-300 mb-6">
              Dieses Portal ist exklusiv für institutionelle Investoren, Family Offices, 
              Fonds und Pensionskassen reserviert.
            </p>
            <p className="text-sm text-gray-400">
              Für Zugang kontaktieren Sie bitte: <br />
              <a href="mailto:ir@euphena.com" className="text-[#D4AF37] hover:underline">
                ir@euphena.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reports = [
    { name: 'Q4 2024 Performance Report', type: 'Quarterly', date: '2024-10-31', size: '2.4 MB' },
    { name: 'November 2024 ESG Metrics', type: 'Monthly', date: '2024-11-01', size: '1.8 MB' },
    { name: 'Cashflow Analysis Q3 2024', type: 'Quarterly', date: '2024-09-30', size: '3.1 MB' },
    { name: 'Audit Report 2024', type: 'Annual', date: '2024-03-31', size: '5.2 MB' },
  ];

  const ppms = [
    { name: 'GreenWave Energy Storage - PPM', date: '2024-11-01', status: 'Active' },
    { name: 'PinkCross Real Estate - PPM', date: '2024-10-15', status: 'Active' },
    { name: 'SolarVest Renewable - PPM', date: '2024-11-05', status: 'New' },
  ];

  const events = [
    { title: 'AIM Summit Dubai', type: 'Conference', date: '2025-02-15', location: 'Dubai, UAE' },
    { title: 'TOKEN2049 Singapore', type: 'Conference', date: '2025-04-18', location: 'Singapore' },
    { title: 'Euphena Investor Day Vienna', type: 'Roadshow', date: '2025-03-10', location: 'Vienna, Austria' },
    { title: 'AI in Finance Roundtable', type: 'Roundtable', date: '2025-01-25', location: 'Zurich, Switzerland' },
  ];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-3xl blur-xl" />
          <Card className="border-[#D4AF37]/30 border-2 bg-gradient-to-br from-gray-900/95 via-black to-black backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-[#D4AF37]/20 border-2 border-[#D4AF37]">
                  <Building2 className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Investor Relations</h1>
                  <p className="text-lg text-gray-400">Exklusiver Zugang für institutionelle Investoren</p>
                </div>
              </div>
              <Badge className="bg-[#D4AF37] text-black font-bold">
                {user?.investor_type?.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-900 border-2 border-gray-700">
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="ppms" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Shield className="w-4 h-4 mr-2" />
              PPMs
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="whitepapers" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Newspaper className="w-4 h-4 mr-2" />
              Publikationen
            </TabsTrigger>
            <TabsTrigger value="meetings" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              <Video className="w-4 h-4 mr-2" />
              Meetings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <Card className="border-2 border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-xl">Performance & ESG Reports</CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Monatliche und quartalsweise Berichte inkl. ESG-Metriken und Audit-Ergebnissen
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.map((report, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-[#D4AF37] transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                          <FileText className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{report.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              {report.type}
                            </Badge>
                            <span className="text-sm text-gray-400">{report.date}</span>
                            <span className="text-sm text-gray-500">{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ppms" className="mt-6">
            <Card className="border-2 border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-xl">Private Placement Memoranda</CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Rechtliche und finanzielle Dokumente für SPV-Token-Zeichnungen
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {ppms.map((ppm, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-[#D4AF37] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                          <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{ppm.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={`text-xs ${
                              ppm.status === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {ppm.status}
                            </Badge>
                            <span className="text-sm text-gray-400">{ppm.date}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card className="border-2 border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-xl">Roadshows & Konferenzen</CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Persönliche Meetings mit Management und Auditoren
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-[#D4AF37] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${
                          event.type === 'Roadshow' ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/30' :
                          event.type === 'Conference' ? 'bg-blue-500/20 border border-blue-500/30' :
                          'bg-purple-500/20 border border-purple-500/30'
                        }`}>
                          {event.type === 'Roadshow' ? <Users className="w-6 h-6 text-[#D4AF37]" /> :
                           event.type === 'Conference' ? <Calendar className="w-6 h-6 text-blue-400" /> :
                           <Video className="w-6 h-6 text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{event.title}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                              {event.type}
                            </Badge>
                            <span className="text-sm text-gray-400">{event.date}</span>
                            <span className="text-sm text-gray-500">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
                        Anmelden
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whitepapers" className="mt-6">
            <Card className="border-2 border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-xl">Fachpublikationen & Whitepapers</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Euphena Utility Token (EUT) Whitepaper v4.4', category: 'Tokenomics' },
                  { title: 'Real-World Asset Tokenization Framework', category: 'Technical' },
                  { title: 'ESG Integration in Tokenized Funds', category: 'Sustainability' },
                  { title: 'MiCAR Compliance Guide', category: 'Regulatory' },
                ].map((paper, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-[#D4AF37] transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-2">{paper.title}</p>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {paper.category}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#D4AF37]">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="mt-6">
            <Card className="border-2 border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white text-xl">Private Meetings & Due Diligence</CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Vereinbaren Sie ein persönliches Gespräch mit unserem Team
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 text-center">
                    <Video className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg mb-2">Virtual Due Diligence</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Video-Call mit CFO und Auditoren
                    </p>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
                      Termin buchen
                    </Button>
                  </div>

                  <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 text-center">
                    <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg mb-2">In-Person Roadshow</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Persönliches Treffen in Wien oder Dubai
                    </p>
                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold">
                      Anfragen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="p-6 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
          <h3 className="font-bold text-white text-lg mb-2">Kontakt Investor Relations</h3>
          <p className="text-gray-300 mb-4">
            Für weitere Informationen oder spezielle Anfragen kontaktieren Sie bitte unser IR-Team:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Email:</p>
              <a href="mailto:ir@euphena.com" className="text-[#D4AF37] hover:underline font-semibold">
                ir@euphena.com
              </a>
            </div>
            <div>
              <p className="text-gray-400">Telefon:</p>
              <a href="tel:+971501234567" className="text-[#D4AF37] hover:underline font-semibold">
                +971 50 123 4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}