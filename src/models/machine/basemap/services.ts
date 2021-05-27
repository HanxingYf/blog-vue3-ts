import request from '@/utils/request'
import { BaseMapRunningTaskI, PoiI, BlockI } from './types'

export const createTask = async (params: {
  city: number
  blocks: string // BlockI[]
  service?: string
  task_name: string
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v2/task/poi', 'POST', {
    ...params,
    blocks: JSON.parse(params.blocks)
  }, true)
  if (res) {
    const { code, msg } = res
    return {
      created: !code,
      msg
    }
  } else {
    return {
      created: false,
      msg: '请求失败'
    }
  }
}

export const getTasksByStatus = async (
  progress: 'Running' | 'Completed',
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: boolean
    id?: number
    city?: string
    creator?: string
    task_name?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: BaseMapRunningTaskI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/task/poi', 'GET', { ...params, progress })
}

export const deleteTask = async (id: number): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/v2/task/poi/${id}`, 'DELETE', {}, true)
  if (res) {
    const { code, msg } = res
    return {
      deleted: !code,
      msg
    }
  } else {
    return {
      deleted: false,
      msg: '请求失败'
    }
  }
}

export const distributeTask = async (
  task_id: number,
  params: {
    job_name: string
    blocks: string // BlockI[]
    desc: string
    to_user: string[]
    dead_line: string
  }
): Promise<{ distributed: boolean; msg: string }> => {
  const res = await request(`/v2/job/poi`, 'POST', {
    task_id,
    ...params,
    blocks: JSON.parse(params.blocks)
  }, true)
  if (res) {
    const { code, msg } = res
    return {
      distributed: !code,
      msg
    }
  } else {
    return {
      distributed: false,
      msg: '请求失败'
    }
  }
}

export const loadTiles = async (CityCode: number): Promise<null | {
  Memo: string,
  Result: number,
  Tiles: Array<{
    BlockNo: string // "12_840_383"
    LeftTopLat: number // 41.24477234308208
    LeftTopLon: number // 115.3125
    POINum: number // 104
    DiffPOINum: number
    RightBottomLat: number // 40.97989908207316
    RightBottomLon: number // 115.6640611588955
    SubBlock: Array<{
      BlockId: string // "0"
      LeftTopLat: number // 41.24477234308208
      LeftTopLon: number // 115.3125
      POINum: number // 0
      DiffPOINum: number
      RightBottomLat: number // 41.24477335145852
      RightBottomLon: number // 115.3124986588955
    }>
  }>
}> => request('/poiincreament/evaluation/loadtiles', 'GET', { CityCode }, true)


export const loadPois = async (
  params: {
    CityCode: number
    BlockNo: string
    // BlockId?: string 此处传子块后返回数据结构仅有POIs
  },
  isDiff = false
): Promise<null | {
  Memo: string,
  Result: number,
  POIs: Array<{
    BlockId: string
    POIs: PoiI[]
  }>
}> => request(`/poiincreament/evaluation/${isDiff ? 'loadpoidiff' : 'loadpois'}`, 'GET', params, true)


export const relativePois = async (params: {
  CityCode: number
  BlockNo: string
  BlockId: string
  DidiID: string
  SiweiID: string
  Distance: number
}): Promise<null | {
  Memo: string,
  Result: number,
  POIs: PoiI[]
}> => {
  const res = await request('/poiincreament/evaluation/relativepois', 'GET', params, true)
  return res && {
    ...res,
    POIs: res.POIs.map((p: any) => ({ ...p, keep: -1 }))
  }
}
