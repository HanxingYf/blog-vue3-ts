import request from '@/utils/request'
import { AnalysisReportI, DetailChartI, RateI } from './'

// 播报位置xx率
export const pullAnalysisReport = async (
  payload: {
    city: number[],
    start_date: string,
    end_date: string
  }
) => {
  const res: AnalysisReportI | null = await request('/v1/voice/report', 'GET', {
    ...payload,
    city: payload.city.join(',')
  })
  return res
}

// 指定日期的图表
export const pullIndicateDetail = async (
  date: string,
  scopeObj: { max_scope: number, min_scope: number },
  city: number[],
  graphType: string
): Promise<DetailChartI | null> => {
  let { max_scope, min_scope } = scopeObj
  if (max_scope < min_scope) {
    const max = max_scope
    max_scope = min_scope
    min_scope = max
  }
  const res: DetailChartI | null = await request(`/v1/voice/report/${date}`, 'GET', graphType ? {
    city: city.join(','),
    max_scope,
    min_scope,
    type: graphType
  } : {
    city: city.join(',')
  })
  return res
}

// 环比指标（天）
export const pullDiffRate = async (
  diff_time: number,
  city: number[]
) => {
  const res: RateI | null = await request('/v1/voice/rate', 'GET', {
    city: city.join(','),
    diff_time
  })
  return res
}
