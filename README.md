# OpenAPI 3 viewer

This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification).

See it in action [here](https://koumoul.com/openapi-viewer/)

## Sponsors

| | Click [here to support the development of this project](https://github.com/sponsors/koumoul-dev). |
|-|-|
| ![Koumoul logo](https://koumoul.com/static/logo-slogan.png) | [Koumoul](https://koumoul.com) develops the Data Fair ecosystem and hosts it as an online service. |
| ![Dawizz logo](https://dawizz.fr/logo-Dawizz-all-about-your-data-home.png) | [Dawizz](https://dawizz.fr) uses the Data Fair ecosystem inside its platform and supports its development. |

## Query parameters

You can use the followings query parameters to prefill viewer

* **url** : The location of the API documentation file to load, in OpenAPI v3 JSON format.
* **headers** : URI encoded JSON dictionnary of headers that will be used to prefill parameters if they match. Can be usefull to prefill *x-api-key* or *authorization* headers.
* **query-params** : URI encoded JSON dictionnary of query parameters that will be used to prefill parameters if they match. Can be usefull to prefill an *organizationId* parameter in a multi-tenant application.
* **hide-toolbar** : true or false of you want to hide toolbar. This can be usefull for iframe integration. Defaults to false.
