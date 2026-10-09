import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

ChartJS.defaults.color = "#9CA3AF";
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = "#0c0c12";
ChartJS.defaults.plugins.tooltip.borderColor = "rgba(255,255,255,0.1)";
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.titleColor = "#F5F5F7";
ChartJS.defaults.plugins.tooltip.bodyColor = "#9CA3AF";

export const gridColor = "rgba(255,255,255,0.06)";
