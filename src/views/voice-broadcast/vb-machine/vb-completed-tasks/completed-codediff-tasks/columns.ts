export const CodeDiffTaskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '任务名称',
    key: 'task_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '城市',
    key: 'cities',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '路网版本',
    key: 'map_version',
    align: 'center'
  },
  {
    title: '数据版本',
    key: 'data_version',
    align: 'center',
  },
  {
    title: '创建人',
    key: 'creator',
    align: 'center',
  },
  {
    title: '数量',
    key: 'num',
    align: 'center',
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    slot: 'time'
  },
  {
    title: '操作',
    width: 250,
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const CodeDiffTaskDetailColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: 'Case ID',
    key: 'case_id',
    align: 'center',
  },
  {
    title: '对比结果',
    key: 'diff_type',
    align: 'center',
  },
  {
    title: '线上版本code',
    key: 'ori_code',
    align: 'center',
  },
  {
    title: '线上版本辅助动作',
    key: 'ori_assi_code',
    align: 'center',
  },
  {
    title: '新策略版本code',
    key: 'final_code',
    align: 'center',
  },
  {
    title: '新版本策略辅助动作',
    key: 'final_assi_code',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

