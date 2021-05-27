
import { FeatureCollectionI } from '@/types'

import L, { LatLngLiteral, CircleMarkerOptions, TooltipOptions } from 'leaflet'

import 'leaflet-polylinedecorator'

import moment from 'moment'

import { execCommand } from '@/utils'

// 绘制播报路线(或点)
export function genNaviRoadLine(
  geojson: string,
  options?: {
    drawCode?: boolean
    style?: { color: string },
    esiweiMapDir?: { [propName: string]: number }
  }
): {
  layer: L.FeatureGroup<any> | null
  voice: string
  latlng: LatLngLiteral | null
} {
  let geojsonObj: FeatureCollectionI | null = null
  try {
    geojsonObj = JSON.parse(geojson)
  } catch (error) {
    console.log('解析geojson字段失败', error)
  }
  if (!geojsonObj) {
    return { layer: null, voice: '无效geojson', latlng: null }
  }
  const { drawCode, style, esiweiMapDir } = options || { drawCode: false, style: {}, esiweiMapDir: undefined }
  const _style = style || { color: '#f77' }
  if (esiweiMapDir) {
    const l = genGeojsonLayer(geojsonObj, {
      style: { ..._style, opacity: 1 },
      esiweiMapDir
    })
    return {
      layer: l,
      voice: '',
      latlng: (l as any).codeLatlng
    }
  }
  const layerGp = L.featureGroup()
  const { features } = geojsonObj
  // console.log(geojsonObj, '+++ ')
  let lngLats: LatLngLiteral[] = []
  let latlng: LatLngLiteral | null = null
  const pointMarkers: L.CircleMarker[] = []
  let voice: string = '无'
  features.forEach((feature) => {
    const { geometry, properties } = feature
    const { type, coordinates } = geometry
    if (type === 'LineString') {
      // @ts-ignore
      const ll = coordinates.map((coords) => (L.latLng({ lat: coords[1], lng: coords[0] })))
      lngLats = [
        ...lngLats,
        ...(ll)
      ]
    }
    if (type === 'Point' && properties.name !== 'tts') {
      voice = (properties.tts || '无')
      // @ts-ignore
      latlng = { lng: coordinates[0], lat: coordinates[1] }
      if (drawCode) {
        // @ts-ignore
        const codeMarker = genCircleMarker(latlng, { ..._style, fillColor: '#FFDEAD', fillOpacity: 1 })
        bindTooltip(codeMarker, voice, { permanent: false, direction: 'left' })
        pointMarkers.push(codeMarker)
      }
    }
    if (type === 'Point' && properties.targetPos) {
      // console.log('====');
      voice = (properties.tts || '无')
      // @ts-ignore
      latlng = { lng: coordinates[0], lat: coordinates[1] }
      if (drawCode) {
        // @ts-ignore
        const codeMarker = genCircleMarker(latlng, { ..._style, fillColor: 'orangeRed', fillOpacity: 1})
        bindTooltip(codeMarker, voice, { permanent: false, direction: 'left' })
        pointMarkers.push(codeMarker)
      }
    }
  })
  const polyline = L.polyline(lngLats, _style)
  const decorator = (L as any).polylineDecorator(lngLats, {
    patterns: _getPatterns(_style)
  })
  layerGp.addLayer(polyline)
  layerGp.addLayer(decorator)
  pointMarkers.forEach((m) => layerGp.addLayer(m))
  return { layer: layerGp, voice, latlng }
}

// 绘制导航轨迹
export function genNaviTraj(
  geojson: string,
  style: L.CircleMarkerOptions = { color: '#f77', radius: 5, weight: 2 }
): L.FeatureGroup<any> | null {
  let geojsonObj: FeatureCollectionI | null = null
  try {
    geojsonObj = JSON.parse(geojson)
  } catch (error) {
    console.error('解析geojson字段失败', error)
  }
  if (!geojsonObj) {
    return null
  }
  const mapTrajPoint: { [prop: string]: string } = {
    Accuracy: '精度',
    Direction: '方向',
    TimeStamp: '时间',
    Velocity: '速度(m/s)'
  }
  const layerGp = L.featureGroup()
  const { features } = geojsonObj
  features.forEach((feature) => {
    const { geometry, properties } = feature
    const { type, coordinates } = geometry
    if (type === 'Point') {
      // @ts-ignore
      const latlng = { lng: coordinates[0], lat: coordinates[1] }
      // @ts-ignore
      const codeMarker = genCircleMarker(latlng, style)
      bindPopup(codeMarker, Object.keys(properties).map((k) => ({
        label: mapTrajPoint[k] || k,
        value: k === 'TimeStamp' ? moment(properties[k] * 1000).format('YYYY-MM-DD HH:mm:ss') : properties[k]
      })))
      layerGp.addLayer(codeMarker)
    }
  })
  return layerGp
}

