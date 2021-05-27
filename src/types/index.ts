export interface ValueConfig {
  label: string
  value: number | string
}
export interface ResI {
  code: number
  msg: string
}
export interface SelectItem {
  label: string
  value: string
}
export interface Columns {
  title?: string
  type?: string
  key?: string
  align: string
  width?: number
}
export interface DistributeConfig {
  name: string
}
export interface DataPayload {
  list: any
  count?: number
  index?: number
}

export interface DistributorI {
  email: string
  id: number
  status: number
  username: string
  usernameZh: string
}

export interface DistributeFormI {
  task_name: string
  city: SelectItem[]
  distributors: DistributorI[]
  custom_filter: string
  comparison_of_results: string[]
  filter_of_code: string[]
  filter_of_copywriting: string
  filter_of_text_type: number
  nums: number
  description_of_task: string
  deadline: Date
}

export interface DistributeFormII {
  task_name: string
  city: SelectItem[]
  distributors: DistributorI[]
  hot: number
  filter_of_code: string[]
  nums: number
  description_of_task: string
  deadline: Date
}

export interface FeatureCollectionI {
  type: 'FeatureCollection',
  features: Array<{
    type: 'Feature',
    geometry: {
      type: 'LineString'
      coordinates: number[][] // [[lng, lat], [lng, lat]]
    } | {
      type: 'Point'
      coordinates: number[] // [lng, lat]
    },
    properties: { [propName: string]: any }
  }>
}

export interface LayerCtlI {
  name: string;
  checked: boolean;
  check: (checked: boolean) => void
}

