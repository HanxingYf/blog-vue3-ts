export interface BaseMapRunningTaskI {
  block_noes: {
    BlockNos: BlockI[]
  }
  block_num: number // 1
  city_id: number // 0
  city_name: string // ""
  create_time: string // "2020-06-28 14:54:38"
  creator: string // "test"
  id: number // 3
  poi_num: number // 388
  progress: string // "Completed"
  service: string // ""
  task_name: string // "bigbang"
}

export interface PoiI {
  BlockID: string,
  DidiID: string
  DispLevel: number[],
  KindName: string
  KindRank: number
  Lat: number
  Lng: number
  POIRank: string
  PoiName: string
  SiweiID: string
  Type?: number
  keep?: number
}

export interface PoiConfigI {
  CityCode: number
  BlockNo: string
  BlockId: string
  DidiID: string
  SiweiID: string
  Lat: number
  Lng: number
  DispLevel: number[]
  PoiName: string
}

export interface BlockI {
  block_no: string
  block_ids: string[]
}
