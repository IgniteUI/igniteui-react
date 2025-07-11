# Ignite UI React

A work in progress repository for a new batch of React wrappers for out core
products.

## Typedoc

The typedoc will use the configs from the ig-typedoc-theme, in this case the `react.oss.config.json`. If you would like to test out a local versioning, you will need to set your `react-api-docs-versions.json` file, that is usually used on the staging/production machines that lists the versions. The content of the file looks like this: `{"folders": [ "19.0.3" ]}`.

In order to generate typedocs for the components you will need to perform the following steps.
You can do everything from root level:

1. Build the source: `npm run build` (required)
2. Build the typedoc: `npm run build:typedoc:dev`

The `build:typedoc:dev` script sets `NODE_ENV`, because it is required by the `ig-typedoc-theme` to be set, so the config works. Should be already set on staging/production machines.

For development of the plugin you can use the `npm run build:plugin:watch` and run typedoc under a separate VSCode `JS Debug Terminal` or similar and breakpoints should work for the source in `plugins/typedoc-plugin-react-components/src/main.ts`.

>**Note:** If you have globally installed typedoc, it may interfere and not take into account the project config in `typedoc.json`. Either use the local package since there's no need for global typedoc or specify the project config manually.