export interface TaskListI {
  city_list: string // "1,2"
  city_name: string // "北京,深圳"
  create_time: string // "2020-08-23 18:09:53"
  update_time: string // "2020-08-23 18:09:53"
  creator: string // "test"
  id: number // 91
  num: number // 200
  progress: string // "Running"
  task_name: string // "auto_lane_task"
  version_a: string
  version_b: string
  task_type: string  // 自身对比 || 新旧版本盲评
}

export interface TaskCaseListI {
  base_pic_a: string // "http://img-ys011.didistatic.com/static/navi_guide_dev/test-enlargeMap-65-50-a.png"
  base_pic_b: string // ""
  city_code: string // "1"
  city_name: string // "北京"
  create_time: string // "2020-11-06 16:11:00"
  enlarge_map_task_id: number
  id: number
  in_link: string // "145317850"
  map_version: string // "2020102814"
  out_link: string // "4570550,4570531,6030225151"
  pass_link: string // ""
}
