import { ContentAndHotCodeTaskDetailListResI } from '@/models/machine';

export interface ContentTaskRowI {
  id: number;
  task_name: string;
  create_time: string;
  city: string;
  min_link_level: number;
  creator: string;
  task_num: number;
  all_consisrate: string;
  main_consisrate: string;
  recall_rate: string;
}

export interface ContentTaskDetailRowI {
  id: number
  link_list: string
  result_of_comparison: string,
  didi_broadcast: string,
  competitive_broadcast: string,
  didi_assist1: string
  didi_assist2: string
  rival_assist1: string
  rival_assist2: string
  heat: string
  extra: ContentAndHotCodeTaskDetailListResI
}
