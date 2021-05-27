export const EvaluationCodeDiffListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  // {
  //   title: '评测ID',
  //   key: 'mark_job_id',
  //   align: 'center',
  // },
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
    slot: 'time'
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
    key: 'nums',
    align: 'center',
    slot: 'nums'
  },
  {
    title: '截止时间',
    key: 'deadline',
    align: 'center',
    width: 100,
    slot: 'time'
  },
  {
    title: '评测描述',
    key: 'description',
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

export const EvaluationCodeDetailListColumns = [
  {
    title: 'Record ID',
    key: 'self_diff_record_id',
    align: 'center'
  },
  {
    title: 'Case ID',
    key: 'case_id',
    align: 'center'
  },
  {
    title: '对比结果',
    key: 'diff_type',
    align: 'center'
  },
  {
    title: '线上版本code',
    key: 'ori_code',
    align: 'center'
  },
  {
    title: '线上版本辅助动作',
    key: 'ori_assi_code',
    align: 'center'
  },
  {
    title: '新策略版本code',
    key: 'final_code',
    align: 'center'
  },
  {
    title: '新策略版本辅助动作',
    key: 'final_assi_code',
    align: 'center'
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
    slot: 'mark_record',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center'
  }
]

export const EvaluationCodeDiffMarkRecordColumns = [
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
    title: 'GSB',
    key: 'tag',
    align: 'center',
    slot: 'gsb'
  },
  {
    title: '错误等级',
    key: 'err_level',
    align: 'center',
    slot: 'err_level'
  },
  {
    title: 'code真值',
    key: 'truth_code',
    align: 'center'
  },
  {
    title: '辅助动作1',
    key: 'truth_assi_code1',
    align: 'center'
  },
  {
    title: '辅助动作2',
    key: 'truth_assi_code2',
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
