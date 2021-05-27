import { EvaluationContentDetailListI } from '@/models/manager';

export interface EvaluationContentListRowI {
  id: number;
  job_name: string;
  create_time: string;
  city: string;
  nums: string;
  deadline_time: string;
  desc_of_evaluation: string;
  dispatch_type: number
  blind: number;
}

export interface EvaluationContentDetailListRowI {
  id: number
  record_id: number;
  result_of_comparison: string;
  left_broadcast: string;
  right_broadcast: string;
  heat: number;
  status: number;
  left_mark: string;
  right_mark: string;
  left_geo: string;
  right_geo: string;
  left_code_family: string;
  right_code_family: string;
  extra: EvaluationContentDetailListI;
}

export interface EvaluationContentRecordRowI {
  verifier: string;
  marker: string;
  update_time: string;
  expect_action: string;
  assist1: string;
  assist2: string;
  best_code: number;
  verify_comment: string;
}
