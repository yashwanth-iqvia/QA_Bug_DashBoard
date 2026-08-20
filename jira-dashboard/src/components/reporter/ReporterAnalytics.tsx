import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardTitle } from '@/components/ui/Card';
import type { ReporterStats } from '@/types/jira';

const COLORS = ['#2563EB', '#16A34A', '#EA580C', '#DC2626', '#CA8A04', '#6B7280'];

interface ReporterAnalyticsProps {
  stats: ReporterStats[];
}

export function ReporterAnalytics({ stats }: ReporterAnalyticsProps) {
  const top = stats.slice(0, 10);

  return (
    <section className="space-y-4">
      <Card>
        <CardTitle>Reporter Analytics — Leaderboard</CardTitle>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700">
                <th className="px-3 py-2">Reporter</th>
                <th className="px-3 py-2">Total Reported</th>
                <th className="px-3 py-2">Open</th>
                <th className="px-3 py-2">Resolved</th>
                <th className="px-3 py-2">Critical</th>
                <th className="px-3 py-2">Avg Resolution (days)</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => (
                <tr key={row.reporter} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 font-medium">{row.reporter}</td>
                  <td className="px-3 py-2">{row.total}</td>
                  <td className="px-3 py-2">{row.open}</td>
                  <td className="px-3 py-2">{row.resolved}</td>
                  <td className="px-3 py-2">{row.critical}</td>
                  <td className="px-3 py-2">{row.avgResolutionDays ? row.avgResolutionDays.toFixed(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Reporter Share (Pie)</CardTitle>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={top} dataKey="total" nameKey="reporter" cx="50%" cy="50%" outerRadius={90} label>
                {top.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Reporter Totals (Bar)</CardTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reporter" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" />
              <Bar dataKey="open" fill="#EA580C" />
              <Bar dataKey="resolved" fill="#16A34A" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </section>
  );
}
