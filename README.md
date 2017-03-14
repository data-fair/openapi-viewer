# OpenAPI 3 viewer
This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification) (fka Swagger Specification). This service mainly uses [vue-openapi](https://github.com/koumoul-dev/vue-openapi) component. It also provides a simple nodeJS backend for proxy purpose.

## Install and run

Clone this project and install dependencies with `npm install` or `yarn`.

### Development

```
npm run dev
```

#### Docker image for production

```
npm run build
docker build -t openapi-viewer:latest .
```
