export interface UserInfoI {
  username: string
  flags: FlagI[]
}

export interface FlagI {
  appId: number // 2442
  createAt: string // ""
  id: number // 418878
  name: string // "nc_task"
  nameZh: string // "机评页面"
  pid: number // 0
  rank: number // 0
  status: number // 1
  updateAt: string // ""
}

export interface RoadVersionI {
  id: number // 288
  version: string // "2020040324"
  date: string // "2020-04-07T13:28:33.000Z"
  status: number // 0
  publish_date: string | null
  delete_date: string | null
  use_status: number // 0
  preserve: number // 0
}

export interface MissionResI {
  message: string
  mission_list: MissionI[]
  ret: number
}

export interface MissionI {
  update_time: string // "2019-09-03 15:26:26"
  time_range: string // "00:00-24:00"
  finished: number // 1
  create_time: string // "2019-09-03 15:15:53"
  expire_time: string // "2019-09-04 15:15:53"
  quality_control: string // "{"quality": 50}"
  job_id: number // 56
  seq_num: number // 1
  mid: number // 206963525
  first_finish_time: string // "2019-09-03 15:26:26"
  geom: string // "{"type": "LineString", "coordinates": [[113.31365203857422, 23.104000091552734], [113.31368255615234, 23.103620529174805]]}"
  finished_times: number // 1
  group_id: number // 59188943
  resource_type: number // 0
  collection_time: string // "2019-09-03 15:26:26"
}

export interface MissionPicI {
  callback_context: string // ""
  check_traj: number // 1
  city: string // "广州市"
  collect_interval: number // 5
  collection_infos: Array<{
    resource_info: {
      features: Array<{
        geometry: {
          coordinates: number[]
          type: string
        }
        properties: { url: string, direction: number }
        type: string
      }>
      type: string
    }
  }>
  create_time: string // "2020-04-01T03:52:52"
  delete_flag: number // 0
  expire_time: string // "2020-05-06T00:00:00"
  finished: number // 1
  finished_times: number // 1
  first_finish_time: string // "2020-04-08T09:15:35"
  group_id: number // 346253076
  job_id: number // 250
  level: number // 2
  mid: number // 587957968
  mission_length: number // 143.94
  recollect_times: number // 0
  resource_type: number // 0
  seq_num: number // 1
  start_time: string // "2020-04-07T00:00:00"
  time_range: string // "09:00-16:00"
  update_time: string // "2020-04-08T09:15:34"
  use_backtrack: number // 0
  use_mm_traj: number // 1
}
