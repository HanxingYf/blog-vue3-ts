import request from '@/utils/request'
import { TaskCaseListI, TaskListI } from './types'

// 创建任务
export const createTask = async (params: {
  task_name: string
  city_list: number[]
  creator: string
  num: number
  version_a: string
  version_b?: string
}): Promise<{ created: boolean; msg: string }> => {
  const res = await request('/v3/task/enlargeMap', 'POST', {
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
  return request('/v3/task/enlargeMap', 'GET', { ...params, progress })
}

// 删除任务
export const deleteTask = async (id: number): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/v3/task/enlargeMap/${id}`, 'DELETE', {}, true)
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
  in_link?: string
  out_link?: string
  pass_link?: string
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
  } = await request(`/v3/task/enlargeMap/${task_id}`, 'GET', params)
  return data
}

// 任务下发
export const distributeTask = async (
  task_id: number,
  params: {
    job_name: string
    num: number
    filter_type?: string
    city: number[]
    custom_filter: string
    desc: string
    to_user: string
    dead_line: string
    info: string
  }
): Promise<{ distributed: boolean; msg: string }> => {
  const res = await request(`/v3/job/enlargeMap`, 'POST', {
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
