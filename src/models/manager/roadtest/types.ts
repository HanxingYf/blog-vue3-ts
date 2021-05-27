export interface RoadtestTaskListI {
  car_arrange_info: string // ""
  car_rental_info: string // ""
  city: string // "北京"
  create_time: string // "2020-12-09T16:18:43+08:00"
  creator: string // "test"
  flight_info: string // ""
  hotel_info: string // "123"
  id: number // 4
  road_test_time: string // ""
  target: string // ""
  tips: string // ""
  title: string // "title"
  update_person: string // "0001-01-01T00:00:00Z"
  update_time: string // ""
  person_ids: string // 1,2,3
}

export interface RoadtesterI {
  user_group: string // "123"
  id: number // 3
  is_first_test: number // 0
  name: string // "123"
  nick_name: string
  phone: string // "123"
  road_test_id: number // 2
  test_phone: string // "123"
}

export interface StaffUserResI {
  data: Array<{
    deptDescr1: string // "地图与公交事业部"
    deptDescr2: string // "泛前端"
    deptDescr3: string // "前端技术"
    emailAddr: string // "lidongsevenlee@didiglobal.com"
    name: string // "李冬"
  }>
  meta: {
    api: string // "/hr-basic/openApi/V2/searchOnJobStaffByKeyWord"
    code: number // 0
    message: string // ""
    method: string // "GET"
  }
}
