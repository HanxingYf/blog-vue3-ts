export const ManagerCodeDiffTaskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
    fixed: 'left',
    width: 70
  },
  {
    title: '评测名称',
    key: 'job_name',
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
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
    title: '对比结果',
    key: 'diff_res_filter',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '截止时间',
    key: 'deadline',
    align: 'center',
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
    title: '已分发数量',
    key: 'dispatch_count',
    align: 'center'
  },
  {
    title: '总数量',
    key: 'case_count',
    align: 'center'
  },
  {
    title: '操作',
    width: 300,
    key: 'action',
    align: 'center',
    slot: 'action',
    fixed: 'right'
  }
]

export const ManagerCodeDiffMarkedTaskListColumns = [
  {
    type: 'selection',
    align: 'center',
    width: 60,
    fixed: 'left'
  },
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
    title: 'code真值(标注)',
    key: 'truth_code',
    align: 'center'
  },
  {
    title: '辅助动作1(标注)',
    key: 'truth_assi_code1',
    align: 'center'
  },
  {
    title: '辅助动作2(标注)',
    key: 'truth_assi_code2',
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
    title: '备注',
    key: 'custom_mark',
    align: 'center'
  },
  {
    title: '最后操作人',
    key: 'last_operator',
    align: 'center'
  },
  {
    title: '评测时间',
    key: 'update_time',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center'
  }
]

export const DeliveryDetailListNumsColumns = [
  {
    title: '质检已分发',
    key: 'verify_dispatch',
    align: 'center',
  },
  {
    title: '评测已分发',
    key: 'mark_dispatch',
    align: 'center',
  },
  {
    title: '流转',
    key: 'circulation',
    align: 'center',
  },
  {
    title: '总量',
    key: 'total',
    align: 'center'
  }
]

export const DeliveryDetailListMarkPersonColumns = [
  {
    title: '评测人员',
    key: 'user_name',
    align: 'center',
  },
  {
    title: '数量',
    key: 'nums',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  },
]

export const DeliveryDetailListVerifyPersonColumns = [
  {
    title: '质检人员',
    key: 'user_name',
    align: 'center',
  },
  {
    title: '数量',
    key: 'nums',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  },
]

export const taskStatisticsColunms = [
  {
    title: '与上版本',
    key: 'contrast',
    align: 'center',
    slot: 'contrast'
  },
  {
    title: '数量',
    key: 'num',
    align: 'center'
  },
  {
    title: '占比',
    key: 'ratio',
    align: 'center'
  },
  {
    title: '问题等级',
    key: 'questionType',
    align: 'center',
    slot: 'questionType'
  },
  {
    title: '问题数量',
    key: 'questionNum',
    align: 'center'
  },
  {
    title: '问题占比',
    key: 'questionRatio',
    align: 'center'
  }
]
