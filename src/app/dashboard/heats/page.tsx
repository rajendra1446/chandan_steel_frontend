'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { Flame, Plus, RefreshCw, Layers, Scale, TrendingUp, X } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/layout/StatCard';
import { api, Heat, Material, HeatMaterial } from '@/lib/api';

export default function HeatsPage() {
  const [heats, setHeats] = useState<Heat[]>([]);
  const [grades, setGrades] = useState<Array<{ id: number; grade_code: string; grade_name: string }>>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Expandable heat inspection state
  const [expandedHeatId, setExpandedHeatId] = useState<number | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<{
    materials: HeatMaterial[];
    billets: Array<{
      id: number;
      billet_no: string;
      quantity: number | string;
      consumed_quantity: number | string;
      remaining_quantity: number | string;
      status: string;
    }>;
    loading: boolean;
  } | null>(null);

  const [heatForm, setHeatForm] = useState({
    heat_no: '',
    grade_id: '',
    heat_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    total_output_qty: '',
    remarks: ''
  });

  const [chargeMaterials, setChargeMaterials] = useState([
    { material_id: '', quantity: '', unit: 'KG', remarks: '' }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [heatsRes, gradesRes, matRes] = await Promise.all([
        api.getHeats().catch(() => ({ success: true, count: 0, data: [] })),
        api.getGrades().catch(() => ({ success: true, count: 0, data: [] })),
        api.getMaterials().catch(() => ({ success: true, count: 0, data: [] }))
      ]);

      if (heatsRes?.data) setHeats(heatsRes.data);
      if (gradesRes?.data) setGrades(gradesRes.data);
      if (matRes?.data) setMaterials(matRes.data);
    } catch (err) {
      console.error('Failed to load heats data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMaterialChange = (index: number, field: string, value: string) => {
    const updated: any = [...chargeMaterials];
    updated[index][field] = value;
    setChargeMaterials(updated);
  };

  const addMaterialRow = () => {
    setChargeMaterials([...chargeMaterials, { material_id: '', quantity: '', unit: 'KG', remarks: '' }]);
  };

  const removeMaterialRow = (index: number) => {
    if (chargeMaterials.length > 1) {
      setChargeMaterials(chargeMaterials.filter((_, i) => i !== index));
    }
  };

  const totalInput = chargeMaterials.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalOutput = parseFloat(heatForm.total_output_qty) || 0;
  const meltLoss = totalInput > 0 && totalOutput > 0 ? Math.max(0, totalInput - totalOutput) : 0;
  const yieldPct = totalInput > 0 && totalOutput > 0 ? ((totalOutput / totalInput) * 100).toFixed(1) : null;

  // Toggle heat drill-down details
  const toggleHeatDetails = async (heatId: number) => {
    if (expandedHeatId === heatId) {
      setExpandedHeatId(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedHeatId(heatId);
    setExpandedDetails({ materials: [], billets: [], loading: true });

    try {
      const [matRes, billetsRes] = await Promise.all([
        api.getHeatMaterials(heatId).catch(() => ({ success: false, data: [] })),
        api.getHeatBillets(heatId).catch(() => ({ success: false, data: [] }))
      ]);

      setExpandedDetails({
        materials: matRes.success ? matRes.data : [],
        billets: billetsRes.success ? billetsRes.data : [],
        loading: false
      });
    } catch (err) {
      console.error('Failed to load heat details:', err);
      setExpandedDetails({ materials: [], billets: [], loading: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heatForm.heat_no || !heatForm.grade_id || !heatForm.heat_date) {
      alert('Heat No, Grade, and Heat Date are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const heatRes = await api.createHeat({
        heat_no: heatForm.heat_no.trim(),
        grade_id: Number(heatForm.grade_id),
        heat_date: heatForm.heat_date,
        start_time: heatForm.start_time ? new Date(heatForm.start_time).toISOString() : null,
        end_time: heatForm.end_time ? new Date(heatForm.end_time).toISOString() : null,
        total_input_qty: totalInput,
        total_output_qty: totalOutput,
        remarks: heatForm.remarks.trim() || null
      });

      if (!heatRes.success) throw new Error(heatRes.message || 'Failed to create heat');

      const createdHeatId = heatRes.data.id;
      const validMaterials = chargeMaterials.filter((m) => m.material_id && parseFloat(m.quantity) > 0);

      if (validMaterials.length > 0) {
        await Promise.all(
          validMaterials.map((m) =>
            api.addHeatMaterial(createdHeatId, {
              material_id: Number(m.material_id),
              quantity: parseFloat(m.quantity),
              unit: m.unit || 'KG',
              remarks: m.remarks.trim() || null
            })
          )
        );
      }

      setHeatForm({
        heat_no: '',
        grade_id: '',
        heat_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        total_output_qty: '',
        remarks: ''
      });
      setChargeMaterials([{ material_id: '', quantity: '', unit: 'KG', remarks: '' }]);
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording heat');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aggregated KPIs
  const totalHeats = heats.length;
  const totalMeltInput = heats.reduce((s, h) => s + (Number(h.total_input_qty) || 0), 0);
  const totalMeltOutput = heats.reduce((s, h) => s + (Number(h.total_output_qty) || 0), 0);
  const overallYield = totalMeltInput > 0 ? ((totalMeltOutput / totalMeltInput) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="SMS Furnace Heats"
        subtitle="Record electric arc furnace melt cycles, charge raw materials, and inspect cast output"
        badge="Steel Melting Shop"
        icon={Flame}
        onOpenAi={() => {}}
        aiPromptHint="show furnace heats output"
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
              <span>{showForm ? 'Close Form' : 'Record Melt Heat'}</span>
            </button>
          </div>
        }
      />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heats Melted"
          value={loading ? '...' : totalHeats}
          subtitle="Total furnace heat cycles"
          icon={<Flame size={20} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Charge Raw Input"
          value={`${totalMeltInput.toLocaleString()} KG`}
          subtitle="Scrap & alloys charged"
          icon={<Scale size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Liquid Steel Output"
          value={`${totalMeltOutput.toLocaleString()} KG`}
          subtitle="Net furnace liquid yield"
          icon={<Layers size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Furnace Recovery"
          value={`${overallYield}%`}
          subtitle="Overall melt conversion efficiency"
          icon={<TrendingUp size={20} />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* RECORD NEW HEAT FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 space-y-5 animate-in fade-in duration-150"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Record New Furnace Heat</h2>
              <p className="text-xs text-slate-500">Step 1: Furnace Heat & Raw Scrap Charge Loading</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              Melt Logging
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Heat Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. H-2026-001"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                value={heatForm.heat_no}
                onChange={(e) => setHeatForm({ ...heatForm, heat_no: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Steel Grade *
              </label>
              <select
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                value={heatForm.grade_id}
                onChange={(e) => setHeatForm({ ...heatForm, grade_id: e.target.value })}
              >
                <option value="">Select Steel Grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.grade_code} - {g.grade_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Heat Date *
              </label>
              <input
                type="date"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                value={heatForm.heat_date}
                onChange={(e) => setHeatForm({ ...heatForm, heat_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Liquid Output (KG)
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="Liquid output weight"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                value={heatForm.total_output_qty}
                onChange={(e) => setHeatForm({ ...heatForm, total_output_qty: e.target.value })}
              />
            </div>
          </div>

          {/* Charge Materials Builder */}
          <div className="border border-orange-200/70 bg-orange-50/20 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Raw Material Charge (Total: {totalInput.toFixed(2)} KG)
                </h3>
                <p className="text-[11px] text-slate-500">Add scrap grades, alloys, and fluxes charged into furnace</p>
              </div>
              <button
                type="button"
                onClick={addMaterialRow}
                className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-600 text-xs px-3 py-1.5 rounded-lg font-bold transition self-start cursor-pointer"
              >
                + Add Material Row
              </button>
            </div>

            {chargeMaterials.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="md:col-span-5">
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500 bg-white"
                    value={row.material_id}
                    onChange={(e) => handleMaterialChange(idx, 'material_id', e.target.value)}
                  >
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.material_name} ({m.material_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Qty (KG)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500"
                    value={row.quantity}
                    onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                  />
                </div>

                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="Remarks / Batch"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500"
                    value={row.remarks}
                    onChange={(e) => handleMaterialChange(idx, 'remarks', e.target.value)}
                  />
                </div>

                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(idx)}
                    disabled={chargeMaterials.length === 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 text-xs font-bold p-1 cursor-pointer"
                    title="Remove row"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {totalInput > 0 && totalOutput > 0 && (
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-700 border-t border-orange-200/60 font-medium">
                <span>Charge Input: <strong className="text-slate-900">{totalInput.toFixed(2)} KG</strong></span>
                <span>Liquid Output: <strong className="text-slate-900">{totalOutput.toFixed(2)} KG</strong></span>
                <span>Melt Loss: <strong className="text-rose-600">{meltLoss.toFixed(2)} KG</strong></span>
                <span>Yield: <strong className="text-emerald-600">{yieldPct}%</strong></span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Saving Heat Record...' : 'Save Heat Record'}
            </button>
          </div>
        </form>
      )}

      {/* HEATS TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Recorded Furnace Heats</h3>
            <p className="text-xs text-slate-500">Click any Heat Number to trace all billet consumption and yield</p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-md w-fit">
            {heats.length} Heats Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="p-3.5 pl-6">Heat No (Click to Trace)</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Charge Input</th>
                <th className="p-3.5">Liquid Output</th>
                <th className="p-3.5">Billets Cast</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {heats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {loading ? 'Loading furnace melt records...' : 'No heats recorded yet.'}
                  </td>
                </tr>
              ) : (
                heats.map((h) => {
                  const isExpanded = expandedHeatId === h.id;
                  return (
                    <Fragment key={h.id}>
                      <tr className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-3.5 pl-6">
                          <Link
                            href={`/dashboard/traceability?heat=${encodeURIComponent(h.heat_no)}`}
                            className="font-extrabold text-orange-600 hover:text-orange-800 hover:underline inline-flex items-center gap-1.5"
                            title="Click heat number to trace complete billet flow"
                          >
                            <span>{h.heat_no}</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-medium">
                              Trace
                            </span>
                          </Link>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {h.grade_code}
                          <span className="text-[11px] text-slate-400 font-normal block">{h.grade_name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{new Date(h.heat_date).toLocaleDateString()}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{Number(h.total_input_qty).toLocaleString()} KG</td>
                        <td className="p-3.5 font-bold text-slate-900">{Number(h.total_output_qty).toLocaleString()} KG</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            (h.billets_count || 0) > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {h.billets_count || 0} Billets
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            {h.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="p-3.5 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => toggleHeatDetails(h.id)}
                            className="text-xs font-semibold text-slate-600 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Drilldown Panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-4 bg-slate-50/80 border-b border-slate-200">
                            {expandedDetails?.loading ? (
                              <div className="py-4 text-center text-xs text-slate-500">Loading details...</div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                    Heat Drilldown: {h.heat_no} ({h.grade_code})
                                  </h4>
                                  <Link
                                    href={`/dashboard/traceability?heat=${encodeURIComponent(h.heat_no)}`}
                                    className="text-xs font-bold text-orange-600 hover:underline"
                                  >
                                    View Full Traceability Page →
                                  </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Materials */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                                    <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">
                                      Charge Materials ({expandedDetails?.materials.length || 0})
                                    </h5>
                                    {(!expandedDetails?.materials || expandedDetails.materials.length === 0) ? (
                                      <p className="text-xs text-slate-400 italic">No charge materials logged</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {expandedDetails.materials.map((m) => (
                                          <div key={m.id} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                            <span className="font-medium text-slate-700">{m.material_name}</span>
                                            <span className="font-bold text-slate-900">{Number(m.quantity).toLocaleString()} {m.unit || 'KG'}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Billets */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                                    <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">
                                      Cast Billets ({expandedDetails?.billets.length || 0})
                                    </h5>
                                    {(!expandedDetails?.billets || expandedDetails.billets.length === 0) ? (
                                      <p className="text-xs text-slate-400 italic">No billets cast from this heat yet</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {expandedDetails.billets.map((b) => (
                                          <div key={b.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                                            <Link
                                              href={`/dashboard/traceability?billet=${encodeURIComponent(b.billet_no)}`}
                                              className="font-bold text-orange-600 hover:underline"
                                            >
                                              {b.billet_no}
                                            </Link>
                                            <div className="flex gap-2">
                                              <span>{Number(b.quantity).toLocaleString()} KG</span>
                                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700">
                                                {b.status}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}