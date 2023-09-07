import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import AggregatorProxyInterface from '@chainlink/abi/v0.7/interfaces/AggregatorProxyInterface.json'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const getPriceFromBand = async (): Promise<number> => {
  const api = 'https://laozi1.bandchain.org/api/oracle/v1/request_prices?symbols=ETH';
  const result = await fetch(api, { cache: 'force-cache' });
  const data = await result.json();
  return data.price_results[0].px / data.price_results[0].multiplier;
}

export const getLatestPrice = async (): Promise<(number | string)[]> => {
  const result = await client.readContract({
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' as `0x${string}`,
    abi: AggregatorProxyInterface.abi,
    functionName: 'latestRoundData'
  })
  return Number(result[1]) / 1e8;
}