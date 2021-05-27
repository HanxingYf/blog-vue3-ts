export const EvaluationTickListColumns = [
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
    key: 'city',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '已标注/总数量',
    key: 'nums',
    align: 'center',
  },
  {
    title: '截止时间',
    key: 'deadline_time',
    align: 'center',
    width: 100,
    slot: 'deadline_time'
  },
  {
    title: '评测描述',
    key: 'desc_of_evaluation',
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

export const EvaluationTickDetailListColumns = [
  {
    title: 'Record ID',
    key: 'voice_diff_record_id',
    align: 'center',
  },
  {
    title: '滴滴播报',
    key: 'didi_tts',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品播报',
    key: 'rival_tts',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '热度',
    key: 'hot',
    align: 'center',
  },
  {
    title: '任务状态',
    key: 'status',
    align: 'center',
    slot: 'case_status'
  },
  {
    title: '评测记录',
    key: 'mark_record',
    align: 'center',
    slot: 'mark_record',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const EvaluationTickMarkRecordColumns = [
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
    title: '起始至转向点距',
    key: 'start_turning_dis',
    align: 'center'
  },
  {
    title: '结束至转向点距',
    key: 'end_turning_dis',
    align: 'center'
  },
  {
    title: '转向点偏差',
    key: 'turning_dis',
    align: 'center',
  },
  {
    title: '分歧至转向点距',
    key: 'div_turning_dis',
    align: 'center',
  },
  {
    title: '播报体验',
    key: 'tag',
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
