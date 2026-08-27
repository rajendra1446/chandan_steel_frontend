'use client';
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chandan-steel-backend-4.onrender.com/api';

export default function HeatsPage() {
  const [heats, setHeats] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadData = async () => {
    try {
      const headers = getAuthHeaders();
      const [heatsRes, gradesRes, matRes] = await Promise.all([
        fetch(`${API_BASE}/heats`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/grades`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/materials`, { headers }).then((r) => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (heatsRes?.success) setHeats(heatsRes.data);
      if (gradesRes?.success) setGrades(gradesRes.data);
      if (matRes?.success) setMaterials(matRes.data);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const headers = getAuthHeaders();
      const heatRes = await fetch(`${API_BASE}/heats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          heat_no: heatForm.heat_no.trim(),
          grade_id: Number(heatForm.grade_id),
          heat_date: heatForm.heat_date,
          start_time: heatForm.start_time ? new Date(heatForm.start_time).toISOString() : null,
          end_time: heatForm.end_time ? new Date(heatForm.end_time).toISOString() : null,
          total_input_qty: totalInput,
          total_output_qty: parseFloat(heatForm.total_output_qty) || 0,
          remarks: heatForm.remarks.trim() || null
        })
      });

      const heatData = await heatRes.json();
      if (!heatData.success) throw new Error(heatData.message);

      const heatId = heatData.data.id;
      const validMaterials = chargeMaterials.filter((m) => m.material_id && parseFloat(m.quantity) > 0);

      await Promise.all(
        validMaterials.map((m) =>
          fetch(`${API_BASE}/heats/${heatId}/materials`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              material_id: Number(m.material_id),
              quantity: parseFloat(m.quantity),
              unit: m.unit || 'KG',
              remarks: m.remarks.trim() || null
            })
          })
        )
      );

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
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording heat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Heat Logging</h1>
          <p className="text-sm text-gray-500">Record furnace melt cycles and charge materials</p>
        </div>
        <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-md text-xs font-semibold">
          Total Heats: {heats.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Record New Heat</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Heat No *</label>
            <input
              type="text"
              required
              placeholder="e.g. H-2026-001"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={heatForm.heat_no}
              onChange={(e) => setHeatForm({ ...heatForm, heat_no: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Grade *</label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={heatForm.grade_id}
              onChange={(e) => setHeatForm({ ...heatForm, grade_id: e.target.value })}
            >
              <option value="">Select Grade</option>
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
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
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
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
              value={heatForm.total_output_qty}
              onChange={(e) => setHeatForm({ ...heatForm, total_output_qty: e.target.value })}
            />
          </div>
        </div>

        {/* Charge Materials */}
        <div className="border border-orange-100 bg-orange-50/30 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Raw Material Charge (Total: {totalInput.toFixed(2)} KG)</h3>
            <button
              type="button"
              onClick={addMaterialRow}
              className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-600 text-xs px-3 py-1.5 rounded-md font-semibold transition"
            >
              + Add Material Row
            </button>
          </div>

          {chargeMaterials.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-gray-200">
              <div className="md:col-span-5">
                <select
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
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
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                  value={row.quantity}
                  onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Remarks"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                  value={row.remarks}
                  onChange={(e) => handleMaterialChange(idx, 'remarks', e.target.value)}
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeMaterialRow(idx)}
                  disabled={chargeMaterials.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Heat Record'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3.5 font-semibold text-gray-600">Heat No</th>
              <th className="p-3.5 font-semibold text-gray-600">Grade</th>
              <th className="p-3.5 font-semibold text-gray-600">Date</th>
              <th className="p-3.5 font-semibold text-gray-600">Input (KG)</th>
              <th className="p-3.5 font-semibold text-gray-600">Output (KG)</th>
              <th className="p-3.5 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {heats.map((h) => (
              <tr key={h.id} className="hover:bg-orange-50/40 transition-colors">
                <td className="p-3.5 font-bold text-orange-600">{h.heat_no}</td>
                <td className="p-3.5 font-medium text-gray-800">{h.grade_code}</td>
                <td className="p-3.5 text-gray-600">{new Date(h.heat_date).toLocaleDateString()}</td>
                <td className="p-3.5 text-gray-700">{h.total_input_qty} KG</td>
                <td className="p-3.5 font-semibold text-gray-900">{h.total_output_qty} KG</td>
                <td className="p-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {h.status || 'COMPLETED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}