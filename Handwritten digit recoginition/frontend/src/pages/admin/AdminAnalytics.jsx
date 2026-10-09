import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPlatformAnalytics } from "../../api/admin";
import ChartCard from "../../components/dashboard/ChartCard";
import DigitBarChart from "../../components/dashboard/charts/DigitBarChart";
import TrendLineChart from "../../components/dashboard/charts/TrendLineChart";
import DigitPieChart from "../../components/dashboard/charts/DigitPieChart";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformAnalytics().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-400 text-sm text-center py-16">{error}</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-red-400/30 border-t-orange-400 animate-spin" />
      </div>
    );
  }

  const sourceTotal = data.source_breakdown.draw + data.source_breakdown.upload;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Platform analytics</h1>
        <p className="text-muted text-sm mt-1">Aggregated across every user on DigiSense.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Predictions by digit" subtitle="Platform-wide" delay={0.1}>
          <DigitBarChart data={data.digit_distribution} />
        </ChartCard>
        <ChartCard title="Volume trend" subtitle="Last 14 days" delay={0.15}>
          <TrendLineChart labels={data.daily_trend.labels} values={data.daily_trend.values} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Most predicted digits" subtitle="Share of total" delay={0.2}>
          <DigitPieChart data={data.digit_distribution} />
        </ChartCard>
        <ChartCard title="Draw vs. Upload" subtitle="Input source breakdown" delay={0.25}>
          <div className="flex items-center justify-center h-[220px] gap-10">
            {[
              ["Draw", data.source_breakdown.draw, "from-violet to-purple"],
              ["Upload", data.source_breakdown.upload, "from-sky to-cyan"],
            ].map(([label, count, gradient]) => (
              <div key={label} className="text-center">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-display font-semibold text-xl text-onaccent mb-2`}
                >
                  {sourceTotal ? Math.round((count / sourceTotal) * 100) : 0}%
                </div>
                <p className="text-sm">{label}</p>
                <p className="text-xs text-muted">{count}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
