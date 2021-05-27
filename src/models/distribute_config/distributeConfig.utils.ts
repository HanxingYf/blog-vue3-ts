export const combinValueAndLabel = (obj: any): any => {
  const arr = []
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      const v = obj[k]
      arr.push({
        label: v,
        value: k
      })
    }
  }
  return arr
}
