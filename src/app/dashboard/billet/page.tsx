'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Boxes, Plus, RefreshCw, Layers, Scale, CheckCircle2, X } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/layout/StatCard';
import { api } from '@/lib/api';

interface HeatOption {
  id: number;
  heat_no: string;
  grade_id: number;
  grade_code: string;
  grade_name: string;
  total_output_qty?: number | string;
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
  consumed_quantity?: number;
  remaining_quantity?: number;
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
  const [showForm, setShowForm] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState<HeatOption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    billet_no: '',
    heat_id: '',
    grade_id: '',
    quantity: '',
    production_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [billetsRes, heatsRes, gradesRes] = await Promise.all([
        api.getBillets().catch((err) => {
          console.warn('Billets load warning:', err);
          return { success: false, data: [] };
        }),
        api.getHeats().catch((err) => {
          console.warn('Heats load warning:', err);
          return { success: false, data: [] };
        }),
        api.getGrades().catch((err) => {
          console.warn('Grades load warning:', err);
          return { success: false, data: [] };
        })
      ]);

      if (billetsRes?.data) setBillets(billetsRes.data as any);
      if (heatsRes?.data) setHeats(heatsRes.data as any);
      if (gradesRes?.data) setGrades(gradesRes.data as any);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHeatChange = (heatIdStr: string) => {
    const heatObj = heats.find((h) => h.id === Number(heatIdStr)) || null;
    setSelectedHeat(heatObj);

    setForm((prev) => ({
      ...prev,
      heat_id: heatIdStr,
      grade_id: heatObj ? String(heatObj.grade_id) : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.billet_no || !form.heat_id || !form.grade_id || !form.quantity || !form.production_date) {
      alert('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.createBillet({
        billet_no: form.billet_no.trim(),
        heat_id: Number(form.heat_id),
        grade_id: Number(form.grade_id),
        quantity: parseFloat(form.quantity),
        production_date: form.production_date
      });

      if (result.success) {
        setForm({
          billet_no: '',
          heat_id: '',
          grade_id: '',
          quantity: '',
          production_date: new Date().toISOString().split('T')[0]
        });
        setSelectedHeat(null);
        setShowForm(false);
        await loadData();
      } else {
        alert(result.message || 'Error recording billet');
      }
    } catch (error: any) {
      console.error('Failed to submit billet:', error);
      alert(error.message || 'Network error recording billet');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const totalBillets = billets.length;
  const totalWeight = billets.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
  const availableBillets = billets.filter((b) => b.status === 'AVAILABLE');
  const availableWeight = availableBillets.reduce((sum, b) => sum + (Number(b.remaining_quantity ?? b.quantity) || 0), 0);
  const consumedBillets = billets.filter((b) => b.status === 'CONSUMED' || Number(b.consumed_quantity) > 0);
  const consumedWeight = billets.reduce((sum, b) => sum + (Number(b.consumed_quantity) || 0), 0);

  const filteredBillets = billets.filter((b) =>
    b.billet_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.heat_no && b.heat_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.grade_code && b.grade_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Cast Billet Inventory & Cutting"
        subtitle="Continuous cast billet yard inventory, heat heat-stamps, and rolling mill consumption"
        badge="Continuous Caster"
        icon={Boxes}
        onOpenAi={() => {}}
        aiPromptHint="how many billet were consume and remain"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
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
              {showForm ? <X size={16} /> : <Plus size={16} />}
              <span>{showForm ? 'Close Form' : 'Register Cast Billet'}</span>
            </button>
          </div>
        }
      />

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cast Billets"
          value={loading ? '...' : totalBillets}
          subtitle={`Total Cast: ${(totalWeight / 1000).toFixed(1)} MT`}
          icon={<Boxes size={20} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Available in Yard"
          value={availableBillets.length}
          subtitle={`Ready for mill: ${(availableWeight / 1000).toFixed(1)} MT`}
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Consumed in Rolling"
          value={consumedBillets.length}
          subtitle={`Processed: ${(consumedWeight / 1000).toFixed(1)} MT`}
          icon={<Scale size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Yard Weight"
          value={`${totalWeight.toLocaleString()} KG`}
          subtitle="Net continuous cast volume"
          icon={<Layers size={20} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* NEW BILLET FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 space-y-5 animate-in fade-in duration-150"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Continuous Cast Billet Entry</h2>
              <p className="text-xs text-slate-500">Log new cast billets cut from furnace heats</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              Caster Output
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Heat Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Furnace Heat *
              </label>
              <select
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 bg-white font-medium"
                value={form.heat_id}
                onChange={(e) => handleHeatChange(e.target.value)}
              >
                <option value="">-- Select Heat --</option>
                {heats.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.heat_no} ({h.grade_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Steel Grade *
              </label>
              <select
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 bg-white font-medium"
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

            {/* Billet Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Billet Stamp / No *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BIL-2026-001"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                value={form.billet_no}
                onChange={(e) => setForm({ ...form, billet_no: e.target.value })}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Weight (KG) *
              </label>
              <input
                type="number"
                step="0.001"
                required
                placeholder="e.g. 2500.000"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            {/* Production Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Casting Date *
              </label>
              <input
                type="date"
                required
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                value={form.production_date}
                onChange={(e) => setForm({ ...form, production_date: e.target.value })}
              />
            </div>
          </div>

          {/* Selected Heat Live Preview */}
          {selectedHeat && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-wrap gap-5 items-center text-slate-700">
              <div>
                <span className="text-slate-500">Selected Heat:</span>{' '}
                <span className="font-extrabold text-orange-600">{selectedHeat.heat_no}</span>
              </div>
              <div>
                <span className="text-slate-500">Grade Specification:</span>{' '}
                <span className="font-bold text-slate-900">{selectedHeat.grade_code} ({selectedHeat.grade_name})</span>
              </div>
              {selectedHeat.total_output_qty !== undefined && (
                <div>
                  <span className="text-slate-500">Furnace Output:</span>{' '}
                  <span className="font-bold text-emerald-700">{selectedHeat.total_output_qty} KG</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Registering Billet...' : 'Create Cast Billet'}
            </button>
          </div>
        </form>
      )}

      {/* BILLETS TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Continuous Cast Billets Yard Stock</h3>
            <p className="text-xs text-slate-500">All registered billets linked to parent heats and rolling status</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search billets, heats, grades..."
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
                <th className="p-3.5 pl-6">Billet Stamp</th>
                <th className="p-3.5">Parent Heat</th>
                <th className="p-3.5">Steel Grade</th>
                <th className="p-3.5">Cast Weight</th>
                <th className="p-3.5">Casting Date</th>
                <th className="p-3.5 pr-6">Yard Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBillets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {loading ? 'Loading cast billet stock records...' : 'No billets found.'}
                  </td>
                </tr>
              ) : (
                filteredBillets.map((b) => (
                  <tr key={b.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-900">
                      <Link
                        href={`/dashboard/traceability?billet=${encodeURIComponent(b.billet_no)}`}
                        className="hover:text-orange-600 hover:underline flex items-center gap-1.5"
                        title="Click to view full billet traceability"
                      >
                        <span>{b.billet_no}</span>
                        <span className="text-[10px] text-slate-400">→</span>
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/dashboard/traceability?heat=${encodeURIComponent(b.heat_no)}`}
                        title="Click to trace parent heat"
                        className="inline-flex items-center gap-1 font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded text-xs transition"
                      >
                        <span>{b.heat_no}</span>
                        <span className="text-[10px] text-orange-600">→</span>
                      </Link>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="font-bold text-slate-900">{b.grade_code}</div>
                      <div className="text-[11px] text-slate-400">{b.grade_name}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {Number(b.quantity).toLocaleString()} {b.unit || 'KG'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {new Date(b.production_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3.5 pr-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'IN_PRODUCTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
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