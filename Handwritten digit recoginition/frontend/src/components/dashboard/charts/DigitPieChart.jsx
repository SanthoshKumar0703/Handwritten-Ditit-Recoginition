import "../../../lib/chartSetup";
import { Pie } from "react-chartjs-2";

const palette = [
  "#6C63FF", "#7F5AF0", "#3ABEFF", "#00D4FF", "#8B7CFF",
  "#4FD1FF", "#9D8BFF", "#2FA8E8", "#B4A6FF", "#5CCBFF",
];

export default function DigitPieChart({ data }) {
  const chartData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    datasets: [
      {
        data,
        backgroundColor: palette,
        borderColor: "#050505",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { boxWidth: 10, boxHeight: 10, padding: 10, font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}
