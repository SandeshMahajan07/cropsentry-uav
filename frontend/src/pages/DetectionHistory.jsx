import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Filter, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Thermometer,
  Radio
} from 'lucide-react';

export default function DetectionHistory({ onSelectDetection }) {
  const [detections, setDetections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewedFilter, setReviewedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch Detections with filters and pagination
  const loadDetections = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit
      };

      if (statusFilter) params.status = statusFilter;
      if (reviewedFilter) params.reviewed_status = reviewedFilter;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo).toISOString();

      const res = await api.getDetections(params);
      setDetections(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load detections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetections(1);
  }, [statusFilter, reviewedFilter, dateFrom, dateTo]);

  // Inline Review Action Handler
  const handleQuickReview = async (e, id, newStatus) => {
    e.stopPropagation();
    try {
      await api.updateReviewedStatus(id, newStatus);
      setDetections(prev => prev.map(d => d.id === id ? { ...d, reviewed_status: newStatus } : d));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setReviewedFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-forest-700" />
            <h3 className="text-sm font-bold text-slate-900">Filter Sightings & Scans</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-forest-700 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thermal Scan Outcome</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-forest-600 focus:outline-none"
            >
              <option value="">All Scans</option>
              <option value="confirmed_candidate">🚨 Animal Detected (Alarm Triggered)</option>
              <option value="below_threshold">Safe / Normal Soil Sweep</option>
            </select>
          </div>

          {/* Reviewed Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Farmer Verification</label>
            <select
              value={reviewedFilter}
              onChange={(e) => setReviewedFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-forest-600 focus:outline-none"
            >
              <option value="">All Verification States</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="confirmed_real">Real Animal Confirmed</option>
              <option value="false_alarm">False Alarm (Rock/Tractor)</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Detections Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Scan ID</th>
                <th className="py-3.5 px-4">Snapshot</th>
                <th className="py-3.5 px-4">Timestamp (Local)</th>
                <th className="py-3.5 px-4">Field Coordinates</th>
                <th className="py-3.5 px-4">Thermal Contrast</th>
                <th className="py-3.5 px-4">Detection Result</th>
                <th className="py-3.5 px-4">Farmer Verification</th>
                <th className="py-3.5 px-4 text-right">Quick Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detections.map((d) => {
                const isAnimal = d.status === 'confirmed_candidate';
                return (
                  <tr 
                    key={d.id} 
                    onClick={() => onSelectDetection(d.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{d.id}
                    </td>

                    {/* Snapshot */}
                    <td className="py-3 px-4">
                      {d.image_url ? (
                        <img 
                          src={`http://localhost:5000${d.image_url}`} 
                          alt="Thumbnail" 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                          None
                        </div>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      <div className="font-semibold">{new Date(d.timestamp).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{new Date(d.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* Coordinates */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="font-mono text-slate-600">
                        {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-0.5 mt-0.5"
                      >
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    {/* Temperatures */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                        <span>Δ +{d.delta}°C</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Target: {d.object_temp_celsius}°C | Soil: {d.ambient_temp_celsius}°C
                      </div>
                    </td>

                    {/* Simple Term Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        isAnimal 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isAnimal ? '🚨 Animal Detected' : 'Safe / Normal'}
                      </span>
                    </td>

                    {/* Reviewed Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        d.reviewed_status === 'confirmed_real'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : d.reviewed_status === 'false_alarm'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.reviewed_status === 'confirmed_real' ? 'Real Animal' : d.reviewed_status === 'false_alarm' ? 'False Alarm' : 'Unreviewed'}
                      </span>
                    </td>

                    {/* Inline Quick Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Mark Real Animal"
                          onClick={(e) => handleQuickReview(e, d.id, 'confirmed_real')}
                          className={`p-1.5 rounded-xl border transition ${
                            d.reviewed_status === 'confirmed_real'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Mark False Alarm"
                          onClick={(e) => handleQuickReview(e, d.id, 'false_alarm')}
                          className={`p-1.5 rounded-xl border transition ${
                            d.reviewed_status === 'false_alarm'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectDetection(d.id)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {detections.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No detections match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total detections)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => loadDetections(pagination.page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 transition shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => loadDetections(pagination.page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 transition shadow-sm"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
