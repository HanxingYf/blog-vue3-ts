import { EvaluationTickDetailListI, TimingI, CheckTimingI } from '@/models/manager';

export interface EvaluationTickListRowI {
  id: number;
  job_name: string;
  create_time: string;
  city: string;
  nums: string;
  deadline_time: string;
  desc_of_evaluation: string;
  dispatch_type: number;
}

export interface EvaluationTickDetailListRowI {
  voice_diff_record_id: number;
  didi_tts: string;
  rival_tts: string;
  hot: number;
  status: number;
  extra: EvaluationTickDetailListI;
}

export interface EvaluationTickRecordRowI {
  verifier: string;
  marker: string;
  update_time: string;
  start_turning_dis: number;
  end_turning_dis: number;
  turning_dis: number;
  div_turning_dis: number;
  tag: string;
  verify_comment: string;
}

export interface LayerItemsI {
  didi_act_start_coor: string // 始
  didi_act_end_coor: string // 末
  didi_code_fix_coor: string // code
  geojson_rival: string // 竞品路线
  rival_act_start_coor: string // 5
  rival_act_end_coor: string // 6
  rival_code_coor: string // 4
  turning_coor: string // 转
  traj_geojson: string // 显示轨迹
  main_assi_end_coor: string // 主辅结束点
  timing: TimingI
  check_timing: CheckTimingI
}

export interface ContentAndTickLayerItemsI {
  original_json: string
  new_json: string
}

export interface ContentAndTickTimeingI {
  begin: {
    coor: number[]
    dis: number// 792.3140271106104
  }
  end: {
    coor: number[]
    dis: number
  }
}

export interface OriginalAndNewJsonI {
  priority: number
  timing: ContentAndTickTimeingI
  eventkind: number
  event_id: number
  checktiming: ContentAndTickTimeingI
  event: {
    infokind: number
    distanceKind: number
    trafficStatus: null
    sentence: Array<{
      prefixKind: number
      ttsContent: string // <distance def=\200米\>后,请沿左侧道路继续行驶,走左侧3车道,
      cond: any[]
      scene: number
    }>
    extra: object // null,
    begin: {
      coor: number[]
      dis: number // 989.2215582262274
    },
    ttscontents: string // null,
  }
}
