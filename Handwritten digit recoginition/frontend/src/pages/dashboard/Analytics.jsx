import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Layers, Gauge, Cpu } from "lucide-react";
import { getAnalyticsSummary } from "../../api/predictions";
import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import DigitBarChart from "../../components/dashboard/charts/DigitBarChart";
import TrendLineChart from "../../components/dashboard/charts/TrendLineChart";
import DigitPieChart from "../../components/dashboard/charts/DigitPieChart";
import ConfidenceAreaChart from "../../components/dashboard/charts/ConfidenceAreaChart";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-violet/30 border-t-sky animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm text-center py-16">{error}</p>;
  }

  const hasData = data.total_predictions > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Analytics</h1>
        <p className="text-muted text-sm mt-1">Real trends from your own prediction history.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Target} label="Today's Predictions" value={data.today_predictions} delay={0} />
        <StatCard icon={Layers} label="Total Predictions" value={data.total_predictions} delay={0.05} />
        <StatCard
          icon={Gauge}
          label="Average Confidence"
          value={data.average_confidence}
          suffix="%"
          decimals={1}
          delay={0.1}
        />
        <StatCard
          icon={Cpu}
          label="Model Accuracy"
          value={data.model_accuracy}
          suffix="%"
          decimals={2}
          delay={0.15}
        />
      </div>

      {!hasData ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted text-sm">
            No predictions yet — head to Recognize and draw a few digits to see your trends here.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Predictions by digit" subtitle="Distribution across 0–9" delay={0.1}>
            <DigitBarChart data={data.digit_distribution} />
          </ChartCard>
          <ChartCard title="Prediction volume" subtitle="Last 14 days" delay={0.15}>
            <TrendLineChart labels={data.daily_trend.labels} values={data.daily_trend.values} />
          </ChartCard>
          <ChartCard title="Most predicted digits" subtitle="Share of total" delay={0.2}>
            <DigitPieChart data={data.digit_distribution} />
          </ChartCard>
          <ChartCard title="Average confidence" subtitle="Last 14 days" delay={0.25}>
            <ConfidenceAreaChart labels={data.confidence_trend.labels} values={data.confidence_trend.values} />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
