import "../../../lib/chartSetup";
import { Line } from "react-chartjs-2";
import { gridColor } from "../../../lib/chartSetup";

export default function TrendLineChart({ labels, values }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Predictions",
        data: values,
        borderColor: "#3ABEFF",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#00D4FF",
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
      y: { grid: { color: gridColor } },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
