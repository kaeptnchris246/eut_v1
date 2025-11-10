
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  DollarSign,
  Upload,
  FileText,
  Users,
  TrendingUp,
  Send,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Mail,
  Coins,
  History,
  MessageSquare,
  Inbox,
  Bell,
  Reply,
  Archive,
  Flag,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ManageSPV() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const spvId = urlParams.get('id');

  // Dividend state
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendNote, setDividendNote] = useState('');
  const [distributionType, setDistributionType] = useState('pro_rata');
  const [fixedAmountPerInvestor, setFixedAmountPerInvestor] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);

  // Report upload state
  const [reportType, setReportType] = useState('quarterly');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');

  // Investor filter state
  const [investorSearch, setInvestorSearch] = useState('');
  const [sortBy, setSortBy] = useState('token_amount');

  // Communication state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('normal');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [directMessageContent, setDirectMessageContent] = useState('');
  const [directMessageSubject, setDirectMessageSubject] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');

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

  const { data: spv, isLoading } = useQuery({
    queryKey: ['spv', spvId],
    queryFn: async () => {
      const spvs = await base44.entities.SPV.filter({ id: spvId });
      return spvs[0];
    },
    enabled: !!spvId,
  });

  const { data: investors } = useQuery({
    queryKey: ['spv-investors', spvId],
    queryFn: async () => {
      if (!spvId) return [];
      return await base44.entities.Investment.filter({ spv_id: spvId });
    },
    enabled: !!spvId,
    initialData: [],
  });

  const { data: dividendHistory } = useQuery({
    queryKey: ['dividend-history', spvId],
    queryFn: async () => {
      if (!spvId) return [];
      const txs = await base44.entities.Transaction.filter({ spv_id: spvId, type: 'dividende' }, '-created_date');
      return txs;
    },
    enabled: !!spvId,
    initialData: [],
  });

  const { data: messages } = useQuery({
    queryKey: ['spv-messages', spvId],
    queryFn: async () => {
      if (!spvId) return [];
      return await base44.entities.Message.filter({ spv_id: spvId }, '-created_date');
    },
    enabled: !!spvId,
    initialData: [],
  });

  const { data: inquiries } = useQuery({
    queryKey: ['spv-inquiries', spvId],
    queryFn: async () => {
      if (!spvId) return [];
      return await base44.entities.Message.filter({ 
        spv_id: spvId, 
        message_type: 'inquiry',
        receiver_email: user?.email 
      }, '-created_date');
    },
    enabled: !!spvId && !!user?.email,
    initialData: [],
  });

  const calculateDistribution = () => {
    if (!dividendAmount && !fixedAmountPerInvestor) return []; // Ensure one of these is set for calculation
    if (investors.length === 0) return [];
    
    const amount = parseFloat(dividendAmount);
    
    if (distributionType === 'pro_rata') {
      if (isNaN(amount) || amount <= 0) return [];
      const totalTokens = investors.reduce((sum, inv) => sum + inv.token_amount, 0);
      if (totalTokens === 0) return []; // Avoid division by zero
      return investors.map(inv => ({
        ...inv,
        distribution: (inv.token_amount / totalTokens) * amount
      }));
    } else { // fixed
      const perInvestor = parseFloat(fixedAmountPerInvestor);
      if (isNaN(perInvestor) || perInvestor <= 0) return [];
      return investors.map(inv => ({
        ...inv,
        distribution: perInvestor
      }));
    }
  };

  const handleDistributeDividends = async () => {
    const amount = parseFloat(dividendAmount);
    if (distributionType === 'pro_rata' && (isNaN(amount) || amount <= 0)) {
      toast.error('Bitte geben Sie einen gültigen Gesamtbetrag ein');
      return;
    }

    if (distributionType === 'fixed' && (!fixedAmountPerInvestor || parseFloat(fixedAmountPerInvestor) <= 0)) {
      toast.error('Bitte geben Sie einen Betrag pro Investor ein');
      return;
    }

    const distributions = calculateDistribution();
    if (distributions.length === 0) {
      toast.error('Keine gültigen Ausschüttungen berechenbar.');
      return;
    }
    const totalDistribution = distributions.reduce((sum, d) => sum + d.distribution, 0);

    if (!window.confirm(
      `Dividendenausschüttung:\n` +
      `Typ: ${distributionType === 'pro_rata' ? 'Proportional' : 'Fester Betrag'}\n` +
      `Gesamt: ${totalDistribution.toFixed(2)} UTK\n` +
      `An ${investors.length} Investoren\n\n` +
      `Fortfahren?`
    )) {
      return;
    }

    setIsDistributing(true);

    try {
      for (const dist of distributions) {
        // Find the full investment object to update
        const investmentToUpdate = investors.find(inv => inv.id === dist.id);
        if (!investmentToUpdate) continue;

        await base44.entities.Investment.update(dist.id, {
          dividends_earned: (investmentToUpdate.dividends_earned || 0) + dist.distribution,
        });

        // Create transaction for investor
        await base44.entities.Transaction.create({
          user_email: dist.investor_email,
          type: 'dividende',
          amount: dist.distribution,
          spv_id: spv.id,
          spv_name: spv.name,
          description: `Dividende: ${dividendNote || 'Ausschüttung'} (${distributionType === 'pro_rata' ? 'Proportional' : 'Fester Betrag'})`,
          status: 'erfolgreich',
        });

        // Update investor wallet
        const investorUser = await base44.entities.User.filter({ email: dist.investor_email });
        if (investorUser.length > 0) {
          await base44.entities.User.update(investorUser[0].id, {
            wallet_balance: (investorUser[0].wallet_balance || 0) + dist.distribution,
          });
        }
      }

      toast.success(`Dividende erfolgreich an ${investors.length} Investoren ausgeschüttet!`);
      setDividendAmount('');
      setDividendNote('');
      setFixedAmountPerInvestor('');
      queryClient.invalidateQueries(['spv-investors', spvId]);
      queryClient.invalidateQueries(['dividend-history', spvId]);
      queryClient.invalidateQueries(['spv-messages', spvId]); // Potentially affects investor messages/notifications
    } catch (error) {
      toast.error('Fehler bei der Ausschüttung: ' + error.message);
      console.error(error);
    }

    setIsDistributing(false);
  };

  const handleReportUpload = async (file) => {
    if (!reportType || !reportPeriod) {
      toast.error('Bitte wählen Sie Berichtstyp und Periode');
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const currentDocs = spv.documents || [];
      currentDocs.push({
        name: file.name,
        url: file_url,
        type: reportType,
        description: reportDescription,
        period: reportPeriod,
        upload_date: new Date().toISOString(),
      });

      await base44.entities.SPV.update(spv.id, {
        documents: currentDocs,
      });

      toast.success('Bericht erfolgreich hochgeladen');
      setReportDescription('');
      setReportPeriod('');
      queryClient.invalidateQueries(['spv', spvId]);
    } catch (error) {
      toast.error('Fehler beim Hochladen: ' + error.message);
    }
  };

  const exportInvestorData = () => {
    if (investors.length === 0) {
      toast.info('Keine Investorendaten zum Exportieren.');
      return;
    }
    const data = investors.map(inv => ({
      'Email': inv.investor_email,
      'Token Amount': inv.token_amount,
      'Invested (UTK)': inv.invested_amount,
      'Current Value (UTK)': inv.current_value || inv.invested_amount,
      'Purchase Price': inv.purchase_price,
      'Purchase Date': format(new Date(inv.purchase_date), 'dd.MM.yyyy'),
      'Dividends Earned': inv.dividends_earned || 0,
      'Status': inv.status,
    }));

    // CSV header and rows
    const csvRows = [];
    // Escape commas and double quotes for CSV
    const escapeCsvField = (field) => {
      if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    csvRows.push(Object.keys(data[0]).map(escapeCsvField).join(','));
    data.forEach(row => {
      csvRows.push(Object.values(row).map(escapeCsvField).join(','));
    });

    const csv = csvRows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spv.symbol}_investors_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Free up memory
  };

  const filteredInvestors = investors
    .filter(inv => inv.investor_email.toLowerCase().includes(investorSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'token_amount') return b.token_amount - a.token_amount;
      if (sortBy === 'invested_amount') return b.invested_amount - a.invested_amount;
      if (sortBy === 'purchase_date') return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
      if (sortBy === 'dividends_earned') return (b.dividends_earned || 0) - (a.dividends_earned || 0);
      return 0;
    });

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastContent) {
      toast.error('Bitte füllen Sie Betreff und Nachricht aus');
      return;
    }

    if (investors.length === 0) {
      toast.error('Keine Investoren zum Versenden');
      return;
    }

    if (!window.confirm(
      `Broadcast-Nachricht an ${investors.length} Investoren senden?\n\n` +
      `Betreff: ${broadcastSubject}\n` +
      `Priorität: ${broadcastPriority}`
    )) {
      return;
    }

    setIsSendingBroadcast(true);

    try {
      // Create broadcast message for each investor
      const broadcastId = `broadcast-${Date.now()}`;
      
      for (const investor of investors) {
        await base44.entities.Message.create({
          spv_id: spv.id,
          spv_name: spv.name,
          sender_email: user.email,
          sender_name: user.full_name || 'SPV Manager',
          receiver_email: investor.investor_email,
          message_type: 'broadcast',
          subject: broadcastSubject,
          content: broadcastContent,
          priority: broadcastPriority,
          status: 'ungelesen',
          is_broadcast: true,
          thread_id: broadcastId,
          broadcast_recipient_count: investors.length,
        });
      }

      toast.success(`Broadcast erfolgreich an ${investors.length} Investoren gesendet!`);
      setBroadcastSubject('');
      setBroadcastContent('');
      setBroadcastPriority('normal');
      queryClient.invalidateQueries(['spv-messages', spvId]);
    } catch (error) {
      toast.error('Fehler beim Senden: ' + error.message);
      console.error(error);
    }

    setIsSendingBroadcast(false);
  };

  const handleSendDirectMessage = async () => {
    if (!selectedInvestor || !directMessageSubject || !directMessageContent) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      await base44.entities.Message.create({
        spv_id: spv.id,
        spv_name: spv.name,
        sender_email: user.email,
        sender_name: user.full_name || 'SPV Manager',
        receiver_email: selectedInvestor.investor_email,
        message_type: 'direct',
        subject: directMessageSubject,
        content: directMessageContent,
        priority: 'normal',
        status: 'ungelesen',
        is_broadcast: false,
      });

      toast.success('Nachricht erfolgreich gesendet!');
      setDirectMessageSubject('');
      setDirectMessageContent('');
      setSelectedInvestor(null);
      queryClient.invalidateQueries(['spv-messages', spvId]);
    } catch (error) {
      toast.error('Fehler beim Senden: ' + error.message);
    }
  };

  const handleReplyToInquiry = async (inquiry, replyContent) => {
    if (!replyContent) {
      toast.error('Bitte geben Sie eine Antwort ein');
      return;
    }

    try {
      await base44.entities.Message.create({
        spv_id: spv.id,
        spv_name: spv.name,
        sender_email: user.email,
        sender_name: user.full_name || 'SPV Manager',
        receiver_email: inquiry.sender_email,
        message_type: 'direct',
        subject: `Re: ${inquiry.subject}`,
        content: replyContent,
        priority: inquiry.priority,
        status: 'ungelesen',
        thread_id: inquiry.thread_id || inquiry.id, // Use existing thread_id or the inquiry's ID
      });

      // Update original inquiry status
      await base44.entities.Message.update(inquiry.id, {
        status: 'beantwortet',
      });

      toast.success('Antwort gesendet!');
      queryClient.invalidateQueries(['spv-inquiries', spvId]);
      queryClient.invalidateQueries(['spv-messages', spvId]);
    } catch (error) {
      toast.error('Fehler beim Antworten: ' + error.message);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await base44.entities.Message.update(messageId, {
        status: 'gelesen',
        read_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries(['spv-inquiries', spvId]);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'dringend': { label: 'Dringend', className: 'bg-red-500/20 text-red-400 border-red-500' },
      'hoch': { label: 'Hoch', className: 'bg-orange-500/20 text-orange-400 border-orange-500' },
      'normal': { label: 'Normal', className: 'bg-blue-500/20 text-blue-400 border-blue-500' },
      'niedrig': { label: 'Niedrig', className: 'bg-gray-500/20 text-gray-400 border-gray-500' },
    };
    return badges[priority] || badges['normal'];
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ungelesen': { label: 'Ungelesen', className: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]' },
      'gelesen': { label: 'Gelesen', className: 'bg-blue-500/20 text-blue-400 border-blue-500' },
      'beantwortet': { label: 'Beantwortet', className: 'bg-green-500/20 text-green-400 border-green-500' },
      'archiviert': { label: 'Archiviert', className: 'bg-gray-500/20 text-gray-400 border-gray-500' },
    };
    return badges[status] || badges['ungelesen'];
  };

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'broadcast') return msg.is_broadcast;
    if (messageFilter === 'direct') return !msg.is_broadcast;
    return true;
  });

  const unreadInquiries = inquiries.filter(inq => inq.status === 'ungelesen').length;
  const broadcastMessages = messages.filter(msg => msg.is_broadcast);
  const directMessages = messages.filter(msg => !msg.is_broadcast && msg.sender_email === user?.email); // Messages sent BY the manager

  if (isLoading || !spv) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  if (user && user.email !== spv.manager_email && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8 flex items-center justify-center">
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Kein Zugriff</h2>
            <p className="text-gray-300">Sie haben keine Berechtigung, diesen SPV zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTokensIssued = spv.total_supply - spv.available_supply;
  const totalRaised = spv.key_metrics?.total_invested || 0;
  const distributions = calculateDistribution();
  const totalDistributionAmount = distributions.reduce((sum, d) => sum + d.distribution, 0);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("IssuerDashboard"))}
            className="text-gray-300 hover:text-white hover:bg-gray-900 mb-4 border-2 border-transparent hover:border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center border-2 border-white shadow-xl">
              <span className="text-black font-bold text-xl">{spv.symbol?.substring(0, 2)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{spv.name}</h1>
              <p className="text-gray-400">{spv.symbol}</p>
            </div>
            <Badge className={`ml-auto text-sm ${
              spv.status === 'aktiv' ? 'bg-green-500/20 text-green-400 border-green-500 border-2' :
              'bg-blue-500/20 text-blue-400 border-blue-500 border-2'
            }`}>
              {spv.status}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Users className="w-4 h-4" />
                Investoren
              </div>
              <div className="text-2xl font-bold text-white">{spv.key_metrics?.number_of_investors || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Eingesammelt
              </div>
              <div className="text-2xl font-bold text-white">{totalRaised.toLocaleString('de-DE')} UTK</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Token verkauft
              </div>
              <div className="text-2xl font-bold text-white">{totalTokensIssued.toLocaleString('de-DE')}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Coins className="w-4 h-4" />
                Verfügbar
              </div>
              <div className="text-2xl font-bold text-white">{spv.available_supply.toLocaleString('de-DE')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black">
          <Tabs defaultValue="dividends" className="w-full">
            <CardHeader className="border-b-2 border-gray-700">
              <TabsList className="bg-gray-900 border-2 border-gray-700">
                <TabsTrigger value="dividends" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">
                  Dividenden
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">
                  Berichte
                </TabsTrigger>
                <TabsTrigger value="investors" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold">
                  Investoren
                </TabsTrigger>
                <TabsTrigger value="communication" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black data-[state=active]:font-bold relative">
                  Kommunikation
                  {unreadInquiries > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">
                      {unreadInquiries}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              {/* Dividends Tab */}
              <TabsContent value="dividends" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Distribution Form */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5 text-[#D4AF37]" />
                      Neue Dividendenausschüttung
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Ausschüttungstyp *</Label>
                        <Select value={distributionType} onValueChange={setDistributionType}>
                          <SelectTrigger className="bg-gray-900 border-2 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pro_rata">Proportional (Pro-Rata nach Token-Anteil)</SelectItem>
                            <SelectItem value="fixed">Fester Betrag pro Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {distributionType === 'pro_rata' ? (
                        <div className="space-y-2">
                          <Label className="text-white font-semibold">Gesamtbetrag (UTK) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="z.B. 5000"
                            value={dividendAmount}
                            onChange={(e) => setDividendAmount(e.target.value)}
                            className="bg-gray-900 border-2 border-gray-700 text-white text-lg"
                          />
                          <p className="text-xs text-gray-400">
                            Wird proportional nach Token-Anteil an {investors.length} Investoren verteilt
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label className="text-white font-semibold">Betrag pro Investor (UTK) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="z.B. 100"
                              value={fixedAmountPerInvestor}
                              onChange={(e) => setFixedAmountPerInvestor(e.target.value)}
                              className="bg-gray-900 border-2 border-gray-700 text-white text-lg"
                            />
                            <p className="text-xs text-gray-400">
                              Jeder Investor erhält den gleichen Betrag
                            </p>
                          </div>
                          {fixedAmountPerInvestor && !isNaN(parseFloat(fixedAmountPerInvestor)) && (
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                              <p className="text-sm text-gray-300">
                                Gesamtbetrag: <span className="text-white font-semibold">
                                  {(parseFloat(fixedAmountPerInvestor) * investors.length).toFixed(2)} UTK
                                </span>
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Notiz</Label>
                        <Textarea
                          placeholder="z.B. Q4 2024 Dividende, Jahresabschluss 2024..."
                          value={dividendNote}
                          onChange={(e) => setDividendNote(e.target.value)}
                          className="bg-gray-900 border-2 border-gray-700 text-white h-20"
                        />
                      </div>

                      {(dividendAmount || fixedAmountPerInvestor) && investors.length > 0 && totalDistributionAmount > 0 ? (
                        <div className="p-4 rounded-xl bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30">
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Vorschau der Ausschüttung
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Anzahl Investoren:</span>
                              <span className="text-white font-bold">{investors.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Gesamtbetrag:</span>
                              <span className="text-[#D4AF37] font-bold">{totalDistributionAmount.toFixed(2)} UTK</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Ø pro Investor:</span>
                              <span className="text-white font-bold">
                                {(totalDistributionAmount / investors.length).toFixed(2)} UTK
                              </span>
                            </div>
                            {distributions.length > 0 && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Min. Ausschüttung:</span>
                                  <span className="text-white font-bold">
                                    {Math.min(...distributions.map(d => d.distribution)).toFixed(2)} UTK
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Max. Ausschüttung:</span>
                                  <span className="text-white font-bold">
                                    {Math.max(...distributions.map(d => d.distribution)).toFixed(2)} UTK
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}

                      <Button
                        onClick={handleDistributeDividends}
                        disabled={isDistributing || (distributionType === 'pro_rata' && (!dividendAmount || parseFloat(dividendAmount) <= 0)) || (distributionType === 'fixed' && (!fixedAmountPerInvestor || parseFloat(fixedAmountPerInvestor) <= 0)) || investors.length === 0}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold text-lg py-6 shadow-xl"
                      >
                        {isDistributing ? 'Wird ausgeschüttet...' : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Dividende ausschütten
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Dividend History */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-[#D4AF37]" />
                      Ausschüttungshistorie
                    </h3>
                    
                    {dividendHistory.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {Object.entries(
                          dividendHistory.reduce((acc, tx) => {
                            const date = format(new Date(tx.created_date), 'yyyy-MM-dd');
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(tx);
                            return acc;
                          }, {})
                        ).map(([date, txs]) => (
                          <div key={date} className="p-4 rounded-xl bg-gray-900 border-2 border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                <span className="text-white font-semibold">
                                  {format(new Date(date), 'dd.MM.yyyy')}
                                </span>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500 font-bold">
                                {txs.length} Investoren
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Gesamt ausgeschüttet:</span>
                                <span className="text-white font-bold">
                                  {txs.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)} UTK
                                </span>
                              </div>
                              {txs[0]?.description && (
                                <div className="text-xs text-gray-400 mt-2 italic">
                                  {txs[0].description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-900/30 rounded-xl border-2 border-gray-800">
                        <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Noch keine Dividenden ausgeschüttet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Upload Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-[#D4AF37]" />
                      Neuen Bericht hochladen
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Berichtstyp *</Label>
                        <Select value={reportType} onValueChange={setReportType}>
                          <SelectTrigger className="bg-gray-900 border-2 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Quartalsbericht</SelectItem>
                            <SelectItem value="annual">Jahresbericht</SelectItem>
                            <SelectItem value="audit">Prüfbericht</SelectItem>
                            <SelectItem value="performance">Performance Report</SelectItem>
                            <SelectItem value="compliance">Compliance-Bericht</SelectItem>
                            <SelectItem value="other">Sonstiges</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Berichtszeitraum *</Label>
                        <Input
                          placeholder="z.B. Q4 2024, Jahr 2024, Januar 2025..."
                          value={reportPeriod}
                          onChange={(e) => setReportPeriod(e.target.value)}
                          className="bg-gray-900 border-2 border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Beschreibung</Label>
                        <Textarea
                          placeholder="Zusätzliche Informationen zum Bericht..."
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          className="bg-gray-900 border-2 border-gray-700 text-white h-20"
                        />
                      </div>

                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-[#D4AF37] transition-colors">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-white mb-2 font-semibold">Bericht hochladen</p>
                        <p className="text-sm text-gray-400 mb-6">PDF - max. 20MB</p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files[0] && handleReportUpload(e.target.files[0])}
                          className="hidden"
                          id="report-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('report-upload').click()}
                          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-lg"
                        >
                          Datei wählen
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Reports */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#D4AF37]" />
                      Hochgeladene Berichte
                    </h3>
                    
                    {spv.documents && spv.documents.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {spv.documents.map((doc, index) => (
                          <div key={index} className="p-4 rounded-xl bg-gray-900 border-2 border-gray-700 hover:border-[#D4AF37] transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <FileText className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-white truncate">{doc.name}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]">
                                      {doc.type}
                                    </Badge>
                                    {doc.period && (
                                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                                        {doc.period}
                                      </Badge>
                                    )}
                                  </div>
                                  {doc.description && (
                                    <p className="text-xs text-gray-400 mt-2">{doc.description}</p>
                                  )}
                                  {doc.upload_date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Hochgeladen: {format(new Date(doc.upload_date), 'dd.MM.yyyy')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black flex-shrink-0">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-900/30 rounded-xl border-2 border-gray-800">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Noch keine Berichte hochgeladen</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Investors Tab */}
              <TabsContent value="investors" className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                    Investoren-Übersicht ({investors.length})
                  </h3>
                  <div className="flex gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 bg-gray-900 border-2 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="token_amount">Nach Token-Anzahl</SelectItem>
                        <SelectItem value="invested_amount">Nach Investiert</SelectItem>
                        <SelectItem value="purchase_date">Nach Kaufdatum</SelectItem>
                        <SelectItem value="dividends_earned">Nach Dividenden</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={exportInvestorData}
                      variant="outline"
                      className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      disabled={investors.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                <Input
                  placeholder="Investor suchen (E-Mail)..."
                  value={investorSearch}
                  onChange={(e) => setInvestorSearch(e.target.value)}
                  className="bg-gray-900 border-2 border-gray-700 text-white"
                />
                
                {filteredInvestors.length > 0 ? (
                  <div className="space-y-3">
                    {filteredInvestors.map((inv) => {
                      const gainLoss = (inv.current_value || inv.invested_amount) - inv.invested_amount;
                      const gainLossPercent = inv.invested_amount > 0 ? (gainLoss / inv.invested_amount) * 100 : 0;

                      return (
                        <div key={inv.id} className="p-5 rounded-xl bg-gray-900 border-2 border-gray-700 hover:border-[#D4AF37] transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center flex-shrink-0 border-2 border-white">
                                <Mail className="w-6 h-6 text-black" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate">{inv.investor_email}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge className={`${
                                    inv.status === 'aktiv' ? 'bg-green-500/20 text-green-400 border-green-500' :
                                    inv.status === 'gesperrt' ? 'bg-red-500/20 text-red-400 border-red-500' :
                                    'bg-gray-500/20 text-gray-400 border-gray-500'
                                  } border-2 font-bold`}>
                                    {inv.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                                    Seit {format(new Date(inv.purchase_date), 'dd.MM.yyyy')}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400 font-semibold">Token</p>
                                <p className="text-white font-bold text-lg">
                                  {inv.token_amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {((inv.token_amount / spv.total_supply) * 100).toFixed(2)}% Anteil
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-semibold">Investiert</p>
                                <p className="text-white font-bold text-lg">
                                  {inv.invested_amount.toLocaleString('de-DE')} UTK
                                </p>
                                <p className="text-xs text-gray-500">
                                  @ {inv.purchase_price} UTK/Token
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-semibold">Gewinn/Verlust</p>
                                <p className={`font-bold text-lg ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)} UTK
                                </p>
                                <p className={`text-xs ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-semibold">Dividenden</p>
                                <p className="text-green-400 font-bold text-lg">
                                  {(inv.dividends_earned || 0).toFixed(2)} UTK
                                </p>
                                <p className="text-xs text-gray-500">
                                  Erhalten
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-900/30 rounded-xl border-2 border-gray-800">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {investorSearch ? 'Keine Investoren gefunden' : 'Noch keine Investoren'}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-6">
                {/* Communication Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-gray-700 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Bell className="w-4 h-4" />
                        Broadcasts gesendet
                      </div>
                      <div className="text-2xl font-bold text-white">{broadcastMessages.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-gray-700 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Direkte Nachrichten (Gesendet)
                      </div>
                      <div className="text-2xl font-bold text-white">{directMessages.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-gray-700 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Inbox className="w-4 h-4" />
                        Ungelesene Anfragen
                      </div>
                      <div className="text-2xl font-bold text-[#D4AF37]">{unreadInquiries}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Broadcast Messages */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#D4AF37]" />
                      Broadcast-Nachricht senden
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Priorität</Label>
                        <Select value={broadcastPriority} onValueChange={setBroadcastPriority}>
                          <SelectTrigger className="bg-gray-900 border-2 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="niedrig">Niedrig</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="hoch">Hoch</SelectItem>
                            <SelectItem value="dringend">Dringend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Betreff *</Label>
                        <Input
                          placeholder="z.B. Quartalsbericht Q4 2024"
                          value={broadcastSubject}
                          onChange={(e) => setBroadcastSubject(e.target.value)}
                          className="bg-gray-900 border-2 border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Nachricht *</Label>
                        <Textarea
                          placeholder="Ihre Nachricht an alle Investoren..."
                          value={broadcastContent}
                          onChange={(e) => setBroadcastContent(e.target.value)}
                          className="bg-gray-900 border-2 border-gray-700 text-white h-32"
                        />
                        <p className="text-xs text-gray-400">
                          Diese Nachricht wird an {investors.length} Investoren gesendet
                        </p>
                      </div>

                      <Button
                        onClick={handleSendBroadcast}
                        disabled={isSendingBroadcast || !broadcastSubject || !broadcastContent || investors.length === 0}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-xl"
                      >
                        {isSendingBroadcast ? 'Wird gesendet...' : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Broadcast senden
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Recent Broadcasts */}
                    {broadcastMessages.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-white mb-3">Letzte Broadcasts</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {broadcastMessages.slice(0, 5).map((msg) => (
                            <div key={msg.id} className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-semibold truncate flex-1">{msg.subject}</span>
                                <Badge className={`${getPriorityBadge(msg.priority).className} text-xs ml-2`}>
                                  {getPriorityBadge(msg.priority).label}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400">
                                {format(new Date(msg.created_date), 'dd.MM.yyyy HH:mm')} • {msg.broadcast_recipient_count} Empfänger
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Messages */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                      Direkte Nachricht
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white font-semibold">Investor auswählen *</Label>
                        <Select 
                          value={selectedInvestor?.id || ''} 
                          onValueChange={(value) => {
                            const investor = investors.find(inv => inv.id === value);
                            setSelectedInvestor(investor);
                          }}
                        >
                          <SelectTrigger className="bg-gray-900 border-2 border-gray-700 text-white">
                            <SelectValue placeholder="Investor wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {investors.length > 0 ? (
                              investors.map((inv) => (
                                <SelectItem key={inv.id} value={inv.id}>
                                  {inv.investor_email}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-investors" disabled>
                                Keine Investoren verfügbar
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedInvestor && (
                        <>
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
                            <p className="text-gray-300">
                              <strong className="text-white">{selectedInvestor.investor_email}</strong>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {selectedInvestor.token_amount.toFixed(2)} Token • 
                              {selectedInvestor.invested_amount.toLocaleString('de-DE')} UTK investiert
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white font-semibold">Betreff *</Label>
                            <Input
                              placeholder="Betreff der Nachricht"
                              value={directMessageSubject}
                              onChange={(e) => setDirectMessageSubject(e.target.value)}
                              className="bg-gray-900 border-2 border-gray-700 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white font-semibold">Nachricht *</Label>
                            <Textarea
                              placeholder="Ihre Nachricht..."
                              value={directMessageContent}
                              onChange={(e) => setDirectMessageContent(e.target.value)}
                              className="bg-gray-900 border-2 border-gray-700 text-white h-32"
                            />
                          </div>

                          <Button
                            onClick={handleSendDirectMessage}
                            disabled={!directMessageSubject || !directMessageContent}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold shadow-xl"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Nachricht senden
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Investor Inquiries */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-[#D4AF37]" />
                    Investoren-Anfragen ({inquiries.length})
                  </h3>

                  {inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <Card key={inquiry.id} className="border-2 border-gray-700 bg-gray-900">
                          <CardContent className="p-5">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                                    <h4 className="font-bold text-white text-lg">{inquiry.subject}</h4>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge className={`${getStatusBadge(inquiry.status).className} border-2`}>
                                      {getStatusBadge(inquiry.status).label}
                                    </Badge>
                                    <Badge className={`${getPriorityBadge(inquiry.priority).className} border-2`}>
                                      {getPriorityBadge(inquiry.priority).label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-3">
                                    Von: <strong className="text-white">{inquiry.sender_email}</strong>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(inquiry.created_date), 'dd.MM.yyyy HH:mm')}
                                  </p>
                                </div>
                                {inquiry.status === 'ungelesen' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markAsRead(inquiry.id)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Als gelesen
                                  </Button>
                                )}
                              </div>

                              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                <p className="text-gray-300 whitespace-pre-wrap">{inquiry.content}</p>
                              </div>

                              {inquiry.status !== 'beantwortet' && (
                                <div className="space-y-2">
                                  <Label htmlFor={`reply-${inquiry.id}`} className="text-white text-sm font-semibold">Antwort:</Label>
                                  <Textarea
                                    placeholder="Ihre Antwort..."
                                    className="bg-gray-800 border-2 border-gray-700 text-white"
                                    id={`reply-${inquiry.id}`}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const replyContent = document.getElementById(`reply-${inquiry.id}`).value;
                                      handleReplyToInquiry(inquiry, replyContent);
                                    }}
                                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                                  >
                                    <Reply className="w-4 h-4 mr-2" />
                                    Antworten
                                  </Button>
                                </div>
                              )}

                              {inquiry.status === 'beantwortet' && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                  <div className="flex items-center gap-2 text-sm text-green-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="font-semibold">Beantwortet</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl border-2 border-gray-800">
                      <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Keine Anfragen vorhanden</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
