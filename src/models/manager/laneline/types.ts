export interface LanelineJobListI {
  admin: string // "test"
  block_count: number
  block_dispatch_count: number
  case_count: number
  city_filter: string // "北京,深圳"
  code_diff_task_id: number
  code_filter: string // ""
  content_filter: string // ""
  create_time: string // "2020-08-26 16:34:26"
  deadline: string // "2020-08-27 16:43:55"
  description: string // "(⊙o⊙)…"
  diff_res_filter: string // "背景相同高亮不同"
  dispatch_count: number
  from_user: string // "test"
  id: number
  info: string // ""
  job_name: string // "测试"
  job_type: number
  status: number
  update_time: string // "2020-08-26 16:34:26"
  verify_dispatch_count: number
}

export interface LanelineMarkedJobCaseListI {
  didi_show: string // 自定义
  rival_show: string // 自定义
  didi_range: string // 自定义
  rival_range: string // 自定义
  blind_test: number
  city_code: number
  city_name: string // "北京"
  tag: number
  create_time: string // "2020-08-26 16:34:26"
  custom_mark: string // "hahadfdfd"
  didi_background: string // "14"
  didi_disappear_point: string // "116.473770,39.908508"
  didi_event_point: string // "116.473824,39.908508"
  didi_front_arrow: string // "0b"
  didi_start_point: string // "116.476753,39.908447"
  didi_property: string
  diff_type: string // "2"
  display_tag: number
  geojson: string // "{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[116.47784423828125,39.91135787963867],[116.47785186767578,39.911041259765625],[116.47784423828125,39.91090774536133],[116.47783660888672,39.91036605834961],[116.47782897949219,39.910240173339844],[116.47782897949219,39.91019821166992],[116.47782135009766,39.90992736816406],[116.4778060913086,39.90915298461914],[116.47779083251953,39.90872573852539],[116.47776794433594,39.908485412597656],[116.47705078125,39.908477783203125],[116.47695922851562,39.908477783203125],[116.47666931152344,39.90847396850586],[116.47573852539062,39.90847396850586],[116.4755630493164,39.90847396850586],[116.47502899169922,39.908485412597656],[116.47409057617188,39.90849304199219],[116.473388671875,39.90850830078125],[116.47337341308594,39.909725189208984],[116.47406005859375,39.90974807739258]]},"properties":{"pathId":"TWpnNU56QTRNVFkyT0RBNU9UUTNNalV5_1598089946251","linkList":"322460740,322460750,6262930,6277530,5639890,322460880,322460890,618844600,618844610,6309330,880261620,880261630,6300790,6277630,6277660,6342031,6342031,735168561,735168551,300049581,5545501,5545501,5545481,6286161,6337231,6337291,6337281,6277481,6262121,90000247969750,90000247969750"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.47400665283203,39.90848922729492]},"properties":{"aa_startPoint":"116.474007,39.908489","pathId":"TWpnNU56QTRNVFkyT0RBNU9UUTNNalV5_1598089946251","aa_arrow":"b","aa_background":"4","aa_property":"0"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.47340393066406,39.90863800048828]},"properties":{"aa_endPoint":"116.473404,39.908638"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.47675323486328,39.908447265625]},"properties":{"dd_startPoint":"116.476753,39.908447","pathId":"TWpnNU56QTRNVFkyT0RBNU9UUTNNalV5_1598089946251","dd_arrow":"0b","dd_background":"14","dd_property":"00"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.47377014160156,39.90850830078125]},"properties":{"dd_endPoint":"116.473770,39.908508"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.47382354736328,39.90850830078125]},"properties":{"ddPoint":"116.473824,39.908508"}}]}"
  id: number
  lane_diff_record_id: number
  lane_issue_type: number
  last_operator: string // "test"
  link_list: string // "322460740,322460750,6262930,6277530,5639890,322460880,322460890,618844600,618844610,6309330,880261620,880261630,6300790,6277630,6277660,6342031,6342031,735168561,735168551,300049581,5545501,5545501,5545481,6286161,6337231,6337291,6337281,6277481,6262121,90000247969750,90000247969750"
  mark_job_dispatch_id: number
  mark_job_id: number
  mark_job_verify_id: number
  owner: string // "test"
  path_consis: number
  rival_background: string // "4"
  rival_disappear_point: string // "116.473404,39.908638"
  rival_front_arrow: string // "b"
  rival_start_point: string // "116.474007,39.908489"
  rival_property: string
  status: number
  update_time: string // "2020-08-28 11:34:54"
  verify_owner: string // ""
}

export interface LanelineEvaluationListI {
  admin: string // "test"
  blind_test: number
  block_id: string // ""
  case_count: number
  city_filter: string // "北京,深圳"
  code_filter: string // ""
  comment: string // ""
  complete_count: number
  content_filter: string // ""
  create_time: string // "2020-08-27 17:00:24"
  deadline: string // "2020-08-27 16:43:55"
  description: string // "(⊙o⊙)…"
  diff_res_filter: string // "背景相同高亮不同"
  dispatch_type: number
  id: number
  info: string // ""
  job_name: string // "测试"
  job_type: number
  mark_job_id: number
  owner: string // "test"
  task_type: number
  update_time: string // "2020-08-27 17:00:24"
}

export interface LanelineEvaluationCaseListI {
  didi_show: string // 自定义
  rival_show: string // 自定义
  didi_range: string // 自定义
  rival_range: string // 自定义
  blind_test: number
  city_code: number
  city_name: string // "北京"
  tag: number
  create_time: string // "2020-08-26 16:34:26"
  custom_mark: string // ""
  didi_background: string // "b003"
  didi_disappear_point: string // "116.467896,40.115517"
  didi_event_point: string // "116.467903,40.115509"
  didi_front_arrow: string // "0aa0"
  didi_start_point: string // "116.467827,40.117756"
  didi_property: string
  diff_type: string // "2"
  display_tag: number
  geojson: string
  id: number
  lane_diff_record_id: number
  lane_issue_type: number
  last_operator: string // ""
  link_list: string // "147284531,279592601,279592591,279592591,279589741,279589731,279589731,16546421,279592260,279592260,279592270,165244120,90000596030020,90000596030020,90000595930340,438662290,279592541,279592531,164147550,200426480,707687510,707687510,90000332772610,90000332837060,164147640,164147680,707687650,707687660,164147870,833426741,164147810"
  mark_job_dispatch_id: number
  mark_job_id: number
  mark_job_verify_id: number
  owner: string // "test"
  path_consis: number
  rival_background: string // "10003"
  rival_disappear_point: string // "116.467957,40.118252"
  rival_front_arrow: string // "d0000"
  rival_start_point: string // "116.468369,40.118519"
  rival_property: string
  status: number
  update_time: string // "2020-08-27 17:00:24"
  verify_owner: string // ""
}

export interface LanelineEvaluationCaseRecordI {
  tag: number
  create_time: string // "2020-08-28 11:30:01"
  custom_mark: string // "hahadfdfd"
  display_tag: number
  id: number
  lane_issue_type: number
  lane_mark_job_record_id: number
  marker: string // "test"
  path_consis: number
  update_time: string // "2020-08-28 12:28:21"
  verifier: string // ""
  verify_comment: string // ""
}
