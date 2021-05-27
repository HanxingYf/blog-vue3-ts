import request from '@/utils/request'
import { LanelineJobListI, LanelineEvaluationListI, LanelineEvaluationCaseListI, LanelineEvaluationCaseRecordI, LanelineMarkedJobCaseListI } from './types'

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
  data_list: LanelineJobListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/job/lane', 'GET', params)
}

// 评测任务分发
export const deliveryJob = async (
  task_id: string,
  params: {
    pa_name: string[]
    num: number
    type: number
  }
) => {
  const res = await request(`/v2/job/lane/${task_id}/distribution`, 'POST', params, true)
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
  return request(`/v2/job/lane/${task_id}/detail`, 'GET')
}

// 收回
export const recallDelivery = async (task_id: number, params: { dis_id: number, type: number }) => {
  const res = await request(`/v2/job/lane/${task_id}/recall`, 'POST', params, true)
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
    lane_diff_record_id?: string
    path_consis?: string
    tag?: number[]
    lane_issue_type?: number[]
    display_tag?: number[]
  }
): Promise<null | {
  cur_page_num: number
  data_list: LanelineMarkedJobCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  const data: null | {
    cur_page_num: number
    data_list: LanelineMarkedJobCaseListI[]
    has_next: boolean
    has_prev: boolean
    num_per_page: number
    pages: number
    total_num: number
  } = await request(`/v2/mark/lane`, 'GET', {
    job_id,
    ...params,
    tag: (params.tag || []).join(','),
    path_consis: params.path_consis,
    lane_issue_type: (params.lane_issue_type || []).join(','),
    display_tag: (params.display_tag || []).join(',')
  })
  return data && {
    ...data,
    data_list: (data.data_list || []).map((d) => {
      return {
        ...d,
        didi_show: `${ d.didi_front_arrow || '-' } / ${ d.didi_background || '-' } | ${ d.didi_property || '-' }`,
        rival_show: `${ d.rival_front_arrow || '-' } / ${ d.rival_background || '-' } | ${ d.rival_property || '-' }`,
        didi_range: `${ d.didi_start_point || '-' };${ d.didi_disappear_point || '-' }`,
        rival_range: `${ d.rival_start_point || '-' };${ d.rival_disappear_point || '-' }`,
      }
    })
  }
}

// 统计
export const getStatistic = async (task_id: number): Promise<null | {
  bad: number
  dis_unknow: number
  end_early: number
  end_late: number
  good: number
  issue_arrow_num: number
  issue_back_num: number
  issue_front_num: number
  issue_other_num: number
  marked: number
  no_didi_record: number
  dis_no_didi_record: number
  same_bad: number
  same_good: number
  start_early: number
  start_late: number
  suitable: number
  unknown: number
  valid: number
}> => {
  return request(`/v2/statistic/gsb/lane/${task_id}`, 'GET')
}

// 结束
export const stopJob = async (task_id: string) => {
  const res = await request(`/v2/job/lane/${task_id}/stop`, 'POST', {}, true)
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
    dispatch_type: number
  }
): Promise<null | {
  cur_page_num: number
  data_list: LanelineEvaluationListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/pa_job/lane', 'GET', params)
}

// 评测标注case列表
export const getPaJobCaseList = async (
  task_id: number,
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
    lane_diff_record_id?: number // 页面的caseID筛选
    status: number // 0-待评测 1-已完成 2-被驳回
    tag?: string // GSB tag 对于config内的lane_content_tag)
  }
): Promise<null | {
  cur_page_num: number
  data_list: LanelineEvaluationCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}>  => {
  const data: null | {
    cur_page_num: number
    data_list: LanelineEvaluationCaseListI[]
    has_next: boolean
    has_prev: boolean
    num_per_page: number
    pages: number
    total_num: number
  } = await request(`/v2/pa_job/lane/${task_id}`, 'GET', params)
  return data && {
    ...data,
    data_list: (data.data_list || []).map((d) => {
      return {
        ...d,
        didi_show: `${ d.didi_front_arrow || '-' } / ${ d.didi_background || '-' } | ${ d.didi_property || '-' }`,
        rival_show: `${ d.rival_front_arrow || '-' } / ${ d.rival_background || '-' } | ${ d.rival_property || '-' }`,
        didi_range: `${ d.didi_start_point || '-' };${ d.didi_disappear_point || '-' }`,
        rival_range: `${ d.rival_start_point || '-' };${ d.rival_disappear_point || '-' }`,
      }
    })
  }
}

// 标注
export const markJob = async (
  id: number,
  job_id: number,
  params: { [propName: string]: string | number }
  //   path_consis: string
  //   tag: string // 内容评价结论 config的content_lane_tag
  //   display_tag: string // 时机评价结论 对应config的display_lane_tag
  //   lane_issue_type: string // 内容问题类型 config的lane_issue_type
  //   custom_mark: string
  // }
): Promise<{ isDone: boolean; msg: string }>  => {
  const res = await request('/v2/mark/lane', 'POST', {
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

/**
 * 质检通过|驳回
 * @param task_type
 * @param params
 */
export const acceptOrRejectTask = async (
  id: number,
  job_id: number,
  accepted: boolean,
  params: { [propName: string]: string | number }
    // path_consis: string
    // tag: string // 内容评价结论 config的content_lane_tag
    // display_tag: string // 时机评价结论 对应config的display_lane_tag
    // lane_issue_type: string // 内容问题类型 config的lane_issue_type
    // custom_mark: string
  // }
): Promise<{ isDone: boolean; msg: string }> => {
  const method = accepted ? 'accept' : 'reject'
  const res = await request(`/v2/verify/lane/${method}`, 'POST', {
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
  history: null | LanelineEvaluationCaseRecordI[]
  mark_records: string
  verify_records: string
}> => {
  return request(`/v2/mark/lane/${task_id}/history`, 'GET')
}

