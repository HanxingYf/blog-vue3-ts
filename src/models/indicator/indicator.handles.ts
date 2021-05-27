import {
  preConfig
} from './indicator.utils'
import { AnalysisReportI, DetailChartI, RateI } from './'

interface DataObjItemI {
  last_date: string,
  counts: number[],
  rate: {
    label: string[],
    value: string[]
  },
  compared: {
    label: string,
    value: '-'
  },
  count: {
    label: string,
    value: number
  },
  desc: {
    label: string,
    value: string
  },
  graph: {
    title: string,
    columns: string[],
    rows: any[]
  }
}
export const parseAnalysisReport = (
  data: AnalysisReportI
) => {
  const { accuracy_report, consis_report, gsb_report } = data
  const iterators = [
    {
      chart: {
        dates: accuracy_report.dates,
        rates: accuracy_report.rates
      },
      counts: accuracy_report.counts,
      desc: accuracy_report.desc
    },
    {
      chart: {
        dates: consis_report.dates,
        rates: consis_report.rates
      },
      counts: consis_report.counts,
      desc: consis_report.desc
    },
    {
      chart: {
        dates: gsb_report.dates,
        rates: [
          gsb_report.good_rates,
          gsb_report.same_rates,
          gsb_report.bad_rates
        ]
      },
      counts: gsb_report.counts,
      desc: gsb_report.desc
    }
  ]
  const dataObj: { [propName: string]: DataObjItemI } = {}
  iterators.forEach((item, index: number) => {
    const { label_title, label_rate, label_compared, label_count, label_desc } = preConfig[index]
    const { chart, counts, desc } = item
    const { dates, rates } = chart
    const _rates = genPercentValue(rates)
    const last_index: number = 1
    const rows = dates.map((d: string, i: number) => {
      return index === 2 ? {
        '日期': d,
        'Good': (_rates[0] as number[])[i],
        'Same': (_rates[1] as number[])[i],
        'Bad': (_rates[2] as number[])[i],
      } : {
        '日期': d,
        [label_rate[0]]: _rates[i]
      }
    })
    dataObj[label_title] = {
      last_date: dates[dates.length - last_index],
      counts,
      rate: {
        label: label_rate,
        value: index === 2 ? [
          `${rows[rows.length - last_index]['Good']}%`,
          `${rows[rows.length - last_index]['Same']}%`,
          `${rows[rows.length - last_index]['Bad']}%`
        ] : [`${_rates[_rates.length - last_index]}%`] // 最后日期的rate
      },
      compared: {
        label: label_compared,
        value: '-'
      },
      count: {
        label: label_count,
        value: counts[counts.length - last_index] // 最后日期的count
      },
      desc: {
        label: label_desc,
        value: desc
      },
      graph: {
        title: label_title,
        columns: ['日期', ...label_rate],
        rows
      }
    }
  })
  return dataObj
}

export const parseIndicateDetail = (
  data: DetailChartI,
  date: string
) => {
  const { code_diff_report, end_time_diff_report, start_time_diff_report } = data
  return [
    start_time_diff_report,
    end_time_diff_report,
    code_diff_report
  ].map((item, index: number) => {
    const { chart, title, rate, early, late, same, compare, type, desc } = item
    const { num } = chart
    let { distance } = chart
    distance = distance ? distance : []
    return {
      graph: {
        columns: ['距离差', '数量'],
        rows: distance.map((d: any, i: number) => {
          return {
            '距离差': d.toString() + (index === 2 ? 'm' : 's'),
            '数量': num[i],
          }
        })
      },
      desc,
      type,
      distance,
      num,
      date,
      title,
      rate: {
        label: '区间占比',
        value: `${(rate * 100).toFixed(2)}%`
      },
      compared: {
        label: '对比上周数据',
        value: `${(compare * 100).toFixed(2)}%`
      },
      competitions: [
        {
          label: '早于竞品',
          value: early
        },
        {
          label: '晚于竞品',
          value: late
        },
        {
          label: '竞品一致',
          value: same
        }
      ]
    }
  })
}

export const parseDiffRate = (
  res: RateI,
  title: string
) => {
  const { accuracy_rate, consis_rate, good_rate } = res
  const mapTitle: { [prop: string]: number } = {
    '播报位置准确率': accuracy_rate,
    '播报位置一致率': consis_rate,
    '播报位置GSB评测': good_rate
  }
  return mapTitle[title]
}

function genPercentValue(arr: Array<number | number[]>) {
  return arr.map((r: number | number[] ) => {
    return Array.isArray(r) ? r.map((_r: number) => toFixed(_r)) : toFixed(r)
  })
}
function toFixed(n: number) {
  return n === 0 ? n : +(n * 100).toFixed(2)
}
