import { formatTokenMetatagTitleName } from 'shared-cloud/metatags'
import {
  Chain,
  TokenWebDocument,
  TokenWebQuery,
} from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { Data } from 'utils/cache'
import { NATIVE_CHAIN_ID } from '../../src/constants/tokens'
import client from '../client'

const convertTokenAddress = (networkName: string, tokenAddress: string) => {
  if (tokenAddress === NATIVE_CHAIN_ID) {
    switch (networkName) {
      case Chain.Celo:
        return '0x471EcE3750Da237f93B8E339c536989b8978a438'
      case Chain.Polygon:
        return '0x0000000000000000000000000000000000001010'
      default:
        return undefined
    }
  }
  return tokenAddress
}

export default async function getToken(networkName: string, tokenAddress: string, url: string) {
  const origin = new URL(url).origin
  const image = origin + '/api/image/tokens/' + networkName + '/' + tokenAddress
  const uppercaseNetworkName = networkName.toUpperCase()
  const convertedTokenAddress = convertTokenAddress(uppercaseNetworkName, tokenAddress)
  const { data } = await client.query<TokenWebQuery>({
    query: TokenWebDocument,
    variables: {
      chain: uppercaseNetworkName,
      address: convertedTokenAddress,
    },
  })
  const asset = data?.token
  if (!asset) {
    return undefined
  }

  const title = formatTokenMetatagTitleName(asset.symbol, asset.name)

  const frame = {
    version: 'next',
    imageUrl: `${image}?aspect=frame`,
    button: {
      title: `Buy ${asset.symbol}`,
      action: {
        type: 'launch_frame',
        name: 'Uniframe',
        url: `https://uniframe.org/swap?chain=${networkName.toLowerCase()}&outputCurrency=${convertTokenAddress(
          uppercaseNetworkName,
          tokenAddress,
        )}`,
        splashImageUrl: 'https://uniframe.org/favicon.png',
        splashBackgroundColor: '#131313',
      },
    },
  } as const

  const formattedAsset: Data = {
    title,
    image,
    url,
    tokenData: {
      symbol: asset.symbol ?? 'UNK',
    },
    ogImage: asset.project?.logoUrl,
    name: asset.name ?? 'Token',
    frame,
  }
  return formattedAsset
}
