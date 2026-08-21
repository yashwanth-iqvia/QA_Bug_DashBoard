import { memo, type ReactElement } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardTitle } from '@/components/ui/Card';
import type { BugRecord } from '@/types/jira';
import { countByField, trendByMonth } from '@/lib/jira-utils';
import { PRIORITY_COLORS } from '@/types/jira';

const CHART_COLORS = ['#2563EB', '#16A34A', '#EA580C', '#DC2626', '#CA8A04', '#6B7280', '#7C3AED', '#0891B2'];

interface BugAnalyticsProps {
  bugs: BugRecord[];
  onDrillDown?: (field: string, value: string) => void;
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <Card className="min-h-[320px]">
      <CardTitle>{title}</CardTitle>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </Card>
  );
}

export const BugAnalytics = memo(function BugAnalytics({ bugs, onDrillDown }: BugAnalyticsProps) {
  const byStatus = countByField(bugs, 'status');
  const byPriority = countByField(bugs, 'priority');
  const byReporter = countByField(bugs, 'reporter').slice(0, 8);
  const byAssignee = countByField(bugs, 'assignee').slice(0, 8);
  const createdTrend = trendByMonth(bugs, 'created');
  const resolvedTrend = trendByMonth(bugs, 'resolutionDate');

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Bugs by Status">
        <PieChart>
          <Pie
            data={byStatus}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
            onClick={(d) => onDrillDown?.('status', d.name)}
          >
            {byStatus.map((entry, i) => (
              <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title="Bugs by Priority">
        <BarChart data={byPriority}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" onClick={(d) => onDrillDown?.('priority', d.name)}>
            {byPriority.map((entry) => (
              <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#64748B'} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Bugs by Reporter">
        <BarChart data={byReporter} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563EB" onClick={(d) => onDrillDown?.('reporter', d.name)} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Bugs by Assignee">
        <BarChart data={byAssignee} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip />
          <Bar dataKey="value" fill="#16A34A" onClick={(d) => onDrillDown?.('assignee', d.name)} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Bugs Created Trend">
        <LineChart data={createdTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Bugs Resolved Trend">
        <LineChart data={resolvedTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>
    </section>
  );
});
