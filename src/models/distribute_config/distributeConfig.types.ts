import { ValueConfig } from '@/types';

export interface BaseConfigI {
  city_list: ValueConfig[] // [{label: "北京", value: 1}, {label: "深圳", value: 2}, {label: "广州", value: 3}, {label: "上海", value: 4},…]
  road_level: ValueConfig[] // [{label: "0", value: 0}, {label: "1", value: 1}, {label: "2", value: 2}, {label: "3", value: 3},…]
  machine_tag: ValueConfig[] // [{label: "动作语音缺失", value: "action_voice_miss"}, {label: "路口不同", value: "cross_not_same"},…]
  code_list: ValueConfig[] // [{label: "三岔系列", value: "三岔系列"}, {label: "二岔系列", value: "二岔系列"}, {label: "环岛系列", value: "环岛系列"},…]
  code_match: { [propName: string]: number[] } // {2fork: [10, 11, 12, 81, 83, 20, 21, 22, 82, 84], 3fork: [13, 14, 15, 23, 24, 25],…}
  manual_tag: ValueConfig[] // [{label: "未评价", value: 0}, {label: "两方都好", value: 1}, {label: "竞品好", value: 2},…]
  path_consis: ValueConfig[] // [{label: "一致", value: 0}, {label: "不一致", value: 1}]
  action: ValueConfig[] // [{label: "不提示", value: "0"}, {label: "直行", value: "1"},…]
  assist_action: ValueConfig[] // [{label: "无", value: 0}, {label: "进入主路", value: 10}, {label: "进入辅路", value: 11},…]
  cross_action: ValueConfig[] // [{label: "无", value: 0}, {label: "道路尽头", value: 20}, {label: "过高架后", value: 68},…]
  navi_api: ValueConfig[] // [{label: "线上", value: "100.70.178.24:9088"}, {label: "测试", value: "100.90.163.21:8008"},…]
  navi_ng: ValueConfig[] // [{label: "小流量", value: "10.89.123.12:10100"}, {label: "线上", value: "100.90.189.13:101000"},…]
  filter_type: ValueConfig[] // [{label: "滴滴", value: 1}, {label: "竞品", value: 2}, {label: "都有", value: 3}, {label: "都没有", value: 4},…]
  job_status: { [propName: number]: string } // {0: "未开始", 1: "已分配", 2: "标注中", 3: "已完成"}
  issue_type: ValueConfig[] // [{label: "路网问题", value: 1}, {label: "策略问题", value: 2}]
  road_issue_net: ValueConfig[] // [{label: "道路名称", value: 1}, {label: "通行方向", value: 2}, {label: "禁止穿行", value: 4},…]
  issue_solution: ValueConfig[] // [{label: "策略修复", value: 1}, {label: "强制诱导", value: 2}, {label: "维持现状", value: 3}]
  issue_status: ValueConfig[] // [{label: "未解决", value: 0}, {label: "定位中", value: 1}, {label: "无法处理", value: 2},…]
  truth_source: ValueConfig[] // [{label: "机评（相同）", value: 1}, {label: "人工标注", value: 2}, {label: "手动修改", value: 3}]
  truth_status: ValueConfig[] // [{label: "待继承", value: 2}, {label: "继承失败", value: 3}, {label: "已失效", value: 4}]
  job_type: ValueConfig[] // [{label: "所有", value: 0}, {label: "评测", value: 1}, {label: "质检", value: 2}]
  job_mark_status: ValueConfig[] // [{label: "所有", value: -1}, {label: "待评测", value: 0}, {label: "待质检", value: 1},…]
  job_verify_status: ValueConfig[] // [{label: "所有", value: -1}, {label: "待质检", value: 1}, {label: "被驳回", value: 2},…]
  cross_type: ValueConfig[] // [{label: "十字路口", value: 1}, {label: "Y字形路口", value: 2}, {label: "T型路口", value: 3},…]
  cross_sub_type_map: { [propName: number]: ValueConfig[] } // {1: [{label: "有停止线", value: 1}, {label: "没有停止线", value: 2}],…}
  cross_sub_type: ValueConfig[] // [{label: "无", value: 0}, {label: "有停止线", value: 1}, {label: "没有停止线", value: 2},…]
  voice_issue_type1: ValueConfig[] // [{label: "路网问题", value: 1}, {label: "策略问题", value: 2}, {label: "工具问题", value: 3},…]
  voice_issue_type2: ValueConfig[] // [{label: "无", value: 0}, {label: "长实线", value: 1}, {label: "路口前短实线", value: 2},…]
  voice_issue_road_type: ValueConfig[] // [{label: "长实线", value: 1}, {label: "路口前短实线", value: 2}, {label: "路口偏差", value: 3}]
  voice_issue_strategy_type: ValueConfig[] // [{label: "code位置", value: 4}, {label: "播报区间", value: 5}]
  voice_tag: ValueConfig[] // [{label: "合适", value: 1}, {label: "过早", value: 2}, {label: "过晚", value: 3}, {label: "无法确定", value: 4}]
  self_tag: ValueConfig[] // [{label: "Good", value: 1}, {label: "Same", value: 2}, {label: "Bad", value: 3},…]
  err_level: ValueConfig[] // [{label: "P0", value: 1}, {label: "P1", value: 2}, {label: "P2", value: 3}]
  all_code_action: ValueConfig[] // [{label: "无", value: "0"}, {label: "直行（不提示）", value: "1"}, {label: "向左前方行驶", value: "10"},…]
  self_diff_tag: ValueConfig[] // [{label: "ASSI_CODE", value: "ASSI_CODE"}, {label: "CODE", value: "CODE"},…]
  self_task_remind: string
  map_poi_type: { [propName: number]: string }
  lane_diff_type: ValueConfig[]
  lane_display_tag: ValueConfig[]
  lane_front_tag: ValueConfig[]
  lane_issue_type: ValueConfig[]
  lane_content_tag: ValueConfig[]
  lane_background_tag: ValueConfig[]
  // 矢量图相关
  enlarge_map_task_remind: string
  enlarge_map_diff_type: ValueConfig[]
  enlarge_map_better_version: ValueConfig[]
  enlarge_map_show_range: ValueConfig[]
  enlarge_map_should_recall: ValueConfig[]
  enlarge_map_beauty: ValueConfig[]
  enlarge_map_tag: ValueConfig[]
  enlarge_map_beauty_arrow: ValueConfig[]
  enlarge_map_beauty_road: ValueConfig[]
  enlarge_map_issue_arrow: ValueConfig[]
  enlarge_map_issue_other: ValueConfig[]
  enlarge_map_issue_road: ValueConfig[]
  enlarge_map_job_info: ValueConfig[]
  // jenkins
  jenkins_content_tag: ValueConfig[]
  jenkins_pos_tag: ValueConfig[]
}
