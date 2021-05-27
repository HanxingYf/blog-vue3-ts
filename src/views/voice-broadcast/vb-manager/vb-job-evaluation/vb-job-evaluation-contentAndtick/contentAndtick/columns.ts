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
    title: '已标注/总数量',
    key: 'nums',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const EvaluationContentAngTickDetailListColumns = [
  {
    title: 'CaseID',
    key: 'jenkins_diff_record_id',
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

export const EvaluationContentAndTickMarkRecordColumns = [
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
    align: 'center',
    slot: 'time'
  },
  {
    title: '播报内容评价',
    key: 'content_tag',
    align: 'center',
    slot: 'content_tag'
  },
  {
    title: '错误分类',
    key: 'content_err_type',
    align: 'center'
  },
  {
    title: '原因分析',
    key: 'content_err_reason',
    align: 'center'
  },
  {
    title: '播报时机评价',
    key: 'pos_tag',
    align: 'center',
    slot: 'pos_tag'
  },
  {
    title: '错误分类',
    key: 'pos_err_type',
    align: 'center'
  },
  {
    title: '原因分析',
    key: 'pos_err_reason',
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
