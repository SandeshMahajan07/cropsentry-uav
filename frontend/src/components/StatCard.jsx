import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, alert = false, accent = false }) {
  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-200 ${
      accent 
        ? 'bg-gradient-to-br from-forest-900 to-forest-950 text-white border-forest-800 shadow-md' 
        : alert
        ? 'bg-rose-50/70 border-rose-200 text-slate-900'
        : 'bg-white border-slate-200/80 shadow-sm hover:shadow text-slate-800'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-semibold tracking-wider uppercase ${
            accent ? 'text-forest-300' : alert ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${accent ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </h3>
            {badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                accent 
                  ? 'bg-forest-800 text-forest-200 border border-forest-700' 
                  : 'bg-forest-100 text-forest-800'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 ${accent ? 'text-forest-300/80' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${
            accent 
              ? 'bg-forest-800/80 text-forest-200' 
              : alert
              ? 'bg-rose-100 text-rose-600'
              : 'bg-forest-50 text-forest-700'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
