import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react';

export default function MarketNewsWidget({ spvSymbol = null, compact = false }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarketNews = async () => {
    try {
      // PRODUCTION TODO: Replace with real News API integration
      // Options: NewsAPI.org, Finnhub, CryptoCompare, or custom RSS aggregator
      // 
      // Example implementation:
      // const response = await fetch(
      //   `https://newsapi.org/v2/everything?q=${spvSymbol || 'security+tokens+blockchain'}&apiKey=${API_KEY}`
      // );
      // const data = await response.json();
      // setNews(data.articles.map(article => ({
      //   id: article.url,
      //   title: article.title,
      //   source: article.source.name,
      //   url: article.url,
      //   published_at: article.publishedAt,
      //   sentiment: analyzeSentiment(article.title), // AI sentiment analysis
      //   relevance_score: calculateRelevance(article)
      // })));
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Placeholder news (for development)
      const placeholderNews = [
        {
          id: 1,
          title: spvSymbol 
            ? `${spvSymbol}: Positive market outlook for Q1 2025` 
            : 'Security Token Market sees 47% growth in Q4 2024',
          source: 'Bloomberg',
          url: '#',
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance_score: 95,
          summary: 'Strong institutional interest driving growth...'
        },
        {
          id: 2,
          title: spvSymbol
            ? `Analysts upgrade ${spvSymbol} price target to 125 EUT`
            : 'ERC-1400 becomes industry standard for security tokens',
          source: 'Reuters',
          url: '#',
          published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance_score: 88,
          summary: 'Positive regulatory developments...'
        },
        {
          id: 3,
          title: spvSymbol
            ? `${spvSymbol} NAV increases 8% in latest quarter`
            : 'MiCAR regulation comes into effect across EU',
          source: 'Financial Times',
          url: '#',
          published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          relevance_score: 82,
          summary: 'Important regulatory updates...'
        }
      ];

      setNews(placeholderNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [spvSymbol]);

  const getSentimentColor = (sentiment) => {
    return {
      positive: 'bg-green-500/20 text-green-400 border-green-500/30',
      negative: 'bg-red-500/20 text-red-400 border-red-500/30',
      neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }[sentiment] || 'bg-gray-500/20 text-gray-400';
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Vor wenigen Minuten';
    if (diffHours === 1) return 'Vor 1 Stunde';
    if (diffHours < 24) return `Vor ${diffHours} Stunden`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Vor 1 Tag';
    return `Vor ${diffDays} Tagen`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Lade News...</span>
          </div>
        ) : (
          news.slice(0, 3).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-[#D4AF37]/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-1.5 rounded-lg ${
                  item.sentiment === 'positive' ? 'bg-green-500/20' :
                  item.sentiment === 'negative' ? 'bg-red-500/20' :
                  'bg-gray-500/20'
                }`}>
                  {item.sentiment === 'positive' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : item.sentiment === 'negative' ? (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  ) : (
                    <Newspaper className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.source}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{getTimeAgo(item.published_at)}</span>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-gray-700 bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#D4AF37]" />
            Market News
            {spvSymbol && (
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] ml-2">
                {spvSymbol}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMarketNews}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : (
          news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="p-4 rounded-lg bg-black/50 border border-gray-700 hover:border-[#D4AF37]/50 transition-all group">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`mt-1 p-2 rounded-lg ${
                    item.sentiment === 'positive' ? 'bg-green-500/20 border border-green-500/30' :
                    item.sentiment === 'negative' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-gray-500/20 border border-gray-500/30'
                  }`}>
                    {item.sentiment === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : item.sentiment === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Newspaper className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">{item.source}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{getTimeAgo(item.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSentimentColor(item.sentiment)} style={{ fontSize: '10px' }}>
                          {item.sentiment}
                        </Badge>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}