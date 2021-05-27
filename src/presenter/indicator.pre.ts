import {
  pullAnalysisReport,
  pullIndicateDetail,
  pullDiffRate,
  parseAnalysisReport,
  parseIndicateDetail,
  parseDiffRate
} from '@/models/indicator'

export const getAnalysisReport = async (payload: {
  city: number[],
  start_date: string,
  end_date: string
}) => {
  const data = await pullAnalysisReport(payload)
  return data && parseAnalysisReport(data)
}

export const getIndicateDetail = async (date: string, scopeObj: any, city: number[], graphType: string) => {
  const data = await pullIndicateDetail(date, scopeObj, city, graphType)
  return !graphType ? data && parseIndicateDetail(data, date) : data
}

export const getDiffRate = async (diff_time: number, city: number[], title: string) => {
  const data = await pullDiffRate(diff_time, city)
  return data && parseDiffRate(data, title)
}
