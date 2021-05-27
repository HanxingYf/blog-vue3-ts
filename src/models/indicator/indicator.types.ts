export interface AnalysisReportI {
  accuracy_report: {
    dates: string[]
    rates: number[]
    counts: number[]
    desc: string
  }
  consis_report: {
    dates: string[]
    rates: number[]
    counts: number[]
    desc: string
  }
  gsb_report: {
    dates: string[]
    good_rates: number[]
    same_rates: number[]
    bad_rates: number[]
    counts: number[]
    desc: string
  }
}

export interface DetailChartItemI {
  chart: {
    distance: number[]  // [0, 1, 2, 3, 4],
    num: number[]  // [31102, 18465, 9929, 5499, 3284]
  }
  distance: number[]                                           // [0, 1, 2, 3, 4]
  num: number[]                                           // [31102, 18465, 9929, 5499, 3284]
  title: string                                             // "播报起始位置时间差"
  rate: number                                             // 0.2363413
  count: number                                             // 288900
  early: number                                             // 64320
  late: number                                             // 12812
  same: number                                             // 211768
  compare: number                                             // -0.004262924
  type: 'start_time_diff' | 'end_time_diff' | 'code_diff'
  desc: string                                             // "播报起始位置时间差，滴滴开始播报时间减去竞品开始播报时间"
}

export interface DetailChartI {
  code_diff_report: DetailChartItemI
  end_time_diff_report: DetailChartItemI
  start_time_diff_report: DetailChartItemI
}

export interface RateI {
  accuracy_rate: number  // 0.9563
  consis_rate: number  // 0.9222
  good_rate: number  // 0
  same_rate: number  // 0
  bad_rate: number  // 0
  count: number  // 275280
  date: string  // "2020-01-08"
}
