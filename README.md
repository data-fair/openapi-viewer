# OpenAPI 3 viewer

This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification).

## Sponsors

| | Click [here to support the development of this project](https://github.com/sponsors/koumoul-dev). |
|-|-|
| ![Koumoul logo](https://koumoul.com/static/logo-slogan.png) | [Koumoul](https://koumoul.com) develops the Data Fair ecosystem and hosts it as an online service. |
| ![Dawizz logo](https://dawizz.fr/logo-Dawizz-all-about-your-data-home.png) | [Dawizz](https://dawizz.fr) uses the Data Fair ecosystem inside its platform and supports its development. |

## Query parameters

You can use the followings query parameters to prefill the viewer :

### Available Parameters

- **drawerLocation** : The location of the navigation-drawer. Can be `left` or `right`. Defaults to `left`.
- **urlType** : The type of the URL defined in the environment variable `ALLOWED_URLS`.

> *Examples of ALLOWED_URLS :*
>
> ```json
> {
>   "exampleYaml": "https://example1.com/openapi.yaml",
>   "exampleWithUrlTemplate": "https://example2.com/{id}/openapi.json"
> }
> ```

> ⚠️ **Deprecated**: `url` and `hide-toolbar` are deprecated.
>
> - ~~**url** : The location of the API documentation file to load, in OpenAPI v3 JSON format.~~
> - ~~**hide-toolbar** : `true` or `false` to hide the toolbar (useful for iframe integration). Defaults to `false`.~~

### Directly Linking to an API Operation

You can append a query parameter `operation` with an `operationId` as its value to directly navigate to a specific API operation. [Reference : OpenAPI 3.1 Operation Object](https://spec.openapis.org/oas/v3.1.0#operation-object)

## Integration with SimpleDirectory

By default, the viewer runs in **standalone mode** and does not integrate with **[SimpleDirectory](https://github.com/data-fair/simple-directory)**.  
However, you can enable integration to benefit from:

- **Theming**: Automatically adapts to the platform's look and feel.
- **Language**: Uses the same language settings as the environment.

To enable integration with SimpleDirectory, set the environment variable:

```bash
USE_SIMPLE_DIRECTORY=true
```

## Developers

Take a look at the [contribution guidelines](./CONTRIBUTING.md).
