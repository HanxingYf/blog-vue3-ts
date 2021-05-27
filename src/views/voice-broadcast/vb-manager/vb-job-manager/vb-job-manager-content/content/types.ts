import { ManagerContentNormalMarkedListI } from '@/models/manager';

export interface ManagerContentTaskListRowI {
  id: number
  job_name: string
  create_time: string
  city: string
  result_of_comparison: string
  filter_of_code: string
  filter_of_description: string
  nums: number
  deadline_time: string
  desc_of_evaluation: string
  dispatch_count: number
  status: number
}

export interface ManagerContentTaskMarkedListRowI {
  id: number
  code_diff_record_id: number;
  evaluation_time: string;
  consistent_of_route: string;
  conclusion: string;
  action_of_expectation: string;
  action_of_auxiliary_1: string;
  action_of_auxiliary_2: string;
  intersection: string;
  best_code: number;
  left_mark: string;
  right_mark: string;
  left_geo: string;
  right_geo: string;
  left_code_family: string;
  right_code_family: string;
  note: string;
  auto_move: string;
  issue_type: string;
  issue_status: string;
  issue_sub_type: string;
  issue_solution: string;
  last_operator: string;
  extra: ManagerContentNormalMarkedListI;
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
