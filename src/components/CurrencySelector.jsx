
import React from 'react';
import { Button } from '@/components/ui/button';
import { CURRENCIES } from '@/utils/currency'; // Updated import path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function CurrencySelector({ selectedCurrency, onCurrencyChange, compact = false }) {
  const current = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800">
            <span className="mr-1">{current.flag}</span>
            <span className="font-bold">{current.code}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-700">
          {CURRENCIES.map(currency => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => onCurrencyChange(currency.code)}
              className={`text-white hover:bg-gray-800 cursor-pointer ${
                currency.code === selectedCurrency ? 'bg-gray-800' : ''
              }`}
            >
              <span className="mr-2">{currency.flag}</span>
              <span className="font-semibold">{currency.code}</span>
              <span className="text-gray-400 text-xs ml-2">({currency.symbol})</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800">
          <span className="mr-2">{current.flag}</span>
          <span className="font-bold">{current.name}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 w-64">
        {CURRENCIES.map(currency => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => onCurrencyChange(currency.code)}
            className={`text-white hover:bg-gray-800 cursor-pointer p-3 ${
              currency.code === selectedCurrency ? 'bg-gray-800' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currency.flag}</span>
                <div>
                  <p className="font-semibold">{currency.code}</p>
                  <p className="text-xs text-gray-400">{currency.name}</p>
                </div>
              </div>
              <span className="text-[#D4AF37] font-bold">{currency.symbol}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
