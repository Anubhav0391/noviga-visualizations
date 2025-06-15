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

