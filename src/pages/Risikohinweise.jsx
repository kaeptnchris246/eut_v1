import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Lock, DollarSign } from "lucide-react";

export default function Risikohinweise() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Risikohinweise</h1>
          <p className="text-gray-400">Wichtige Informationen zu Investment-Risiken</p>
        </div>

        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2 text-lg">Allgemeiner Risikohinweis</h3>
                <p className="text-gray-300 text-sm">
                  Investitionen in tokenisierte SPVs sind mit erheblichen Risiken verbunden und 
                  können zum Totalverlust des eingesetzten Kapitals führen. Investieren Sie nur 
                  Beträge, deren Verlust Sie verkraften können.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#D4AF37]" />
              Marktrisiken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Wertschwankungen</p>
              <p>
                Der Wert von SPV-Token kann stark schwanken. Es gibt keine Garantie für Wertsteigerungen 
                oder die Erreichung der prognostizierten Renditen.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Liquiditätsrisiko</p>
              <p>
                Der Sekundärmarkt für SPV-Token kann illiquide sein. Es ist möglich, dass Sie Ihre 
                Token nicht zum gewünschten Zeitpunkt oder Preis verkaufen können.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Marktvolatilität</p>
              <p>
                Krypto- und Token-Märkte sind besonders volatil. Kurse können innerhalb kurzer Zeit 
                erheblich steigen oder fallen.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
              Operationelle Risiken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Technologierisiken</p>
              <p>
                Blockchain-Technologie und Smart Contracts können technische Fehler oder 
                Sicherheitslücken aufweisen. Hacks oder Systemausfälle sind nicht ausgeschlossen.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Regulatorische Risiken</p>
              <p>
                Die rechtliche und regulatorische Situation für tokenisierte Assets entwickelt sich 
                weiter. Änderungen können sich negativ auf Ihre Investments auswirken.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Plattformrisiko</p>
              <p>
                Die Euphena-Plattform könnte aufgrund technischer, wirtschaftlicher oder rechtlicher 
                Gründe den Betrieb einstellen.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              SPV-spezifische Risiken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Unternehmerisches Risiko</p>
              <p>
                Jeder SPV verfolgt eine eigene Investmentstrategie. Das zugrundeliegende Geschäftsmodell 
                kann fehlschlagen oder nicht die erwarteten Erträge erzielen.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Ausschüttungsrisiko</p>
              <p>
                Dividenden und Ausschüttungen sind nicht garantiert und hängen von der wirtschaftlichen 
                Entwicklung des jeweiligen SPV ab.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Totalverlustrisiko</p>
              <p>
                Bei Insolvenz oder Scheitern eines SPV kann es zum Totalverlust des investierten Kapitals kommen.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Wichtige Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300 text-sm">
            <p>✓ Lesen Sie alle Dokumente (Whitepaper, Prospekt) sorgfältig</p>
            <p>✓ Diversifizieren Sie Ihre Investments</p>
            <p>✓ Investieren Sie nur Geld, dessen Verlust Sie verkraften können</p>
            <p>✓ Holen Sie bei Bedarf professionelle Beratung ein</p>
            <p>✓ Verstehen Sie die Technologie und das Geschäftsmodell</p>
          </CardContent>
        </Card>

        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-white font-semibold mb-2">
            ⚠️ Diese Plattform richtet sich nicht an US-Personen
          </p>
          <p className="text-gray-300 text-sm">
            Investments sind für Personen und Unternehmen in den USA nicht verfügbar.
          </p>
        </div>
      </div>
    </div>
  );
}