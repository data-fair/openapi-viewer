import dotenv from 'dotenv'

// .env fills the variables the environment does not set already (dotenv never overrides them), from the repo root
// or a workspace; the production names (PORT, PRIVATE_DIRECTORY_URL, ALLOWED_URLS, USE_SIMPLE_DIRECTORY) override
// this file (custom-environment-variables.mjs)
dotenv.config({ path: ['.env', '../.env'], quiet: true })

if (!process.env.DEV_API_PORT) throw new Error('missing DEV_API_PORT env variable, run "npm run dev-deps" to create the .env file')

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
