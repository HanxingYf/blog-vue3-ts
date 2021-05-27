export const contentTaskListColumns = [
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
    title: '最低道路等级',
    key: 'min_link_level',
    align: 'center',
  },
  {
    title: '创建人',
    key: 'creator',
    align: 'center',
  },
  {
    title: '数量',
    key: 'task_num',
    align: 'center',
  },
  {
    title: '主辅动作一致率',
    key: 'all_consisrate',
    align: 'center'
  },
  {
    title: '主动作一致率',
    key: 'main_consisrate',
    align: 'center'
  },
  {
    title: '召回率',
    key: 'recall_rate',
    align: 'center'
  },
  {
    title: '操作',
    width: 250,
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const contentTaskDetailColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: 'LinkList',
    key: 'link_list',
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
    title: '滴滴辅助动作1',
    key: 'didi_assist1',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴辅助动作2',
    key: 'didi_assist2',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品辅助动作1',
    key: 'rival_assist1',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品辅助动作2',
    key: 'rival_assist2',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴播报',
    key: 'didi_broadcast',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品播报',
    key: 'competitive_broadcast',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '热度',
    key: 'heat',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action',
    width: 250
  }
]

