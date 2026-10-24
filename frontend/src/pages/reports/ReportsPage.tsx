import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useToast } from '@/hooks/useToast';

export function ReportsPage() {
  const [reportType, setReportType] = useState('resident');
  const [format, setFormat] = useState('csv');
  const { pushToast } = useToast();

  const handleDownload = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const url = `${apiBase}/reports/export?type=${reportType}&format=${format}`;
    window.open(url, '_blank');

    pushToast({
      type: 'success',
      title: 'Report Download Started',
      description: `Downloading ${reportType.toUpperCase()} report in ${format.toUpperCase()} format.`,
    });
  };

  return (
    <section className="space-y-6">
      <TopBar title="Society Reports & Analytics Export" subtitle="Generate comprehensive PDF, Excel, and CSV reports for residents, visitors, complaints, maintenance dues, and facilities." />

      <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 backdrop-blur-md space-y-6">
        <h2 className="text-xl font-bold text-white">Select Export Options</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Report Module</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="resident">Resident Directory & Occupancy Report</option>
              <option value="visitor">Visitor Traffic & Gate Verification Log Report</option>
              <option value="complaint">Complaint Ticketing & Staff Performance Report</option>
              <option value="maintenance">Maintenance Billing & Payment Collection Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">File Format</label>
            <div className="flex gap-4">
              {['csv', 'excel', 'pdf'].map((fmt) => (
                <label key={fmt} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-2xl border p-4 text-center text-xs font-bold uppercase transition ${
                      format === fmt
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                        : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {fmt}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full rounded-2xl bg-cyan-400 py-3.5 font-bold text-slate-950 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
        >
          <span>Download Formatted Report</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        </button>
      </div>
    </section>
  );
}
