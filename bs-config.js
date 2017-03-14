module.exports = {
  ui: {
    port: 5602,
    weinre: {
      port: 5603
    }
  },
  files: ['public/index.html', 'public/bundles/*', 'public/styles/*', 'package.json'],
  watchOptions: {},
  server: false,
  proxy: 'localhost:5600',
  port: 5601,
  startPath: '/'
}
