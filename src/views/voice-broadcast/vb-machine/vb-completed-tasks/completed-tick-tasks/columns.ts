export const TickTaskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: '任务名称',
    key: 'task_name',
    align: 'center',
  },
  {
    title: '创建时间',
    key: 'create_time',
    align: 'center',
    slot: 'time'
  },
  {
    title: '城市',
    key: 'city',
    align: 'center',
    ellipsis: true,
    tooltip: true
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
    title: '操作',
    width: 250,
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]
export const TickTaskDetailColumns = [
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
    title: '滴滴播报',
    key: 'didi_code',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品播报',
    key: 'rival_code',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '开始播报点距离差',
    key: 'delta_act_start_dis',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '结束播报点距离差',
    key: 'delta_act_end_dis',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'code点距离差',
    key: 'code_dis',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '滴滴结束点code距离',
    key: 'didi_surplus',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '竞品结束点code距离',
    key: 'rival_surplus',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '热度',
    key: 'hot',
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
