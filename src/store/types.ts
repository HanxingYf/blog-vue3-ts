import { RoadVersionI, UserInfoI } from '@/models/common';
import { BaseConfigI } from '@/models/distribute_config'

export interface RootStateI {
  baseConfig: BaseConfigI | null
  userInfo: UserInfoI
  roadNetVersions: RoadVersionI[]
}
