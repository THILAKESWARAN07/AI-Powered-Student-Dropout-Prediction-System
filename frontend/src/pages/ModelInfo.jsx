import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/common/GlassCard';
import { Cpu, ShieldCheck, BarChart3, Database, Award, Loader2 } from 'lucide-react';

export default function ModelInfo() {
  const [loading, setLoading] = useState(true);
  const [modelDetails, setModelDetails] = useState(null);

  const fetchModelDetails = async () => {
    try {
      const res = await api.get('/dashboard/model');
      setModelDetails(res.data);
    } catch (err) {
      console.error('Failed to load model details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metricCards = [
    { label: 'Accuracy', value: `${(modelDetails.accuracy * 100).toFixed(2)}%`, desc: 'Overall classification correctness', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
    { label: 'Precision', value: `${(modelDetails.precision * 100).toFixed(2)}%`, desc: 'Accuracy of true positive flags', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
    { label: 'Recall (Sensitivity)', value: `${(modelDetails.recall * 100).toFixed(2)}%`, desc: 'Dropout capture rate of the model', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
    { label: 'F1 Score', value: `${(modelDetails.f1_score * 100).toFixed(2)}%`, desc: 'Harmonic mean of precision & recall', color: 'text-pink-400 border-pink-500/20 bg-pink-500/5' },
    { label: 'ROC-AUC', value: `${(modelDetails.roc_auc * 100).toFixed(2)}%`, desc: 'Classifier probability separation score', color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
          <Cpu className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Model Information & Parameters</h1>
          <p className="text-sm text-slate-500">Deep-dive into the trained Tuned Logistic Regression dropout classifier's metrics, configuration and weight importances.</p>
        </div>
      </div>

      {/* Model Spec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4" hoverEffect={false}>
          <Database className="h-10 w-10 text-indigo-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Training Size</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">
              {modelDetails.training_dataset_size.toLocaleString()} Balanced Rows
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4" hoverEffect={false}>
          <ShieldCheck className="h-10 w-10 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Algorithm</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">
              {modelDetails.algorithm}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4" hoverEffect={false}>
          <BarChart3 className="h-10 w-10 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Model Features</span>
            <span className="text-lg font-black text-slate-800 dark:text-white">
              {modelDetails.features_count} Raw Variables
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Metrics Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Classification Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricCards.map((m, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${m.color} text-center space-y-2`}>
              <Award className="h-6 w-6 mx-auto opacity-80" />
              <div>
                <span className="text-xs font-bold text-slate-400 block">{m.label}</span>
                <span className="text-2xl font-black block">{m.value}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight font-medium">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Importance Data */}
      <GlassCard className="p-8" hoverEffect={false}>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Tuned Logistic Regression Feature Importance Weights</h2>
          <p className="text-xs text-slate-500">Weight breakdown illustrating the model's reliance on raw student categories when issuing dropout predictions.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Feature Column</th>
                <th className="px-6 py-3.5">Variable Label</th>
                <th className="px-6 py-3.5">Model Weight (%)</th>
                <th className="px-6 py-3.5">Importance Contribution Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white/10 dark:bg-slate-950/10">
              {modelDetails.feature_importance.map((f, i) => (
                <tr key={f.feature} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-3 font-bold text-slate-400">#{i + 1}</td>
                  <td className="px-6 py-3 font-mono font-bold text-primary">{f.feature}</td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-350">{f.label}</td>
                  <td className="px-6 py-3 font-extrabold text-slate-800 dark:text-white">
                    {f.importance.toFixed(2)}%
                  </td>
                  <td className="px-6 py-3">
                    <div className="w-48 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, f.importance * 5)}%` }} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
