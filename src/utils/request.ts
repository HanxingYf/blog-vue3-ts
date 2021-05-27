import axios from 'axios'
import config from '@/config'
const { baseUrl } = config
import { stringify } from 'query-string'

interface ResI {
  code: number
  msg: string
  data: any
}

export default async (
  uri: string,
  method: 'GET' | 'POST' | 'DELETE',
  params: Record<string, any> = {},
  returnOrigin?: boolean
): Promise<ResI | any> => {
  const isGet = !method || method === 'GET'
  const handleQuery = isGet ? stringify : JSON.stringify
  const query = handleQuery(params)
  try {
    const reqUrl = `${baseUrl}${uri}${isGet && query ? `?${query}` : ''}`
    const res = await fetch(reqUrl, {
      method,
      ...(isGet ? {} : {
        body: query
      }),
      headers: { 'content-type': 'application/json' },
      redirect: 'manual'
    })
    const { redirected, type } = res
    if (redirected || type === 'opaqueredirect') {
      window.location.replace('/login')
    }
    const resData: ResI = await res.json()
    if (returnOrigin) {
      return resData
    } else {
      const { code, msg, data } = resData
      code && console.error(msg)
      return code ? null : data
    }
  } catch (error) {
    console.error(error)
    return returnOrigin ? { code: -1, msg: '服务器错误', data: null } : null
  }
}
