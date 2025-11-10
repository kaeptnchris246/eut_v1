import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe } from "lucide-react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Impressum</h1>
          <p className="text-gray-400">Angaben gemäß § 5 TMG</p>
        </div>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
              Anbieter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-white">Euphena Exchange GmbH</p>
              <p>Musterstraße 123</p>
              <p>10115 Berlin</p>
              <p>Deutschland</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <a href="mailto:info@euphena.com" className="text-[#D4AF37] hover:underline">
                  info@euphena.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <a href="tel:+491234567890" className="text-[#D4AF37] hover:underline">
                  +49 123 456 7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <a href="https://euphena.com" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">
                  www.euphena.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Rechtliche Angaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-white mb-1">Handelsregister</p>
              <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
              <p>Registernummer: HRB 123456 B</p>
            </div>

            <div>
              <p className="font-semibold text-white mb-1">Umsatzsteuer-ID</p>
              <p>DE123456789</p>
            </div>

            <div>
              <p className="font-semibold text-white mb-1">Geschäftsführer</p>
              <p>Max Mustermann</p>
            </div>

            <div>
              <p className="font-semibold text-white mb-1">Zuständige Aufsichtsbehörde</p>
              <p>Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)</p>
              <p>Graurheindorfer Str. 108, 53117 Bonn</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader>
            <CardTitle className="text-white">Haftungsausschluss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Haftung für Inhalte</p>
              <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Haftung für Links</p>
              <p>
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter 
                verantwortlich.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}