import { Router } from 'express'

const router = Router()
const proxy = require('express-http-proxy')

// 接口代理转发
router.post(
    '/api/index/template',
    proxy('http://127.0.0.1:9595')
)

export default router;