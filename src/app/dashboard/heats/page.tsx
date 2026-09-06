'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { api, Heat, Material, HeatMaterial } from '../../../lib/api';

export default function HeatsPage() {
  const [heats, setHeats] = useState<Heat[]>([]);
  const [grades, setGrades] = useState<Array<{ id: number; grade_code: string; grade_name: string }>>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        api.getHeats(),
        api.getGrades(),
        api.getMaterials().catch(() => ({ success: true, count: 0, data: [] }))
      ]);

      if (heatsRes?.success) setHeats(heatsRes.data);
      if (gradesRes?.success) setGrades(gradesRes.data);
      if (matRes?.success) setMaterials(matRes.data);
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
        api.getHeatMaterials(heatId),
        api.getHeatBillets(heatId)
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

      // Reset form
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
    <div className="p-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Heat Logging</h1>
          <p className="text-sm text-gray-500">Record furnace melt cycles, raw material charges, and cast billets</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/traceability"
            className="px-4 py-2 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
          >
            Traceability Center →
          </Link>
          <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
            Total Heats: {totalHeats}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Heats Melted</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalHeats}</p>
          <span className="text-[11px] text-gray-400">Total logged melt heats</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Charge Input</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalMeltInput.toLocaleString()} <span className="text-xs text-gray-500">KG</span></p>
          <span className="text-[11px] text-gray-400">Raw scrap & alloys charged</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Liquid Output</span>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalMeltOutput.toLocaleString()} <span className="text-xs text-gray-500">KG</span></p>
          <span className="text-[11px] text-gray-400">Net liquid steel produced</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Overall Melt Yield</span>
          <p className="text-2xl font-bold text-orange-600 mt-1">{overallYield}%</p>
          <span className="text-[11px] text-gray-400">Furnace recovery efficiency</span>
        </div>
      </div>

      {/* Record New Heat Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">Record New Heat Cycle</h2>
          <span className="text-xs text-gray-400 font-medium">Step 1: Furnace Heat & Material Loading</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Heat No *</label>
            <input
              type="text"
              required
              placeholder="e.g. H-2026-001"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500"
              value={heatForm.heat_no}
              onChange={(e) => setHeatForm({ ...heatForm, heat_no: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Grade *</label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500"
              value={heatForm.grade_id}
              onChange={(e) => setHeatForm({ ...heatForm, grade_id: e.target.value })}
            >
              <option value="">Select Steel Grade</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.grade_code} - {g.grade_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Heat Date *</label>
            <input
              type="date"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500"
              value={heatForm.heat_date}
              onChange={(e) => setHeatForm({ ...heatForm, heat_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Output Qty (KG)</label>
            <input
              type="number"
              step="0.001"
              placeholder="Liquid steel output"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500"
              value={heatForm.total_output_qty}
              onChange={(e) => setHeatForm({ ...heatForm, total_output_qty: e.target.value })}
            />
          </div>
        </div>

        {/* Charge Materials Builder */}
        <div className="border border-orange-100 bg-orange-50/30 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Raw Material Charge (Total: {totalInput.toFixed(2)} KG)
              </h3>
              <p className="text-[11px] text-gray-500">Add scrap, alloys, and additives charged into furnace</p>
            </div>
            <button
              type="button"
              onClick={addMaterialRow}
              className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-600 text-xs px-3 py-1.5 rounded-md font-semibold transition self-start"
            >
              + Add Material Row
            </button>
          </div>

          {chargeMaterials.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-gray-200">
              <div className="md:col-span-5">
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
                  value={row.material_id}
                  onChange={(e) => handleMaterialChange(idx, 'material_id', e.target.value)}
                >
                  <option value="">Select Material</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.material_name} ({m.material_code})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <input
                  type="number"
                  step="0.001"
                  placeholder="Qty (KG)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
                  value={row.quantity}
                  onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Remarks / Batch No"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
                  value={row.remarks}
                  onChange={(e) => handleMaterialChange(idx, 'remarks', e.target.value)}
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeMaterialRow(idx)}
                  disabled={chargeMaterials.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30 text-sm font-bold p-1"
                  title="Remove row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Real-time yield / loss summary box */}
          {totalInput > 0 && totalOutput > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-700 border-t border-orange-100">
              <span>Total Charge: <strong>{totalInput.toFixed(2)} KG</strong></span>
              <span>Liquid Output: <strong>{totalOutput.toFixed(2)} KG</strong></span>
              <span>Melt Loss: <strong className="text-red-600">{meltLoss.toFixed(2)} KG</strong></span>
              <span>Yield: <strong className="text-green-600">{yieldPct}%</strong></span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Heat...' : 'Save Heat Record'}
          </button>
        </div>
      </form>

      {/* Heats Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Recorded Furnace Heats</h3>
            <p className="text-xs text-gray-500">Click any Heat Number to trace all billet consumption and yield</p>
          </div>
          <button
            onClick={loadData}
            className="text-xs text-gray-600 hover:text-orange-600 border border-gray-200 bg-white px-3 py-1.5 rounded-md font-medium transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading furnace heat logs...</div>
        ) : heats.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No heat records found. Record your first heat cycle above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <tr>
                  <th className="p-3.5">Heat No (Click to Trace)</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Charge Input</th>
                  <th className="p-3.5">Liquid Output</th>
                  <th className="p-3.5">Billets Cast</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {heats.map((h) => {
                  const isExpanded = expandedHeatId === h.id;
                  return (
                    <Fragment key={h.id}>
                      <tr className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-3.5">
                          <Link
                            href={`/dashboard/traceability?heat=${encodeURIComponent(h.heat_no)}`}
                            className="font-bold text-orange-600 hover:text-orange-800 hover:underline inline-flex items-center gap-1.5"
                            title="Click heat number to show complete billet traceability"
                          >
                            <span>{h.heat_no}</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                              Trace Billet Flow
                            </span>
                          </Link>
                        </td>
                        <td className="p-3.5 font-medium text-gray-800">
                          {h.grade_code}
                          <span className="text-xs text-gray-400 block">{h.grade_name}</span>
                        </td>
                        <td className="p-3.5 text-gray-600">{new Date(h.heat_date).toLocaleDateString()}</td>
                        <td className="p-3.5 text-gray-700 font-medium">{Number(h.total_input_qty).toLocaleString()} KG</td>
                        <td className="p-3.5 font-semibold text-gray-900">{Number(h.total_output_qty).toLocaleString()} KG</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            (h.billets_count || 0) > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {h.billets_count || 0} Billets
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {h.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleHeatDetails(h.id)}
                            className="text-xs font-semibold text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 border border-gray-200 px-2.5 py-1 rounded transition"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Heat Inspection Panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-4 bg-slate-50 border-b border-gray-200">
                            {expandedDetails?.loading ? (
                              <div className="py-4 text-center text-xs text-gray-500">Loading heat materials and billets...</div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                                      Heat Drilldown: {h.heat_no} ({h.grade_code})
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      Input: {Number(h.total_input_qty).toLocaleString()} KG | Output: {Number(h.total_output_qty).toLocaleString()} KG
                                    </span>
                                  </div>
                                  <Link
                                    href={`/dashboard/traceability?heat=${encodeURIComponent(h.heat_no)}`}
                                    className="text-xs font-semibold text-orange-600 hover:text-orange-800 hover:underline flex items-center gap-1"
                                  >
                                    View Full End-to-End Traceability Page →
                                  </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Raw Material Charge */}
                                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                      Raw Material Charge ({expandedDetails?.materials.length || 0})
                                    </h5>
                                    {(!expandedDetails?.materials || expandedDetails.materials.length === 0) ? (
                                      <p className="text-xs text-gray-400 italic">No charge materials logged for this heat</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                          <thead className="bg-gray-50 text-gray-500 border-b">
                                            <tr>
                                              <th className="py-1 px-2">Material</th>
                                              <th className="py-1 px-2">Type</th>
                                              <th className="py-1 px-2 text-right">Quantity</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {expandedDetails.materials.map((m) => (
                                              <tr key={m.id}>
                                                <td className="py-1 px-2 font-medium text-gray-800">
                                                  {m.material_name} ({m.material_code})
                                                </td>
                                                <td className="py-1 px-2 text-gray-500">{m.material_type}</td>
                                                <td className="py-1 px-2 text-right font-semibold text-gray-900">
                                                  {Number(m.quantity).toLocaleString()} {m.unit || 'KG'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  {/* Billets Cast */}
                                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                      Billets Cast ({expandedDetails?.billets.length || 0})
                                    </h5>
                                    {(!expandedDetails?.billets || expandedDetails.billets.length === 0) ? (
                                      <p className="text-xs text-gray-400 italic">No billets cast from this heat yet</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                          <thead className="bg-gray-50 text-gray-500 border-b">
                                            <tr>
                                              <th className="py-1 px-2">Billet No</th>
                                              <th className="py-1 px-2">Cast Qty</th>
                                              <th className="py-1 px-2">Consumed</th>
                                              <th className="py-1 px-2">Remaining</th>
                                              <th className="py-1 px-2">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {expandedDetails.billets.map((b) => (
                                              <tr key={b.id}>
                                                <td className="py-1 px-2 font-bold text-orange-600">
                                                  <Link
                                                    href={`/dashboard/traceability?billet=${encodeURIComponent(b.billet_no)}`}
                                                    className="hover:underline"
                                                    title="Trace this billet"
                                                  >
                                                    {b.billet_no}
                                                  </Link>
                                                </td>
                                                <td className="py-1 px-2 font-medium">{Number(b.quantity).toLocaleString()} KG</td>
                                                <td className="py-1 px-2 text-blue-600 font-medium">{Number(b.consumed_quantity).toLocaleString()} KG</td>
                                                <td className="py-1 px-2 text-green-600 font-semibold">{Number(b.remaining_quantity).toLocaleString()} KG</td>
                                                <td className="py-1 px-2">
                                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                                                    {b.status}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}