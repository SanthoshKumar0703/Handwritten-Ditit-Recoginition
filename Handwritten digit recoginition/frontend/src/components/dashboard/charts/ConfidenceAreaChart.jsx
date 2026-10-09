import "../../../lib/chartSetup";
import { Line } from "react-chartjs-2";
import { gridColor } from "../../../lib/chartSetup";

export default function ConfidenceAreaChart({ labels, values }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Avg. confidence",
        data: values,
        borderColor: "#7F5AF0",
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { chartArea } = chart;
          if (!chartArea) return "rgba(127,90,240,0.2)";
          const gradient = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(127,90,240,0.35)");
          gradient.addColorStop(1, "rgba(127,90,240,0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#7F5AF0",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } },
      y: { grid: { color: gridColor }, ticks: { callback: (v) => `${v}%` } },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
