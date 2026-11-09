import dotenv from 'dotenv'
dotenv.config({ path: ['.env', '../.env'], quiet: true })

if (!process.env.DEV_API_PORT) throw new Error('missing DEV_API_PORT env variable, run "npx --no df-dev setup"')

export default {
  defaultUrl: 'examples/fulltest.json',
  allowedUrls: {
    // fetched by the browser, through nginx
    example: `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/openapi-viewer/examples/{filename}`,
    petstore: 'https://petstore.swagger.io/v2/swagger.json'
  },
  port: Number(process.env.DEV_API_PORT),
  serveUi: false,
  useSimpleDirectory: true,
  privateDirectoryUrl: `http://localhost:${process.env.SD_PORT}`,
}
