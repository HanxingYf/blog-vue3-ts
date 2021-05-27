import { EvaluationContentAndTickDetailListI } from '@/models/manager';

export interface EvaluationContentAndTickListRowI {
  id: number;
  job_name: string;
  create_time: string;
  city: string;
  nums: string;
  deadline_time: string;
  desc_of_evaluation: string;
  dispatch_type: number;
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
  original_links: string
  map_version: string,
  original_geojson: string,
  new_geojson: string
}

export interface EvaluationContentAndTickRecordRowI {
  content_err_reason: string
  content_err_type: string
  content_tag: number
  create_time: string
  custom_mark: string
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

