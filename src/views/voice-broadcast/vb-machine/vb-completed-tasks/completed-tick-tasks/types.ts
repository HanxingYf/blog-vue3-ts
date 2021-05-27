import { TickTaskDetailListResI } from '@/models/machine';

export interface TickTaskListRowI {
  id: number
  task_name: string
  create_time: string
  city: string
  creator: string
  task_num: number
}

export interface TickTaskDetailRowI {
  id: number
  link_list: string
  didi_code: string
  rival_code: string
  delta_act_start_dis: number
  delta_act_end_dis: number
  code_dis: number
  didi_surplus: number
  rival_surplus: number
  hot: number
  extra: TickTaskDetailListResI
}

