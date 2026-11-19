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
  const [newCatColor, setNewCatColor] = useState('#818cf8');
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
      copy[lastIndex] = {
        ...copy[lastIndex],
        percentage: Math.max(0, (Number(copy[lastIndex].percentage) || 0) + diffTo100)
      };
      return copy;
    });
  };

  const handleApplyTemplate = async (templateBuckets) => {
    const fresh = templateBuckets.map((b, idx) => ({ ...b, id: `tmp_${Date.now()}_${idx}` }));
    setTempCategories(fresh);
    await saveBuckets(fresh);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setTempCategories((prev) => [
      ...prev,
      { id: `tmp_${Date.now()}`, name: newCatName.trim(), percentage: Number(newCatPercent) || 0, color: newCatColor, icon: 'Tag' }
    ]);
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
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="y-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" /> Flexible Budget Allocator
          </div>
          <h2 className="text-base font-extrabold tracking-tight">100% Salary Split</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isValid && (
            <button
              onClick={handleAutoBalance}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/25"
            >
              <Wand2 className="w-3.5 h-3.5" /> Auto-Fit ({diffTo100 > 0 ? `+${diffTo100}%` : `${diffTo100}%`})
            </button>
          )}

          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            {isValid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {currentTotalPercent}% / 100%
          </div>

          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${
              isValid ? 'y-btn-accent' : 'opacity-40 cursor-not-allowed text-muted'
            }`}
            style={!isValid ? { background: 'var(--bg-3)' } : undefined}
          >
            {savedToast ? 'Saved!' : 'Save Split'}
          </button>
        </div>
      </div>

      {/* Salary Simulator */}
      <div className="p-3.5 rounded-lg space-y-2" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Calculator className="w-3.5 h-3.5 text-accent" /> Income Simulator
          </span>
          <span className="text-xs font-extrabold text-accent">{formatRupiah(simulatorSalary)}</span>
        </div>

        <input
          type="range"
          min="1000000"
          max="50000000"
          step="500000"
          value={Math.min(50000000, Math.max(1000000, simulatorSalary))}
          onChange={(e) => setSimulatorSalary(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg cursor-pointer"
          style={{ accentColor: 'var(--color-accent)' }}
        />

        {simulatorSalary !== baseSalary && (
          <button
            type="button"
            onClick={() => setBaseSalary(simulatorSalary)}
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            Set {formatRupiah(simulatorSalary)} as my monthly base income →
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5">
        {BUDGET_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleApplyTemplate(tpl.buckets)}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted hover:text-primary transition-colors"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Allocation Bar */}
      <div className="h-2.5 w-full rounded-full overflow-hidden flex" style={{ background: 'var(--bg-3)' }}>
        {tempCategories.map((cat) => (
          <div
            key={cat.id}
            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
            className="h-full transition-all duration-300"
            title={`${cat.name}: ${cat.percentage}%`}
          />
        ))}
      </div>

      {/* Bucket List */}
      <div className="space-y-2">
        {tempCategories.map((cat) => {
          const nominal = Math.round((simulatorSalary * (Number(cat.percentage) || 0)) / 100);
          return (
            <div
              key={cat.id}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-2.5 h-8 rounded flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleNameChange(cat.id, e.target.value)}
                    className="w-full bg-transparent font-bold text-xs text-primary focus:outline-none truncate"
                  />
                  <span className="text-[11px] font-semibold text-accent block">{formatRupiah(nominal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <div
                  className="flex items-center gap-0.5 rounded-md p-0.5"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={() => handleAdjustStep(cat.id, -5)}
                    className="px-1.5 py-0.5 text-[10px] text-muted hover:text-primary font-bold"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cat.percentage}
                    onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                    className="w-9 bg-transparent text-center text-xs font-bold text-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted font-bold">%</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustStep(cat.id, 5)}
                    className="px-1.5 py-0.5 text-[10px] text-muted hover:text-primary font-bold"
                  >
                    +5
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="p-1 text-dim hover:text-rose-400"
                  title="Remove bucket"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Bucket */}
      <div>
        {showAddForm ? (
          <form
            onSubmit={handleAddCategory}
            className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <input
              type="text"
              placeholder="Bucket name (e.g. Investments)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 min-w-[140px] y-input px-2.5 py-1.5 text-xs"
              required
            />
            <input
              type="number"
              value={newCatPercent}
              onChange={(e) => setNewCatPercent(e.target.value)}
              className="w-14 y-input px-2 py-1.5 text-center text-xs font-bold"
            />
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <button type="submit" className="px-3 py-1.5 rounded-md y-btn-accent text-xs">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1.5 rounded-md text-xs text-muted hover:text-primary"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 rounded-lg text-xs font-semibold text-muted hover:text-primary flex items-center justify-center gap-1.5"
            style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-strong)' }}
          >
            <Plus className="w-3.5 h-3.5 text-accent" /> Add Custom Budget Bucket
          </button>
        )}
      </div>
    </div>
  );
};
