export interface ManagerContentOrTickOrCodeDiffNormalListI {
  id: number // 191
  job_name: string // sd
  code_diff_task_id: number // 255
  from_user: string // test
  admin: string // test
  case_count: number // 2
  dispatch_count: number // 0
  info: string
  code_filter: string
  diff_res_filter: string
  content_filter: string
  city_filter: string // 北京
  status: number // 0
  create_time: string // 2020-04-13 17:11:09
  update_time: string // 2020-04-13 17:11:09
  deadline: string // 2020-04-14 17:12:13
  description: string
  job_type: number // 0
  verify_dispatch_count: number // 0
}

export interface ManagerContentNormalMarkedListI {
  id: number
  mark_job_id: number
  mark_job_dispatch_id: number
  mark_job_verify_id: number
  code_diff_record_id: number
  tag: number
  rd_tag: number
  last_operator: string // test1
  custom_mark: string
  create_time: string // 2019-11-29 15:10:55
  update_time: string // 2019-11-29 18:45:54
  path_consis: number
  expect_action: string // 10_38_6_11_12_12_81
  assist1: number
  assist2: number
  cross_shape: number
  best_code: number
  sort_site: number
  issue_type: number
  issue_sub_type: number
  issue_point: string
  issue_status: number
  issue_info_id: number
  issue_info_origin_id: number
  issue_url: string
  issue_solution: number
  auto_move: number
  report_person: string
  code_id: number
  task_id: number
  city_code: number
  city_name: string // 北京
  diff_tag: string // same_all
  link_list: string // 6352350,398623720,320928310,320928320,6158500,298804320,320928250,320928260,6137330,6286620,6137400,320928230,320928240,6137380,706101440,90000869153720,90000869220710,398623910,90000592397090,90000592397110,90000591933190,90000592167800,90000591933230
  map_ver: string // 2019112018
  hot: number
  imported: number
  import_person: string
  status: number
  rival_code: string // 10_38_6_11_12_12_81_靠左沿主路行驶,上坡
  rival_code_family: string // 二岔系列
  didi_code: string // 81_靠左行驶,上坡
  didi_code_family: string // 二岔系列
  rival_assist1: string // 上坡
  rival_assist2: string
  didi_assist1: string // 上坡
  didi_assist2: string
  geojson_rival: string // {type:FeatureCollection,features:[{type:Fea
  geojson_didi: string // {type:FeatureCollection,features:[{type:Feature,
  owner: string // test
  blind_test: number
  verify_owner: string // test
}

