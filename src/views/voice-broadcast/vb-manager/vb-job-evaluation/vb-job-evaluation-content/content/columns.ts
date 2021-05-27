export const EvaluationContentListColumns = [
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
    title: '是否盲评',
    key: 'blind',
    align: 'center',
    slot: 'blind'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

const EvaluationContentDetailListColumnsHead = [
  {
    title: 'Record ID',
    key: 'record_id',
    align: 'center',
  }
]

const EvaluationContentDetailListColumnsTail = [
  {
    title: '热度',
    key: 'heat',
    align: 'center',
  },
  {
    title: '任务状态',
    key: 'heat',
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

export const EvaluationContentDetailListColumns = [
  ...EvaluationContentDetailListColumnsHead,
  {
    title: '对比结果',
    key: 'result_of_comparison',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴播报',
    key: 'left_broadcast',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品播报',
    key: 'right_broadcast',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴code类型',
    key: 'left_code_family',
    align: 'center',
  },
  {
    title: '竞品code类型',
    key: 'right_code_family',
    align: 'center',
  },
  ...EvaluationContentDetailListColumnsTail
]

export const EvaluationContentDetailListColumnsBlind = [
  ...EvaluationContentDetailListColumnsHead,
  {
    title: '左边code类型',
    key: 'left_code_family',
    align: 'center',
  },
  {
    title: '右边code类型',
    key: 'right_code_family',
    align: 'center'
  },
  ...EvaluationContentDetailListColumnsTail
]

export const EvaluationContentMarkRecordColumns = [
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
    title: '播报内容',
    key: 'expect_action',
    align: 'center'
  },
  {
    title: '辅助动作1',
    key: 'assist1',
    align: 'center'
  },
  {
    title: '辅助动作2',
    key: 'assist2',
    align: 'center'
  },
  {
    title: 'code类型',
    key: 'best_code',
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
