export interface ContentAndHotCodeTaskRunningListResI {
  id: number // 251
  taskid: string // 20200413095549_refactor-test
  tasktag: string // refactor-test
  progress: string // Running
  citycode: number // 0
  citylist: string // 1
  codenum: number // 1000
  ngservice: string // 10.89.123.12:10100
  minweight: number // 0
  maxweight: number // 8
  createtime: string // 2020-04-13T09:49:03+08:00
  updatetime: string // 2020-04-13T09:49:03+08:00
  creator: string // test
  completeCodeNum: number // 950
  city: string // 北京
  mainconsisrate: number // 0
  allconsisrate: number // 0
  recallrate: number // 0
  batchtasknum: number // 1
}

export interface TickTaskRunningListResI {
  id: number // 112
  task_name: string // 1586743604_refactor-test
  code_task_name: string // 20200412_1_3_2_4_dailyTask_online
  task_tag: string // refactor-test
  progress: string // Running
  city_id: number // 0
  city_list: string // 1,3,2,4
  city_name: string // 北京,广州,深圳,上海
  num: number // 50
  total_num: number // 807
  navi_api: string //
  creator: string // test
  create_time: string // 2020-04-13 09:59:58
  update_time: string // 2020-04-13 10:00:17
}

export interface ContentAndHotCodeTaskDetailListResI {
  id: number // 196459
  code_id: number // 569244
  task_id: number // 119
  city_code: number // 1
  city_name: string // 北京
  tag: string // same_all
  link_list: string // 6352350,398623720,320928310,320928320,6158500,298804320,320928250,320928260,6137330,6286620,6137400,320928230,320928240,6137380,706101440,90000869153720,90000869220710,398623910,90000592397090,90000592397110,90000591933190,90000592167800,90000591933230
  map_ver: string // 2019110318
  hot: number // 3074
  weight: number // 1
  rival_code: string // 10_38_6_11_12_12_81_靠左沿主路行驶,上坡
  rival_code_family: string // 二岔系列
  didi_code: string // 81_靠左行驶,上坡
  didi_code_family: string // 二岔系列
  rival_assist1: string // 上坡
  rival_assist2: string //
  didi_assist1: string // 上坡
  didi_assist2: string //
  geojson_rival: string // {type:FeatureCollection,features:[{
  geojson_didi: string // {type:FeatureCollection,features:[{
  create_time: string // 2019-11-05 00:00:13
}

export interface TickTaskDetailListResI {
  id: number // 5875
  voice_task_id: number // 13
  code_id: number // 69244
  geojson_didi: string // {type:FeatureCollection,features:[
  geojson_rival: string // {type:FeatureCollection,features:[
  city_code: number
  rival_act_start_time: number // 555461723
  rival_act_end_time: number // 555461726
  didi_act_start_time: number // 555461723
  didi_act_end_time: number // 555461725
  delta_act_start_time: number
  delta_act_end_time: number // -1
  rival_code_coor: string // 116.432259,39.908443
  didi_code_coor: string // 116.432216,39.908427
  code_dis: number // -4
  didi_act_start_coor: string // 116.431656,39.908421
  didi_act_end_coor: string // 116.431793,39.908421
  rival_act_start_coor: string // 116.431679,39.908432
  rival_act_end_coor: string // 116.431839,39.908421
  main_assi_end_coor: string // 116.431793,39.908421
  delta_act_start_dis: number
  delta_act_end_dis: number
  didi_surplus: number // 7
  rival_surplus: number // 4
  didi_tts: string //  靠左行驶,上坡
  rival_tts: string //  靠左沿主路行驶,上坡
  didi_code_fix_coor: string // 116.432213,39.908428
  weight: number
  hot: number // 074
  link_list: string // 6352350,398623720,
  mapVersion: string //  2019120418
  didi_code_family: string //  二岔系列
  rival_code_family: string //  二岔系列
  city_name: string //  北京
  traj_geojson: string //  {type:FeatureCollection,features:[{
  timing: {
    beginposofroute: {
      cooridx: number // 7
      geopoint: {
        lng: number // 2961070
        lat: number // 852641
      }
      shapeoffset: number
    }
    endposofroute: {
      cooridx: number
      geopoint: {
        lng: number
        lat: number
      },
      shapeoffset: number
    }
    order: number // 0
    validendlength: number // 43
  }
  check_timing: {
    beginposofroute: {
      cooridx: number // 17
      geopoint: {
        lng: number // 12961070
        lat: number // 4852641
      }
      shapeoffset: number // 7
    }
    endposofroute: {
      cooridx: number // 20
      geopoint: {
        lng: number // 12961180
        lat: number // 4852644
      }
      shapeoffset: number // 4
    }
  }
}

export interface CodeDiffTaskRunningListResI {
  id: number // 1
  task_name: string
  map_version: string // 2020042618
  data_version: string // code20200428_01
  creator: string // test
  create_time: string // 2020-04-29 18:15:55
  progress: string // Completed
  structure: string
  cities: string
  num: number // 59028
}

export interface CodeDiffTaskDetailListResI {
  id: number
  self_task_id: number
  city: string
  case_id: string // 270286600_270228940
  diff_type: string // CODE
  inlink_level: number
  outlink_level: number
  final_assi_code: string
  final_code: number
  ori_assi_code: string
  ori_code: number
  link_list: string // 270228940,121212
  create_time: string // 2020-04-29 18:16:26
  map_version: string
}

export interface ContentAndTickTaskRunningListResI {
  completed_num: number // 0
  create_time: string // "2021-05-18 19:19:32"
  creator: string // "test"
  id: number // 66
  jenkins_url: string // "http://jenkins.xiaojukeji.com/job/ng_diff_test/21/Test_Report/voice_fcross_timing.txt"
  new_host: string // "123"
  num: number // 16
  original_host: string // "123"
  progress: string // "Completed"
  task_name: string // "123"
  update_time: string // "2021-05-18 19:19:32"

}

export interface ContentAndTickTaskDetailResI {
  id: number,
  jenkins_task_id: number,
  new_code: number,
  online_code: number,
  start_pos: string,
  end_pos: string,
  map_version: number,
  new_json: string,
  new_links: string,
  original_json: string,
  original_links: string,
  original_tts: string,
  new_tts: string,
  new_geojson: string,
  original_geojson: string
}