export interface ManagerTickNormalMarkedListI {
  id: number
  mark_job_id: number
  mark_job_dispatch_id: number
  mark_job_verify_id: number
  voice_diff_record_id: number
  tag: number
  rd_tag: number
  path_consis: number
  cross_type: number
  cross_sub_type: number
  weight: number
  turning_coor: string // 121.52285715439626,29.848770217399206
  start_turning_dis: number
  end_turning_dis: number
  div_turning_dis: number
  turning_dis: number
  issue_type1: number
  issue_type2: number
  last_operator: string // helipinghlp
  custom_mark: string
  create_time: string // 2020-03-17 17:26:33
  update_time: string // 2020-03-24 12:30:17
  status: number
  auto_move: number
  code_id: number
  voice_task_id: number
  city_code: number
  city_name: string // 宁波
  hot: number
  geojson_didi: string // {type:FeatureCollection,features:[{type:Feature,
  geojson_rival: string // {type:FeatureCollection,features:[{type:Feature,
  link_list: string // 320910151,550817260,550817250,175720341,175720411,175720431,953752391,954164801,954164791,85684231,431964021,431964011
  didi_tts: string // 靠左行驶,不要上坡
  rival_tts: string // 靠左沿辅路行驶,请注意不要驶入公交车道
  didi_act_start_coor: string // 121.523232,29.848284
  didi_act_end_coor: string // 121.522957,29.848501
  rival_act_start_coor: string // 121.523224,29.848408
  rival_act_end_coor: string // 121.522873,29.848587
  main_assi_end_coor: string
  code_dis: number
  didi_code_coor: string // 121.523023,29.848455
  rival_code_coor: string // 121.522781,29.848772
  didi_code_fix_coor: string // 121.523026,29.848455
  traj_geojson: string // {type:FeatureCollection,features:[{type:Feature,geometry:{type:Point,coordinates:[121.52558,29.84621]},properties:{Accuracy:6.429999828338623,Direction:316,TimeStamp:1560326473,Velocity:13.229999542236328}},{type:Feature,geometry:{type:Point,coordinates:[121.5253,29.846468]},properties:{Accuracy:6.429999828338623,Direction:316,TimeStamp:1560326476,Velocity:13.039999961853027}},{type:Feature,geometry:{type:Point,coordinates:[121.52503,29.846727]},properties:{Accuracy:8.569999694824219,Direction:316,TimeStamp:1560326479,Velocity:11.989999771118164}},{type:Feature,geometry:{type:Point,coordinates:[121.52482,29.846935]},properties:{Accuracy:9.640000343322754,Direction:316,TimeStamp:1560326482,Velocity:10.180000305175781}},{type:Feature,geometry:{type:Point,coordinates:[121.52457,29.84707]},properties:{Accuracy:11.789999961853027,Direction:310,TimeStamp:1560326485,Velocity:8.890000343322754}},{type:Feature,geometry:{type:Point,coordinates:[121.524345,29.847265]},properties:{Accuracy:11.789999961853027,Direction:318,TimeStamp:1560326488,Velocity:10.520000457763672}},{type:Feature,geometry:{type:Point,coordinates:[121.52417,29.847448]},properties:{Accuracy:11.789999961853027,Direction:316,TimeStamp:1560326491,Velocity:7.139999866485596}},{type:Feature,geometry:{type:Point,coordinates:[121.52408,29.847527]},properties:{Accuracy:10.720000267028809,Direction:315,TimeStamp:1560326494,Velocity:1.8600000143051147}},{type:Feature,geometry:{type:Point,coordinates:[121.52407,29.847536]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326497,Velocity:1.190000057220459}},{type:Feature,geometry:{type:Point,coordinates:[121.52408,29.847534]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326500,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52409,29.847534]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326503,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52411,29.847534]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326506,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52412,29.847532]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326509,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.524124,29.84753]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326512,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847528]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326515,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847527]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326518,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847528]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326521,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847527]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326524,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847527]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326527,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847525]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326530,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.84752]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326533,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847525]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326536,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.84752]},properties:{Accuracy:13.930000305175781,Direction:0,TimeStamp:1560326539,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.84752]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326542,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847525]},properties:{Accuracy:12.859999656677246,Direction:0,TimeStamp:1560326545,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847532]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326548,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.847532]},properties:{Accuracy:10.720000267028809,Direction:0,TimeStamp:1560326551,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847536]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326554,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847534]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326557,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847544]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326560,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847536]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326563,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847538]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326566,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52414,29.847538]},properties:{Accuracy:11.789999961853027,Direction:0,TimeStamp:1560326569,Velocity:0}},{type:Feature,geometry:{type:Point,coordinates:[121.52413,29.84754]},properties:{Accuracy:11.789999961853027,Direction:316,TimeStamp:1560326572,Velocity:0.36000001430511475}},{type:Feature,geometry:{type:Point,coordinates:[121.52408,29.847588]},properties:{Accuracy:10.720000267028809,Direction:318,TimeStamp:1560326575,Velocity:3.609999895095825}},{type:Feature,geometry:{type:Point,coordinates:[121.52398,29.847681]},properties:{Accuracy:10.720000267028809,Direction:316,TimeStamp:1560326578,Velocity:4.880000114440918}},{type:Feature,geometry:{type:Point,coordinates:[121.52386,29.84779]},properties:{Accuracy:10.720000267028809,Direction:317,TimeStamp:1560326581,Velocity:6.71999979019165}},{type:Feature,geometry:{type:Point,coordinates:[121.523674,29.84794]},properties:{Accuracy:9.640000343322754,Direction:314,TimeStamp:1560326584,Velocity:10.039999961853027}},{type:Feature,geometry:{type:Point,coordinates:[121.52344,29.848131]},properties:{Accuracy:9.640000343322754,Direction:313,TimeStamp:1560326587,Velocity:10.649999618530273}},{type:Feature,geometry:{type:Point,coordinates:[121.523186,29.84836]},properties:{Accuracy:10.720000267028809,Direction:314,TimeStamp:1560326590,Velocity:12.520000457763672}},{type:Feature,geometry:{type:Point,coordinates:[121.52289,29.848602]},properties:{Accuracy:10.720000267028809,Direction:312,TimeStamp:1560326593,Velocity:13.649999618530273}},{type:Feature,geometry:{type:Point,coordinates:[121.522545,29.848866]},properties:{Accuracy:10.720000267028809,Direction:310,TimeStamp:1560326596,Velocity:15.420000076293945}},{type:Feature,geometry:{type:Point,coordinates:[121.52215,29.849148]},properties:{Accuracy:10.720000267028809,Direction:307,TimeStamp:1560326599,Velocity:16.709999084472656}},{type:Feature,geometry:{type:Point,coordinates:[121.52189,29.849329]},properties:{Accuracy:11.789999961853027,Direction:306,TimeStamp:1560326602,Velocity:16.489999771118164}},{type:Feature,geometry:{type:Point,coordinates:[121.521324,29.849674]},properties:{Accuracy:11.789999961853027,Direction:303,TimeStamp:1560326605,Velocity:17.290000915527344}},{type:Feature,geometry:{type:Point,coordinates:[121.52085,29.849928]},properties:{Accuracy:12.859999656677246,Direction:300,TimeStamp:1560326608,Velocity:17.479999542236328}},{type:Feature,geometry:{type:Point,coordinates:[121.52038,29.850163]},properties:{Accuracy:13.930000305175781,Direction:298,TimeStamp:1560326611,Velocity:17.700000762939453}},{type:Feature,geometry:{type:Point,coordinates:[121.51985,29.850409]},properties:{Accuracy:13.930000305175781,Direction:297,TimeStamp:1560326614,Velocity:19.440000534057617}}]}
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
  owner: string // dzdaizhen_v
  verify_owner: string // yandongdong_v
}

