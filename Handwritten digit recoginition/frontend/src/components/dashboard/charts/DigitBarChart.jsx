import "../../../lib/chartSetup";
import { Bar } from "react-chartjs-2";
import { gridColor } from "../../../lib/chartSetup";

export default function DigitBarChart({ data }) {
  const chartData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    datasets: [
      {
        label: "Predictions",
        data,
        backgroundColor: "rgba(108,99,255,0.55)",
        hoverBackgroundColor: "rgba(0,212,255,0.7)",
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: gridColor }, beginAtZero: true },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
