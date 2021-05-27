import request from '@/utils/request'
import { BaseMapManagerListI, BaseMapEvaluationListI, BaseMapEvaluationCaseListI, BaseMapEvaluationCaseRecordI, BaseMapManagerCaseListI } from './types'

// 评测管理列表
export const getJobList = async (
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
    id?: number
    city_filter?: string
    job_name?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: BaseMapManagerListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/job/poi', 'GET', params)
}
// 评测管理详情 暂不使用
export const getJobCaseList = async (
  task_id: number,
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
  }
) => {
  return request(`/v2/job/poi/${task_id}`, 'GET', params)
}

// 已标注列表
export const getMarkedJobCaseList = async (
  job_id: number,
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: boolean
    user: string
    marked: number | 1
    id?: string
    BlockID?: string
    Type?: number
    poi_diff_record_id?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: BaseMapManagerCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request(`/v2/mark/poi`, 'GET', { job_id, ...params })
}

// 分发
export const deliveryJob = async (
  task_id: string,
  params: {
    pa_name: string[]
    blocks: string, // BlockI[]
    num: number,
    type: number
  }
) => {
  const res = await request(`/v2/job/poi/${task_id}/distribution`, 'POST', {
    ...params,
    blocks: JSON.parse(params.blocks)
  }, true)
  if (res) {
    const { code, msg } = res
    return {
      deliveried: !code,
      msg
    }
  } else {
    return {
      deliveried: false,
      msg: '请求失败'
    }
  }
}

// 可分发数量
export const getCanDeliveryNums = async (params: {
  job_id: number
  blockNo: string
  blockID: string
}): Promise<null | {
  count: number
}> => {
  return request(`/v2/count/record/poi`, 'GET', params)
}

// 分发详情
export const getDeliveryDetail = async (task_id: number): Promise<null | {
  Block_disp_num: Array<{
    block_id: string // "12_843_387-1610612976"
    poi_complete_num: number // 0
    poi_num: number // 396
  }> | null
  block_num: number
  mark_dispatch_num: number
  mark_person: Array<{
    block_id: string // "12_843_387-1610612976"
    complete_count: number // 0
    dis_id: number // 127
    person: string // "test"
    total_count: number // 396
    type: number // 1
  }>
  marked_num: number
  total_num: number
  verified_num: number
  verify_dispatch_num: number
  verify_person: any[]
}> => {
  return request(`/v2/job/poi/${task_id}/detail`, 'GET')
}

// 结束
export const recallDelivery = async (task_id: number, params: { dis_id: number, type: number }) => {
  const res = await request(`/v2/job/poi/${task_id}/recall`, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      recalled: !code,
      msg
    }
  } else {
    return {
      recalled: false,
      msg: '请求失败'
    }
  }
}

// 结束
export const stopJob = async (task_id: string) => {
  const res = await request(`/v2/job/poi/${task_id}/stop`, 'POST', {}, true)
  if (res) {
    const { code, msg } = res
    return {
      stoped: !code,
      msg
    }
  } else {
    return {
      stoped: false,
      msg: '请求失败'
    }
  }
}

// 评测标注列表
export const getPaJobList = async (
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
    id?: number
    city_filter?: string
    job_name?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: BaseMapEvaluationListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/pa_job/poi', 'GET', params)
}
// 评测标注列表详情
export const getPaJobCaseList = async (
  task_id: number,
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
    status: number
  }
): Promise<null | {
  cur_page_num: number
  data_list: BaseMapEvaluationCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}>  => {
  return request(`/v2/pa_job/poi/${task_id}`, 'GET', params)
}

// 标注
export const markJob = async (
  params: {
    id: number,
    job_id: number,
    marked_json: string
  }
) => {
  const res = await request('/v2/mark/poi', 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      marked: !code,
      msg
    }
  } else {
    return {
      marked: false,
      msg: '请求失败'
    }
  }
}

// 标注记录
export const getMarkRecord = async (task_id: number): Promise<null | {
  history: null | BaseMapEvaluationCaseRecordI[]
  mark_records: string
  verify_records: string
}> => {
  return request(`/v2/mark/poi/${task_id}/history`, 'GET')
}

