const config = require('config')
const express = require('express')
const path = require('node:path')
const axios = require('axios').default

let app = module.exports = express()

// Business routers
app.get('/proxy', (req, res) => {
  if (!req.query.url || typeof req.query.url !== 'string') {
    return res.status(400).send('url query parameter is required')
  }

  axios.get(req.query.url, {
    responseType: 'stream'
  }).then((response) => {
    response.data.pipe(res)
  }).catch((err) => {
    res.status(500).send(err.message)
  })
})

// Static routing
const oneWeek = 7 * 24 * 60 * 60
const staticOptions = {
  setHeaders: (res) => {
    // 'private' so that it doesn't get store in the reverse proxy's cache
    res.set('cache-control', 'private, max-age=' + oneWeek)
  }
}
app.use('/assets', express.static(path.join(__dirname, '../public/assets'), staticOptions))
app.use('/bundles', express.static(path.join(__dirname, '../public/bundles'), staticOptions))

app.use('/*', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0')
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Error handling to complement express default error handling. TODO do something useful of errors.
app.use((err, req, res, next) => {
  console.error('Error, what to do ?', err.stack)

  // Default error handler of express is actually not bad.
  // It will send stack to client only if not in production and manage interrupted streams.
  next(err)
})

app.listen(config.port, (err) => {
  if (err) {
    console.log('Could not run server : ', err.stack)
    throw err
  }
  console.log('Listening on http://localhost:%s', config.port)
    // Emit this event for the test suite
  app.emit('listening')
})

// Ctrl+C handling
process.on('SIGINT', () => {
  console.log('Server is shutting down')
  process.exit(0)
})

// SIGTERM handling
process.on('SIGTERM', () => {
  console.log('Server is shutting down')
  process.exit(0)
})
