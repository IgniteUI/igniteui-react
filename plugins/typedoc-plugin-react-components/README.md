# TypeDoc plugin for Ignite UI for React - from Infragistics

Externally available plugin for building any version of Ignite UI for React source with it. Mainly used in the API docs.

How to use it:

1. Add the plugin to a typedoc configuration that will be used:

```
"plugin": [
  "typedoc-plugin-react-components"
],
```

2. Build the Ignite UI for React source
3. Use as entries the `*.ts` files from the React source from the previous step
