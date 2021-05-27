export const basemapTaskListColumns = [
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
    key: 'city_name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '子块编号',
    key: 'block_noes',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    slot: 'blockIds'
  },
  {
    title: 'POI数量',
    key: 'poi_num',
    align: 'center',
  },
  {
    title: '创建人',
    key: 'creator',
    align: 'center',
  },
  {
    title: '操作',
    width: 150,
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]
