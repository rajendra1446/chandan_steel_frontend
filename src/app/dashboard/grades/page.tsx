'use client';
import { useState, useEffect } from 'react';
import { Grade } from '../../../types/index';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chandan-steel-backend-4.onrender.com/api';

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ grade_code: '', grade_name: '', description: '' });

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchGrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/grades`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) setGrades(data.data);
    } catch (err) {
      console.error('Failed to load grades', err);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/grades`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setForm({ grade_code: '', grade_name: '', description: '' });
        fetchGrades();
      } else {
        alert(data.message || 'Error adding grade');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Master</h1>
          <p className="text-sm text-gray-500">Manage steel grades and chemical compositions</p>
        </div>
        <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-md text-xs font-semibold">
          Total Grades: {grades.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Grade Code *</label>
          <input
            type="text"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            value={form.grade_code}
            onChange={(e) => setForm({ ...form, grade_code: e.target.value })}
            placeholder="e.g. Fe 500D"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Grade Name *</label>
          <input
            type="text"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            value={form.grade_name}
            onChange={(e) => setForm({ ...form, grade_name: e.target.value })}
            placeholder="High Yield Strength Steel"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Specifications..."
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Saving...' : 'Add Grade'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3.5 font-semibold text-gray-600">ID</th>
              <th className="p-3.5 font-semibold text-gray-600">Grade Code</th>
              <th className="p-3.5 font-semibold text-gray-600">Grade Name</th>
              <th className="p-3.5 font-semibold text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">No grades registered yet.</td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr key={g.id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="p-3.5 text-gray-500">#{g.id}</td>
                  <td className="p-3.5 font-semibold text-orange-600">{g.grade_code}</td>
                  <td className="p-3.5 text-gray-800 font-medium">{g.grade_name}</td>
                  <td className="p-3.5 text-gray-500">{g.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}