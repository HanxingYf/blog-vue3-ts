import { ManagerTickNormalMarkedListI } from '@/models/manager';

export interface ManagerTickTaskListRowI {
  id: number
  job_name: string
  create_time: string
  city: string
  code_filter: string
  deadline_time: string
  dispatch_count: number
  case_count: number
  status: number
}

export interface ManagerTickTaskMarkedListRowI {
  id: number;
  mark_job_id: number;
  voice_diff_record_id: number;
  update_time: string;
  path_consis: string;
  cross_type: string;
  weight: number;
  start_turning_dis: number;
  end_turning_dis: number;
  turning_dis: number;
  div_turning_dis: number;
  tag: string;
  custom_mark: string;
  issue_type1: string;
  issue_type2: string;
  last_operator: string;
  main_assi_end_coor: string;
  didi_tts: string;
  rival_tts: string;
  hot: number;
  status: number;
  geojson_didi: string;
  geojson_rival: string;
  didi_act_start_coor: string;
  didi_code_fix_coor: string;
  didi_act_end_coor: string;
  didi_code_coor: string;
  traj_geojson: string;
  rival_act_start_coor: string;
  rival_act_end_coor: string;
  rival_code_coor: string;
  turning_coor: string;
  auto_move: number;
  cross_sub_type: number;
  extra: ManagerTickNormalMarkedListI;
}

export interface DeliveryDetailListNumsI {
  verify_dispatch: string;
  mark_dispatch: string;
  circulation: string;
  total: number;
}

export interface DeliveryDetailListPersonI {
  dis_id: number
  type: number
  user_name: string;
  nums: string;
  disabled: boolean;
}
