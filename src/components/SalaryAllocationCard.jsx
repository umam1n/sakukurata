import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, CheckCircle, Plus, Trash2, Wand2, Calculator } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';
import { BUDGET_TEMPLATES } from '../utils/templates';

export const SalaryAllocationCard = () => {
  const { categories, saveBuckets, totalIncome, baseSalary, setBaseSalary } = useFinance();

  const [tempCategories, setTempCategories] = useState(categories);
  const [simulatorSalary, setSimulatorSalary] = useState(totalIncome || 5000000);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPercent, setNewCatPercent] = useState('10');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');
  const [showAddForm, setShowAddForm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setTempCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (totalIncome > 0) setSimulatorSalary(totalIncome);
  }, [totalIncome]);

  const currentTotalPercent = tempCategories.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0);
  const isValid = currentTotalPercent === 100;
  const diffTo100 = 100 - currentTotalPercent;

  const handlePercentageChange = (id, newPercent) => {
    const val = Math.max(0, Math.min(100, Number(newPercent) || 0));
    setTempCategories((prev) => prev.map((c) => (c.id === id ? { ...c, percentage: val } : c)));
  };

  const handleNameChange = (id, name) => {
    setTempCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleAdjustStep = (id, step) => {
    setTempCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, percentage: Math.max(0, Math.min(100, (Number(c.percentage) || 0) + step)) } : c
      )
    );
  };

  const handleAutoBalance = () => {
    if (diffTo100 === 0 || tempCategories.length === 0) return;
    setTempCategories((prev) => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const newPercent = Math.max(0, (Number(copy[lastIndex].percentage) || 0) + diffTo100);
      copy[lastIndex] = { ...copy[lastIndex], percentage: newPercent };
      return copy;
    });
  };

  const handleApplyTemplate = async (templateBuckets) => {
    const fresh = templateBuckets.map((b, idx) => ({
      ...b,
      id: `tmp_${Date.now()}_${idx}`
    }));
    setTempCategories(fresh);
    await saveBuckets(fresh);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: `tmp_${Date.now()}`,
      name: newCatName.trim(),
      percentage: Number(newCatPercent) || 0,
      color: newCatColor,
      icon: 'Tag'
    };
    setTempCategories((prev) => [...prev, newCat]);
    setNewCatName('');
    setShowAddForm(false);
  };

  const handleRemoveCategory = (id) => {
    if (tempCategories.length <= 1) return;
    setTempCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    if (!isValid) return;
    await saveBuckets(tempCategories);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="modern-glass-card rounded-[28px] p-5 space-y-5">
      <div className="space-y-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" /> Alokasi Anggaran Fleksibel
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Atur Pos Anggaran (Total 100%)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isValid && (
            <button
              onClick={handleAutoBalance}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30"
            >
              <Wand2 className="w-3.5 h-3.5" /> Auto-Pas ({diffTo100 > 0 ? `+${diffTo100}%` : `${diffTo100}%`})
            </button>
          )}

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isValid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {currentTotalPercent}% / 100%
          </div>

          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
              isValid
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {savedToast ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Salary Input & Live Simulator */}
      <div className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <Calculator className="w-3.5 h-3.5 text-blue-400" /> Simulasi Gaji / Pemasukan
          </span>
          <span className="text-xs font-extrabold text-emerald-400">{formatRupiah(simulatorSalary)}</span>
        </div>

        <input
          type="range"
          min="1000000"
          max="50000000"
          step="500000"
          value={Math.min(50000000, Math.max(1000000, simulatorSalary))}
          onChange={(e) => setSimulatorSalary(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />

        {simulatorSalary !== baseSalary && (
          <button
            type="button"
            onClick={() => setBaseSalary(simulatorSalary)}
            className="text-[11px] font-bold text-emerald-400 hover:underline"
          >
            Terapkan {formatRupiah(simulatorSalary)} sebagai Gaji Bulanan saya →
          </button>
        )}
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Terapkan Template Cepat:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tpl.buckets)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-semibold border border-white/10 transition-all"
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
        {tempCategories.map((cat) => (
          <div
            key={cat.id}
            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
            className="h-full transition-all duration-300"
            title={`${cat.name}: ${cat.percentage}%`}
          />
        ))}
      </div>

      {/* Editable Bucket Rows */}
      <div className="space-y-2.5">
        {tempCategories.map((cat) => {
          const nominal = Math.round((simulatorSalary * (Number(cat.percentage) || 0)) / 100);
          return (
            <div
              key={cat.id}
              className="bg-[#0d1117] p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="w-3 h-9 rounded-md flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleNameChange(cat.id, e.target.value)}
                    className="w-full bg-transparent font-bold text-white text-xs focus:outline-none focus:text-emerald-300 truncate"
                  />
                  <span className="text-[11px] font-extrabold text-emerald-400 block">
                    {formatRupiah(nominal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-0.5 bg-[#16191f] border border-white/10 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustStep(cat.id, -5)}
                    className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white font-bold"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cat.percentage}
                    onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                    className="w-9 bg-transparent text-center text-xs font-extrabold text-white focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400">%</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustStep(cat.id, 5)}
                    className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white font-bold"
                  >
                    +5
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                  title="Hapus Pos"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Bucket */}
      <div className="pt-2 border-t border-white/5">
        {showAddForm ? (
          <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2 bg-[#0d1117] p-3 rounded-2xl border border-white/10">
            <input
              type="text"
              placeholder="Nama Pos (mis: Investasi)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 min-w-[140px] bg-[#16191f] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
              required
            />
            <input
              type="number"
              value={newCatPercent}
              onChange={(e) => setNewCatPercent(e.target.value)}
              className="w-14 bg-[#16191f] border border-white/10 text-center text-xs font-bold text-white rounded-xl py-2"
            />
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
              Tambah
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
            >
              Batal
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-dashed border-white/15"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Tambah Pos Anggaran Baru
          </button>
        )}
      </div>
    </div>
  );
};
