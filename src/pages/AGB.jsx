import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AGB() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-gray-400">Nutzungsbedingungen der Euphena Plattform</p>
        </div>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§1 Geltungsbereich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der 
              Euphena Exchange GmbH im Rahmen der digitalen Plattform für tokenisierte 
              Special Purpose Vehicles (SPVs).
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§2 Vertragsgegenstand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Euphena stellt eine Plattform zur Verfügung, über die Nutzer in tokenisierte 
              SPVs investieren können. Die Plattform ermöglicht:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Kauf und Verkauf von SPV-Token mit Utility Token (UTK)</li>
              <li>Verwaltung eines digitalen Wallets</li>
              <li>Einsicht in SPV-Dokumentation und Performance</li>
              <li>Erhalt von Dividenden und Ausschüttungen</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§3 Registrierung und KYC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Zur Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer verpflichtet 
              sich, wahrheitsgemäße Angaben zu machen und die KYC-Verifizierung durchzuführen.
            </p>
            <p>
              Euphena behält sich das Recht vor, Nutzer ohne KYC-Verifizierung von Investment-Funktionen 
              auszuschließen.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§4 Utility Token (UTK)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Utility Token (UTK) sind das primäre Zahlungsmittel auf der Plattform. Sie können 
              gegen Fiat-Währung erworben werden (1 UTK = €1.20).
            </p>
            <p>
              UTK sind keine Wertpapiere und gewähren keine Rechte am Unternehmen Euphena.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§5 SPV-Investments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              SPV-Token repräsentieren Anteile an tokenisierten Investment-Vehikeln. Jeder SPV 
              hat individuelle Bedingungen, die im jeweiligen Verkaufsprospekt dargelegt sind.
            </p>
            <p>
              <strong className="text-white">Sperrfristen:</strong> SPV-Token unterliegen in der Regel 
              einer Sperrfrist von 6 Monaten nach Kauf.
            </p>
            <p>
              <strong className="text-white">Mindestinvestment:</strong> Das Mindestinvestment ist 
              pro SPV unterschiedlich und wird bei der Präsentation angezeigt.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§6 Gebühren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Die Nutzung der Plattform ist grundsätzlich kostenfrei. Folgende Gebühren können anfallen:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Transaktionsgebühren beim Handel von SPV-Token (0,5%)</li>
              <li>Netzwerkgebühren bei Blockchain-Transaktionen</li>
              <li>Gebühren beim Kauf von Utility Token über Payment-Provider</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§7 Haftung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Euphena haftet nicht für Verluste aus SPV-Investments. Jedes Investment trägt 
              individuelle Risiken, die in den jeweiligen Dokumenten dargelegt sind.
            </p>
            <p>
              Euphena haftet nur bei Vorsatz und grober Fahrlässigkeit.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">§8 Schlussbestimmungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin.
            </p>
            <p>
              Stand: November 2025
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}