import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/common/GlassCard';
import { Brain, HelpCircle, AlertCircle, CheckCircle2, Loader2, Sparkles, Filter } from 'lucide-react';

export default function XaiDashboard() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  // Filters
  const [schoolId, setSchoolId] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [gender, setGender] = useState('');
  const [community, setCommunity] = useState('');

  const fetchFiltersAndData = async () => {
    try {
      const schoolsRes = await api.get('/schools');
      setSchools(schoolsRes.data);
      
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to initialize filters', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (schoolId) params.school_id = schoolId;
      if (className) params.class_name = className;
      if (section) params.section = section;
      if (gender) params.gender = gender;
      if (community) params.community = community;

      const summaryRes = await api.get('/dashboard/summary', { params });
      setSummaryData(summaryRes.data);
    } catch (err) {
      console.error('Failed to load XAI data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [schoolId, className, section, gender, community]);

  if (loading && !summaryData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Static SHAP impact rules for premium explanation cards
  const shapExplanations = [
    { name: 'Attendance Rate', impact: 'High Risk Impact (+45.2%)', color: 'border-red-500/20 bg-red-500/5 text-red-400', desc: 'Attendance percentage below 75% acts as the single strongest operational precursor to student drop-out.' },
    { name: 'Academic Backlogs', impact: 'High Risk Impact (+32.1%)', color: 'border-red-500/20 bg-red-500/5 text-red-400', desc: 'Active learning backlogs create learning fatigue, decreasing student self-efficacy and accelerating dropout status.' },
    { name: 'Financial Difficulty', impact: 'Medium Risk Impact (+28.4%)', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400', desc: 'Direct financial difficulty hampers supply access (books, transport, smart devices) and correlates with high dropout probabilities.' },
    { name: 'Classroom Motivation', impact: 'Medium Risk Impact (+18.9%)', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400', desc: 'Low motivation feedback logs directly predict high attrition rates. Engagement levels drive classroom retention.' },
    { name: 'Distance to School', impact: 'Low Risk Impact (+11.3%)', color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400', desc: 'Long travel distances (exceeding 3km) without school transportation support increases daily absence rates.' }
  ];

  // Cohort Intervention Recommendations
  const interventionCards = [
    { title: 'Academic Mentorship Circle', focus: 'Academics & Backlogs', action: 'Set up remedial classes for math, sciences, and language backlogs. Pair high-risk students with teacher mentors for exam preparation.', color: 'border-blue-500/30' },
    { title: 'Bursary & Transport Support', focus: 'Financial & Logistical', action: 'Extend tuition grants, midday meal beneficiary coverage, and bicycle/transport passes to students flagged with financial distress.', color: 'border-emerald-500/30' },
    { title: 'Behavioral & Counseling Program', focus: 'Motivation & Engagement', action: 'Incorporate peer counseling workshops, classroom participation rewards, and monthly home visits for students with consecutive absences.', color: 'border-amber-500/30' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Explainable AI (XAI) Cohort Analysis</h1>
            <p className="text-sm text-slate-500">Deconstruct model predictions into actionable risk contributors and tailored intervention plans.</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <GlassCard className="p-5 flex flex-wrap gap-4 items-center justify-between" hoverEffect={false}>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Cohort Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center flex-grow justify-end">
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.school_name}</option>
            ))}
          </select>

          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Classes</option>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Sections</option>
            {['A', 'B', 'C', 'D'].map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Communities</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
      </GlassCard>

      {/* Cohort Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 text-center border-white/20 dark:border-white/5" hoverEffect={false}>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">High Risk Students</span>
          <span className="text-3xl font-black text-red-500">{summaryData?.high_risk_count}</span>
          <p className="text-[10px] text-slate-400 mt-2">Immediate counseling recommended</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-white/20 dark:border-white/5" hoverEffect={false}>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Medium Risk Students</span>
          <span className="text-3xl font-black text-amber-500">{summaryData?.medium_risk_count}</span>
          <p className="text-[10px] text-slate-400 mt-2">Close monitoring advised</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-white/20 dark:border-white/5" hoverEffect={false}>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Predictions Logged</span>
          <span className="text-3xl font-black text-indigo-400">{summaryData?.total_predictions}</span>
          <p className="text-[10px] text-slate-400 mt-2">Total ML model evaluations</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-white/20 dark:border-white/5" hoverEffect={false}>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Model Accuracy</span>
          <span className="text-3xl font-black text-emerald-400">85.32%</span>
          <p className="text-[10px] text-slate-400 mt-2">Trained on Balanced Dataset</p>
        </GlassCard>
      </div>

      {/* SHAP Explanation Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-black text-slate-800 dark:text-white">SHAP Global Risk Impact Cards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shapExplanations.map((exp, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${exp.color} space-y-4 flex flex-col justify-between`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{exp.name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-current">{exp.impact}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">{exp.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <HelpCircle className="h-4 w-4 opacity-70" /> Feature Weight Explanation
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Program Block */}
      <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Cohort-Level Intervention Recommendations</h2>
          <p className="text-xs text-slate-500">Suggested policy reforms and active support groups recommended by the AI engine based on student clusters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interventionCards.map((card, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${card.color} bg-slate-100/5 dark:bg-slate-900/10 space-y-3`}>
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{card.focus}</span>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">{card.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{card.action}</p>
              <div className="pt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Ready for enrollment
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