export interface EvaluationContentOrTickOrCodeDiffListI {
  job_name: string // test_wang1206
  admin: string // test
  info: string
  code_filter: string
  diff_res_filter: string
  content_filter: string
  city_filter: string // 北京,深圳,广州,上海
  deadline: string // 2019-12-07 23:59:09
  description: string
  id: number
  mark_job_id: number
  task_type: number
  owner: string // test
  case_count: number
  create_time: string // 2020-03-23 18:01:05
  update_time: string // 2020-03-23 18:01:05
  comment: string
  blind_test: number
  dispatch_type: number
  complete_count: number
  job_type: number
}

export interface EvaluationContentDetailListI {
  id: number
  mark_job_id: number
  mark_job_dispatch_id: number
  mark_job_verify_id: number
  code_diff_record_id: number
  tag: number
  rd_tag: number
  last_operator: string // test
  custom_mark: string
  create_time: string // 2019-12-06 23:56:12
  update_time: string // 2020-03-23 18:01:05
  path_consis: number
  expect_action: string // 1
  assist1: number
  assist2: number
  cross_shape: number
  best_code: number
  sort_site: number
  err_level: number
  issue_type: number
  issue_sub_type: number
  issue_point: string
  issue_status: number
  issue_info_id: number
  issue_info_origin_id: number
  issue_url: string
  issue_solution: number
  auto_move: number
  report_person: string
  code_id: number
  task_id: number
  city_code: number
  city_name: string // 广州
  diff_tag: string // same_all
  link_list: string // 15815191,154234131,154234121,15770591,15770581,710178621,710178611,154234561,710178581,710178571,15723390,15723400,15831930,15712670,15831970,15831980
  map_ver: string // 2019120418
  hot: number
  imported: number
  import_person: string
  status: number
  rival_code: string // 3_右转,,进入主路
  rival_code_family: string // 简单动作系列
  didi_code: string // 3_右转,进入主路
  didi_code_family: string // 简单动作系列
  rival_assist1: string // 进入主路
  rival_assist2: string
  didi_assist1: string // 进入主路
  didi_assist2: string
  geojson_rival: string // {type:FeatureCollection,features:[
  geojson_didi: string // {type:FeatureCollection,features:[
  owner: string // test
  blind_test: number
  verify_owner: string // test
}

