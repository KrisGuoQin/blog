import express from 'express'
import routes from './routes'

const server = express()

const webpack = require('webpack')
const config = require('../webpack/webpack.dev.js')
const compiler = webpack(config)
const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    writeToDisk: true,

})
const webpackHotMiddleware = require('webpack-hot-middleware')(compiler, {
    quiet: true,
    heartbeat: 2000
})

server.use(webpackHotMiddleware)
server.use(webpackDevMiddleware)

const staticMiddleware = express.static("dist")

server.use(staticMiddleware)
server.use(routes)

server.listen(8080, () => {
    console.log('server is listening')
})
