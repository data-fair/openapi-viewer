# OpenAPI 3 viewer
This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification) (fka Swagger Specification). This service mainly uses [vue-openapi](https://github.com/koumoul-dev/vue-openapi) component. It also provides a simple nodeJS backend for proxy purpose.

See it in action :
 * https://koumoul.com/openapi-viewer/

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

## Query parameters
You can use the followings query parameters to prefill viewer

 * **url** : The location of the API documentation file to load, in OpenAPI v3 JSON format.
 * **proxy** : true or false if you want to fetch API documentation file using this service backend as a proxy. Defaults to false.
Can be usefull if the API description can't be reached with CORS headers. Do not use the proxy if you want to access an API description located on *localhost*.
 * **headers** : URI encoded JSON dictionnary of headers that will be used to prefill parameters if they match. Can be usefull to prefill *x-api-key* or *authorization* headers.
 * **query-params** : URI encoded JSON dictionnary of query parameters that will be used to prefill parameters if they match. Can be usefull to prefill an *organizationId* parameter in a multi-tenant application.
 * **hide-toolbar** : true or false if you want to hide toolbar. This can be usefull for iframe integration. Defaults to false.
