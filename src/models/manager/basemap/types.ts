import { BlockI } from '@/models/machine/basemap';

export interface BaseMapManagerListI {
  admin: string // "test"
  block_count: number
  block_dispatch_count: number
  blocks: {
    BlockNos: BlockI[]
  }
  case_count: number
  city_filter: string // "北京"
  code_diff_task_id: number
  code_filter: string // ""
  content_filter: string // ""
  create_time: string // "2020-06-28 16:31:56"
  deadline: string // "2020-06-29 16:39:06"
  description: string // ""
  diff_res_filter: string // "12_842_387"
  dispatch_count: number
  from_user: string // "test"
  id: number
  info: string // ""
  job_name: string // "测试北京"
  job_type: number
  status: number
  update_time: string // "2020-06-28 16:31:57"
  verify_dispatch_count: number
}

export interface BaseMapManagerCaseListI {
  BlockID: string // 1610612736"
  BlockNo: string // 12_843_385"
  DidiID: string // 2000000000000234625"
  DispLevel: string // 18"
  KindName: string // 农家乐/民俗游"
  KindRank: number
  Lat: number
  Lng: number
  Name: string // 映山湖农餐厅"
  POIRank: string // 3121"
  SiweiID: string // 95909680"
  Type: number
  blind_test: number
  continuous: number
  create_time: string // 2020-06-29 14:41:28"
  id: number
  last_operator: string // test"
  mark_job_dispatch_id: number
  mark_job_id: number
  mark_job_verify_id: number
  marked_json: string // [{"level":18,"pois":[{"BlockID":"1610612736","DidiID":"948601310272290818","DispLevel":[18],"KindName":"农家乐/民俗游","KindRank":2400,"Lat":40.702011,"Lng":116.369689,"POIRank":"2400","PoiName":"吴金花农家餐厅","SiweiID":"601298816","keep":0},{"BlockID":"1610612736","DidiID":"2000000000000946675","DispLevel":[18],"KindName":"农家乐/民俗游","KindRank":2400,"Lat":40.700501,"Lng":116.369399,"POIRank":"2668","PoiName":"北京聚龙缘农家院","SiweiID":"95134217","keep":0},{"BlockID":"1610612736","DidiID":"2000000000000991186","DispLevel":[18],"KindName":"农家乐/民俗游","KindRank":2400,"Lat":40.7015,"Lng":116.370629,"POIRank":"3072","PoiName":"龙湾山庄农家餐厅","SiweiID":"95134223","keep":0}]}]"
  owner: string // test"
  poi_diff_record_id: number
  status: number
  update_time: string // 2020-07-01 18:15:38"
  verify_owner: string
}

export interface BaseMapEvaluationListI {
  admin: string // "test"
  blind_test: number
  block_id: string
  case_count: number
  city_filter: string // "1"
  code_filter: string // ""
  comment: string // ""
  complete_count: number
  content_filter: string // ""
  create_time: string // "2020-06-29 14:57:45"
  deadline: string // "2020-06-30 14:48:44"
  description: string // "ooooooooooooooook"
  diff_res_filter: string // "12_843_385"
  dispatch_type: number
  id: number
  info: string // ""
  job_name: string // "测一测北京"
  job_type: number
  mark_job_id: number
  owner: string // "test"
  task_type: number
  update_time: string // "2020-06-29 14:57:45"
}

export interface BaseMapEvaluationCaseListI {
  BlockID: string // ""
  BlockNo: string // "12_843_385"
  DidiID: string // "948601310272290818"
  DispLevel: string // "18"
  KindName: string // "农家乐/民俗游"
  KindRank: number // 400
  Lat: number // 0.702
  Lng: number // 16.37
  Name: string // "吴金花农家餐厅"
  POIRank: string // "2400"
  SiweiID: string // "601298816"
  Type: number
  blind_test: number
  continuous: number
  create_time: string // "2020-06-29 14:41:28"
  id: number // 626
  last_operator: string // ""
  mark_job_dispatch_id: number // 19
  mark_job_id: number // 00
  mark_job_verify_id: number
  marked_json: string // ""
  owner: string // "test"
  poi_diff_record_id: number // 1462
  status: number
  update_time: string // "2020-06-29 14:57:45"
  verify_owner: string // ""
}

export interface BaseMapEvaluationCaseRecordI {
  continuous: number
  create_time: string // 2020-07-02 11:26:37"
  id: number
  marked_json: string // [{"level":18,"pois":[{"BlockID":"1610612753","DidiID":"2000000000000637108","DispLevel":[18],"KindName":"农家乐/民俗游","KindRank":2400,"Lat":40.69629,"Lng":116.39648,"POIRank":"2849","PoiName":"宜香家园农家餐厅","SiweiID":"98007553","keep":1}]}]"
  marker: string // test"
  poi_mark_job_record_id: number
  update_time: string // 2020-07-02 11:26:37"
  verifier: string // "
  verify_comment: string // "
}

