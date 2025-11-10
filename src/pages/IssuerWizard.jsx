
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Check, 
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  Coins,
  Upload,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, name: 'SPV Details', icon: Building2 },
  { id: 2, name: 'Tokenomics', icon: Coins },
  { id: 3, name: 'Rechtliche Dokumente', icon: FileText },
  { id: 4, name: 'Review & Submit', icon: CheckCircle2 },
];

export default function IssuerWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: SPV Details
    name: '',
    symbol: '',
    category: '',
    description: '',
    long_description: '',
    legal_entity: '',
    registration_number: '',
    jurisdiction: '',
    manager_name: '',
    manager_email: '',
    
    // Step 2: Tokenomics
    token_price: '',
    total_supply: '',
    available_supply: '',
    minimum_investment: '',
    target_return: '',
    risk_level: '',
    duration_months: '',
    
    // Step 3: Documents
    whitepaper_url: '',
    prospectus_url: '',
    image_url: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    whitepaper: null,
    prospectus: null,
    image: null,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type, file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => ({ ...prev, [type]: file.name }));
      
      const fieldMap = {
        whitepaper: 'whitepaper_url',
        prospectus: 'prospectus_url',
        image: 'image_url',
      };
      
      handleInputChange(fieldMap[type], file_url);
      toast.success(`${type} erfolgreich hochgeladen`);
    } catch (error) {
      toast.error(`Fehler beim Hochladen: ${error.message}`);
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.symbol || !formData.category || !formData.description) {
          toast.error('Bitte füllen Sie alle Pflichtfelder aus');
          return false;
        }
        return true;
      case 2:
        if (!formData.token_price || !formData.total_supply || !formData.minimum_investment || !formData.target_return || !formData.risk_level) {
          toast.error('Bitte füllen Sie alle Tokenomics-Felder aus');
          return false;
        }
        return true;
      case 3:
        if (!formData.whitepaper_url || !formData.prospectus_url) {
          toast.error('Bitte laden Sie mindestens Whitepaper und Verkaufsprospekt hoch');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      // Create SPV
      await base44.entities.SPV.create({
        name: formData.name,
        symbol: formData.symbol,
        category: formData.category,
        description: formData.description,
        long_description: formData.long_description,
        legal_entity: formData.legal_entity,
        registration_number: formData.registration_number,
        jurisdiction: formData.jurisdiction,
        manager_name: formData.manager_name,
        manager_email: formData.manager_email,
        whitepaper_url: formData.whitepaper_url,
        prospectus_url: formData.prospectus_url,
        image_url: formData.image_url,
        token_price_eut: parseFloat(formData.token_price),
        nav_per_token: parseFloat(formData.token_price),
        total_supply: parseFloat(formData.total_supply),
        available_supply: parseFloat(formData.total_supply),
        minimum_investment_eut: parseFloat(formData.minimum_investment),
        target_return: parseFloat(formData.target_return),
        risk_level: formData.risk_level,
        duration_months: parseInt(formData.duration_months) || 12,
        status: 'coming_soon',
        token_standard: 'ERC-1400',
        key_metrics: {
          total_invested: 0,
          number_of_investors: 0,
          current_valuation: 0,
          avg_return: 0,
          aum: 0
        },
      });

      toast.success('SPV erfolgreich erstellt!');
      navigate(createPageUrl('IssuerDashboard'));
    } catch (error) {
      toast.error('Fehler beim Erstellen: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">SPV Name *</Label>
                <Input
                  placeholder="z.B. Green Energy Fund I"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Token Symbol *</Label>
                <Input
                  placeholder="z.B. GEF1"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Kategorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Wählen Sie eine Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immobilien">Immobilien</SelectItem>
                  <SelectItem value="tech_startups">Tech Startups</SelectItem>
                  <SelectItem value="erneuerbare_energien">Erneuerbare Energien</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="venture_capital">Venture Capital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Kurzbeschreibung *</Label>
              <Textarea
                placeholder="Beschreiben Sie Ihr SPV in 1-2 Sätzen"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white h-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Ausführliche Beschreibung</Label>
              <Textarea
                placeholder="Detaillierte Beschreibung Ihres Investment-Vehikels"
                value={formData.long_description}
                onChange={(e) => handleInputChange('long_description', e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white h-32"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Rechtsform</Label>
                <Input
                  placeholder="z.B. GmbH & Co. KG"
                  value={formData.legal_entity}
                  onChange={(e) => handleInputChange('legal_entity', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Handelsregisternummer</Label>
                <Input
                  placeholder="z.B. HRB 12345"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Jurisdiktion</Label>
                <Input
                  placeholder="z.B. Deutschland"
                  value={formData.jurisdiction}
                  onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Manager Name</Label>
                <Input
                  placeholder="Name des SPV Managers"
                  value={formData.manager_name}
                  onChange={(e) => handleInputChange('manager_name', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Manager E-Mail</Label>
              <Input
                type="email"
                placeholder="manager@spv.com"
                value={formData.manager_email}
                onChange={(e) => handleInputChange('manager_email', e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Token Preis (UTK) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="z.B. 100"
                  value={formData.token_price}
                  onChange={(e) => handleInputChange('token_price', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Gesamt-Token-Anzahl *</Label>
                <Input
                  type="number"
                  placeholder="z.B. 10000"
                  value={formData.total_supply}
                  onChange={(e) => handleInputChange('total_supply', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Mindestinvestment (UTK) *</Label>
                <Input
                  type="number"
                  placeholder="z.B. 1000"
                  value={formData.minimum_investment}
                  onChange={(e) => handleInputChange('minimum_investment', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Ziel-Rendite (% p.a.) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="z.B. 8.5"
                  value={formData.target_return}
                  onChange={(e) => handleInputChange('target_return', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Risikostufe *</Label>
                <Select value={formData.risk_level} onValueChange={(value) => handleInputChange('risk_level', value)}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                    <SelectValue placeholder="Wählen Sie eine Risikostufe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="niedrig">Niedrig</SelectItem>
                    <SelectItem value="mittel">Mittel</SelectItem>
                    <SelectItem value="hoch">Hoch</SelectItem>
                    <SelectItem value="sehr_hoch">Sehr Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Laufzeit (Monate)</Label>
                <Input
                  type="number"
                  placeholder="z.B. 24"
                  value={formData.duration_months}
                  onChange={(e) => handleInputChange('duration_months', e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <h4 className="font-semibold text-white mb-3">Zusammenfassung</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Gesamt-Volumen:</span>
                  <p className="text-white font-semibold">
                    {formData.token_price && formData.total_supply ? 
                      (parseFloat(formData.token_price) * parseFloat(formData.total_supply)).toLocaleString('de-DE') : '0'
                    } UTK
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Min. Ticket:</span>
                  <p className="text-white font-semibold">{formData.minimum_investment || '0'} UTK</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Whitepaper *</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#D4AF37] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Whitepaper hochladen</p>
                  <p className="text-sm text-gray-400 mb-4">PDF, max. 10MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files[0] && handleFileUpload('whitepaper', e.target.files[0])}
                    className="hidden"
                    id="whitepaper-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('whitepaper-upload').click()}
                    variant="outline"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    Datei wählen
                  </Button>
                  {uploadedFiles.whitepaper && (
                    <p className="text-green-400 text-sm mt-2">✓ {uploadedFiles.whitepaper}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Verkaufsprospekt *</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#D4AF37] transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Prospekt hochladen</p>
                  <p className="text-sm text-gray-400 mb-4">PDF, max. 10MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files[0] && handleFileUpload('prospectus', e.target.files[0])}
                    className="hidden"
                    id="prospectus-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('prospectus-upload').click()}
                    variant="outline"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    Datei wählen
                  </Button>
                  {uploadedFiles.prospectus && (
                    <p className="text-green-400 text-sm mt-2">✓ {uploadedFiles.prospectus}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">SPV Bild (optional)</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#D4AF37] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Bild hochladen</p>
                  <p className="text-sm text-gray-400 mb-4">JPG, PNG, max. 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleFileUpload('image', e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('image-upload').click()}
                    variant="outline"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    Datei wählen
                  </Button>
                  {uploadedFiles.image && (
                    <p className="text-green-400 text-sm mt-2">✓ {uploadedFiles.image}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="font-semibold text-yellow-400 mb-2">Wichtiger Hinweis</h4>
              <p className="text-sm text-gray-300">
                Stellen Sie sicher, dass alle rechtlichen Dokumente vollständig sind und den regulatorischen Anforderungen entsprechen. 
                Diese Dokumente werden öffentlich auf der Plattform sichtbar sein.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <h3 className="text-xl font-bold text-white mb-4">SPV Zusammenfassung</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">SPV Name</p>
                    <p className="text-white font-semibold">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Symbol</p>
                    <p className="text-white font-semibold">{formData.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Kategorie</p>
                    <p className="text-white font-semibold">{formData.category?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Risikostufe</p>
                    <p className="text-white font-semibold">{formData.risk_level}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Token Preis</p>
                    <p className="text-white font-semibold">{formData.token_price} UTK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Gesamt-Supply</p>
                    <p className="text-white font-semibold">{formData.total_supply} Token</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Min. Investment</p>
                    <p className="text-white font-semibold">{formData.minimum_investment} UTK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ziel-Rendite</p>
                    <p className="text-white font-semibold">{formData.target_return}% p.a.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <h4 className="font-semibold text-white mb-3">Hochgeladene Dokumente</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {uploadedFiles.whitepaper ? 
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                    <div className="w-4 h-4" />
                  }
                  <span className="text-gray-300">Whitepaper: {uploadedFiles.whitepaper || 'Nicht hochgeladen'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {uploadedFiles.prospectus ? 
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                    <div className="w-4 h-4" />
                  }
                  <span className="text-gray-300">Prospekt: {uploadedFiles.prospectus || 'Nicht hochgeladen'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {uploadedFiles.image ? 
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                    <div className="w-4 h-4" />
                  }
                  <span className="text-gray-300">Bild: {uploadedFiles.image || 'Nicht hochgeladen'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <h4 className="font-semibold text-blue-400 mb-2">Nächste Schritte</h4>
              <p className="text-sm text-gray-300">
                Nach dem Absenden wird Ihr SPV zur Überprüfung eingereicht. Dies kann 2-3 Werktage dauern. 
                Sie erhalten eine E-Mail, sobald Ihr SPV genehmigt wurde und auf dem Marktplatz erscheint.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = STEPS[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">SPV Emittent Wizard</h1>
          <p className="text-gray-400">Erstellen Sie Ihr tokenisiertes Investment-Vehikel</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.id ? 'bg-[#D4AF37] border-[#D4AF37]' :
                    currentStep === step.id ? 'border-[#D4AF37] bg-transparent' :
                    'border-gray-700 bg-transparent'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6 text-black" />
                    ) : (
                      <IconComponent className={`w-6 h-6 ${currentStep === step.id ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center hidden md:block ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 ${currentStep > step.id ? 'bg-[#D4AF37]' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-black">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <StepIcon className="w-6 h-6 text-[#D4AF37]" />
              {currentStepData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            >
              Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            >
              {isSubmitting ? 'Wird erstellt...' : 'SPV erstellen'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
