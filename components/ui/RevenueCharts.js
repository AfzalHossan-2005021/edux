import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#34d399'];

function formatCurrency(value) {
  if (value == null) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

export default function RevenueCharts({ series = [], breakdown = [], type = 'all' }) {
  if (type === 'pie') {
    return (
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={breakdown} cx="50%" cy="50%" innerRadius={36} outerRadius={80} paddingAngle={4}>
              {breakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdown} margin={{ top: 6, right: 6, left: -10, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="value" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default: combined view (area trend on top, small pie beside)
  return (
    <div className="w-full">
      <div className="w-full h-128">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 6, right: 6, left: -10, bottom: 6 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
