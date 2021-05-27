import L from 'leaflet'

import { ValueConfig } from '@/types'

export * from './leaflet'

export * from './drawboard'

export const parseToMapObj = (configs: ValueConfig[], transf?: boolean) => {
  const mapObj: { [propName: string]: string } = {}
  configs.forEach((c) => {
    if (transf) {
      mapObj[`${c.label}`] = `${c.value}`
    } else {
      mapObj[`${c.value}`] = c.label // !key的排序方式?
    }
  })
  return mapObj
}

export const parseToValueConfigArr = (obj: { [propName: string]: any }) => {
  return Object.keys(obj).map((k) => {
    return {
      label: obj[k],
      value: k
    }
  })
}

export const getUid = () => {
  return Date.now() +
    Math.random()
      .toString(16)
      .slice(2)
}

export function execCommand(command: string, value: string, $Notice?: any) {
  const input = document.createElement('input')
  input.setAttribute('value', value)
  input.setAttribute('id', 'copy-container')
  document.body.appendChild(input)
  input.select()
  if (document.execCommand(command)) {
    document.execCommand(command)
    document.body.removeChild(document.getElementById('copy-container') || input)
    $Notice && $Notice.success({
      title: '已复制到剪贴板',
      duration: 3
    })
    return true
  }
  document.body.removeChild(document.getElementById('copy-container') || input)
  $Notice && $Notice.warning({
    title: '复制失败',
    duration: 3
  })
  return false
}

export const getLayerGpFn = (length: number) => {
  const layerGps: Array<() => L.FeatureGroup<any>> = []
  Array(length).fill('').forEach(() => {
    // 创建闭包，保证layerGp一致性
    const layerGp = L.featureGroup()
    layerGps.push(() => {
      return layerGp
    })
  })
  return layerGps
}

export const getCodeImgUrl = (code: string, line?: boolean) => {
  const prefix = line ? 'lane' : 'code'
  return `http://img-ys011.didistatic.com/static/pickuppoint/navi-${prefix}-${code}.png`
}

export const getEsiweiMapDir = (link_list: string) => {
  const linkids: number[] = []
  const esiweiMapDir: { [propName: string]: number } = {}
  link_list.split(',').forEach((id, index) => {
    const dir = id.slice(-1)
    const _id = id.slice(0, id.length - 1)
    linkids.push(+_id)
    esiweiMapDir[!index ? `@${_id}` : `${_id}`] = +dir // 标记第一个link
  })
  return { esiweiMapDir, linkids }
}

export const mapZoomAndRadius: { [propName: number]: number } = {
  4: 500000,
  5: 300000,
  6: 100000,
  7: 50000,
  8: 30000,
  9: 20000,
  10: 10000,
  11: 5000,
  12: 2000,
  13: 1000,
  14: 500,
  15: 300,
  16: 100,
  17: 50,
  18: 30,
  19: 20,
  20: 10
}

export const validatePhone = (phone: any) => {
  return phone && !isNaN(phone) && `${phone}`.length <= 11
}

export const validateTestPhone = (phones: any) => {
  const phoneList = phones.split(',');
  for (const phone of phoneList) {
    if (!validatePhone(phone)) {
      return false;
    }
  }
  return true
}
