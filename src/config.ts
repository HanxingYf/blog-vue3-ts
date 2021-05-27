const env: any = process.env.NODE_ENV
export default {
  baseUrl: env === 'development' ? 'http://10.89.110.12:8081' : ''
}
