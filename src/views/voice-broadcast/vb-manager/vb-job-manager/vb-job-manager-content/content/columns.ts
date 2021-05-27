export const ManagerContentTaskListColumns = [
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
    key: 'city',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '对比结果',
    key: 'result_of_comparison',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'code筛选',
    key: 'filter_of_code',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '文案筛选',
    key: 'filter_of_description',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '截止时间',
    key: 'deadline_time',
    align: 'center',
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
    title: '已分发数量',
    key: 'dispatch_count',
    align: 'center'
  },
  {
    title: '总数量',
    key: 'nums',
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

const ManagerContentMarkedTaskListColumnsHead = [
  {
    type: 'selection',
    align: 'center',
    width: 60,
    fixed: 'left'
  },
  {
    title: 'Record ID',
    key: 'code_diff_record_id',
    fixed: 'left',
    align: 'center',
    width: 100
  },
  {
    title: '评测时间',
    key: 'evaluation_time',
    align: 'center',
    width: 100
  },
  {
    title: '路线是否一致',
    key: 'consistent_of_route',
    align: 'center',
    width: 200
  },
  {
    title: '结论',
    key: 'conclusion',
    align: 'center',
    width: 200
  },
  {
    title: '期望动作',
    key: 'action_of_expectation',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '辅助动作1',
    key: 'action_of_auxiliary_1',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '辅助动作2',
    key: 'action_of_auxiliary_2',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '路口',
    key: 'intersection',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '最佳code',
    key: 'best_code',
    align: 'center',
    width: 100
  }
]

const ManagerContentMarkedTaskListColumnsTail = [
  {
    title: '备注',
    key: 'note',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '问题类型',
    key: 'issue_type',
    align: 'center',
    width: 100
  },
  {
    title: '问题原因',
    key: 'issue_sub_type',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '解决办法',
    key: 'issue_solution',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '问题状态',
    key: 'issue_status',
    align: 'center',
    width: 100
  },
  {
    title: '导入状态',
    key: 'imported',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '是否流转',
    key: 'auto_move',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 100
  },
  {
    title: '最后操作人',
    key: 'last_operator',
    align: 'center',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action',
    fixed: 'right',
    width: 100
  }
]

export const ManagerContentMarkedTaskListColumns = [
  ...ManagerContentMarkedTaskListColumnsHead,
  {
    title: '滴滴code类型',
    key: 'left_code_family',
    align: 'center',
    width: 100
  },
  {
    title: '竞品code类型',
    key: 'right_code_family',
    align: 'center',
    width: 100
  },
  ...ManagerContentMarkedTaskListColumnsTail
]

export const ManagerContentMarkedTaskListColumnsBlind = [
  ...ManagerContentMarkedTaskListColumnsHead,
  {
    title: '左边code类型',
    key: 'left_code_family',
    align: 'center',
    width: 100
  },
  {
    title: '右边code类型',
    key: 'right_code_family',
    align: 'center',
    width: 100
  },
  ...ManagerContentMarkedTaskListColumnsTail
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
    title: '与竞品',
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
    title: '问题',
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
