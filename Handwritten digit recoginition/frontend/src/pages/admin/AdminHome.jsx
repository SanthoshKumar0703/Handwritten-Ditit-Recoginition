import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Database, Gauge, UserPlus, ArrowRight } from "lucide-react";
import { getPlatformAnalytics } from "../../api/admin";
import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import DigitBarChart from "../../components/dashboard/charts/DigitBarChart";
import TrendLineChart from "../../components/dashboard/charts/TrendLineChart";

const links = [
  { to: "/admin/users", label: "Manage users", desc: "View, promote, or remove accounts", icon: Users },
  { to: "/admin/predictions", label: "Manage predictions", desc: "Browse and moderate every prediction", icon: Database },
  { to: "/admin/model", label: "Model statistics", desc: "Accuracy, per-digit breakdown, training info", icon: Gauge },
];

export default function AdminHome() {
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

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Admin overview</h1>
        <p className="text-muted text-sm mt-1">Platform-wide activity across every account.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Users" value={data.total_users} delay={0} />
        <StatCard icon={UserPlus} label="New Users Today" value={data.new_users_today} delay={0.05} />
        <StatCard icon={Database} label="Total Predictions" value={data.total_predictions} delay={0.1} />
        <StatCard icon={Gauge} label="Avg. Confidence" value={data.average_confidence} suffix="%" decimals={1} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Predictions by digit" subtitle="Across all users" delay={0.1}>
          <DigitBarChart data={data.digit_distribution} />
        </ChartCard>
        <ChartCard title="Platform volume" subtitle="Last 14 days" delay={0.15}>
          <TrendLineChart labels={data.daily_trend.labels} values={data.daily_trend.values} />
        </ChartCard>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {links.map((l, i) => (
          <motion.div
            key={l.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
          >
            <Link to={l.to} className="glow-border glass rounded-2xl p-5 flex items-start gap-3 hover:-translate-y-1 transition-transform block">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-400/20 border border-overlay/10 flex items-center justify-center shrink-0">
                <l.icon size={16} className="text-orange-300" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-xs text-muted mt-0.5">{l.desc}</p>
              </div>
              <ArrowRight size={15} className="text-muted mt-1" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
