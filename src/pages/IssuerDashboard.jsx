
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { 
  Plus, 
  Building2, 
  TrendingUp, 
  Users,
  DollarSign,
  Edit,
  Eye,
  Trash2
} from "lucide-react";

export default function IssuerDashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient(); // Initialize useQueryClient

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: mySPVs, isLoading } = useQuery({
    queryKey: ['my-spvs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const spvs = await base44.entities.SPV.filter({ manager_email: user.email }, '-created_date');
      // Remove duplicates by ID
      const uniqueSPVs = Array.from(new Map(spvs.map(spv => [spv.id, spv])).values());
      return uniqueSPVs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const totalRaised = mySPVs.reduce((sum, spv) => sum + (spv.key_metrics?.total_invested || 0), 0);
  const totalInvestors = mySPVs.reduce((sum, spv) => sum + (spv.key_metrics?.number_of_investors || 0), 0);
  const activeSPVs = mySPVs.filter(spv => spv.status === 'aktiv').length;

  const getStatusBadge = (status) => {
    const badges = {
      'aktiv': { label: 'Aktiv', className: 'bg-green-500/20 text-green-400 border-green-500' },
      'coming_soon': { label: 'Coming Soon', className: 'bg-blue-500/20 text-blue-400 border-blue-500' },
      'geschlossen': { label: 'Geschlossen', className: 'bg-gray-500/20 text-gray-400 border-gray-500' },
      'ausgezahlt': { label: 'Ausgezahlt', className: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]' },
    };
    return badges[status] || badges['coming_soon'];
  };

  const handleDeleteSPV = async (spvId, spvName) => {
    if (!window.confirm(
      `SPV "${spvName}" wirklich löschen?\n\n` +
      `WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden!\n` +
      `Alle zugehörigen Investments bleiben erhalten.`
    )) {
      return;
    }

    try {
      await base44.entities.SPV.delete(spvId);
      toast.success('SPV erfolgreich gelöscht');
      queryClient.invalidateQueries({ queryKey: ['my-spvs'] });
    } catch (error) {
      toast.error('Fehler beim Löschen: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              SPV Emittenten Dashboard
            </h1>
            <p className="text-gray-400">Verwalten Sie Ihre tokenisierten Investment-Vehikel</p>
          </div>
          <Link to={createPageUrl("IssuerWizard")}>
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-lg shadow-xl">
              <Plus className="w-5 h-5 mr-2" />
              Neuen SPV erstellen
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Meine SPVs</CardTitle>
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {mySPVs.length}
              </div>
              <p className="text-sm text-[#D4AF37] font-semibold">{activeSPVs} Aktiv</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Gesamt Eingesammelt</CardTitle>
                <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {totalRaised.toLocaleString('de-DE')}
              </div>
              <p className="text-sm text-[#D4AF37] font-semibold">EUT</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Investoren</CardTitle>
                <Users className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {totalInvestors}
              </div>
              <p className="text-sm text-[#D4AF37] font-semibold">Gesamt</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-400">Ø Performance</CardTitle>
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {mySPVs.length > 0 
                  ? (mySPVs.reduce((sum, spv) => sum + (spv.key_metrics?.avg_return || spv.target_return || 0), 0) / mySPVs.length).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-sm text-[#D4AF37] font-semibold">p.a.</p>
            </CardContent>
          </Card>
        </div>

        {/* SPV List */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <CardHeader className="border-b-2 border-gray-700">
            <CardTitle className="text-white text-xl">Ihre SPVs</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]" />
              </div>
            ) : mySPVs.length > 0 ? (
              <div className="space-y-4">
                {mySPVs.map((spv) => (
                  <div 
                    key={spv.id}
                    className="p-6 rounded-xl bg-gray-900 border-2 border-gray-700 hover:border-[#D4AF37] transition-all shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-xl">
                          <Building2 className="w-10 h-10 text-black" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{spv.name}</h3>
                            <Badge className={`${getStatusBadge(spv.status).className} border-2 font-bold`}>
                              {getStatusBadge(spv.status).label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{spv.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-semibold">Token Preis</p>
                              <p className="text-white font-bold">{spv.token_price_eut || spv.token_price} EUT</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold">Investoren</p>
                              <p className="text-white font-bold">{spv.key_metrics?.number_of_investors || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold">Eingesammelt</p>
                              <p className="text-white font-bold">
                                {(spv.key_metrics?.total_invested || 0).toLocaleString('de-DE')} EUT
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold">Verfügbar</p>
                              <p className="text-white font-bold">
                                {spv.available_supply} / {spv.total_supply}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Link to={createPageUrl(`ManageSPV?id=${spv.id}`)}>
                          <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-lg">
                            <Edit className="w-4 h-4 mr-2" />
                            Verwalten
                          </Button>
                        </Link>
                        <Link to={createPageUrl(`SPVDetails?id=${spv.id}`)}>
                          <Button variant="outline" className="w-full border-2 border-gray-700 hover:bg-gray-900 hover:border-white text-white font-semibold">
                            <Eye className="w-4 h-4 mr-2" />
                            Ansehen
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDeleteSPV(spv.id, spv.name)}
                          variant="outline"
                          className="w-full border-2 border-red-500/50 hover:bg-red-500/20 hover:border-red-500 text-red-400 font-semibold"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Noch keine SPVs</h3>
                <p className="text-gray-400 mb-6">
                  Erstellen Sie Ihren ersten tokenisierten SPV
                </p>
                <Link to={createPageUrl("IssuerWizard")}>
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    SPV erstellen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
