# Ignite UI for React - from Infragistics

[Ignite UI for React](https://www.infragistics.com/products/ignite-ui-react) includes a wide range of easy to use React UI components that have been designed and optimized for high-performance, high-volume data scenarios. It includes a grid, charts, gauges and the Excel library.

You can build amazing experiences with Ignite UI for React.  Ignite UI for React includes the world’s fastest, virtualized real-time, live-data React grid with interactive responsive web design features like built-in column types & templating support, column sorting, filtering, and more.  The high-performance, streaming financial & business charts can render millions of data points in milliseconds with interactive panning & zooming, touch support, callout layers, trend lines and markers with full styling capability.  The included Microsoft Excel library has read / write XLS & XLSX file capability, support for more than 300 Excel formulas and reporting with charting & sparklines.

Current list of controls include:

|Components|Description|Packages|
|:--|:--|:--|
|[Grid](https://www.infragistics.com/products/ignite-ui-react/react/components/grid_table.html)|The Ignite UI for React Table / Grid component simplifies the complexities of the grid domain into manageable API so that a user can bind a collection of data.|igniteui-react-grids igniteui-react-core|
|[Category Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/categorychart.html)|Use the category chart component to analyze and automatically choose the best chart type to represent data. Learn about our chart types for visualization.|igniteui-react-charts igniteui-react-core|
|[Data Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/datachart.html)|Create a data chart that displays multiple instances of visual elements in the same plot area in order to create composite chart views.|igniteui-react-charts igniteui-react-core|
|[Financial Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/financialchart.html)|Use the financial chart component to visualize financial data using a simple API. View the demo, dependencies, usage and toolbar for more information. |igniteui-react-charts igniteui-react-core|
|[Doughnut Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/doughnutchart.html)|Use the doughnut chart component to display multiple variables in concentric rings for hierarchical data visualization. View the demo for more information.|igniteui-react-charts igniteui-react-core|
|[Pie Chart](https://www.infragistics.com/products/ignite-ui-react/react/components/piechart.html)|Create a colorful pie chart to display categorical data in Ignite UI for data visualization. View the demo for more information.|igniteui-react-charts igniteui-react-core|
|[Excel Library](https://www.infragistics.com/products/ignite-ui-react/react/components/excel_library.html)|Use the Excel Library to work with spreadsheet data using Microsoft Excel features. Easily transfer data from excel to your application. |igniteui-react-excel igniteui-react-core|
|[Bullet Graph](https://www.infragistics.com/products/ignite-ui-react/react/components/bulletgraph.html)|Create data presentations using the bullet graph component to display ranges or compare multiple measurements. View our data visualization tools.|igniteui-react-gauges igniteui-react-core|
|[Linear Gauge](https://www.infragistics.com/products/ignite-ui-react/react/components/lineargauge.html)|Use the linear gauge component to visualize data with a simple and concise view. Learn about the configurable elements, dependencies and code snippets.|igniteui-react-gauges igniteui-react-core|
|[Radial Gauge](https://www.infragistics.com/products/ignite-ui-react/react/components/radialgauge.html)|Create a colorful radial gauge to display a number of visual elements, such as needle, tick marks and ranges. View our data visualization tools.|igniteui-react-gauges igniteui-react-core|


# Create New App

In VS Code, select Terminal menu, New Terminal option, and type this command in terminal window:

  - **npx create-react-app my-app-name --typescript**

Or

  - **yarn create react-app my-app-name --typescript**

Next, you need to open the my-app-name folder in VS Code app and install the following packages for Ignite UI for React using these commands:
  - **npm install --save igniteui-react-charts igniteui-react-core**
  - **npm install --save igniteui-react-excel igniteui-react-core**
  - **npm install --save igniteui-react-gauges igniteui-react-core**
  - **npm install --save igniteui-react-grids igniteui-react-core**
  - **npm install --save igniteui-react-maps igniteui-react-core**

Or
  
  - **yarn add igniteui-react-charts igniteui-react-core**
  - **yarn add igniteui-react-excel igniteui-react-core**
  - **yarn add igniteui-react-gauges igniteui-react-core**
  - **yarn add igniteui-react-grids igniteui-react-core**
  - **yarn add igniteui-react-maps igniteui-react-core**

Lastly, you can build for production or start your application with these commands:
  - **npm run-script build**
  - **npm run-script start**

After executing those simple commands, your new project will be built and served. It will automatically open in your default browser and you will be able to use Ignite UI for React components in your project.

# Update Existing App
What if you want to use React in an existing React CLI project (one that you have from before)? We have you covered! All you have to do is execute these commands:

  - **npm install --save igniteui-react-charts igniteui-react-core**
  - **npm install --save igniteui-react-excel igniteui-react-core**
  - **npm install --save igniteui-react-gauges igniteui-react-core**
  - **npm install --save igniteui-react-grids igniteui-react-core**
  - **npm install --save igniteui-react-maps igniteui-react-core**

Or

  - **yarn add igniteui-react-charts igniteui-react-core**
  - **yarn add igniteui-react-excel igniteui-react-core**
  - **yarn add igniteui-react-gauges igniteui-react-core**
  - **yarn add igniteui-react-grids igniteui-react-core**
  - **yarn add igniteui-react-maps igniteui-react-core**

This will automatically install packages for React, along with all of their dependencies, font imports and styles references to the existing project.

# Importing Modules

First we have to import the required modules of the components we want to use. We will go ahead and do this for the [**Catgeory Chart**](https://www.infragistics.com/products/ignite-ui-react/react/components/categorychart.html) component.

```
import { IgrCategoryChartModule } from "igniteui-react-charts/ES5/igr-category-chart-module";
IgrCategoryChartMapModule.register();
```

# Using Components

We are now ready to use the `CategoryChart` component in our markup! Let's go ahead and define it:

```
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

# Running Application

Finally, we can run our new application by using one of the following commands:

- **npm run-script start**


