"use client";

import React, { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import AggregatorProxyInterface from '@chainlink/abi/v0.7/interfaces/AggregatorProxyInterface.json'

/*
https://data.chain.link/ethereum/mainnet/crypto-usd/eth-usd
https://etherscan.io/address/0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419#code
*/

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const getPriceFromBand = async (): Promise<number> => {
  const api = 'https://laozi1.bandchain.org/api/oracle/v1/request_prices?symbols=ETH';
  const result = await fetch(api);
  const data = await result.json();
  return data.price_results[0].px / data.price_results[0].multiplier;
}

const getLatestPrice = async (): Promise<number> => {
  const result = await client.readContract({
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' as `0x${string}`,
    abi: AggregatorProxyInterface.abi,
    functionName: 'latestRoundData'
  }) as any;
  return Number(result[1]) / 1e8;
}

const useCurrentTime = () => {
  const [time, setTime] = useState<null|Date>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return time;
};

const DisplayValue: React.FC<{ name: string; value: any }> = ({ name, value }) => {
  return (
    <div className="bg-black/50 text-white p-3 rounded-md flex flex-col w-full lg:w-64">
      <span className="text-white/50">{name}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Home() {
  const time = useCurrentTime();
  const [price, setPrice] = useState<number|null>(null);
  const [prevPrice, setPrevPrice] = useState<number|null>(null);
  const [priceColor, setPriceColor] = useState<string>('');
  const [oracle, setOracle] = useState<string>("Chainlink");

  const oracleMethods: { [key: string]: () => Promise<number> } = {
    "Chainlink": getLatestPrice,
    "Band Protocol": getPriceFromBand,
  };
  
  useEffect(() => {
    const fetchPrice = async () => {
      const method = oracleMethods[oracle];
      const latestPriceData = await method();
      const answer = Number(latestPriceData);
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
  }, [price, prevPrice]);

  return (
    <main className="h-screen w-screen flex flex-col bg-blue-900 justify-center items-center">
      <nav>
        <ul className="flex gap-x-2 py-2">
          {oracleMethods && Object.keys(oracleMethods).map((o) => (
            <li className={`uppercase cursor-pointer py-2 font-bold ${oracle === o ? 'underline' : ''}`} key={o} onClick={() => setOracle(o)}>
              {o}
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DisplayValue name='Oracle' value={oracle} />
        <DisplayValue name='Price Feed' value='ETH/USD' />
        <DisplayValue name='USD' value={<span className={`${priceColor}`}>${price?.toFixed(2) || "-"}</span>} />
        <DisplayValue name='Time' value={time?.toLocaleString() || "-"} />
      </div>
    </main>
  )
}