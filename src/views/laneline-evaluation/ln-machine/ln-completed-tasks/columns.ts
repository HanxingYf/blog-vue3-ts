export const taskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '任务名称',
    key: 'task_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    slot: 'create_time'
  },
  {
    title: '城市',
    key: 'city_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建人',
    key: 'creator',
    align: 'center',
  },
  {
    title: '数量',
    key: 'num',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center'
  }
]

export const taskCaseListColumns = [
  {
    title: 'CaseID',
    key: 'id',
    align: 'center',
  },
  {
    title: '对比结果',
    key: 'diff_type',
    align: 'center',
    slot: 'diff_type',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴显示',
    key: 'didi_show',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品显示',
    key: 'rival_show',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴显示区间',
    key: 'didi_range',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品显示区间',
    key: 'rival_range',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center'
  }
]
