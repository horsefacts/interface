import { formatNFTAssetMetatagTitleName } from 'shared-cloud/metatags'
import { AssetDocument, AssetQuery } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { Data } from 'utils/cache'
import client from '../client'

export default async function getAsset(collectionAddress: string, tokenId: string, url: string) {
  const origin = new URL(url).origin
  const image = origin + '/api/image/nfts/asset/' + collectionAddress + '/' + tokenId
  const { data } = await client.query<AssetQuery>({
    query: AssetDocument,
    variables: {
      address: collectionAddress,
      filter: {
        tokenIds: [tokenId],
      },
    },
  })
  const asset = data?.nftAssets?.edges[0]?.node
  if (!asset) {
    return undefined
  }
  const title = formatNFTAssetMetatagTitleName(asset.name, asset.collection?.name, asset.tokenId)

  const frame = {
    version: 'next',
    imageUrl: `${image}?aspect=frame`,
    button: {
      title: 'View',
      action: {
        type: 'launch_frame',
        name: 'Uniframe',
        url: `https://uniframe.org/nfts/asset/${collectionAddress}/${tokenId}`,
        splashImageUrl: 'https://uniframe.org/favicon.png',
        splashBackgroundColor: '#131313',
      },
    },
  } as const

  const formattedAsset: Data = {
    title,
    image,
    url,
    ogImage: asset.image?.url ?? origin + '/images/192x192_App_Icon.png',
    frame,
  }
  return formattedAsset
}
