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
    title: '任务类型',
    key: 'task_type',
    align: 'center',
    slot: 'task_type'
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
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '路网版本',
    key: 'map_version',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'in_link',
    key: 'in_link',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'out_link',
    key: 'out_link',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'pass_link',
    key: 'pass_link',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '城市',
    key: 'city_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]
