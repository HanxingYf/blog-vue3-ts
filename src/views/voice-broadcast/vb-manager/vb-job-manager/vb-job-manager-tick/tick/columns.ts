export const ManagerTickNormalListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
    width: 70
  },
  {
    title: '评测名称',
    key: 'job_name',
    align: 'center',
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
    title: 'Code筛选',
    key: 'code_filter',
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
    title: '已分发数量',
    key: 'dispatch_count',
    align: 'center',
  },
  {
    title: '总数量',
    key: 'case_count',
    align: 'center',
  },
  {
    title: '操作',
    width: 300,
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const ManagerTickMarkedListColumns = [
  {
    title: 'Record ID',
    key: 'voice_diff_record_id',
    align: 'center',
  },
  {
    title: '评测时间',
    key: 'update_time',
    align: 'center',
  },
  {
    title: '路线是否一致',
    key: 'path_consis',
    align: 'center',
  },
  {
    title: '路口类型',
    key: 'cross_type',
    align: 'center',
  },
  {
    title: '路段道路等级',
    key: 'weight',
    align: 'center',
  },
  {
    title: '起始至转向点距',
    key: 'start_turning_dis',
    align: 'center',
  },
  {
    title: '结束至转向点距',
    key: 'end_turning_dis',
    align: 'center',
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
    align: 'center',
  },
  {
    title: '备注',
    key: 'custom_mark',
    align: 'center',
  },
  {
    title: '问题类型',
    key: 'issue_type1',
    align: 'center',
  },
  {
    title: '细分类',
    key: 'issue_type2',
    align: 'center',
  },
  {
    title: '最后操作人',
    key: 'last_operator',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action',
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

export const tickStatisticsColunms = [
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
    key: 'type',
    align: 'center',
    slot: 'type'
  },
  {
    title: '问题数量',
    key: 'typeNum',
    align: 'center'
  },
  {
    title: '问题占比',
    key: 'typeRatio',
    align: 'center'
  },
  {
    title: '问题',
    key: 'question',
    align: 'center',
    slot: 'question'
  },
  {
    title: '数量',
    key: 'questionNum',
    align: 'center'
  },
  {
    title: '占比',
    key: 'questionRatio',
    align: 'center'
  }
]
