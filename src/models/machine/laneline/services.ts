import request from '@/utils/request'
import { TaskListI, TaskCaseListI } from './types'

// 创建任务
export const createTask = async (params: {
  city_list: number[]
  creator: string
  num: number
  task_name: string
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v2/task/lane', 'POST', {
    ...params,
    city_list: params.city_list.join(',')
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

// 获取任务列表：运行中/已完成
export const getTasksByStatus = async (
  progress: 'Running' | 'Completed',
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: boolean
    id?: number
    city_name?: string
    creator?: string
    task_name?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: TaskListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v2/task/lane', 'GET', { ...params, progress })
}

// 删除任务
export const deleteTask = async (id: number): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/v2/task/lane/${id}`, 'DELETE', {}, true)
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

// 获取任务详情
export const getTaskDetail = async (task_id: string, params: {
  page: number
  per_page: number
  order_col?: string
  desc?: boolean
  id?: number
  diff_type?: string
  custom_filter?: string
}): Promise<null | {
  cur_page_num: number
  data_list: TaskCaseListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  const data: null | {
    cur_page_num: number
    data_list: TaskCaseListI[]
    has_next: boolean
    has_prev: boolean
    num_per_page: number
    pages: number
    total_num: number
  } = await request(`/v2/task/lane/${task_id}`, 'GET', params)
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
// 任务下发
export const distributeTask = async (
  task_id: number,
  params: {
    job_name: string
    num: number
    diff_type: string[] // config中的lane_diff_type
    city: number[]
    custom_filter: string
    desc: string
    to_user: string
    dead_line: string
  }
): Promise<{ distributed: boolean; msg: string }> => {
  const res = await request(`/v2/job/lane`, 'POST', {
    task_id,
    ...params
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
