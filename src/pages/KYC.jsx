import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import EnhancedKYC from '@/components/EnhancedKYC';
import WalletOwnershipProof from '@/components/WalletOwnershipProof';
import ExplainerBox from '@/components/ExplainerBox';

export default function KYC() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const getStatusDisplay = (status) => {
    const displays = {
      'verifiziert': {
        icon: <CheckCircle2 className="w-12 h-12 text-green-400" />,
        title: 'Verifiziert',
        description: 'Ihr Account ist vollständig verifiziert',
        badgeClass: 'bg-green-500/20 text-green-400 border-green-500',
        cardClass: 'border-green-500/30 bg-green-500/10'
      },
      'in_prüfung': {
        icon: <Clock className="w-12 h-12 text-yellow-400" />,
        title: 'In Prüfung',
        description: 'Ihre Dokumente werden geprüft (1-2 Werktage)',
        badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
        cardClass: 'border-yellow-500/30 bg-yellow-500/10'
      },
      'abgelehnt': {
        icon: <XCircle className="w-12 h-12 text-red-400" />,
        title: 'Abgelehnt',
        description: 'Bitte kontaktieren Sie den Support',
        badgeClass: 'bg-red-500/20 text-red-400 border-red-500',
        cardClass: 'border-red-500/30 bg-red-500/10'
      },
      'nicht_verifiziert': {
        icon: <AlertCircle className="w-12 h-12 text-gray-400" />,
        title: 'Nicht verifiziert',
        description: 'Bitte schließen Sie die KYC-Verifizierung ab',
        badgeClass: 'bg-gray-500/20 text-gray-400 border-gray-500',
        cardClass: 'border-gray-700 bg-gray-900'
      }
    };

    return displays[status] || displays['nicht_verifiziert'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  const kycStatus = user?.kyc_status || 'nicht_verifiziert';
  const statusDisplay = getStatusDisplay(kycStatus);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
            KYC Verifizierung
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Know Your Customer - Identitätsverifizierung mit KI-Automatisierung
          </p>
        </div>

        <ExplainerBox title="Warum KYC?" type="help">
          <p className="mb-2">
            <strong>Rechtliche Pflicht:</strong> EU-Regulierung (MiCAR) erfordert KYC für Security Token Investments
          </p>
          <p className="mb-2">
            <strong>Automatische Verifizierung:</strong> Unsere KI prüft Ihre Dokumente in Minuten (bei Score ≥85% sofortige Freischaltung)
          </p>
          <p>
            <strong>Sicherheit:</strong> Liveness Detection verhindert Identitätsdiebstahl
          </p>
        </ExplainerBox>

        <Card className={`border-2 ${statusDisplay.cardClass}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {statusDisplay.icon}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white">{statusDisplay.title}</h3>
                  <Badge className={`${statusDisplay.badgeClass} border-2 font-bold text-xs md:text-sm`}>
                    {kycStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-gray-300">{statusDisplay.description}</p>
                
                {user?.kyc_ai_verification_score && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">KI-Verifizierungs-Score:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{ width: `${user.kyc_ai_verification_score}%` }}
                        />
                      </div>
                      <span className="text-white font-bold text-sm">
                        {user.kyc_ai_verification_score}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {(kycStatus === 'nicht_verifiziert' || kycStatus === 'abgelehnt') && (
          <>
            <EnhancedKYC user={user} onUpdate={loadUser} />
            <WalletOwnershipProof user={user} onVerified={loadUser} />
          </>
        )}

        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              Datenschutz & Sicherheit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs md:text-sm text-gray-300 space-y-1">
              <li>✓ Alle Dokumente AES-256 verschlüsselt</li>
              <li>✓ Video nur für Liveness Detection, wird nicht gespeichert</li>
              <li>✓ KI-Analyse auf sicheren EU-Servern</li>
              <li>✓ DSGVO-konform</li>
              <li>✓ Kein Zugriff auf Ihre Wallet - nur Ownership-Nachweis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}