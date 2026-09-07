'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, RefreshCw, Layers } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/layout/StatCard';
import { api } from '@/lib/api';

interface GradeItem {
  id: number;
  grade_code: string;
  grade_name: string;
  description: string | null;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ grade_code: '', grade_name: '', description: '' });

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.getGrades();
      if (res?.data) setGrades(res.data);
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade_code.trim() || !form.grade_name.trim()) {
      alert('Grade Code and Grade Name are required.');
      return;
    }

    setSaving(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chandan-steel-backend-4.onrender.com/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${API_BASE}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setForm({ grade_code: '', grade_name: '', description: '' });
        setShowForm(false);
        fetchGrades();
      } else {
        alert(data.message || 'Error adding grade');
      }
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const filteredGrades = grades.filter((g) =>
    g.grade_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.grade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Steel Grades Master"
        subtitle="Manage metallurgical compositions, alloy codes, and physical tensile standards"
        badge="Quality Standards"
        icon={Sparkles}
        onOpenAi={() => {}}
        aiPromptHint="what grades are available"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchGrades}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              <span>{showForm ? 'Close Form' : 'New Steel Grade'}</span>
            </button>
          </div>
        }
      />

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Grades"
          value={loading ? '...' : grades.length}
          subtitle="Certified metallurgical grades"
          icon={<Sparkles size={20} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Rebar & Structural Grades"
          value={grades.filter((g) => g.grade_code.includes('Fe') || g.grade_code.includes('TMT')).length}
          subtitle="High yield rebar standards"
          icon={<Layers size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Specialty Alloy Grades"
          value={grades.filter((g) => !g.grade_code.includes('Fe') && !g.grade_code.includes('TMT')).length}
          subtitle="Stainless & alloy grades"
          icon={<Sparkles size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* CREATE NEW GRADE FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Steel Grade</h2>
              <p className="text-xs text-slate-500">Register metallurgical code and chemical definition</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              Grade Entry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Grade Code *
              </label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition font-medium"
                value={form.grade_code}
                onChange={(e) => setForm({ ...form, grade_code: e.target.value })}
                placeholder="e.g. Fe 500D, SS 304L"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Grade Name *
              </label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition font-medium"
                value={form.grade_name}
                onChange={(e) => setForm({ ...form, grade_name: e.target.value })}
                placeholder="High Yield Strength Rebar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Chemical / Mechanical Specs
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition font-medium"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="C: 0.25 max, S: 0.040 max"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Steel Grade'}
            </button>
          </div>
        </form>
      )}

      {/* GRADES TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Registered Steel Grades</h3>
            <p className="text-xs text-slate-500">Official steel chemical compositions recognized across the plant</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="p-3.5 pl-6">ID</th>
                <th className="p-3.5">Grade Code</th>
                <th className="p-3.5">Grade Specification Name</th>
                <th className="p-3.5 pr-6">Chemical & Tensile Specifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    {loading ? 'Loading steel grade master records...' : 'No steel grades match your search.'}
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-3.5 pl-6 text-slate-400 font-mono">#{g.id}</td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/80">
                        {g.grade_code}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{g.grade_name}</td>
                    <td className="p-3.5 pr-6 text-slate-500">{g.description || 'Standard mill specification'}</td>
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