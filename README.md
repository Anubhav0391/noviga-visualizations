# 🛠️ Industrial Monitoring Dashboard (React + Highcharts + React Flow)

## 📋 Overview

This is a simulation-based frontend project built with **React**, **Redux**, **Highcharts**, and **React Flow**. The application provides an interactive dashboard to:

- Visualize and analyze **machine cycle data** through scatter and line charts.
- Display **machine station process flows** using a drag-and-drop, editable **tree graph**.
- Simulate data interactions, configurations, and edge cases based on static JSON data.

---

## 🚀 Features

### 📈 Scatter Data Module
- Visualizes cycle data as **scatter plots**.
- Clicking `Show Comparision` splits in two charts for comparision.
- Clicking a scatter point shows **time series data** in a **line chart**.
- Highlights anomalies and unprocessed data visually.
- Filters data based on machine, date, and tool configuration.
- Uses `react-toastify` for error reporting.

### 🌳 Tree View Module
- Shows process flow using **React Flow** with layout powered by **dagre.js**.
- Handles **disconnected**, **bypassed**, and **not-allowed** machine nodes.
- Provides toggles to change:
  - Layout direction: **Top-Bottom** or **Left-Right**
  - Edge type: **Step** or **Bezier**
- Custom node with absolute-positioned editing popup.
- Zoom-to-node on click and visual focus for the selected node.

---

## 🧱 Folder Structure

```
public/
├── data/
│ ├── Machine1-SSP0173/
│ │ ├── changelog.json
│ │ ├── prediction_data.json
│ │ ├── timeseries_cycledata_red.json
│ │ ├── timeseries_cycledata_green.json
│ │ └── timeseries_cycledata_black.json
│ ├── Machine2-SSP0167/
│ │ └── [similar structure]
│ └── graphViz.json
src/
├── components/
│ ├── scatterPlot/
│ │ ├── LineChart.tsx
│ │ ├── ScatterChart.tsx
│ │ └── SearchBar.tsx
│ ├── treeView/
│ │ ├── TreeGraph.tsx
│ │ ├── CustomNode.tsx
│ │ └── SelfConnectingEdge.tsx
│ ├── SideNav.tsx
│ └── Spinner.tsx
├── lib/
│ └── theme.js
├── pages/
│ ├── ScatterPlot.tsx
│ └── TreeView.tsx
├── redux/
│ ├── slices/
│ │ ├── scatterPlotSlice.ts
│ │ └── treeViewSlice.ts
│ └── store.ts
├── types/
│ ├── scatterPlotTypes.ts
│ └── treeViewTypes.ts
├── App.tsx
├── index.css
├── main.tsx
├── utils.ts
index.html
```


---

## 🧪 Tech Stack

- ⚛️ React
- 📊 Highcharts + highcharts-react-official
- 🧩 React Flow + dagre layout
- 📦 Redux Toolkit
- ⏱️ moment.js
- 🎨 Material UI (MUI)
- 🔔 react-toastify
- 📁 Vite

---

## ▶️ How to Run Locally

```bash
# Step 1: Clone the repository
git clone https://github.com/Anubhav0391/noviga-visualizations.git
cd project-name

# Step 2: Install dependencies
npm install

# Step 3: Start development server
npm run dev
```
---

## 🧠 Approach

### 1. Problem Understanding

The goal was to build a **visual analytics interface** for analyzing machine cycle data:

- Allow visual identification of anomalies via a **scatter plot**
- Show detailed **time series charts** for selected cycles
- Represent **machine flow/connection** as an interactive **tree graph**

The data was provided as static JSON files emulating API responses.

---

### 2. Data Flow & Structure

- JSON files from the `public/data/` directory act as the source of truth.
- Redux is used to manage filters, selected tools, time-series data, and changelog information.
- Typescript types in the `types/` directory define and enforce structure across the codebase.

---

### 3. Visual Components Breakdown

- **`ScatterChart`**  
  Plots cycle points as anomalies / normal / unknown using Highcharts.  
  Clicking a point fetches and shows its corresponding time-series chart.

- **`LineChart`**  
  Displays the `spindle_1_load` signal over time along with an "ideal" threshold line for comparison.

- **`TreeGraph`**  
  Uses React Flow and Dagre to render machine connections.  
  - Handles bypasses and self-loops visually  
  - Supports node dragging and layout switching  
  - Allows focus and zoom on node click  

---

### 4. Layout & UX Strategy

- Tree layout is toggleable between **Top-Bottom (TB)** and **Left-Right (LR)** using a `Switch`.
- Edge types are toggleable between **Step** and **Bezier** for visual clarity.
- Nodes snap into layout automatically using **Dagre** after data load or toggle.
- **Zoom-to-fit** and **node focus** behavior enhances navigation and interaction.

---

### 5. Key Technical Choices


| **Decision**         | **Reason**                                                                                                                |
|----------------------|---------------------------------------------------------------------------------------------------------------------------|
| `React Flow`         | Highly customizable and interactive. Optimized for handling 500 –10,000 nodes based on use case.                          |
| `Highcharts`         | Mature and flexible library for responsive and customizable charts. Uses canvas and is optimized for 50,000+ data points. |
| `Redux Toolkit`      | Simplifies state management with built-in best practices and reduced boilerplate.                                         |
| `Vite + TypeScript`  | Fast build toolchain with static typing and modular architecture.                                                         |







