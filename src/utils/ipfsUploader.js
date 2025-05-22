import { NFTStorage, File } from 'nft.storage'

const API_TOKEN = '1b1d1da9.f4b20706985642c28dd870d1014773f3'

const client = new NFTStorage({ token: API_TOKEN })

export async function uploadToIPFS(fileOrText) {
  if (typeof fileOrText === 'string') {
    const blob = new Blob([fileOrText], { type: 'text/plain' })
    const file = new File([blob], 'message.txt')
    const cid = await client.storeBlob(file)
    return `https://ipfs.io/ipfs/${cid}`
  } else if (fileOrText instanceof File) {
    const cid = await client.storeBlob(fileOrText)
    return `https://ipfs.io/ipfs/${cid}`
  } else {
    throw new Error('Invalid input')
  }
}
