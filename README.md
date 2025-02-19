# OpenAPI 3 viewer

This service is designed to easily browse and test a REST API described with the [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification).

See it in action [here](https://koumoul.com/openapi-viewer/)

## Sponsors

| | Click [here to support the development of this project](https://github.com/sponsors/koumoul-dev). |
|-|-|
| ![Koumoul logo](https://koumoul.com/static/logo-slogan.png) | [Koumoul](https://koumoul.com) develops the Data Fair ecosystem and hosts it as an online service. |
| ![Dawizz logo](https://dawizz.fr/logo-Dawizz-all-about-your-data-home.png) | [Dawizz](https://dawizz.fr) uses the Data Fair ecosystem inside its platform and supports its development. |

## Query parameters

You can use the followings query parameters to prefill the viewer :

### Available Parameters

- **url** : The location of the API documentation file to load, in OpenAPI v3 JSON format.
- **hide-toolbar** : `true` or `false` to hide the toolbar (useful for iframe integration). Defaults to `false`.

### Directly Linking to an API Operation

You can append a **hash (`#`)** with an `operationId` to directly navigate to a specific API operation. [Reference : OpenAPI 3.1 Operation Object](https://spec.openapis.org/oas/v3.1.0#operation-object)

## Integration with SimpleDirectory

By default, the viewer is designed to work seamlessly with **[SimpleDirectory](https://github.com/data-fair/simple-directory)**.  
This ensures full integration with the ecosystem where it is deployed, including:

- **Theming**: Automatically adapts to the platform's look and feel.
- **Language**: Uses the same language settings as the environment.

### Standalone Mode

If you want to disable this integration and run the viewer in standalone mode, set the environment variable:

```bash
USE_SIMPLE_DIRECTORY=false
```

## Developers

Take a look at the [contribution guidelines](./CONTRIBUTING.md).
