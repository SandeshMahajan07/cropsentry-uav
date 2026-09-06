import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Moon, 
  Calendar, 
  Percent, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo).toISOString();

      const res = await api.getAnalyticsSummary(params);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateFrom, dateTo]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-forest-300">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }}>
              {item.name}: <span className="font-bold">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Analytics Header & Date Range Filter */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forest-700" />
            <span>Wildlife Activity Trends & Detection Analytics</span>
          </h3>
          <p className="text-xs text-slate-500">
            Temporal patterns and nocturnal behavior analysis across farm sectors
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            />
          </div>
          <span className="text-slate-400 font-bold">to</span>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Ingested Detections"
            value={data.total_detections}
            subtitle="Raw thermal readings"
            icon={TrendingUp}
          />
          <StatCard
            title="Confirmed Candidates"
            value={data.confirmed_candidates}
            subtitle="Triggered deterrents"
            icon={ShieldAlert}
            alert={true}
          />
          <StatCard
            title="Verified Real Animals"
            value={data.reviewed_stats?.confirmed_reals || 0}
            subtitle="Confirmed by human review"
            icon={CheckCircle2}
            accent={true}
          />
          <StatCard
            title="System False-Alarm Rate"
            value={`${data.false_alarm_rate}%`}
            subtitle="Heated ground/tractors"
            icon={Percent}
          />
        </div>
      )}

      {/* Chart 1: Nocturnal Hour Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Detections by Hour of Night (Nocturnal Sweep)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Distribution across 24-hour cycle. Peak crop raids typically occur between 22:00 and 04:00.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Nocturnal Focus
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {data?.detections_by_hour ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.detections_by_hour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar 
                  dataKey="count" 
                  name="Total Scans" 
                  fill="#94a3b8" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="candidates" 
                  name="Confirmed Animals (Alert Triggered)" 
                  fill="#15803d" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Loading hourly charts...
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Daily Detections Trend */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest-700" />
              <span>Daily Detection Timeline</span>
            </h4>
            <p className="text-xs text-slate-500">
              Tracking wildlife intrusion frequency and drone patrol coverage over consecutive days
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {data?.detections_per_day && data.detections_per_day.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.detections_per_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Field Scans" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="confirmed_candidates" 
                  name="Animal Candidates" 
                  stroke="#dc2626" 
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#dc2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No daily data available for selected range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
