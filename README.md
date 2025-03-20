# OpenAPI viewer

This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification).

## Sponsors

| | Click [here to support the development of this project](https://github.com/sponsors/koumoul-dev). |
|-|-|
| ![Koumoul logo](https://koumoul.com/static/logo-slogan.png) | [Koumoul](https://koumoul.com) develops the Data Fair ecosystem and hosts it as an online service. |
| ![Dawizz logo](https://dawizz.fr/logo-Dawizz-all-about-your-data-home.png) | [Dawizz](https://dawizz.fr) uses the Data Fair ecosystem inside its platform and supports its development. |

## Parameters

### Query Parameters

- **drawerLocation** : The location of the navigation-drawer. Can be `left` or `right`. Defaults to `left`.
- **urlType** : The type of the URL defined in the environment variable `ALLOWED_URLS`.
- **operation** : The `operationId` of the operation to navigate to. [Reference : OpenAPI 3.1 Operation Object](https://spec.openapis.org/oas/v3.1.0#operation-object)

> ⚠️ **Deprecated**:
>
> - ~~**url** : The location of the API documentation file to load, in OpenAPI v3 JSON format.~~ *Replaced by the `urlType` query parameter instead and the `ALLOWED_URLS` environment variable.*
> - ~~**hide-toolbar** : `true` or `false` to hide the toolbar (useful for iframe integration). Defaults to `false`.~~

### Environment Variables

- **USE_SIMPLE_DIRECTORY** : A boolean to enable integration with **[SimpleDirectory](https://github.com/data-fair/simple-directory)**. Defaults to `false`.

- **DEFAULT_URL** : The default URL to load when no `urlType` query parameter is provided.

- **ALLOWED_URLS** : A JSON object containing a list of allowed URLs. The keys are used as the `urlType` query parameter. The values are the URLs to the OpenAPI files. These URLs can contain placeholders enclosed in curly braces {}, which will be replaced by the corresponding query parameters. The placeholders are defined by the keys of the query parameters. Defaults to an empty object.

> *Examples of ALLOWED_URLS :*
>
> ```json
> {
>   "exampleYaml": "https://example1.com/openapi.yaml",
>   "exampleWithUrlTemplate": "https://example2.com/{id}/openapi.json"
> }
> ```

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
