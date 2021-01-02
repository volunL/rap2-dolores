const config: IConfig = {
  serve: `http://${window.location.hostname}:8080`,
  // serve: `http://rap2api.taobao.org`,
  keys: ['some secret hurr'],
  session: {
    key: 'koa:sess'
  }
}

export default config
