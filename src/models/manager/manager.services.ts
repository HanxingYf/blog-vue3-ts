import request from '@/utils/request'
import {
  ManagerContentOrTickOrCodeDiffNormalListI, ManagerContentNormalMarkedListI, ManagerTickNormalMarkedListI,
  EvaluationContentOrTickOrCodeDiffListI, EvaluationContentDetailListI, EvaluationTickDetailListI, EvaluationContentRecordI,
  EvaluationTickRecordI,
  ManagerCodeDiffNormalMarkedListI,
  EvaluationCodeDiffDetailListI,
  EvaluationCodeDiffRecordI,
  EvaluationContentAndTickfDetailListI,
  EvaluationContentAndTickListI,
  EvaluationContentAndTickDetailListI,
  EvaluationContentAndTickRecordI,
  ManagerContentAndTickNormalMarkedListI
} from './manager.types'

const mapType: { [propName: string]: string } = {
  'content': '',
  'tick': 'voice/',
  'codediff': 'self/',
  'contentAndTick': 'jenkins/'
}

/**
 * 获取内容常规任务列表
 * @param params
 */
export const getManagerContentNormalList = async (params: {
  page: number
  per_page: number
  id?: string
  diff_res_filter?: string
  city_filter?: string
  job_name?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  jobs: ManagerContentOrTickOrCodeDiffNormalListI[]
} | null> => request('/v1/job', 'GET', params)

/**
 * 获取时机常规任务列表
 * @param params
 */
export const getManagerTickNormalList = async (params: {
  page: number
  per_page: number
  id?: string
  diff_res_filter?: string
  city_filter?: string
  job_name?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ManagerContentOrTickOrCodeDiffNormalListI[]
} | null> => request('/v2/job/voice', 'GET', params)

/**
 * 获取自身CodeDiff常规任务列表
 * @param params
 */
export const getManagerCodeDiffNormalList = async (params: {
  page: number
  per_page: number
  id?: string
  diff_res_filter?: string
  city_filter?: string
  job_name?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ManagerContentOrTickOrCodeDiffNormalListI[]
} | null> => request('/v2/job/self', 'GET', params)

/**
 * 获取内容常规任务 - 已标注列表
 * @param params
 */
export const getManagerContentNormalMarkedList = async (params: {
  user?: string // test
  job_id: number // 191
  marked: number // 1
  page: number // 1
  per_page: number // 10
  code_diff_record_id?: string // '12'
  tag?: string // 0,1
  path_consis?: number
  expect_action?: string // 10_38_6_11_12_12_81
  assist1?: number // 10
  assist2?: number // 10
  issue_type?: number // 1
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  mark_jobs: ManagerContentNormalMarkedListI[]
} | null> => request('/v1/mark', 'GET', params)

/**
 * 获取时机常规任务 - 已标注列表
 * @param params
 */
export const getManagerTickNormalMarkedList = async (params: {
  page: number
  per_page: number
  job_id: number
  marked: number
  tag?: number
  issue_type?: number
  issue_sub_type?: number
  voice_diff_record_id?: number
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ManagerTickNormalMarkedListI[]
} | null> => request('/v2/mark/voice', 'GET', params)

/**
 * 获取自身codediff常规任务 - 已标注列表
 * @param params
 */
export const getManagerCodeDiffNormalMarkedList = async (params: {
  page: number
  per_page: number
  job_id: number
  marked: number
  user?: string
  tag?: number // GSB
  self_diff_record_id?: number
  err_level?: number // 错误等级
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ManagerCodeDiffNormalMarkedListI[]
} | null> => request('/v2/mark/self', 'GET', params)

/**
 * 分发 内容|codediff|时机任务
 * @param id
 * @param task_type
 * @param params
 */
export const deliveryTask = async (
  id: string,
  task_type: 'content' | 'tick' | 'codediff',
  params: {
    pa_name: string[]
    type: number // 评测 | 质检
    num: number
    tag?: number[]
    blind?: boolean // 是否盲评
  }
): Promise<{ deliveried: boolean, msg: string }> => {
  const v$ = task_type === 'content' ? 'v1' : 'v2'
  const res = await request(`/${v$}/job/${mapType[task_type]}${id}/distribution`, 'POST', params, true)
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

/**
 * 分发详情 内容|codediff|时机 任务
 * @param id
 * @param type
 */
export const getDeliveryDetail = async (id: number, type: 'content' | 'tick' | 'codediff'): Promise<{
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
} | null> => {
  const v$ = type === 'content' ? 'v1' : 'v2'
  return request(`/${v$}/job/${mapType[type]}${id}/detail`, 'GET')
}

/**
 * 内容|codediff|时机任务列表 收回
 * @param id
 * @param task_type
 * @param params
 */
export const recallDelivery = async (
  id: number,
  task_type: 'content' | 'tick' | 'codediff',
  params: { dis_id: number; type: number }
): Promise<{ recalled: boolean; msg: string }> => {
  const v$ = task_type === 'content' ? 'v1' : 'v2'
  const url = `/${v$}/job/${mapType[task_type]}${id}/recall`
  const res = await request(url, 'POST', params, true)
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

/**
 * 内容|codediff|时机任务列表 结束
 * @param id
 * @param task_type
 * @param params
 */
export const finishTask = async (
  id: number,
  task_type: 'content' | 'tick' | 'codediff',
  params: { jobid: number }
): Promise<{ finished: boolean; msg: string }> => {
  const v$ = task_type === 'content' ? 'v1' : 'v2'
  const url = `/${v$}/job/${mapType[task_type]}${id}/stop`
  const res = await request(url, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      finished: !code,
      msg
    }
  } else {
    return {
      finished: false,
      msg: '请求失败'
    }
  }
}

/**
 * 内容任务评测列表
 * @param params
 */
export const getEvaluationContentList = async (params: {
  page: number
  per_page: number
  type?: number
  id?: number
  blind_test?: boolean
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  pa_jobs: EvaluationContentOrTickOrCodeDiffListI[]
} | null> => request(`/v1/pa_job`, 'GET', params)

/**
 * 时机任务评测列表
 * @param params
 */
export const getEvaluationTickList = async (params: {
  page: number
  per_page: number
  dispatch_type?: number
  id?: number
  job_name?: string
  city_filter?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationContentOrTickOrCodeDiffListI[]
} | null> => request(`/v2/pa_job/voice`, 'GET', params)

/**
 * codediff任务评测列表
 * @param params
 */
export const getEvaluationCodeDiffList = async (params: {
  page: number
  per_page: number
  dispatch_type?: number
  id?: number
  mark_job_id?: number
  job_name?: string
  city_filter?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationContentOrTickOrCodeDiffListI[]
} | null> => request(`/v2/pa_job/self`, 'GET', params)

/**
 * 内容任务评测列表 详情
 * @param id
 * @param params
 */
export const getEvaluationContentDetailList = async (
  id: number,
  params: {
    page: number
    per_page: number
    status: number
  }
): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  mark_jobs: EvaluationContentDetailListI[]
} | null> => request(`/v1/pa_job/${id}`, 'GET', params)

/**
 * 时机任务评测列表 详情
 * @param id
 * @param params
 */
export const getEvaluationTickDetailList = async (
  id: number,
  params: {
    page: number
    per_page: number
    status: number
    voice_diff_record_id?: number
  }
): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationTickDetailListI[]
} | null> => request(`/v2/pa_job/voice/${id}`, 'GET', params)

/**
 * codeDiff任务评测列表 详情
 * @param id
 * @param params
 */
export const getEvaluationCodeDiffDetailList = async (
  id: number,
  params: {
    page: number
    per_page: number
    status: number
    self_diff_record_id?: number
    tag?: string
    err_level?: string
  }
): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationCodeDiffDetailListI[]
} | null> => request(`/v2/pa_job/self/${id}`, 'GET', params)


/**
 * 标注 内容|codediff|时机任务
 * @param task_type
 * @param params
 */
export const evaluationTask = async (
  id: number,
  job_id: number,
  task_type: 'content' | 'tick' | 'codediff',
  params: { [propName: string]: any }
): Promise<{ isDone: boolean; msg: string }> => {
  const v$ = task_type === 'content' ? 'v1' : 'v2'
  let url = `/${v$}/mark/${mapType[task_type]}`
  url = url.slice(-1) === '/' ? url.slice(0, -1) : url
  const res = await request(url, 'POST', {
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
 * 内容|codediff|时机任务 评测记录
 * @param id
 * @param task_type
 */
export const getEvaluationRecord = async (id: number, task_type: 'content' | 'tick' | 'codediff' | 'contentAndTick'): Promise<{
  history: EvaluationContentRecordI[] | EvaluationTickRecordI[] | EvaluationCodeDiffRecordI[] | null
  mark_records: string // 0-test-2020-02-21 09:48:43-直行-1-无-无↵
  verify_records: string
} | null> => {
  let v$ = task_type === 'content' ? 'v1' : 'v2'
  if (task_type === 'contentAndTick') {
    v$ = 'v3'
  }
  return request(`/${v$}/mark/${mapType[task_type]}${id}/history`, 'GET')
}

/**
 * 质检通过|驳回 内容|codediff|时机任务
 * @param task_type
 * @param params
 */
export const acceptOrRejectTask = async (
  id: number,
  job_id: number,
  task_type: 'content' | 'tick' | 'codediff',
  accepted: boolean,
  params: { [propName: string]: any }
): Promise<{ isDone: boolean; msg: string }> => {
  const method = accepted ? 'accept' : 'reject'
  const v$ = task_type === 'content' ? 'v1' : 'v2'
  const res = await request(`/${v$}/verify/${mapType[task_type]}${method}`, 'POST', {
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
 * 评测统计 内容任务
 * @param id
 */
export const getContentTaskStatistics = async (id: number): Promise<{
  marked: number
  valid: number
  good: number
  same: number
  bad: number
  bad_strategy: number
  bad_road_net: number
  bad_unknown: number
  same_good: number
  same_bad: number
  other: number
} | null> => request(`/v2/statistic/gsb/code/${id}`, 'GET')

/**
 * 评测统计 时机任务
 * @param id
 */
export const getTickTaskStatistics = async (id: number): Promise<{
  marked: number
  valid: number
  suitable: number
  unsuitable: number
  early_issue: {
    issue_road_net: number
    issue_strategy: number
    issue_tool: number
    issue_gps: number
    issue_crossing: number
    issuse_unknown: number
    [propName: string]: number
  }
  late_issue: {
    issue_road_net: number
    issue_strategy: number
    issue_tool: number
    issue_gps: number
    issue_crossing: number
    issuse_unknown: number
    [propName: string]: number
  }
  unknown: number
} | null> => request(`/v2/statistic/gsb/voice/${id}`, 'GET')

/**
 * 评测统计 codediff任务
 * @param id
 */
export const getCodeDiffTaskStatistics = async (id: number): Promise<{
  marked: number
  valid: number
  good_num: number
  same_num: number
  bad_num: number
  p0_num: number
  p1_num: number
  p2_num: number
  unknown: number
} | null> => request(`/v2/statistic/gsb/self/${id}`, 'GET')

/**
 * 评测管理 内容和时机任务
 * @param params
 */
export const getManagerContentAndTickNormalList = async (params: {
  page: number
  per_page: number
  desc?: boolean
  job_name?: string
  id?: number
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationContentAndTickfDetailListI[]
} | null> => request(`/v3/job/jenkins`, 'GET', params)

/**
 * 评测管理 分发评测任务
 * @param id
 * @param params
 */
export const deliveryContentAndTask = async (id: string, params: {
  pa_name: string[]
  type: number // 评测1 | 质检2
  num: number
  comment?: string // 分发备注
  blind?: boolean // 是否盲评
}): Promise<{ deliveried: boolean, msg: string }> => {
  const res = await request(`/v3/job/jenkins/${id}/distribution`, 'POST', params, true)
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

/**
 * 评测管理 获取任务分发详情
 * @param id
 */
export const getDeliveryContentAndTickDetail = async (id: number): Promise<{
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
    block_id: string
    type: number
  }>
  verify_person: Array<{
    dis_id: number
    person: string
    total_count: number
    complete_count: number
    block_id: string
    type: number
  }>
  Block_disp_num: number
  block_num: number
} | null> => request(`/v3/job/jenkins/${id}/detail`, 'GET')

/**
 * 内容和时机任务列表 收回
 * @param id
 */
export const recallContentAndDelivery = async (
  id: number,
  params: { dis_id: number; type: number }
): Promise<{ recalled: boolean; msg: string }> => {
  const res = await request(`/v3/job/jenkins/${id}/recall`, 'POST', params, true)
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

/**
 * 内容和时机任务列表 结束
 * @param id
 */
export const finishContentAndTickTask = async (
  id: number,
  // params: { jobid: number }
): Promise<{ finished: boolean; msg: string }> => {
  const res = await request(`/v3/job/jenkins/${id}/stop`, 'POST', {}, true)
  const { code, msg } = res
  if (res) {
    return {
      finished: true,
      msg
    }
  } else {
    return {
      finished: false,
      msg: '请求失败'
    }
  }
}

/**
 * 内容和时机任务评测列表
 * @param params
 */
export const getEvaluationContentAndTickList = async (params: {
  page: number
  per_page: number
  dispatch_type?: number
  id?: number
  mark_job_id?: number
  job_name?: string
  blind?: string
  create_time?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationContentAndTickListI[]
} | null> => request(`/v3/pa_job/jenkins`, 'GET', params)

/**
 * 内容和时机任务评测列表 详情
 * @param id
 * @param params
 */
export const getEvaluationContentAndTickDetailList = async (
  id: number,
  params: {
    page: number
    per_page: number
    status?: number
    marked?: number
    jenkins_diff_record_id?: number
  }
): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: EvaluationContentAndTickDetailListI[]
} | null> => request(`/v3/pa_job/jenkins/${id}`, 'GET', params)

/**
 * 内容和时机任务 评测记录
 * @param id
 */
export const getEvaluationContentAndTickRecord = async (id: number): Promise<{
  history: EvaluationContentAndTickRecordI[] | null
  mark_records: string // 0-test-2020-02-21 09:48:43-直行-1-无-无↵
  verify_records: string
} | null> => {
  return request(`/v3/mark/jenkins/${id}/history`, 'GET')
}

/**
 * 获取内容和时机常规任务 - 已标注列表
 * @param params
 */
export const getManagerContentAndTickNormalMarkedList = async (params: {
  page: number
  per_page: number
  desc?: boolean
  job_id?: number
  marked?: number
  id?: number,
  content_tag?: number
  pos_err_typecontent_err_type?: string
  content_err_reason?: string
  pos_tag?: number
  pos_err_type?: string
  pos_err_reason?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ManagerContentAndTickNormalMarkedListI[]
} | null> => request('/v3/mark/jenkins', 'GET', params)

/**
 * 评测统计 时机任务
 * @param id
 */
export const getContentAndTickTaskStatistics = async (id: number): Promise<{
  marked: number,
  valid: number,
  version_a: number,
  version_b: number,
  same_good: number,
  SameBad: number,
  pos_early: number,
  pos_late: number,
  pos_right: number,
  unknown: number
} | null> => request(`/v3/statistic/gsb/jenkins/${id}`, 'GET')

/**
 * 标注 内容和时机任务
 * @param task_type
 * @param params
 */
export const evaluationContentAndTickTask = async (
  id: number,
  job_id: number,
  params?: { [propName: string]: any }
): Promise<{ isDone: boolean; msg: string }> => {
  const res = await request('/v3/mark/jenkins', 'POST', {
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
 * 质检通过|驳回 内容|codediff|时机任务
 * @param task_type
 * @param params
 */
export const acceptOrRejectContentAndTickTask = async (
  id: number,
  job_id: number,
  accepted: boolean,
  params?: { [propName: string]: any }
): Promise<{ isDone: boolean; msg: string }> => {
  const method = accepted ? 'accept' : 'reject'
  const res = await request(`/v3/verify/jenkins/${method}`, 'POST', {
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
