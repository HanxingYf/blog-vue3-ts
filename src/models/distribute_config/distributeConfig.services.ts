import request from '@/utils/request'
import { BaseConfigI } from './distributeConfig.types'

export const getDistributeConfig = async (): Promise<BaseConfigI | null> => {
  const res: BaseConfigI | null = await request('/v1/config', 'GET')
  return res && {
    ...res,
    map_poi_type: {
      1: '已删除',
      0: '新增'
    }
  }
}