export interface EvaluationTickDetailListI {
  id: number
  mark_job_id: number
  mark_job_dispatch_id: number
  mark_job_verify_id: number
  voice_diff_record_id: number
  tag: number
  rd_tag: number
  path_consis: number
  cross_type: number
  cross_sub_type: number
  weight: number
  turning_coor: string // 116.49584247884418,39.915558614057076
  start_turning_dis: number
  end_turning_dis: number
  div_turning_dis: number
  turning_dis: number
  issue_type1: number
  issue_type2: number
  last_operator: string // test
  custom_mark: string
  create_time: string // 2020-01-14 15:41:30
  update_time: string // 2020-01-17 15:45:47
  status: number
  auto_move: number
  code_id: number
  voice_task_id: number
  city_code: number
  city_name: string // 北京
  hot: number
  geojson_didi: string // {type:FeatureCollection,features:[{type:Feature,geometry:{type:LineString,coordinates:[[116.49009,39.91543],[116.49055,39.91543],[116.49123,39.91545],[116.49202,39.91548],[116.49202,39.91548],[116.49317,39.9155],[116.49378,39.9155],[116.49586,39.91558],[116.49595,39.9155],[116.49595,39.9155],[116.49617,39.9155],[116.49805,39.91556],[116.49814,39.91556],[116.49902,39.91558],[116.49937,39.91559]]},properties:{linkList:6174341,6330041,6088651,300053641,300053631,6203860,5907780,300051670,300051680,322460960,322460970}},{type:Feature,geometry:{type:Point,coordinates:[116.49588863003312,39.91558573727241]},properties:{tts:向右前方行驶,进入辅路,code:21,originTts:向右前方行驶,进入辅路}}]}
  geojson_rival: string // {type:FeatureCollection,features:[{type:Feature,geometry:{type:LineString,coordinates:[[116.49009704589844,39.91550064086914],[116.49055480957031,39.91548538208008],[116.4912338256836,39.915489196777344],[116.49202728271484,39.91550827026367]]},properties:{geo:116.490097,39.915501;116.490555,39.915485;116.491234,39.915489;116.492027,39.915508,road_name:朝阳路,have_traffic_light:0,form_way:1,name:inLink0,road_class:1,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:0}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49202728271484,39.91550827026367],[116.49317932128906,39.915523529052734]]},properties:{geo:116.492027,39.915508;116.493179,39.915524,road_name:朝阳路,have_traffic_light:0,form_way:1,name:inLink1,road_class:1,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:1}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49317932128906,39.915523529052734],[116.49378204345703,39.91554260253906]]},properties:{geo:116.493179,39.915524;116.493782,39.915543,road_name:朝阳路,have_traffic_light:0,form_way:1,name:inLink2,road_class:1,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:2}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49378204345703,39.91554260253906],[116.49586486816406,39.91560745239258],[116.49595642089844,39.91550064086914]]},properties:{geo:116.493782,39.915543;116.495865,39.915607;116.495956,39.915501,road_name:朝阳路,have_traffic_light:1,form_way:1,name:inLink3,road_class:1,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:3}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49595642089844,39.91550064086914],[116.49617004394531,39.91550827026367]]},properties:{geo:116.495956,39.915501;116.496170,39.915508,road_name:朝阳路辅路,have_traffic_light:0,form_way:7,name:outLink,road_class:8,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:4}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49617004394531,39.91550827026367],[116.49806213378906,39.915565490722656],[116.49815368652344,39.915565490722656]]},properties:{geo:116.496170,39.915508;116.498062,39.915565;116.498154,39.915565,road_name:朝阳路辅路,have_traffic_light:0,form_way:7,name:outLink,road_class:8,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:5}},{type:Feature,geometry:{type:LineString,coordinates:[[116.49815368652344,39.915565490722656],[116.4990234375,39.915584564208984],[116.4993896484375,39.91559982299805]]},properties:{geo:116.498154,39.915565;116.499023,39.915585;116.499390,39.915600,road_name:朝阳路辅路,have_traffic_light:0,form_way:7,name:outLink,road_class:8,pathid:TWpnNE56a3pNemN3T0RBMU1UazJOalV6_1555476171593,idx:6}},{type:Feature,geometry:{type:Point,coordinates:[116.49586486816406,39.91560745239258]},properties:{coor:116.495865,39.915607,code:5,pre_action:,tts:向右前方行驶,originTts:向右前方行驶,进入朝阳路辅路,assist2:,assist1:,name:code,action:向右前方行驶,position:,idx:0,key:116.495865,39.915607_5_87,didi_code:20,48,7,21,22,22,82,icon_type:5,roadname:}},{type:Feature,geometry:{type:Point,coordinates:[116.49545288085938,39.91559600830078]},properties:{coor:116.495453,39.915596,traj:1555477025,116.49053,39.91546,10.0,10.74,92.0,0;1555477028,116.490906,39.91547,10.0,10.22,90.0,0;1555477031,116.491264,39.915466,10.0,10.36,89.0,0;1555477034,116.49165,39.91545,10.0,11.22,88.0,0;1555477037,116.49199,39.91547,10.0,9.59,88.0,0;1555477040,116.49238,39.91552,10.0,12.65,85.0,0;1555477043,116.49281,39.91552,10.0,10.92,91.0,0;1555477046,116.49319,39.915512,10.0,10.15,92.0,0;1555477049,116.49355,39.91551,10.0,10.27,91.0,0;1555477051,116.49393,39.915512,10.0,10.62,88.0,0;1555477055,116.49431,39.915524,10.0,11.4,87.0,0;1555477058,116.4947,39.91553,10.0,11.21,87.0,0;1555477061,116.49516,39.91553,10.0,14.36,91.0,0;1555477064,116.49563,39.91553,10.0,12.31,87.0,0;1555477067,116.49608,39.915516,10.0,13.55,93.0,0;1555477070,116.49657,39.915516,10.0,14.11,86.0,0;1555477073,116.49705,39.915535,10.0,13.38,87.0,0;1555477076,116.49752,39.91554,10.0,12.78,87.0,0;1555477079,116.49794,39.91555,10.0,11.55,87.0,0;1555477082,116.49833,39.915565,10.0,10.87,88.0,0;1555477085,116.49872,39.91557,10.0,10.91,88.0,0,tts:向右前方行驶,originTts:向右前方行驶,进入朝阳路辅路,name:tts,idx:1,timestamp:1555477062488}}]}
  link_list: string // 6174341,6330041,6088651,300053641,300053631,6203860,5907780,300051670,300051680,322460960,322460970
  didi_tts: string // 向右前方行驶,进入辅路
  rival_tts: string // 向右前方行驶
  didi_act_start_coor: string // 116.494820,39.915539
  didi_act_end_coor: string // 116.495293,39.915565
  rival_act_start_coor: string // 116.495453,39.915596
  rival_act_end_coor: string // 116.495628,39.915581
  main_assi_end_coor: string // 116.495293,39.915565
  code_dis: number
  didi_code_coor: string // 116.495889,39.915586
  rival_code_coor: string // 116.495865,39.915607
  didi_code_fix_coor: string // 116.495651,39.915581
  traj_geojson: string // {type:FeatureCollection,features:[{type:Feature,geometry:{type:Point,coordinates:[116.49053,39.91546]},properties:{Accuracy:10,Direction:92,TimeStamp:1555477025,Velocity:10.739999771118164}},{type:Feature,geometry:{type:Point,coordinates:[116.490906,39.91547]},properties:{Accuracy:10,Direction:90,TimeStamp:1555477028,Velocity:10.220000267028809}},{type:Feature,geometry:{type:Point,coordinates:[116.491264,39.915466]},properties:{Accuracy:10,Direction:89,TimeStamp:1555477031,Velocity:10.359999656677246}},{type:Feature,geometry:{type:Point,coordinates:[116.49165,39.91545]},properties:{Accuracy:10,Direction:88,TimeStamp:1555477034,Velocity:11.220000267028809}},{type:Feature,geometry:{type:Point,coordinates:[116.49199,39.91547]},properties:{Accuracy:10,Direction:88,TimeStamp:1555477037,Velocity:9.59000015258789}},{type:Feature,geometry:{type:Point,coordinates:[116.49238,39.91552]},properties:{Accuracy:10,Direction:85,TimeStamp:1555477040,Velocity:12.649999618530273}},{type:Feature,geometry:{type:Point,coordinates:[116.49281,39.91552]},properties:{Accuracy:10,Direction:91,TimeStamp:1555477043,Velocity:10.920000076293945}},{type:Feature,geometry:{type:Point,coordinates:[116.49319,39.915512]},properties:{Accuracy:10,Direction:92,TimeStamp:1555477046,Velocity:10.149999618530273}},{type:Feature,geometry:{type:Point,coordinates:[116.49355,39.91551]},properties:{Accuracy:10,Direction:91,TimeStamp:1555477049,Velocity:10.270000457763672}},{type:Feature,geometry:{type:Point,coordinates:[116.49393,39.915512]},properties:{Accuracy:10,Direction:88,TimeStamp:1555477051,Velocity:10.619999885559082}},{type:Feature,geometry:{type:Point,coordinates:[116.49431,39.915524]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477055,Velocity:11.399999618530273}},{type:Feature,geometry:{type:Point,coordinates:[116.4947,39.91553]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477058,Velocity:11.210000038146973}},{type:Feature,geometry:{type:Point,coordinates:[116.49516,39.91553]},properties:{Accuracy:10,Direction:91,TimeStamp:1555477061,Velocity:14.359999656677246}},{type:Feature,geometry:{type:Point,coordinates:[116.49563,39.91553]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477064,Velocity:12.3100004196167}},{type:Feature,geometry:{type:Point,coordinates:[116.49608,39.915516]},properties:{Accuracy:10,Direction:93,TimeStamp:1555477067,Velocity:13.550000190734863}},{type:Feature,geometry:{type:Point,coordinates:[116.49657,39.915516]},properties:{Accuracy:10,Direction:86,TimeStamp:1555477070,Velocity:14.109999656677246}},{type:Feature,geometry:{type:Point,coordinates:[116.49705,39.915535]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477073,Velocity:13.380000114440918}},{type:Feature,geometry:{type:Point,coordinates:[116.49752,39.91554]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477076,Velocity:12.779999732971191}},{type:Feature,geometry:{type:Point,coordinates:[116.49794,39.91555]},properties:{Accuracy:10,Direction:87,TimeStamp:1555477079,Velocity:11.550000190734863}},{type:Feature,geometry:{type:Point,coordinates:[116.49833,39.915565]},properties:{Accuracy:10,Direction:88,TimeStamp:1555477082,Velocity:10.869999885559082}},{type:Feature,geometry:{type:Point,coordinates:[116.49872,39.91557]},properties:{Accuracy:10,Direction:88,TimeStamp:1555477085,Velocity:10.90999984741211}}]}
  timing: TimingI
  check_timing: CheckTimingI
  owner: string // test
  verify_owner: string // test
}

