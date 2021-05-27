export const truthDatabaseListColumns = [
  {
    type: 'selection',
    align: 'center',
    width: 60
  },
  {
    title: 'ID',
    key: 'id',
    align: 'center'
  },
  {
    title: 'Record ID',
    key: 'record_id',
    align: 'center',
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    slot: 'status',
    width: 100
  },
  {
    title: '批次ID',
    key: 'group_id',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '主动作',
    key: 'tts',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '辅助动作',
    key: 'assist',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'code类型',
    key: 'code_family',
    align: 'center',
  },
  {
    title: 'code值',
    key: 'code',
    align: 'center'
  },
  {
    title: '城市',
    key: 'city_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '路口形态',
    key: 'cross_kind',
    align: 'center',
  },
  {
    title: '真值来源',
    key: 'source',
    align: 'center',
  },
  {
    title: '机评任务',
    key: 'task_id',
    align: 'center',
  },
  {
    title: '审核人',
    key: 'checker_name',
    align: 'center',
  },
  {
    title: '变更记录',
    key: 'evaluation_record',
    align: 'center',
    slot: 'evaluation_record',
    width: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action',
    width: 155
  }
]

export const truthDatabaseChangesColumns = [
  {
    title: '人员',
    key: 'operator',
    align: 'center',
  },
  {
    title: '时间',
    key: 'create_time',
    align: 'center',
  },
  {
    title: '播报内容',
    key: 'tts',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '辅助动作',
    key: 'assist',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'code类型',
    key: 'code_family',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action',
  }
]
