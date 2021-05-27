import { combinValueAndLabel } from './distributeConfig.utils'

export const handleRemoteData = (data: any): any => {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = combinValueAndLabel(data[key])
    }
  }
  return data
}
