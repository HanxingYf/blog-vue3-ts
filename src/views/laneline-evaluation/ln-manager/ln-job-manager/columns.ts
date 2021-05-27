export const TaskListColumns = [
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
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    slot: 'create_time'
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

export const TaskCaseListColumns = [
  {
    title: 'Record ID',
    key: 'lane_diff_record_id',
    align: 'center',
    fixed: 'left',
    width: 70
  },
  {
    title: '对比结果',
    key: 'diff_type',
    align: 'center',
    slot: 'diff_type',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴显示',
    key: 'didi_show',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品显示',
    key: 'rival_show',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴显示区间',
    key: 'didi_range',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品显示区间',
    key: 'rival_range',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '路口一致性',
    key: 'path_consis',
    slot: 'path_consis',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '内容评价结论',
    key: 'tag',
    slot: 'tag',
    align: 'center',
    with: 100,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '内容问题类型',
    key: 'lane_issue_type',
    slot: 'lane_issue_type',
    align: 'center',
    ellipsis: true,
    with: 100,
    tooltip: true
  },
  {
    title: '时机评价结论',
    key: 'display_tag',
    slot: 'display_tag',
    align: 'center',
    ellipsis: true,
    with: 100,
    tooltip: true
  },
  {
    title: '备注',
    key: 'custom_mark',
    align: 'center',
    ellipsis: true,
    with: 100,
    tooltip: true
  },
  {
    title: '最后操作人',
    key: 'last_operator',
    align: 'center',
    with: 100
  },
  {
    title: '评测时间',
    key: 'update_time',
    align: 'center',
    with: 100
  },
  {
    title: '操作',
    key: 'action',
    slot: 'action',
    align: 'center',
    fixed: 'right',
    width: 100
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

export const contentColumns = [
  {
    title: '显示内容评价结论',
    key: 'category',
    align: 'center',
    slot: 'jumpto'
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
    title: '问题原因',
    key: 'q_reason',
    align: 'center',
    slot: 'q_jumpto'
  },
  {
    title: '问题数量',
    key: 'q_num',
    align: 'center'
  },
  {
    title: '问题占比',
    key: 'q_ratio',
    align: 'center'
  }
]

export const tickColumns = [
  {
    title: '显示时机评价结论',
    key: 'category',
    align: 'center',
    slot: 'jumpto'
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
  }
]