// 绘制code点
export function genCircleMarker(latlng: LatLngLiteral, style?: L.CircleMarkerOptions) {
  return L.circleMarker(latlng, {
    fillColor: '#fff',
    fillOpacity: 0.4,
    radius: 6,
    weight: 1,
    opacity: 1,
    ...style
  })
}

function _getPatterns(style: {}) {
  return [
    {
      offset: 25,
      repeat: 100,
      symbol: (L as any).Symbol.arrowHead({
        pixelSize: 10,
        pathOptions: {
          ...style,
          opacity: 1,
          fillOpacity: 1,
          weight: 0
        }
      })
    }
  ]
}

export function getStreetJumpCb(type: 'google' | 'baidu', latlng: LatLngLiteral) {
  return () => {
    type === 'google' ? window.open(`https://www.google.com/maps?q=${latlng.lat},${latlng.lng}&z=15`, '_blank') :
      window.open(`http://api.map.baidu.com/marker?location=${latlng.lat},${latlng.lng}&title=我的位置&content=我的位置&output=html&coord_type=gcj02&zoom=20`, '_blank')
  }
}

export function bindPopup(
  layer: L.Layer,
  popup: Array<{ label: string, value: any, copy?: boolean, cb?: () => any }>
) {
  const wrapper = document.createElement('div')
  popup.forEach((item) => {
    const { label, value, copy, cb } = item
    const container = document.createElement('div')
    const containerItemKey = document.createElement('div')
    const containerItemColon = document.createElement('div')
    const containerItemValue = document.createElement('div')
    container.setAttribute('style', objSty2StrStyl({
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      'border-bottom': '1px dashed rgb(240, 240, 241)'
    }))
    containerItemKey.setAttribute('style', objSty2StrStyl({
      'width': '30%',
      'text-align': 'right',
      'word-break': 'break-all'
    }))
    containerItemKey.innerHTML = label
    containerItemColon.setAttribute('style', objSty2StrStyl({ 'padding': '0 5px' }))
    containerItemColon.innerHTML = ':'
    containerItemValue.setAttribute('style', objSty2StrStyl({
      'flex': '1',
      'word-break': 'break-all',
      ...(cb ? { 'color': '#f60', 'cursor': 'pointer' } : {})
    }))
    containerItemValue.innerHTML = value || '-'
    if (copy) {
      const span = document.createElement('span')
      span.innerHTML = '复制'
      span.setAttribute('style', objSty2StrStyl({
        'cursor': 'pointer',
        'color': '#f60',
        'margin-left': '5px',
        'display': 'inline-block'
      }))
      containerItemValue.appendChild(span)
      span.addEventListener('click', () => {
        const flag = execCommand('copy', value)
        span.innerHTML = flag ? '复制成功' : '复制失败'
        setTimeout(() => {
          span.innerHTML = '复制'
        }, 1000)
      })
    }
    if (cb) {
      containerItemValue.addEventListener('click', cb)
    }
    container.append(containerItemKey, containerItemColon, containerItemValue)
    wrapper.appendChild(container)
  })
  layer.bindPopup(wrapper, { offset: [0, -20], autoClose: true, maxHeight: 250, minWidth: 250 })
}

export function bindTooltip(
  layer: L.Layer,
  text: string,
  option?: TooltipOptions
) {
  // @ts-ignore
  const offset: L.Point = option && option.direction === 'right' ? [10, 0] : [-10, 0]
  return layer.bindTooltip(text, {
    offset,
    direction: 'right',
    permanent: true,
    ...option
  })
}

export function objSty2StrStyl(style: { [propName: string]: string }) {
  let strStyl = ''
  for (const key in style) {
    if (style.hasOwnProperty(key)) {
      strStyl += `${key}: ${style[key]};`
    }
  }
  return strStyl
}

