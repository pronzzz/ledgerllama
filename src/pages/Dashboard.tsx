import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAutomationAlerts } from '../hooks/useAutomationAlerts';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = 'Inter';

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();
  const alerts = useAutomationAlerts();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-24 text-muted-foreground animate-pulse">
        Calculating insights from local OPFS...
      </div>
    );
  }

  const trendData = {
    labels: stats.dailyTrend.map(t => new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Expenses',
        data: stats.dailyTrend.map(t => t.amount),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      x: { grid: { display: false } }
    }
  };

  const donutData = {
    labels: stats.categoryBreakdown.map(c => c.category),
    datasets: [
      {
        data: stats.categoryBreakdown.map(c => c.amount),
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#f43f5e',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#0ea5e9',
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Your local financial overview.</p>
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => (
            <div key={i} className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl border border-destructive/20 text-sm flex items-center gap-3">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {alert}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Wallet className="w-4 h-4" /> Total Balance
          </div>
          <div className="text-3xl font-bold tracking-tight">
            ${stats.totalBalance.toFixed(2)}
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" /> Monthly Income
          </div>
          <div className="text-3xl font-bold tracking-tight text-green-500">
            ${stats.monthlyIncome.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm hidden md:block">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <ArrowDownRight className="w-4 h-4 text-destructive" /> Monthly Expenses
          </div>
          <div className="text-3xl font-bold tracking-tight text-destructive">
            ${stats.monthlyExpense.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Expense Trend (30 Days)</h3>
          <div className="flex-1 min-h-[300px]">
            {stats.dailyTrend.length > 0 ? (
               <Line data={trendData} options={trendOptions} />
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground italic">No expense data yet.</div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Category Breakdown</h3>
          <div className="flex-1 min-h-[300px]">
             {stats.categoryBreakdown.length > 0 ? (
               <Doughnut data={donutData} options={donutOptions} />
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground italic">No category data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
