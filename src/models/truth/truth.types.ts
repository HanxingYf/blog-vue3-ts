export interface TruthDatabaseListReqI {
  page: number
  per_page: number
  id: string
  group_id: string
  checker_name: string
  status?: number
}

export interface TruthDatabaseListResI {
  cur_page_num: number
  has_next: boolean
  has_prev: boolean
  num_per_page: number
  total_num: number
  pages: number
  codes: TruthDatabaseListResItemI[]
}

export interface TruthDatabaseListResItemI {
  id: number // 190
  group_id: string // "manual_test_20191120183858"
  code_id: number // 306796
  city_code: number // 1
  source: number // 2
  task_id: number // 27
  record_id: number // 155183
  operator_name: string // "test"
  checker_name: string // "test"
  last_operator_name: string // "test"
  code_family: string // "其他"
  position: string // "116.348640,39.870564"
  coors: string // "116.349083,39.874538;116.348961,39.873604,116.348961,39.873604;116.348877,39.872974,116.348877,39.872974;116.348831,39.872406,116.348831,39.872406;116.348694,39.871197;116.348640,39.870564,116.348640,39.870564;116.348854,39.870136,116.348854,39.870136;116.348969,39.869888;116.349205,39.869545;116.349335,39.869392;116.349350,39.869385;116.349594,39.869144;116.349800,39.868984;116.350006,39.868862;116.350403,39.868675;116.350594,39.868607"
  code_link_list: string // "5058880,4615620,4615640,4545351,418080481,418080471,4483790"
  ori_link_list: string // "5058880,4615620,4615640,4545351,418080481,418080471,4483790"
  map_version: string // "2019091018"
  geojson: string // "{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[116.34913,39.87452],[116.349,39.87359],[116.349,39.87359],[116.34892,39.87296],[116.34884,39.87239],[116.34869,39.87118],[116.34866,39.87056],[116.34866,39.87056],[116.34884,39.87012],[116.34897,39.86988],[116.34919,39.86953],[116.34932,39.86938],[116.34933,39.86937],[116.34959,39.86914],[116.3498,39.86898],[116.35,39.86887],[116.3504,39.86867],[116.35059,39.8686]]},"properties":{"linkList":"5058880,4615620,4615640,4545351,418080481,418080471,4483790"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.34863678863975,39.870627560483314]},"properties":{"code":0,"tts":"不提示"}}]}"
  true_value: {
    code: number // 0
    cross_kind: number // 0
    assist: number[] // [10]
    assist_text: string[] // ["进入主路"]
  }
  tts: string // "0"
  status: number // 1
  create_time: string // "2019-11-20 18:38:04"
  update_time: string // "2019-11-20 18:38:04"
  deleted: number // 0
}

export interface TruthHistoryListResItemI {
  id: number // 821
  truth_id: number // 190
  operator: string // "test"
  source: number // 2
  tts: string // "0"
  true_value: {
    code: number // 0
    cross_kind: number // 0
    assist: number[] // [10]
    assist_text: string[] // ["进入主路"]
  }
  create_time: string // "2019-11-20 18:38:15"
  position: string // "116.348640,39.870564"
  coors: string // "116.349083,39.874538;116.348961,39.873604,116.348961,39.873604;116.348877,39.872974,116.348877,39.872974;116.348831,39.872406,116.348831,39.872406;116.348694,39.871197;116.348640,39.870564,116.348640,39.870564;116.348854,39.870136,116.348854,39.870136;116.348969,39.869888;116.349205,39.869545;116.349335,39.869392;116.349350,39.869385;116.349594,39.869144;116.349800,39.868984;116.350006,39.868862;116.350403,39.868675;116.350594,39.868607"
  code_link_list: string // "5058880,4615620,4615640,4545351,418080481,418080471,4483790"
  ori_link_list: string // "5058880,4615620,4615640,4545351,418080481,418080471,4483790"
  map_version: string // "2019091018"
  geojson: string // "{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[116.34913,39.87452],[116.349,39.87359],[116.349,39.87359],[116.34892,39.87296],[116.34884,39.87239],[116.34869,39.87118],[116.34866,39.87056],[116.34866,39.87056],[116.34884,39.87012],[116.34897,39.86988],[116.34919,39.86953],[116.34932,39.86938],[116.34933,39.86937],[116.34959,39.86914],[116.3498,39.86898],[116.35,39.86887],[116.3504,39.86867],[116.35059,39.8686]]},"properties":{"linkList":"5058880,4615620,4615640,4545351,418080481,418080471,4483790"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[116.34863678863975,39.870627560483314]},"properties":{"code":0,"tts":"不提示"}}]}"
  code_family: string // "其他"
  task_id: number // 27
  record_id: number // 155183
}
