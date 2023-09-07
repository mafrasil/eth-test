"use client";

import React, { useState, useEffect } from 'react';
import { getPriceFromBand, getLatestPrice } from '@/api/fetchPrices';

const displayValue = (name: string, value: any) => {
    return (
      <div className="bg-black/50 text-white p-3 rounded-md flex flex-col w-full lg:w-64">
        <span className="text-white/50">{name}</span>
        <span>{value}</span>
      </div>
    );
  }

  export default function HomeWidget() {
    const [price, setPrice] = useState<number|null>(null);
    const [prevPrice, setPrevPrice] = useState<number|null>(null);
    const [priceColor, setPriceColor] = useState<string>('');
    const [oracle, setOracle] = useState<string>("Chainlink");
    const [time, setTime] = useState<Date>(new Date());
  
    const oracleMethods = {
      "Chainlink": latestPrice,
      "Band Protocol": priceFromBand,
    };
    
    useEffect(() => {
      const fetchPrice = async () => {
        const method = oracle === 'Chainlink' ? getLatestPrice : getPriceFromBand;
        const answer = await method();
        setPrevPrice(price);
        setPrice(parseFloat(answer.toFixed(2)));
      };
    
      fetchPrice();
    
      const priceInterval = setInterval(fetchPrice, 5000);
    
      return () => {
        clearInterval(priceInterval);
      };
    }, [price, oracle]);
  
    useEffect(() => {
      if (price && prevPrice) {
        if (price > prevPrice) {
          setPriceColor('text-green-500');
        } else if (price < prevPrice) {
          setPriceColor('text-red-500');
        } else {
          setPriceColor('');
        }
      }
    }, [price, prevPrice])

return (
  <main className="h-screen w-screen flex flex-col bg-blue-900 justify-center items-center">
    <nav>
      <ul className="flex gap-x-2 py-2">
        {oracleMethods && Object.keys(oracleMethods).map((o) => (
          <li className="bg-black/50 px-8 p-2 rounded-full" key={o} onClick={() => setOracle(o)}>
            {o}
          </li>
        ))}
      </ul>
    </nav>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {displayValue('Oracle', oracle)}
    {displayValue('Price Feed', 'ETH/USD')}
    {displayValue('USD', <span className={`${priceColor}`}>${price?.toFixed(2) || 0}</span>)}
    {displayValue('Time', time?.toLocaleString())}
    </div>
  </main>
)
}