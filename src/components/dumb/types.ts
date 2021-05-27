type FormType =
  'text' |
  'input' |
  'input-textarea' |
  'input-number' |
  'input-select' |
  'input-range' |
  'input-range-select' |
  'input-slider-number' |
  'select' |
  'select-multi' |
  'select-img' |
  'radio'|
  'radio-group' |
  'checkbox'|
  'checkbox-group' |
  'date' |
  'daterange' |
  'datetime' |
  'datetimerange' |
  'button'
export interface FilterConfigI {
  type: FormType
  label: string
  value: any
  defaultVal?: any
  radioType?: string
  maxNum?: number
  minNum?: number
  disableCtl?: boolean
  placeholder?: string
  slot?: string
  showSlot?: boolean
  value2?: any
  value3?: any
  diffVal?: any // 做对比用
  disabled?: boolean
  hide?: boolean
  style?: {}
  onFocus?: () => void
  options?: Array<{ label: string, value: string | number }>
  validate?: () => string
  change?: () => void
  onSelectQueryChange?: (query: string) => void
  click?: () => void
}

export type GetMapT = () => L.Map

export interface SubMenuItemI {
  name: string
  to: string
  title: string
  access?: boolean
  subMenuItems?: SubMenuItemI[]
}
export interface SubMenuI {
  name: string
  title: string
  access: boolean
  subMenuItems?: SubMenuItemI[]
}