export interface TimingI {
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

export interface CheckTimingI {
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

export interface EvaluationContentRecordI {
  id: number
  mark_job_record_id: number
  tag: number
  marker: string // test
  verifier: string
  custom_mark: string
  path_consis: number
  expect_action: string // 1
  assist1: number
  assist2: number
  cross_shape: number
  best_code: number
  verify_comment: string
  create_time: string // 2020-02-21 09:48:43
  update_time: string // 2020-02-25 19:10:13
}

export interface EvaluationTickRecordI {
  id: number
  mark_job_record_id: number
  marker: string // test
  verifier: string
  verify_comment: string
  create_time: string // 2020-04-15 16:52:05
  update_time: string // 2020-04-15 16:52:05
  path_consis: number
  cross_type: number
  cross_sub_type: number
  weight: number
  turning_coor: string // 116.4362827419719,39.90815678012696
  start_turning_dis: number
  end_turning_dis: number
  div_turning_dis: number
  turning_dis: number
  tag: number
  custom_mark: string
  issue_type1: number
  issue_type2: number
}

export interface EvaluationCodeDiffRecordI {
  id: number,
  self_mark_job_record_id: number,
  marker: string // test,
  verifier: string // test,
  verify_comment: string // GSB应为:Good;自定义标记应为:哈哈哈;code真值应为:2;辅助动作真值应为:1,2;
  create_time: string // 2020-05-07 20:31:38
  update_time: string // 2020-05-07 20:54:21
  tag: number
  err_level: number
  truth_code: number
  truth_assi_code1: string // 2
  truth_assi_code2: string // 2
  custom_mark: string // 哈哈哈
}

export interface ManagerCodeDiffNormalMarkedListI {
  id: number // 1
  mark_job_id: number,
  self_diff_record_id: number
  mark_job_dispatch_id: number,
  mark_job_verify_id: number,
  tag: number,
  create_time: string // 2020-05-07 15:24:10,
  update_time: string // 2020-05-08 13:00:33,
  last_operator: string // test,
  status: number,
  err_level: number // -1,
  truth_code: number,
  truth_assi_code: string // 1,2,
  custom_mark: string // 哈哈哈,
  city: string // ,
  case_id: string // 90000230591731_90000230591751,
  diff_type: string // CODE,
  inlink_level: number,
  outlink_level: number,
  final_assi_code: string // 42,
  final_code: number,
  ori_assi_code: string // 40,
  ori_code: number,
  link_list: string // 90000230591731,90000230591751,
  owner: string // test,
  blind_test: number,
  verify_owner: string
  map_version: string
}

export interface EvaluationCodeDiffDetailListI {
  id: number
  mark_job_id: number
  self_diff_record_id: number
  mark_job_dispatch_id: number
  mark_job_verify_id: number
  tag: number
  create_time: string
  update_time: string
  last_operator: string
  status: number
  err_level: number // -1
  truth_code: number // -1
  truth_assi_code1: string
  truth_assi_code2: string
  custom_mark: string
  city: string
  case_id: string
  diff_type: string
  inlink_level: number
  outlink_level: number
  final_assi_code: string
  final_code: number
  ori_assi_code: string
  ori_code: number
  link_list: string
  owner: string
  blind_test: number
  verify_owner: string
  map_version: string
}

export interface EvaluationContentAndTickfDetailListI {
  id: number,
  job_name: string,
  code_diff_task_id: number,
  from_user: string,
  admin: string,
  case_count: number,
  dispatch_count: number,
  info: string,
  code_filter: string,
  diff_res_filter: string,
  content_filter: string,
  city_filter: string,
  status: number,
  create_time: string,
  update_time: string,
  deadline: string,
  description: string,
  job_type: number,
  verify_dispatch_count: number,
  block_count: number,
  block_dispatch_count: number,
  blocks: object
}

export interface EvaluationContentAndTickListI {
  job_name: string,
  info: string,
  code_filter: string,
  diff_res_filter: string,
  content_filter: string,
  city_filter: string,
  deadline: string,
  description: string,
  id: number,
  mark_job_id: number
  task_type: number
  owner: string,
  case_count: number,
  create_time: string,
  update_time: string,
  comment: string,
  blind_test: number,
  dispatch_type: number,
  complete_count: number,
  job_type: number,
  block_id: number
}

export interface EvaluationContentAndTickDetailListI {
  id: number,
  mark_job_id: number,
  jenkins_diff_record_id: number,
  mark_job_dispatch_id: number,
  mark_job_verify_id: number,
  create_time: string,
  update_time: string,
  last_operator: string,
  status: number,
  custom_mark: string,
  content_tag: number,
  content_err_type: string,
  content_err_reason: string,
  pos_tag: number,
  pos_err_type: string,
  pos_err_reason: string,
  start_pos: string,
  end_pos: string,
  pass_link: string,
  original_json: string,
  new_json: string,
  original_tts: string,
  new_tts: string,
  owner: string,
  blind_test: number,
  verify_owner: string,
  new_links: string,
  original_links: string,
  map_version: string
  original_geojson: string
  new_geojson: string
}

export interface EvaluationContentAndTickDetailListRowI {
  id: number,
  mark_job_id: number,
  jenkins_diff_record_id: number,
  mark_job_dispatch_id: number,
  mark_job_verify_id: number,
  create_time: string,
  update_time: string,
  last_operator: string,
  status: string,
  custom_mark: string,
  content_tag: number,
  content_err_type: string,
  content_err_reason: string,
  pos_tag: number,
  pos_err_type: string,
  pos_err_reason: string,
  start_pos: string,
  end_pos: string,
  pass_link: string,
  original_json: string,
  new_json: string,
  original_tts: string,
  new_tts: string,
  owner: string,
  blind_test: number,
  verify_owner: string,
  new_links: string,
  original_links: string,
  map_version: string
  original_geojson: string
  new_geojson: string
}


export interface ManagerContentAndTickNormalMarkedListI {
  id: number,
  mark_job_id: number,
  jenkins_diff_record_id: number,
  mark_job_dispatch_id: number,
  mark_job_verify_id: number,
  create_time: string,
  update_time: string,
  last_operator: string,
  status: number,
  custom_mark: string,
  content_tag: number,
  content_err_type: string,
  content_err_reason: string,
  pos_tag: number,
  pos_err_type: string,
  pos_err_reason: string,
  start_pos: string,
  end_pos: string,
  pass_link: string,
  original_json: string
  original_links: string
  new_links: string,
  new_json: string
  original_tts: string
  new_tts: string
  owner: string,
  blind_test: number,
  verify_owner: string,
  map_version: string,
  original_geojson: string
  new_geojson: string
}


export interface EvaluationContentAndTickRecordI {
  content_err_reason: string
  content_err_type: string
  content_tag: number
  custom_mark: string
  create_time: string
  id: number
  jenkins_mark_job_record_id: number
  marker: string
  pos_err_reason: string
  pos_err_type: string
  pos_tag: number
  update_time: string
  verifier: string
  verify_comment: string
}

