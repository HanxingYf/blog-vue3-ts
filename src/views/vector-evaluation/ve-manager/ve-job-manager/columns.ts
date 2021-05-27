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
    slot: 'diff_res_filter',
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
    title: '任务类型',
    key: 'info',
    align: 'center',
    slot: 'info'
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
    key: 'enlarge_map_diff_record_id',
    align: 'center'
  },
  {
    title: '版本评价',
    key: 'better_version_mod',
    align: 'center'
  },
  {
    title: '策略是否应召回',
    key: 'should_recall_mod',
    align: 'center'
  },
  {
    title: '效果准确度',
    key: 'tag_mod',
    align: 'center'
  },
  {
    title: '展示内容范围问题',
    key: 'show_range_mod',
    align: 'center'
  },
  {
    title: '展示内容道路问题',
    key: 'road_issue_mod',
    align: 'center',
    slot: 'road_issue'
  },
  {
    title: '展示内容箭头问题',
    key: 'arrow_issue_mod',
    align: 'center',
    slot: 'arrow_issue'
  },
  {
    title: '展示内容其他问题',
    key: 'other_issue_mod',
    align: 'center',
    slot: 'other_issue'
  },
  {
    title: '效果美观度',
    key: 'beauty_mod',
    align: 'center'
  },
  {
    title: '美观度道路问题',
    key: 'beauty_road_issue_mod',
    align: 'center',
    slot: 'beauty_road_issue'
  },
  {
    title: '美观度箭头问题',
    key: 'beauty_arrow_issue_mod',
    align: 'center',
    slot: 'beauty_arrow_issue'
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

const statisticColumns = [
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
    title: '问题分类(一级)',
    key: 'q_1_reason',
    align: 'center',
    slot: 'q_1_jumpto'
  },
  {
    title: '问题分类(二级)',
    key: 'q_2_reason',
    align: 'center',
    slot: 'q_2_jumpto'
  },
  {
    title: '问题数量',
    key: 'q_2_num',
    align: 'center'
  },
  {
    title: '问题占比',
    key: 'q_2_ratio',
    align: 'center'
  }
]

export const contentColumns = [
  {
    title: '显示内容评价结论',
    key: 'category',
    align: 'center',
    slot: 'jumpto'
  },
  ...statisticColumns
]

export const tickColumns = [
  {
    title: '效果美观度',
    key: 'category',
    align: 'center',
    slot: 'jumpto'
  },
  ...statisticColumns
]

