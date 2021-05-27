import request from '@/utils/request'
import {
  TruthDatabaseListReqI, TruthDatabaseListResI, TruthHistoryListResItemI
} from './truth.types'

// 真值列表 | 待继承真值列表
export const pullTruthDatabaseList = async (type: 'normal' | 'inhreit' , params: TruthDatabaseListReqI): Promise<TruthDatabaseListResI | null> => {
  const url = type === 'normal' ? `/v2/truth` : `/v2/truth/list/invalid`
  return await request(url, 'GET', params)
}

// 变更历史
export const pullTruthHistoryList = async (id: number): Promise<TruthHistoryListResItemI[] | null> => {
  return await request(`/v2/truth/history`, 'GET', { id })
}

// 回滚
export const rollbackTruth = async (id: number): Promise<{ isDone: boolean; msg: string }> => {
  const res = await request(`/v2/truth/rollback/${id}`, 'POST', {}, true)
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

// 导入
export const importTruthDatabase = async (
  params: { job_id: number } | { id: number[] }
): Promise<{ imported: boolean; msg: string }> => {
  const res = await request(`/v2/truth/check`, 'POST', params, true)
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

// 删除
export const deleteTruthDatabase = async (params: { ids: number[] }): Promise<{ isDone: boolean; msg: string }> => {
  const res = await request(`/v2/truth/delete`, 'POST', params, true)
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

// 修改
export const updatedTurthDatabase = async (
  id: number,
  payload: { [propName: string]: any }
): Promise<{ isDone: boolean; msg: string }> => {
  const res = await request(`/v2/truth/update/${id}`, 'POST', payload, true)
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
