export const preConfig: { [prop: number]: {
  label_title: string,
  label_rate: string[],
  label_compared: string,
  label_count: string,
  label_desc: string
} } = {
  0: {
    label_title: '播报位置准确率',
    label_rate: ['准确率'],
    label_compared: '对比上周数据',
    label_count: '样本量',
    label_desc: '末轮播报区间设定'
  },
  1: {
    label_title: '播报位置一致率',
    label_rate: ['一致率'],
    label_compared: '对比上周数据',
    label_count: '样本量',
    label_desc: '一致率差值设定'
  },
  2: {
    label_title: '播报位置GSB评测',
    label_rate: ['Good', 'Same', 'Bad'],
    label_compared: 'Good对比上周数据',
    label_count: '样本量',
    label_desc: '竞品GSB评测'
  }
}
