'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chandan-steel-backend-4.onrender.com/api';

interface HeatOption {
  id: number;
  heat_no: string;
  grade_id: number;
  grade_code: string;
  grade_name: string;
  total_output_qty?: number;
}

interface GradeOption {
  id: number;
  grade_code: string;
  grade_name: string;
}

interface BilletItem {
  id: number;
  billet_no: string;
  quantity: string | number;
  unit: string;
  production_date: string;
  status: string;
  heat_no: string;
  grade_code: string;
  grade_name: string;
}

export default function BilletsPage() {
  const [billets, setBillets] = useState<BilletItem[]>([]);
  const [heats, setHeats] = useState<HeatOption[]>([]);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState<HeatOption | null>(null);

  // Form State matching backend requirements
  const [form, setForm] = useState({
    billet_no: '',
    heat_id: '',
    grade_id: '',
    quantity: '',
    production_date: new Date().toISOString().split('T')[0]
  });

  // Token helper
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Initial Fetch: Billets, Heats & Grades
  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [billetsRes, heatsRes, gradesRes] = await Promise.all([
        fetch(`${API_BASE}/billets`, { headers }).then((res) => res.json()),
        fetch(`${API_BASE}/heats`, { headers }).then((res) => res.json()),
        fetch(`${API_BASE}/grades`, { headers }).then((res) => res.json())
      ]);

      if (billetsRes.success) setBillets(billetsRes.data);
      if (heatsRes.success) setHeats(heatsRes.data);
      if (gradesRes.success) setGrades(gradesRes.data);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When user picks a Heat -> Auto-select grade
  const handleHeatChange = (heatIdStr: string) => {
    const heatObj = heats.find((h) => h.id === Number(heatIdStr)) || null;
    setSelectedHeat(heatObj);

    setForm((prev) => ({
      ...prev,
      heat_id: heatIdStr,
      grade_id: heatObj ? String(heatObj.grade_id) : ''
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.billet_no || !form.heat_id || !form.grade_id || !form.quantity || !form.production_date) {
      alert('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/billets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          billet_no: form.billet_no.trim(),
          heat_id: Number(form.heat_id),
          grade_id: Number(form.grade_id),
          quantity: parseFloat(form.quantity),
          production_date: form.production_date
        })
      });

      const result = await res.json();

      if (result.success) {
        // Reset form
        setForm({
          billet_no: '',
          heat_id: '',
          grade_id: '',
          quantity: '',
          production_date: new Date().toISOString().split('T')[0]
        });
        setSelectedHeat(null);
        // Refresh Table
        loadData();
      } else {
        alert(result.message || 'Billet create karne me problem aayi');
      }
    } catch (error) {
      console.error('Failed to submit billet:', error);
      alert('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6  mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billet Casting & Management</h1>
          <p className="text-sm text-gray-500">Heats se cast huye billets ko register aur track karein</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-sm text-blue-800 font-medium">
          Total Billets: {billets.length}
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">New Billet Entry</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Heat Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Heat Number *
            </label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={form.heat_id}
              onChange={(e) => handleHeatChange(e.target.value)}
            >
              <option value="">-- Heat Select Karein --</option>
              {heats.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.heat_no} ({h.grade_code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Grade Selection (Auto selected or manual fallback) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Grade *
            </label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={form.grade_id}
              onChange={(e) => setForm({ ...form, grade_id: e.target.value })}
            >
              <option value="">-- Grade --</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grade_code} - {g.grade_name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Billet Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Billet No / Heat Stamp *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BIL-2026-001"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={form.billet_no}
              onChange={(e) => setForm({ ...form, billet_no: e.target.value })}
            />
          </div>

          {/* 4. Weight (Quantity in KG) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Weight (KG) *
            </label>
            <input
              type="number"
              step="0.001"
              required
              placeholder="e.g. 2500.000"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          {/* 5. Production Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Production Date *
            </label>
            <input
              type="date"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={form.production_date}
              onChange={(e) => setForm({ ...form, production_date: e.target.value })}
            />
          </div>
        </div>

        {/* Selected Heat Live Overview */}
        {selectedHeat && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap gap-6 items-center text-slate-700">
            <div>
              <span className="font-semibold text-gray-500">Selected Heat:</span>{' '}
              <span className="font-bold text-orange-500">{selectedHeat.heat_no}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-500">Associated Grade:</span>{' '}
              <span className="font-bold text-gray-900">{selectedHeat.grade_code} ({selectedHeat.grade_name})</span>
            </div>
            {selectedHeat.total_output_qty !== undefined && (
              <div>
                <span className="font-semibold text-gray-500">Furnace Output:</span>{' '}
                <span className="font-bold text-emerald-700">{selectedHeat.total_output_qty} KG</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Billet' : '+ Create Cast Billet'}
          </button>
        </div>
      </form>

      {/* Billets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Cast Billets Stock</h3>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Loading data...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3.5 font-semibold text-gray-600">Billet No</th>
                <th className="p-3.5 font-semibold text-gray-600">Heat No</th>
                <th className="p-3.5 font-semibold text-gray-600">Grade</th>
                <th className="p-3.5 font-semibold text-gray-600">Weight</th>
                <th className="p-3.5 font-semibold text-gray-600">Cast / Prod Date</th>
                <th className="p-3.5 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    {loading ? 'Problem Data fetching' : 'No record found'}
                  </td>
                </tr>
              ) : (
                billets.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-semibold text-gray-900">
                      {b.billet_no}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-xs">
                        {b.heat_no}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700">
                      <div className="font-medium text-gray-900">{b.grade_code}</div>
                      <div className="text-xs text-gray-500">{b.grade_name}</div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">
                      {Number(b.quantity).toLocaleString()} {b.unit || 'KG'}
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {new Date(b.production_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'IN_PRODUCTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}