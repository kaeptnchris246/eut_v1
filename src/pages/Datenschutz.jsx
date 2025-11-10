import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Datenschutzerklärung</h1>
          <p className="text-gray-400">Informationen gemäß DSGVO</p>
        </div>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              Verantwortliche Stelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              Euphena Exchange GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland
            </p>
            <p>
              E-Mail: datenschutz@euphena.com<br />
              Telefon: +49 123 456 7890
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Erhebung und Verarbeitung personenbezogener Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Welche Daten werden erhoben?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Kontaktdaten (Name, E-Mail, Telefon, Adresse)</li>
                <li>Ausweisdokumente zur KYC-Verifizierung</li>
                <li>Transaktionsdaten und Wallet-Informationen</li>
                <li>Technische Daten (IP-Adresse, Browser, Gerät)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Rechtsgrundlage</p>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), 
                Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung gemäß Geldwäschegesetz) und 
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Datenspeicherung</p>
              <p>
                Ihre Daten werden verschlüsselt (AES-256) gespeichert und nur solange aufbewahrt, 
                wie es für die Vertragserfüllung und gesetzliche Aufbewahrungspflichten erforderlich ist.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Ihre Rechte</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten (soweit keine Aufbewahrungspflicht besteht)</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenportabilität</li>
                <li>Widerspruch gegen die Verarbeitung</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Datenweitergabe</p>
              <p>
                Wir geben Ihre Daten nur an Dritte weiter, soweit dies zur Vertragserfüllung 
                erforderlich ist (z.B. KYC-Dienstleister, Payment-Provider) oder eine gesetzliche 
                Verpflichtung besteht.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 text-sm">
            <p>
              Unsere Plattform verwendet technisch notwendige Cookies zur Authentifizierung und 
              Session-Verwaltung. Analytische Cookies verwenden wir nur mit Ihrer Einwilligung.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}