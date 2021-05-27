import request from '@/utils/request'
import config from '@/config'
const { baseUrl } = config
import {
  VectorJobListI, VectorEvaluationListI, VectorEvaluationCaseListI,
  VectorEvaluationCaseRecordI, VectorMarkedJobCaseListI, VectorMarkParamsI
} from './types'

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
    diff_res_filter?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: VectorJobListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v3/job/enlargeMap', 'GET', params)
}

// 评测任务分发
export const deliveryJob = async (
  task_id: string,
  params: {
    pa_name: string[]
    num: number
    blind: boolean
    type: number
    comment?: string
  }
) => {
  const res = await request(`/v3/job/enlargeMap/${task_id}/distribution`, 'POST', params, true)
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

// 获取分发状态详情
export const getDeliveryDetail = async (task_id: number): Promise<null | {
  total_num: number
  mark_dispatch_num: number
  marked_num: number
  verify_dispatch_num: number
  verified_num: number
  mark_person: Array<{
    dis_id: number
    person: string
    total_count: number
    complete_count: number
    type: number
  }>
  verify_person: Array<{
    dis_id: number
    person: string
    total_count: number
    complete_count: number
    type: number
  }>
}> => {
  return request(`/v3/job/enlargeMap/${task_id}/detail`, 'GET')
}

// 收回
export const recallDelivery = async (task_id: number, params: { dis_id: number, type: number }) => {
  const res = await request(`/v3/job/enlargeMap/${task_id}/recall`, 'POST', params, true)
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
    id?: number
    enlarge_map_diff_record_id?: number
    better_version?: number
    should_recall?: number
    tag?: number
    show_range?: number
    road_issue?: number[]
    arrow_issue?: number[]
    other_issue?: number[]
    beauty?: number
    beauty_road_issue?: number[]
    beauty_arrow_issue?: number[]
  }
): Promise<null | {
  cur_page_num: number
  data_list: VectorMarkedJobCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  const data: null | {
    cur_page_num: number
    data_list: VectorMarkedJobCaseListI[]
    has_next: boolean
    has_prev: boolean
    num_per_page: number
    pages: number
    total_num: number
  } = await request(`/v3/mark/enlargeMap`, 'GET', {
    job_id,
    ...params
  })
  return data
}

// 统计
export const getStatistic = async (task_id: number): Promise<null | {
  marked: number // 标注总数
  valid: number // 验证总数
  version_a: number // 新版本好
  version_b: number // 旧版本好
  version_all_good: number // 两方都好
  version_all_bad: number // 两方都不好
  recall: number // 召回
  un_recall: number // 不召回
  accurate: number // 准确
  inaccurate: number // 不准确
  beautiful: number // 美观
  ugly: number // 不美观
  show_range_small: number // 展示范围小
  show_range_big: number // 展示范围大
  road_missing: number // 道路缺失
  road_break: number // 道路断裂
  road_redundancy: number // 道路冗余
  road_error: number // 道路错误
  road_overlapping: number // 道路重叠
  road_angle: number // 道路角度
  road_crossing: number // 道路交叉
  arrow_angle: number // 角度不垂直
  arrow_direction: number // 方向错误
  arrow_position: number // 位置错误
  arrow_turning_point: number // 转折点错误
  arrow_bending: number // 严重弯折
  arrow_over_range: number // 超出范围
  other_traffic_flow: number // 车流方向
  other_barrier: number // 隔离带比例失调
  beauty_scale: number // 比例失调
  beauty_redundancy: number // 冗余
  beauty_sign_err: number // 标识异常
  beauty_cross_link_err: number // 交叉点link异常
  beauty_arrow_short: number // 箭头过短
  beauty_arrow_rough: number // 箭头不平滑
  beauty_arrow_crossing: number // 箭头交叉
  beauty_issue_num: number[] // 美观问题个数占比序列（按顺序第一个元素值代表1个的数量，第二个元素值2个的数量）
}> => {
  return request(`/v3/statistic/gsb/enlargeMap/${task_id}`, 'GET')
}

// 结束
export const stopJob = async (task_id: string) => {
  const res = await request(`/v3/job/enlargeMap/${task_id}/stop`, 'POST', {}, true)
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
    mark_job_id?: number
    city_filter?: string
    job_name?: string
    diff_res_filter?: string
    dispatch_type: number
    blind?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: VectorEvaluationListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v3/pa_job/enlargeMap', 'GET', params)
}

// 评测标注case列表
export const getPaJobCaseList = async (
  task_id: number,
  params: {
    page: number
    per_page: number
    marked: number,
    order_col?: string
    desc?: number
    enlarge_map_diff_record_id?: number // 页面的caseID筛选
    status: number // 0-待评测 1-已完成 2-被驳回
    tag?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: VectorEvaluationCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}>  => {
  const data: null | {
    cur_page_num: number
    data_list: VectorEvaluationCaseListI[]
    has_next: boolean
    has_prev: boolean
    num_per_page: number
    pages: number
    total_num: number
  } = await request(`/v3/pa_job/enlargeMap/${task_id}`, 'GET', params)
  return data
}

// 标注
export const markJob = async (
  id: number,
  job_id: number,
  params: VectorMarkParamsI
): Promise<{ isDone: boolean; msg: string }>  => {
  const res = await request('/v3/mark/enlargeMap', 'POST', {
    id,
    job_id,
    ...params
  }, true)
  if (res) {
    const { code, msg } = res
    return {
      isDone: !code,
      msg
    }
  } else {
    return {
      isDone: false,
      msg: '请求失败'
    }
  }
}

// 质检通过|驳回
export const acceptOrRejectTask = async (
  id: number,
  job_id: number,
  accepted: boolean,
  params: VectorMarkParamsI
): Promise<{ isDone: boolean; msg: string }> => {
  const method = accepted ? 'accept' : 'reject'
  const res = await request(`/v3/verify/enlargeMap/${method}`, 'POST', {
    id,
    job_id,
    ...params
  }, true)
  if (res) {
    const { code, msg } = res
    return {
      isDone: !code,
      msg
    }
  } else {
    return {
      isDone: false,
      msg: '请求失败'
    }
  }
}

// 标注记录
export const getMarkRecord = async (task_id: number): Promise<null | {
  history: null | VectorEvaluationCaseRecordI[]
  mark_records: string
  verify_records: string
}> => {
  return request(`/v3/mark/enlargeMap/${task_id}/history`, 'GET')
}

// 上传标注图片
export const uploadCDN = async (formData: FormData): Promise<{ code: number, data: string, msg: string }> => {
  try {
    // formData需要包含
    // filename
    // file
    // content?
    const res = await fetch(`${baseUrl}/v3/cdn/upload`, {
      body: formData,
      method: 'POST'
    })
    const result = await res.json()
    const { code, msg, data } = result
    return {
      code,
      data,
      msg
    }
  } catch (error) {
    return {
      code: 1,
      data: '',
      msg: '请求失败'
    }
  }
}
