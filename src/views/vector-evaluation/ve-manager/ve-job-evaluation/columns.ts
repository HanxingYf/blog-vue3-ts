export const TaskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '评测名称',
    key: 'job_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    width: 100,
    slot: 'create_time'
  },
  {
    title: '城市',
    key: 'city_filter',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '已标注/总数量',
    key: 'num_ratio',
    align: 'center',
    slot: 'num_ratio'
  },
  {
    title: '截止时间',
    key: 'deadline',
    align: 'center',
    width: 100,
    slot: 'deadline'
  },
  {
    title: '评测描述',
    key: 'description',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '评测模式',
    key: 'info',
    slot: 'info',
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

export const TaskCaseListColumns = [
  {
    title: 'Record ID',
    key: 'enlarge_map_diff_record_id',
    align: 'center',
  },
  {
    title: '任务状态',
    key: 'status',
    align: 'center',
    slot: 'status',
    ellipsis: true,
    tooltip: true
  },
  // {
  //   title: 'mark_pic_url',
  //   key: 'mark_pic_url',
  //   align: 'center',
  //   ellipsis: true,
  //   tooltip: true
  // },
  // {
  //   title: 'base_pic_a',
  //   key: 'base_pic_a',
  //   align: 'center',
  //   ellipsis: true,
  //   tooltip: true
  // },
  // {
  //   title: 'base_pic_b',
  //   key: 'base_pic_b',
  //   align: 'center',
  //   ellipsis: true,
  //   tooltip: true
  // },
  {
    title: '评测记录',
    key: 'record',
    align: 'center',
    slot: 'record'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const TaskMarkRecordColumns = [
  {
    title: '质检人',
    key: 'verifier',
    align: 'center'
  },
  {
    title: '评测人',
    key: 'marker',
    align: 'center'
  },
  {
    title: '时间',
    key: 'update_time',
    align: 'center'
  },
  {
    title: '新旧版本评价',
    key: 'better_version',
    slot: 'better_version',
    align: 'center'
  },
  {
    title: '策略是否应召回',
    key: 'should_recall',
    slot: 'should_recall',
    align: 'center'
  },
  {
    title: '展示内容准确性',
    key: 'tag',
    slot: 'tag',
    align: 'center'
  },
  {
    title: '效果美观度',
    key: 'beauty',
    slot: 'beauty',
    align: 'center'
  },
  {
    title: '备注',
    key: 'custom_mark',
    align: 'center'
  },
  {
    title: '质检意见',
    key: 'verify_comment',
    align: 'center'
  },
  // {
  //   title: '操作',
  //   key: 'action',
  //   align: 'center',
  //   slot: 'action',
  // }
]
