import { resolve } from 'node:path'
import express from 'express'
import { errorHandler, createSiteMiddleware, createSpaMiddleware } from '@data-fair/lib-express'
import config, { uiConfig, siteResourcesHtml } from '#config'
import adminRouter from './admin/router.ts'

export const app = express()

// no fancy embedded arrays, just string and arrays of strings in req.query
app.set('query parser', 'simple')
app.use(createSiteMiddleware('openapi-viewer', { prefixOptional: true, neverInternal: true }))

app.set('json spaces', 2)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/admin', adminRouter)

// no dependency to check: answering is enough (dev readiness, container healthcheck)
app.get('/api/ping', (req, res) => {
  res.send('ok')
})

if (config.serveUi) {
  app.use(await createSpaMiddleware(resolve(import.meta.dirname, '../../ui/dist'), uiConfig, {
    extraHtmlTemplateParams: { SITE_RESOURCES: siteResourcesHtml },
    privateDirectoryUrl: config.useSimpleDirectory ? config.privateDirectoryUrl : undefined
  }))
}

app.use(errorHandler)
