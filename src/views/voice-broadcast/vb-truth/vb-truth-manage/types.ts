import { TruthDatabaseListResItemI } from '@/models/truth';

export interface TruthListRowI {
  case_id: number;
  status: string | number;
  group_id: string;
  tts: string;
  assist: string;
  code_family: string;
  code: number;
  city_name: string | number;
  cross_kind: string | number;
  source: string | number;
  task_id: number;
  record_id: number;
  checker_name: string;
  extra: TruthDatabaseListResItemI
}

export interface TruthRecordRowI {
  id: number;
  operator: string;
  create_time: string;
  tts: string;
  assist: string;
  code_family: number;
}
