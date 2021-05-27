import request from '@/utils/request'
import {
  RoadtesterI,
  RoadtestTaskListI,
  StaffUserResI
} from './types'

// 创建路测任务
export const createOrModTask = async (params: {
  id?: number
  title: string
  city: string
  road_test_time: string
  target: string
  creator: string
  update_person: string
  flight_info: string
  hotel_info: string
  car_rental_info: string
  car_arrange_info: string
  tips: string
  person_ids: string
}): Promise<{ done: boolean; msg: string }> => {
  const res = await request(`/v3/road_test/info`, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      done: !code,
      msg
    }
  } else {
    return {
      done: false,
      msg: '请求失败'
    }
  }
}

// 获取路测任务列表
export const getTaskList = async (
  params: {
    page: number
    per_page: number
    order_col?: string
    desc?: number
    id?: number
    title?: string
    city?: string
    creator?: string
    update_person?: string
  }
): Promise<null | {
  cur_page_num: number
  data_list: RoadtestTaskListI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}> => {
  return request('/v3/road_test/info', 'GET', params)
}

// 删除任务
export const deleteTask = async (id: number): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/v3/road_test/info/${id}`, 'DELETE', {}, true)
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

// 创建&编辑路测人
export const createRoadtester = async (params: {
  id?: number
  road_test_id: number
  name: string
  nick_name: string
  user_group: string
  phone: string
  test_phone: string
  is_first_test?: number
}): Promise<{ done: boolean, data?: number, msg: string }> => {
  const res = await request(`/v3/road_test/person`, 'POST', params, true)
  if (res) {
    const { code, data, msg } = res
    return {
      done: !code,
      data,
      msg
    }
  } else {
    return {
      done: false,
      msg: '请求失败'
    }
  }
}

// 获取路测人信息
export const getRoadtesterInfo = async (params: {
  num_per_page?: number
  page?: number
  id?: string
  road_test_id: number
  person_ids?: string
}): Promise<null | {
  cur_page_num: number
  data_list: RoadtesterI[]
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  pages: number
  total_num: number
}>  => {
  return await request('/v3/road_test/person', 'GET', params)
}

// 删除路测人
export const delRoadtester = async (id: number): Promise<{ deleted: boolean; msg: string }> => {
  const res = await request(`/v3/road_test/person/${id}`, 'DELETE', {}, true)
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

// 发送通知
export const notifyMsg = async (params: {
  send_to_new: number
  road_test_id: number
  detail_url: string
  // to_user?: string
}): Promise<{ done: boolean, msg: string }> => {
  const res = await request(`/v3/notice`, 'POST', params, true)
  if (res) {
    const { code, msg } = res
    return {
      done: !code,
      msg
    }
  } else {
    return {
      done: false,
      msg: '请求失败'
    }
  }
}

export const getDuser = async (userName: string) => {
  try {
    const res: StaffUserResI = await request(`/v3/proxy`, 'GET', {
      url: `http://10.170.32.78:8080/time-tunnel/api/getStaffInfo?userName=${userName}`
    })
    const { meta, data } = res
    if (data) {
      return data
    }
    return []
  } catch (error) {
    console.error(error)
    return []
  }
}

