
export interface ManagerContentAndTickTaskListRowI {
  id: number
  job_name: string
  create_time: string
  admin: string
  deadline_time: string
  update_time: string
  dispatch_count: number
  case_count: number
  status: number
  description: string
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

export interface DeliveryDetailListVertifyPersonI {
  dis_id: number
  type: number
  job_name: string;
  dispatch_count: string;
  disabled: boolean;
}

export interface ManagerContentAndTickNormalMarkedRowI {
  id: number,
  mark_job_id: number,
  jenkins_diff_record_id: number,
  mark_job_dispatch_id: number,
  mark_job_verify_id: number,
  create_time: string,
  update_time: string,
  last_operator: string,
  content_tag: string,
  content_err_type: string,
  content_err_reason: string,
  pos_tag: string,
  pos_err_type: string,
  pos_err_reason: string,
  original_json: string,
  new_json: string,
  original_links: string,
  new_links: string,
  original_tts: string,
  new_tts: string,
  map_version: string,
  original_geojson: string
  new_geojson: string
}

export interface ContentStatisticsRowI {
  version: string,
  num: number
  percent: string
}

export interface TickStatisticsRowI {
  pos: string,
  num: number,
  percent: string
}
