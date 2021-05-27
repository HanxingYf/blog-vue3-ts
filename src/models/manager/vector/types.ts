// ! TODO
export interface VectorJobListI {
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
  info: string // 自身对比 || 新旧版本盲评
  job_name: string // "测试"
  job_type: number
  status: number
  update_time: string // "2020-08-26 16:34:26"
  verify_dispatch_count: number
}

export interface VectorMarkedJobCaseListI {
  arrow_issue: number[]
  base_pic_a: string // "http://img-ys011.didistatic.com/static/navi_guide_dev/test-enlargeMap-50-280-a.png"
  base_pic_b: string // ""
  beauty: number
  beauty_arrow_issue: number[]
  beauty_road_issue: number[]
  better_version: number
  blind_test: number
  city_code: number
  city_name: string // "北京"
  create_time: string // "2020-11-05 10:39:16"
  custom_mark: string // ""
  enlarge_map_diff_record_id: number
  id: number
  in_link: string // "164603260,618010160,618010170"
  last_operator: string // "test"
  map_version: string // "2020102814"
  mark_job_dispatch_id: number
  mark_job_id: number
  mark_job_verify_id: number
  mark_pic_url: string // "http://img-ys011.didistatic.com/static/navi_guide_dev/16045607480558bb292c91f35a"
  other_issue: number[]
  out_link: string // "500617090,500617100"
  owner: string // "test"
  pass_link: string // ""
  road_issue: number[]
  should_recall: number
  show_range: number
  sort_site: number
  status: number
  tag: string // "1"
  update_time: string // "2020-11-05 15:07:02"
  verify_owner: string // ""
}

export interface VectorEvaluationListI {
  job_name: string // "测试enlargeMap下发40",
  admin: string // "test",
  info: string // "",
  code_filter: string // "",
  diff_res_filter: string // "",
  content_filter: string // "",
  city_filter: string // "",
  deadline: string // "2020-11-09 11:11:11",
  description: string // "",
  id: number // 224,
  mark_job_id: number // 276,
  task_type: number // 2,
  owner: string // "test",
  case_count: number // 1,
  create_time: string // "2020-10-23 13:17:05",
  update_time: string // "2020-10-23 13:37:41",
  comment: string // "",
  blind_test: number // 0,
  dispatch_type: number // 1,
  complete_count: number // 2,
  job_type: number // 5,
  block_id: string // ""
}

export interface VectorEvaluationCaseListI {
  arrow_issue: number[]
  base_pic_a: string // "http://img-ys011.didistatic.com/static/navi_guide_dev/test-enlargeMap-50-280-a.png"
  base_pic_b: string // ""
  beauty: number
  beauty_arrow_issue: number[]
  beauty_road_issue: number[]
  better_version: number
  blind_test: number
  city_code: number
  city_name: string // "北京"
  create_time: string // "2020-11-05 10:39:16"
  custom_mark: string // ""
  enlarge_map_diff_record_id: number
  id: number
  in_link: string // "164603260,618010160,618010170"
  last_operator: string // "test"
  map_version: string // "2020102814"
  mark_job_dispatch_id: number
  mark_job_id: number
  mark_job_verify_id: number
  mark_pic_url: string // "http://img-ys011.didistatic.com/static/navi_guide_dev/160456033025022df1d870c58e"
  other_issue: number[]
  out_link: string // "500617090,500617100"
  owner: string // "test"
  pass_link: string // ""
  road_issue: number[]
  should_recall: number
  show_range: number
  sort_site: number
  status: number
  tag: string // "1"
  update_time: string // "2020-11-05 15:00:05"
  verify_owner: string // ""
}

export interface VectorEvaluationCaseRecordI {
  id: number // 71,
  enlarge_map_mark_job_record_id: number // 66,
  marker: string // "test",
  verifier: string // "test",
  verify_comment: string // "准确性应为:mock;备注:custom_mark;",
  create_time: string // "2020-10-23 13:37:41",
  update_time: string // "2020-10-24 12:37:06",
  sort_site: number // 0,
  should_recall: number // 0,
  tag: number // 3,
  show_range: number // 0,
  road_issue: number[] // 0,
  arrow_issue: number[] // 0,
  other_issue: number[] // 0,
  beauty: number // 0,
  beauty_road_issue: number[] // 0,
  beauty_arrow_issue: number[] // 0,
  mark_pic_url: string // "0",
  custom_mark: string // "custom_mark"
}

export interface VectorMarkParamsI {
  tag: number | 2 // 1-准确 2-不准确
  sort_site?: number
  better_version?: number | 2 // 1-版本A好 2-版本B好
  should_recall: number | 2 // 1-召回 2-不召回
  show_range?: number | 2 // 1-偏大 2-偏小
  road_issue?: number | number[] // config.enlarge_map_issue_road
  arrow_issue?: number | number[] // config.enlarge_map_issue_arrow
  other_issue?: number | number[] // config.enlarge_map_issue_other
  beauty?: number | 2 // 1-美观 2-不美观
  beauty_road_issue?: number | number[] // config.enlarge_map_beauty_road
  beauty_arrow_issue?: number | number[] // config.enlarge_map_beauty_arrow
  mark_pic_url: string // 标注图片地址
  custom_mark?: string
}
