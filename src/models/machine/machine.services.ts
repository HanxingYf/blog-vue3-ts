import request from '@/utils/request'
import {
  ContentAndHotCodeTaskRunningListResI, TickTaskRunningListResI,
  ContentAndHotCodeTaskDetailListResI, CodeDiffTaskRunningListResI,
  TickTaskDetailListResI, CodeDiffTaskDetailListResI, ContentAndTickTaskRunningListResI, ContentAndTickTaskDetailResI
} from './machine.types'

// ---------- 播报内容与高热code任务 ----------
/**
 * 创建播报内容任务
 * @param params
 */
export const createContentTask = async (params: {
  city_id: number[]
  code_num: number
  ng: string
  task_tag: string
  max_wei: number
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v1/task', 'POST', params, true)
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
/**
 * 创建高热code任务(导入)
 * @param params
 */
export const importHotCodeTask = async (params: {
  map_version: string
  city_code: number[]
  task_tag: string
}): Promise<{ imported: boolean, msg: string }> => {
  const res = await request(`/v1/hotcode/import`, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      imported: !code,
      msg
    }
  } else {
    return {
      imported: false,
      msg: '请求失败'
    }
  }
}
/**
 * 获取播报内容运行中|已完成的任务
 * @param params
 */
export const getContentTasks = async (params: { proc?: string }): Promise<{
  codeDiffTasks: ContentAndHotCodeTaskRunningListResI[]
  count: number
  msg: string
  ret: number
} | null> => request(`/v1/task`, 'GET', params)
/**
 * 删除播报内容和高热code任务
 * @param id
 */
export const deleteContentAndHotCodeTask = async (id: string): Promise<{
  deleted: boolean
  msg: string
}> => {
  const res = await request(`/v1/task/${id}`, 'DELETE', {}, true)
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
/**
 * 下发播报内容和高热code任务
 * @param params
 */
export const distributeContentAndHotCodeTask = async (params: {
  task_id: number
  city: number[] // [1]
  job_name: string // "yyyy"
  tag: string[] // ["action_voice_miss"]
  custom_filter: string // "{"hot >":200}"
  code: string[] // ["直行系列"]
  content: string // "wewe"
  num: number // 1
  desc: string // "sd"
  to_user: string // "test"
  filter_type: number // 1
  dead_line: string // "2020-04-14 10:54:29"
  marked_filter: boolean
}): Promise<{ distributed: boolean, msg: string }> => {
  const res = await request(`/v1/job`, 'POST', params, true)
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
/**
 * 获取播报内容和高热code任务详情
 * @param params
 */
export const getContentAndHotCodeTaskDetail = async (params: {
  id?: number
  page: number
  per_page: number
  tag?: string
  code_family?: string
  rival_code?: number
  didi_code?: number
  custom_filter?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  code_diff_records: ContentAndHotCodeTaskDetailListResI[]
} | null> => {
  const { id } = params
  delete params.id
  return request(`/v1/task/${id}`, 'GET', params)
}
/**
 * 获取高热code导入的筛选项--路网版本
 */
export const getRoadNetMapVersions = async (): Promise<string[]> => {
  const res = await request(`/v1/hotcode/map_version`, 'GET')
  return res || []
}
/**
 * 保存高级筛选规则
 * @param params
 */
export const saveHighFilterRule = async (
  type: 'code' | 'self' | 'lane' | 'enlargeMap',
  params: {
    name: string
    regulation: string
  },
  version = 'v2'
): Promise<{ saved: boolean, msg: string }> => {
  const res = await request(`/${version}/regulation/${type}`, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      saved: !code,
      msg
    }
  } else {
    return {
      saved: false,
      msg: '请求失败'
    }
  }
}
/**
 * 获取高级筛选规则列表
 * @param params
 */
export const getHighFilterRules = async (
  type: 'code' | 'self' | 'lane' | 'enlargeMap',
  params: {
    name?: string
    id?: number
  },
  version = 'v2'
): Promise<Array<{ id: number; name: string; regulation: string }>> => {
  const res = await request(`/${version}/regulation/${type}`, 'GET', params)
  return res || []
}
/**
 * 删除高级筛选规则列表
 * @param id
 */
export const delHighFilterRules = async (id: number, version = 'v2'): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/${version}/regulation/${id}`, 'DELETE', {}, true)
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
// --------------------------------


// ---------- 播报时机任务 ----------
/**
 * 创建播报时机任务
 * @param params
 */
export const createTickTask = async (params: {
  city_id: number[]
  ng: string
  task_tag: string
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v2/task/voice', 'POST', params, true)
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
/**
 * 获取播报时机运行中|已完成的任务
 * @param params
 */
export const getTickTasks = async (params: {
  page: number
  per_page: number
  progress: string
  city_filter?: string
  creator_filter?: string
  task_tag_filter?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: TickTaskRunningListResI[]
} | null> => request('/v2/task/voice', 'GET', params)
/**
 * 删除播报时机任务
 * @param id
 */
export const deleteTickTask = async (id: string): Promise<{
  deleted: boolean
  msg: string
}> => {
  const res = await request(`/v2/task/voice/${id}`, 'DELETE', {}, true)
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
/**
 * 获得播报时机任务详情
 * @param params
 */
export const getTickTaskDetail = async (params: {
  task_id?: number
  page: number
  per_page: number
  order_col: string
  desc: boolean
  id?: number
  hot?: number
  code_dis_min?: number
  code_dis_max?: number
  didi_surplus_min?: number
  didi_surplus_max?: number
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: TickTaskDetailListResI[]
} | null> => {
  const { task_id } = params
  delete params.task_id
  return await request(`/v2/task/voice/${task_id}`, 'GET', params)
}
/**
 * 下发播报时机任务
 * @param params
 */
export const distributeTickTask = async (params: {
  task_id: number
  city: number[] // [6]
  job_name: string // "sd"
  code: string[] // ["三岔系列"]
  dis_include: boolean
  dis_scope: number[]
  num: number
  desc: string // "sd"
  to_user: string // "test"
  dead_line: string // "2020-04-14 10:54:30"
}): Promise<{ distributed: boolean, msg: string }> => {
  const res = await request(`/v2/job/voice`, 'POST', params, true)
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
/**
 * 获取下发表单中，筛选之后剩余数量
 * @param params
 */
export const getDistributeTickFilterCount = async (params: {
  task_id: number
  cities: number[]
  dis_include: boolean
  dis_scope: number[]
}): Promise<number> => {
  const res = await request(`/v2/count/record/voice`, 'GET', {
    ...params,
    cities: params.cities.join(','),
    dis_scope: params.dis_scope.join(',')
  })
  return res ? res.count : 1
}

// --------------------------------


// ---------- 自身codediff任务 ----------
/**
 * 创建自身codediff任务
 * @param params
 */
export const createCodeDiffTask = async (params: {
  // cities: number[]
  map_version: string
  data_version: string
  task_name: string
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v2/task/self', 'POST', params, true)
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
/**
 * 获取自身codediff运行中|已完成的任务
 * @param params
 */
export const getCodeDiffTasks = async (params: {
  page: number
  per_page: number
  progress: 'Running' | 'Completed'
  id?: string
  city?: string
  creator?: string
  task_name?: string
  data_version?: string
  map_version?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: CodeDiffTaskRunningListResI[]
} | null> => request('/v2/task/self', 'GET', params)
/**
 * 获得自身codediff任务详情
 * @param params
 */
export const getCodeDiffTaskDetail = async (task_id: number, params: {
  page: number
  per_page: number
  id?: number
  city?: number
  diff_type?: number
  inlink_level?: number
  outlink_level?: number
  final_assi_code?: string // 新版本辅助动作模糊筛选
  final_code?: number // 新版本动作筛选
  ori_code?: number // 线上版本code筛选
  ori_assi_code?: string // 线上版本模糊筛选
  link_list?: string // link 序列模糊筛选）
  custom_filter?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: CodeDiffTaskDetailListResI[] | null
} | null> => {
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      // @ts-ignore
      if (params[key] === '') {
        // @ts-ignore
        delete params[key]
      }
    }
  }
  return await request(`/v2/task/self/${task_id}`, 'GET', params)
}
/**
 * 删除自身codediff任务
 * @param id
 */
export const deleteCodeDiffTask = async (id: string): Promise<{
  deleted: boolean
  msg: string
}> => {
  const res = await request(`/v2/task/self/${id}`, 'DELETE', {}, true)
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
/**
 * 下发自身codeDiff任务
 * @param params
 */
export const distributeCodeDiffTask = async (params: {
  task_id: number
  city: number[] // [6]
  job_name: string // "sd"
  diff_type: string[]
  custom_filter?: string
  num: number
  desc: string // "sd"
  to_user: string // "test"
  dead_line: string // "2020-04-14 10:54:30"
}): Promise<{ distributed: boolean, msg: string }> => {
  const res = await request(`/v2/job/self`, 'POST', params, true)
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
// --------------------------------


// ---------- 播报内容和时机 ----------
/**
 * 创建自身播报内容和时机任务
 * @param params
 */
export const createContentAndTickTask = async (params: {
  task_name: string,
  creator: string,
  num: number,
  jenkins_url: string,
  original_host: string,
  new_host: string
  city_id?: number[]
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v3/task/jenkins', 'POST', params, true)
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
/**
 * 获取任务列表
 * @param params
 */
export const getContentAndTickTask = async (params: {
  page: number,
  per_page: number,
  progress?: 'Running' | 'Completed'
  order_col?: string,
  desc?: boolean,
  id?: number,
  creator?: string,
  task_name?: string,
  create_time?: string,
  city?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ContentAndTickTaskRunningListResI[]
} | null> => request('/v3/task/jenkins', 'GET', params)
/**
 * 获得自身播报内容和时机任务详情
 * @param params
 */
export const getContentAndTickTaskDetail = async (task_id: number, params: {
  page: number
  per_page: number
  order_col?: string  // 排序字段
  desc?: boolean  // 是否降序
  id?: number // 筛选id
  start_pos?: string  // 筛选起始点
  end_pos?: string  // 筛选终止点
  custom_filter?: string  // 高级筛选,
  new_tts?: string,
  original_tts?: string,
  case_id?: string
}): Promise<{
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  data_list: ContentAndTickTaskDetailResI[] | null
} | null> => {
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      // @ts-ignore
      if (params[key] === '') {
        // @ts-ignore
        delete params[key]
      }
    }
  }
  return await request(`/v3/task/jenkins/${task_id}`, 'GET', params)
}
/**
 * 删除自身播报内容和时机任务
 * @param id
 */
export const deleteContentAndTickTask = async (id: string): Promise<{
  deleted: boolean
  msg: string
}> => {
  const res = await request(`/v3/task/jenkins/${id}`, 'DELETE', {}, true)
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
/**
 * 下发播报内容和时机任务
 * @param id
 */
export const distributeContentAndTickTask = async (params: {
  task_id: number
  job_name: string
  num: number
  marked_filter?: boolean
  custom_filter?: string
  desc: string
  to_user: string
  dead_line: string // "2020-04-14 10:54:30"
  info?: string,
}): Promise<{ distributed: boolean, msg: string }> => {
  const res = await request(`/v3/job/jenkins`, 'POST', params, true)
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
