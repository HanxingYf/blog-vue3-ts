import { RoadVersionI, MissionResI, MissionPicI, MissionI, FlagI, UserInfoI } from './common.types'
import { FeatureCollectionI, DistributorI } from '@/types'
import { LatLngLiteral } from 'leaflet'
import request from '@/utils/request'
import moment from 'moment'

export const getUserName = async (): Promise<string> => {
  const res = await request(`/sso/username`, 'GET', {}, true)
  return res ? res.name : 'test'
}

export const getUserInfo = async (): Promise<UserInfoI> => {
  const username = await getUserName()
  const res: { code: number, flags: FlagI[], msg: string } | null = await request(`/sso/flag/${username}`, 'GET', {}, true)
  if (res) {
    const { code, flags } = res
    return {
      username,
      flags: code ? [] : flags
    }
  } else {
    return { username, flags: [] }
  }
}

export const getUsersByRole = async (role: string): Promise<DistributorI[]> => {
  const res: { code: number, users: DistributorI[] } = await request(`/sso/user/${role}`, 'GET', {}, true)
  if (res) {
    const { code, users } = res
    return code ? [] : users
  } else {
    return []
  }
}

export const getRoadNetVersions = async (): Promise<RoadVersionI[]> => {
  try {
    const res = await fetch('http://100.69.187.40:8080/link_query/get_versions')
    const data: RoadVersionI[] = await res.json()
    return data // .filter((d: RoadVersionI) => d.use_status >= 0)
  } catch (error) {
    console.log(error)
    return []
  }
}

export const pullLinkGeojson = async (ids: number[], versions: string[], index: number = 0): Promise<FeatureCollectionI | null> => {
  if (!versions.length) {
    return null
  }
  try {
    const id = ids.join(',')
    const version = versions[index]
    const res = await fetch('http://100.69.187.40:8080/link_query/linkid_with_node', {
      method: 'POST',
      body: JSON.stringify({ id, version })
    })
    const data = await res.json()
    const { code, type, features } = data
    if (code || (features && !features.length)) {
      if (index < versions.length - 1) {
        code && console.info((data).code + `, 可能无此路网版本: ${version}, 开始轮询，请求下一个路网版本: ${versions[index + 1]}`);
        (features && !features.length) && console.info(`features为空：${version}, 开始轮询，请求下一个路网版本: ${versions[index + 1]}`)
        return pullLinkGeojson(ids, versions, index + 1)
      } else {
        return null
      }
    }
    return data.type ? data : null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const pullNearbyLink = async (latlng: LatLngLiteral, versions: string[], index: number = 0): Promise<number[]> => {
  if (!versions.length) {
    return []
  }
  try {
    const version = versions[index]
    const points = `${latlng.lng},${latlng.lat}`
    const res = await fetch(`http://100.69.187.40:8080/spatial_query/nearby?point=${points}&table=${version}`)
    const data: FeatureCollectionI | { code: string } = await res.json()
    if ((data as any).code) {
      if (index < versions.length - 1) {
        console.error((data as any).code + `, 可能无此路网版本: ${version}, 开始轮询，请求下一个路网版本: ${versions[index + 1]}`)
        return pullNearbyLink(latlng, versions, index + 1)
      } else {
        console.info('轮询完毕，无法找到有效的路网版本！')
        return []
      }
    }
    const { features } = data as FeatureCollectionI
    const link_ids = features.map((f) => +f.properties.id)
    return link_ids
  } catch (error) {
    console.log(error)
    return []
  }
}

export const pullNearMission = async (latlng: LatLngLiteral, radius: number = 5): Promise<MissionI[]> => {
  try {
    const { lat, lng } = latlng
    const res = await fetch(`http://10.96.92.59:8080/near_mission?lat=${lat}&lon=${lng}&r=${radius}`)
    const data: MissionResI = await res.json()
    const { mission_list } = data
    return mission_list.sort((a, b) => moment(b.update_time).valueOf() - moment(a.update_time).valueOf()).slice(15)
  } catch (error) {
    console.log(error)
    return []
  }
}

export const pullNearMissionPics = async (missionId: number) => {
  try {
    const res = await fetch(`http://10.96.92.59:8080/mission_info/${missionId}`)
    const data: MissionPicI = await res.json()
    const { collection_infos } = data
    let pics: string[] = []
    if (collection_infos && collection_infos[0]) {
      const { resource_info } = collection_infos[0]
      const { features } = resource_info
      pics = features.map((f) => f.properties.url)
      return { pics, geojson: resource_info }
    } else {
      return { pics, geojson: null }
    }
  } catch (error) {
    console.log(error)
    return { pics: [], geojson: null }
  }
}

