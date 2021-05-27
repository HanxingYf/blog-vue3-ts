export const EvaluationBasemapListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
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
    slot: 'create_time'
  },
  {
    title: '城市',
    key: 'city_filter',
    align: 'center',
    slot: 'city_id'
  },
  {
    title: '子块编号',
    key: 'block_id',
    align: 'center'
  },
  {
    title: '已标注/总数量',
    key: 'marked',
    align: 'center',
    slot: 'marked'
  },
  {
    title: '截止时间',
    key: 'deadline',
    align: 'center',
    width: 100,
    slot: 'deadline'
  },
  {
    title: '任务介绍',
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

export const EvaluationBasemapCaselListColumns = [
  {
    title: 'Record ID',
    key: 'poi_diff_record_id',
    align: 'center',
  },
  {
    title: '子块编号',
    key: 'BlockID',
    align: 'center'
  },
  {
    title: '类型',
    key: 'Type',
    align: 'center',
    slot: 'poi_type'
  },
  {
    title: 'POI名称',
    key: 'Name',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: 'Rank值',
    key: 'POIRank',
    align: 'center',
  },
  {
    title: '显示层级',
    key: 'DispLevel',
    align: 'center',
  },
  {
    title: '任务状态',
    key: 'status',
    align: 'center',
    width: 100,
    slot: 'case_status'
  },
  {
    title: '评测记录',
    key: 'record',
    align: 'center',
    slot: 'mark_record'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  }
]

export const EvaluationBasemapMarkRecordColumns = [
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
  // {
  //   title: '比例尺是否连续',
  //   key: 'continuous',
  //   align: 'center',
  //   slot: 'continuous'
  // }
  // {
  //   title: '操作',
  //   key: 'action',
  //   align: 'center',
  //   slot: 'action',
  // }
]
