export const ManagerBasemapTaskListColumns = [
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
    slot: 'city_id'
  },
  {
    title: '截止时间',
    key: 'deadline',
    align: 'center',
    slot: 'deadline_time'
  },
  {
    title: '任务介绍',
    key: 'description',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '已分发数量 / 总数量',
    key: 'dispatch_count',
    align: 'center',
    slot: 'dispatch'
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

export const ManagerBasemapMarkedTaskListColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
  },
  {
    title: 'Record ID',
    key: 'poi_diff_record_id',
    align: 'center'
  },
  {
    title: '瓦片编号',
    key: 'BlockNo',
    align: 'center'
  },
  {
    title: '子块编号',
    key: 'BlockID',
    align: 'center'
  },
  {
    title: 'POI名称',
    key: 'Name',
    align: 'center'
  },
  {
    title: '当前POI的DidiID',
    key: 'DidiID',
    align: 'center'
  },
  {
    title: '类型',
    key: 'Type',
    align: 'center',
    slot: 'poi_type'
  },
  {
    title: 'KindName',
    key: 'KindName',
    align: 'center'
  },
  {
    title: 'KindRank',
    key: 'KindRank',
    align: 'center'
  },
  {
    title: 'POIRank',
    key: 'POIRank',
    align: 'center'
  },
  {
    title: '显示层级',
    key: 'DispLevel',
    align: 'center'
  },
  {
    title: '最后操作人',
    key: 'last_operator',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    slot: 'action'
  },
]

export const ExportExpandRowColumns = [
  {
    title: '召回POI显示层级',
    key: 'RC_level',
    align: 'center'
  },
  {
    title: '召回POI_ID(DidiID)',
    key: 'RC_DidiID',
    align: 'center'
  },
  {
    title: '召回POI名称',
    key: 'RC_PoiName',
    align: 'center'
  },
  {
    title: '召回POI类别',
    key: 'RC_KindName',
    align: 'center'
  },
  {
    title: '召回POI类别Rank',
    key: 'RC_KindRank',
    align: 'center'
  },
  {
    title: '召回POIRank',
    key: 'RC_POIRank',
    align: 'center'
  },
  {
    title: '召回POI是否保留',
    key: 'RC_keep',
    align: 'center',
    slot: 'keep'
  }
]

export const ExpandRowColumns = [
  {
    title: '层级',
    key: 'level',
    align: 'center',
    slot: 'level'
  },
  {
    title: 'DidiID',
    key: 'DidiID',
    align: 'center'
  },
  {
    title: 'PoiName',
    key: 'PoiName',
    align: 'center'
  },
  {
    title: 'POIRank',
    key: 'POIRank',
    align: 'center'
  },
  {
    title: 'SiweiID',
    key: 'SiweiID',
    align: 'center'
  },
  {
    title: 'KindName',
    key: 'KindName',
    align: 'center'
  },
  {
    title: 'KindRank',
    key: 'KindRank',
    align: 'center'
  },
  {
    title: '是否召回',
    key: 'keep',
    align: 'center',
    slot: 'keep'
  }
]

export const DeliveryDetailListNumsColumns = [
  // {
  //   title: '质检已分发',
  //   key: 'verify_dispatch',
  //   align: 'center',
  // },
  {
    title: '评测已分发',
    key: 'mark_dispatch',
    align: 'center',
    slot: 'mark_dispatch'
  },
  // {
  //   title: '流转',
  //   key: 'circulation',
  //   align: 'center',
  // },
  {
    title: '总量',
    key: 'total',
    align: 'center',
    slot: 'total'
  }
]

export const DeliveryDetailListMarkPersonColumns = [
  {
    title: '评测人员',
    key: 'user_name',
    align: 'center',
  },
  {
    title: '子块编号',
    key: 'block_id',
    align: 'center',
  },
  {
    title: 'POI数量',
    key: 'poi_nums',
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
  }
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