// 用于绘制打点出现的link
export function genGeojsonLayer(geojson: FeatureCollectionI, options?: {
  style?: CircleMarkerOptions,
  esiweiMapDir?: { [propName: string]: number }
}) {
  const { style, esiweiMapDir } = options || { style: {} as CircleMarkerOptions, esiweiMapDir: undefined }
  let _style = style || {}
  if (!esiweiMapDir) {
    _style = { ..._style, opacity: .5 }
  }
  let firstLinkid = 0
  let firstLinkLastPoint: L.LatLng
  if (esiweiMapDir) {
    for (const key in esiweiMapDir) {
      if ((esiweiMapDir).hasOwnProperty(key)) {
        // 把第一个link的key标记去除
        if (key.includes('@')) {
          const val = esiweiMapDir[key]
          firstLinkid = +key.slice(1)
          delete esiweiMapDir[key]
          esiweiMapDir[key.slice(1)] = val
        }
      }
    }
  }
  const layerGp = L.featureGroup()
  const { features } = geojson
  features.forEach((f) => {
    const { geometry, properties } = f
    const { type, coordinates } = geometry
    const { direction, kind, id } = properties
    if (type === 'LineString') {
      let lngLats = (coordinates as number[][]).map((coords) => (L.latLng({ lat: coords[1], lng: coords[0] })))
      let noDecorator: boolean = false
      let shunDecorator: boolean = false
      let niDecorator: boolean = false
      if (esiweiMapDir) {
        const dir = esiweiMapDir[id]
        noDecorator = false // 无双向（esiwei的link必有方向）
        shunDecorator = dir == 0 && (direction == 2 || direction == 1)
        niDecorator = dir == 1 && (direction == 3 || direction == 1)
      } else {
        noDecorator = direction == 0 || direction == 1 // 双向不绘制方向
        shunDecorator = direction == 2 // 顺方向
        niDecorator = direction == 3 // 逆方向
      }
      if (niDecorator) {
        lngLats = lngLats.reverse()
      }
      const line = L.polyline(lngLats, _style)
      line.on('click', () => {
        // 路线上的kind属性，点击路线时用于判定路线道路等级（时机任务标注使用）
        window.eventBus.$emit('click-nearby-link', kind)
      })
      let patterns = _getPatterns(_style)
      if (esiweiMapDir && firstLinkid == id) {
        firstLinkLastPoint = lngLats[lngLats.length - 1]
        line.setStyle({ color: '#9c27b0' })
        patterns = _getPatterns({ ..._style, color: '#9c27b0' })
      }
      const decorator = (L as any).polylineDecorator(lngLats, { patterns })
      bindPopup(line, Object.keys(properties).map((k) => ({ label: k, value: properties[k] })))
      layerGp.addLayer(line)
      !noDecorator && layerGp.addLayer(decorator)
    }
    if (type === 'Point') {
      const coords = coordinates as number[]
      const latLng = { lng: coords[0], lat: coords[1] }
      const point = L.circleMarker(latLng, {
        fillColor: '#fff',
        fillOpacity: 0.8,
        radius: 4,
        color: '#000',
        weight: 1,
        opacity: 1,
        ..._style
      })
      if (firstLinkLastPoint && firstLinkLastPoint.lat == latLng.lat && firstLinkLastPoint.lng == latLng.lng) {
        (layerGp as any).codeLatlng = latLng
        point.setRadius(6)
        point.setStyle({ color: 'green', fillColor: 'green' })
      }
      // 根据 properties 属性，绘制点的样式（紫色，鼠标hover播
      bindPopup(point, Object.keys(properties).map((k) => ({ label: k, value: properties[k] })))
      layerGp.addLayer(point)
    }
  })
  return layerGp
}

// 墨卡托转gcj
export const mercator2gcj = (lat: number, lon: number) => {
  const PI = 3.141592653589
  const EARTH_RADIUS = 6378137
  const METERS_PER_DEGREE = (EARTH_RADIUS * PI / 180.0)
  const CONV_RATIO = 100000.0
  const MIN_POINT_DIST = 10

  const _lon = lon / METERS_PER_DEGREE
  const _lat = 180.0 / PI * (2 * Math.atan(Math.exp(lat / EARTH_RADIUS)) - PI / 2.0)
  return { lat: _lat, lng: _lon }
}


export const x_pi = 3.14159265358979324 * 3000.0 / 180.0
/**
 * BD-09 to GCJ-02
 * @param bdLat
 * @param bdLon
 */
export function bdPoint2Gcj(bdLat: number, bdLon: number) {
  const x = bdLon - 0.0065
  const y = bdLat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
  const gcjLon = z * Math.cos(theta)
  const gcjLat = z * Math.sin(theta)
  return { lat: gcjLat, lng: gcjLon }
}

/**
 * GCJ-02 to BD-09
 * @param gcjLat
 * @param gcjLon
 */
export function gcj2BdPoint(gcjLat: number, gcjLon: number) {
  const x = gcjLon
  const y = gcjLat
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi)
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi)
  const bdLon = z * Math.cos(theta) + 0.0065
  const bdLat = z * Math.sin(theta) + 0.006
  return { lat: bdLat, lng: bdLon }
}

