import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Info } from 'lucide-react';

export default function ExplainerBox({ title, children, type = 'info' }) {
  const styles = {
    info: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      titleColor: 'text-blue-300'
    },
    help: {
      border: 'border-[#D4AF37]/30',
      bg: 'bg-[#D4AF37]/10',
      icon: <HelpCircle className="w-5 h-5 text-[#D4AF37]" />,
      titleColor: 'text-[#D4AF37]'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <Card className={`${style.border} ${style.bg}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {style.icon}
          </div>
          <div className="flex-1">
            {title && (
              <p className={`font-semibold ${style.titleColor} mb-2 text-sm md:text-base`}>
                {title}
              </p>
            )}
            <div className="text-xs md:text-sm text-gray-300">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}