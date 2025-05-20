# Ignite UI for React - from Infragistics

[![npm version](https://badge.fury.io/js/igniteui-react-core.svg)](https://badge.fury.io/js/igniteui-react)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI for React](https://www.infragistics.com/products/ignite-ui-react) includes a wide range of easy to use React UI components that have been designed and optimized for high-performance, high-volume data scenarios. It includes a grid, charts, gauges and the Excel library.

You can build amazing experiences with Ignite UI for React.  Ignite UI for React includes the world’s fastest, virtualized real-time, live-data React grid with interactive responsive web design features like built-in column types & templating support, column sorting, filtering, and more.  The high-performance, streaming financial & business charts can render millions of data points in milliseconds with interactive panning & zooming, touch support, callout layers, trend lines and markers with full styling capability.  The included Microsoft Excel library has read / write XLS & XLSX file capability, support for more than 300 Excel formulas and reporting with charting & sparklines.

## Browser Support

| ![chrome_48x48] | ![firefox_48x48] | ![edge_48x48] | ![opera_48x48] | ![safari_48x48] |
| --------------- | ---------------- | ------------- | -------------- | --------------- |
| Latest ✔️       | Latest ✔️        | Latest ✔️     | Latest ✔️      | Latest ✔️       |

## [Data Grid Docs]

The Ignite UI for React Data Grid is both lightweight and developed to handle high data volumes. The React Grid offers powerful data visualization capabilities and superior performance on any device. With interactive features that users expect. Fast rendering. Unbeatable interactions. And the best possible user experience that you wouldn’t otherwise be able to achieve with so little code on your own.

## [React Charts & Graphs]

The full-featured Ignite UI for React chart component is built for speed, simplicity, and beauty. It gives you access to more than 65 high-performance React charts such as – [Bubble charts], [Donut charts], [Financial/Stock charts], Pie chart, Line chart and more. With our React component for business and stock charting, you are enabled to build stunning data visualizations, apply deep analytics, and render voluminous data sets in seconds. Flawless experience while scrolling through an unlimited number of rows and columns is guaranteed. 

Keeping in mind the customization and configuration your users expect, the Ignite UI for React charts brings on rich interactivity, full touch-screen support that will run on any browser, intuitive API, minimal hand-on coding, and the same [chart features](https://www.infragistics.com/products/ignite-ui-react/react/components/charts/chart-features) that you come across with Google Finance and Yahoo Finance Charts - price overlays, trendlines, volume indicators, value overlays, and more. 

## Overview

### Grids

| Components        | Status |         Documentation          | Released Version | Package |
| :---------------- | :----: | :----------------------------: |:--:  | :----:|
| Grid         |   ✅   |     [Docs][Data Grid Docs]     |[18.3]| [igniteui-react-grids] |
| Tree Grid         |   ✅   |     [Docs][Tree Grid Docs]     |[18.3]| [igniteui-react-grids]|
| Pivot Grid        |   ✅   |    [Docs][Pivot Grid Docs]     |[18.3]| [igniteui-react-grids]|
| Hierarchical Grid |   ✅   | [Docs][Hierarchical Grid Docs] |[18.6]| [igniteui-react-grids]|

### Components

|Group| Components        | Status |         Documentation          | Released Version | Package |
|:----|:----------|:--------|:----|:----|:----:|
|Lists|List|   ✅   |[Docs][List Docs]|16.11|[igniteui-react]|
||Tree|   ✅   |[Docs][Tree Docs]|16.16|[igniteui-react]|
||Spreadsheet|   ✅   |[Docs][Spreadsheet Docs]|16.11|[igniteui-react-excel]|
|Layouts|Accordion|   ✅   |[Docs][Accordion Docs]|[18.9]|[igniteui-react]|
| | Avatar | ✅ | [Docs][Avatar Docs] | 16.11 | [igniteui-react] |
| | Card | ✅ | [Docs][Card Docs] | 16.11 | [igniteui-react] |
| | Carousel  | ✅ | [Docs][Carousel Docs] | 16.11 | [igniteui-react] |
| | Dock Manager | ✅ | [Docs][Dock Manager Docs] | 16.11 | [igniteui-dockmanager] |



### Charts



## Create New App

The fastest way to kickstart your React application using Ignite UI for React is using the Ignite UI CLI.

```
  npm i -g igniteui-cli
  ig new <project name> --framework=react --type=igr-ts
  cd <project name>
  ig add grid <component name>
  ig start
```

This will initialize a new application and add a single page to it with a pre-configured grid component. If you need to add other components and therefore the packages they reside in, you can either init the Ignite UI CLI prompt again using the `ig` command and choose from the list of templates or use the following commands to install the packages needed directly.

```
  npm install --save igniteui-react-charts igniteui-react-core
  npm install --save igniteui-react-excel igniteui-react-core
  npm install --save igniteui-react-gauges igniteui-react-core
  npm install --save igniteui-react-grids igniteui-react-core 
  npm install --save igniteui-react-maps igniteui-react-core
  npm install --save igniteui-react-excel igniteui-react-core
  npm install --save igniteui-react-spreadsheet igniteui-react-core
```

Or

```
  yarn add igniteui-react-charts igniteui-react-core
  yarn add igniteui-react-excel igniteui-react-core
  yarn add igniteui-react-gauges igniteui-react-core
  yarn add igniteui-react-grids igniteui-react-core
  yarn add igniteui-react-maps igniteui-react-core
  yarn add igniteui-react-excel igniteui-react-core
  yarn add igniteui-react-spreadsheet igniteui-react-core
```

After executing those commands, your new project will be built and served. It will automatically open in your default browser and you will be able to use Ignite UI for React components in your project.

## Importing Modules

First we have to import the required modules of the components we want to use. We will go ahead and do this for the [Category Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/categorychart.html) component.

```tsx
import { IgrCategoryChartModule } from "igniteui-react-charts/ES5/igr-category-chart-module";

IgrCategoryChartMapModule.register();
```

## Using Components

We are now ready to use the `CategoryChart` component in our markup! Let's go ahead and define it:

```tsx
// App.txs
render() {
    return (
        <div style={{height: "100%", width: "100%" }}>
             <IgrCategoryChart dataSource={this.state.data}
                   width="700px"
                   height="500px">
             </IgrCategoryChart>
        </div>
    );
}
```

## Running Application

Finally, we can run our new application by using one of the following commands:

```
npm run start
```

[igniteui-react-grids]: https://www.npmjs.com/package/igniteui-react-grids
[igniteui-react]: https://www.npmjs.com/package/igniteui-react
[igniteui-core]: https://www.npmjs.com/package/igniteui-react-core 
[Ignite UI for Web Components]: https://www.infragistics.com/products/ignite-ui-react
[igniteui-dockmanager]: https://www.npmjs.com/search?q=igniteui-dockmanager
[Indigo.Design Design System]: https://www.infragistics.com/products/appbuilder/ui-toolkit
[Ignite UI for WebComponents Grids]: https://www.npmjs.com/package/igniteui-webcomponents-grids
[Dock Manager Picture]: https://github.com/IgniteUI/igniteui-webcomponents/assets/52001020/a9643f17-f1c2-4554-87aa-96c9daea13b0
[VSCode Custom Data Format]: https://github.com/microsoft/vscode-custom-data
[Web Types]: https://plugins.jetbrains.com/docs/intellij/websymbols-web-types.html
[chrome_48x48]: https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png
[firefox_48x48]: https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png
[edge_48x48]: https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png
[opera_48x48]: https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png
[safari_48x48]: https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png
[Contribution Guidelines]: https://github.com/IgniteUI/igniteui-react/blob/master/.github/CONTRIBUTING.md
[Pivot Grid Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/pivot-grid/overview
[Data Grid Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/grid/overview
[Tree Grid Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/tree-grid/overview
[Hierarchical Grid Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/hierarchical-grid/overview
[Switch Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/switch
[Ripple Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/ripple
[Radio Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/radio
[Navigation Drawer Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/menus/navigation-drawer
[Navigation Bar Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/menus/navbar
[List Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/list
[Input Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/input
[Icon Button Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/icon-button
[Icon Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/icon
[Form Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/form
[Checkbox Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/checkbox
[Card Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/card
[Calendar Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/scheduling/calendar
[Button Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/button
[Badge Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/badge
[Avatar Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/avatar
[Slider Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/slider
[Rating Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/rating
[Toast Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/notifications/toast
[Snackbar Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/notifications/snackbar
[Chip Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/chip
[Circular Progress Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/circular-progress
[Linear Progress Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/linear-progress
[Dropdown Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/notifications/toast
[Tree Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/grids/tree
[Expansion Panel Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/expansion-panel
[Masked Input Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/input
[Accordion Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/accordion
[Tabs Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/tabs
[Date Time Input Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/date-time-input
[Dialog Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/notifications/dialog
[Select Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/select
[Stepper Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/stepper
[Combo Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/combo/overview
[Textarea Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/text-area
[Button Group Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/button-group
[Banner Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/notifications/banner
[Divider Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/divider
[Date Picker Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/scheduling/date-picker
[Carousel Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/carousel
[Tile Manager Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/tile-manager
[File Input Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/file-input
[Tooltip Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/inputs/tooltip
[React Charts & Graphs]: https://www.infragistics.com/products/ignite-ui-react/react/components/charts/chart-overview
[Bubble charts]: https://www.infragistics.com/products/ignite-ui-react/react/components/charts/types/bubble-chart
[Financial/Stock charts]: https://www.infragistics.com/products/ignite-ui-react/react/components/charts/types/stock-chart
[Donut charts]: https://www.infragistics.com/products/ignite-ui-react/react/components/charts/types/donut-chart 
[Spreadsheet Docs]: https://www.infragistics.com/products/ignite-ui-react/react/components/spreadsheet-overview
[igniteui-react-gauges]: https://www.npmjs.com/package/igniteui-react-gauges
[igniteui-react-charts]: https://www.npmjs.com/package/igniteui-react-chartshttps://www.npmjs.com/package/igniteui-react-charts
[igniteui-react-excel]: https://www.npmjs.com/package/igniteui-react-excel
[19.0]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1900-april-2025
[18.9]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1890-april-2025
[18.7.6]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1876-december-2024
[18.7.4]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1874-november-2024
[18.7]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1870-september-2024
[18.6]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1860-march-2024
[18.5]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1850-january-2024
[18.4]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1840-december-2023
[18.3]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1830-october-2023
[18.2]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1820-june-2023
[18.1]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#1810-november-2022
[16.16]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#16160-june-2022
[16.15]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#16150-november-2021
[16.14]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#16140-april-2021
[16.12.3]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#16123-november-2020
[16.12.2]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/5.3.0
[16.11.17]: https://www.infragistics.com/products/ignite-ui-react/react/components/general-changelog-dv-react#161170