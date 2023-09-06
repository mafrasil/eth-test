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

const getLatestPrice = async (): Promise<(number | string)[]> => {
  const result = await client.readContract({
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' as `0x${string}`,
    abi: AggregatorProxyInterface.abi,
    functionName: 'latestRoundData'
  })
  return result as (number | string)[];
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

const displayValue = (name: string, value: any) => {
  return (
    <div className="bg-black/50 p-3 rounded-md flex flex-col w-64">
      <span className="text-white/50">{name}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Home() {
  const time = useCurrentTime();
  const [price, setPrice] = useState<number|null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const latestPriceData = await getLatestPrice();
      const answer = Number(latestPriceData[1]) / 10 ** 8;
      setPrice(parseFloat(answer.toFixed(2)));
    };
    fetchPrice();
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col bg-blue-900 justify-center items-center">
      <div className="grid grid-cols-2 gap-3">
      {displayValue('Oracle', 'Chainlink')}
      {displayValue('Price Feed', 'ETH/USD')}
      {displayValue('USD', `$${price}`)}
      {displayValue('Time', time?.toLocaleString())}
      </div>
    </main>
  )
}