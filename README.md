# OpenAPI 3 viewer
This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification) (fka Swagger Specification). This service mainly uses [vue-openapi](https://github.com/koumoul-dev/vue-openapi) component. It also provides a simple nodeJS backend for proxy purpose.

## Install

Clone this project and install dependencies with `npm install` or `yarn` then :
```
npm run dev
```

## Launch the service with Docker
A Docker image is publicly available on [dockerhub](https://hub.docker.com/r/koumoul/openapi-viewer/).

Run the following command :
```
docker run -p 8080:8080 koumoul/openapi-viewer
```
and go to this [page](http://localhost:8080/)
