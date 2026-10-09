import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Layers, Gauge, Cpu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAnalyticsSummary, listPredictions } from "../../api/predictions";
import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import RecentPredictions from "../../components/dashboard/RecentPredictions";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import DigitBarChart from "../../components/dashboard/charts/DigitBarChart";
import TrendLineChart from "../../components/dashboard/charts/TrendLineChart";
import DigitPieChart from "../../components/dashboard/charts/DigitPieChart";
import ConfidenceAreaChart from "../../components/dashboard/charts/ConfidenceAreaChart";

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), listPredictions({ page: 1, perPage: 6 })])
      .then(([summaryData, listData]) => {
        setSummary(summaryData);
        setRecent(listData.predictions);
      })
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

  const hasData = summary.total_predictions > 0;
  const recentForList = recent.map((p) => ({
    id: p.id,
    digit: p.predicted_digit,
    confidence: p.confidence,
    source: p.source === "draw" ? "Draw" : "Upload",
    time: timeAgo(p.created_at),
  }));
  const activityItems = recent.map((p) => ({
    id: p.id,
    label: `Predicted digit ${p.predicted_digit}`,
    meta: `${p.confidence}% confidence`,
    time: timeAgo(p.created_at),
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="font-display font-semibold text-2xl">
          Welcome back, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted text-sm mt-1">Here's what your model has been up to.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Target} label="Today's Predictions" value={summary.today_predictions} delay={0} />
        <StatCard icon={Layers} label="Total Predictions" value={summary.total_predictions} delay={0.05} />
        <StatCard
          icon={Gauge}
          label="Average Confidence"
          value={summary.average_confidence}
          suffix="%"
          decimals={1}
          delay={0.1}
        />
        <StatCard
          icon={Cpu}
          label="Model Accuracy"
          value={summary.model_accuracy}
          suffix="%"
          decimals={2}
          delay={0.15}
        />
      </div>

      {!hasData ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted text-sm">
            No predictions yet — head to Recognize and draw your first digit to bring this dashboard to life.
          </p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ChartCard title="Predictions by digit" subtitle="Distribution across 0–9" delay={0.1}>
              <DigitBarChart data={summary.digit_distribution} />
            </ChartCard>
            <ChartCard title="Prediction volume" subtitle="Last 14 days" delay={0.15}>
              <TrendLineChart labels={summary.daily_trend.labels} values={summary.daily_trend.values} />
            </ChartCard>
            <ChartCard title="Most predicted digits" subtitle="Share of total" delay={0.2}>
              <DigitPieChart data={summary.digit_distribution} />
            </ChartCard>
            <ChartCard title="Average confidence" subtitle="Last 14 days" delay={0.25}>
              <ConfidenceAreaChart labels={summary.confidence_trend.labels} values={summary.confidence_trend.values} />
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <ChartCard title="Recent predictions" subtitle="Your latest activity" delay={0.3}>
              <RecentPredictions predictions={recentForList} />
            </ChartCard>
            <ChartCard title="Activity timeline" subtitle="Everything, in order" delay={0.35}>
              <ActivityTimeline items={activityItems} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
