import Cache, { Data } from './cache'

export async function getRequest<T extends Data>(
  url: string,
  getData: () => Promise<T | undefined>,
  _validateData: (data: Data) => data is T,
): Promise<T | undefined> {
  _validateData
  try {
    const data = await getData()
    if (!data) {
      return undefined
    }
    await Cache.put(data, url)
    return data
  } catch (e) {
    return undefined
  }
}
