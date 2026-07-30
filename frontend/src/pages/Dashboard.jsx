import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import api from '../services/api';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { 
  Users, Activity, Brain, School, Sparkles, Filter, 
  Download, Calendar, Award, RefreshCw, Loader2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [activeTab, setActiveTab] = useState('risk'); // risk, demographic, academic, causal

  // Metrics state
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);

  // Filter values
  const [schoolId, setSchoolId] = useState(user?.role !== 'admin' ? user?.school_id || '' : '');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [gender, setGender] = useState('');
  const [community, setCommunity] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [labour, setLabour] = useState('');
  const [motivation, setMotivation] = useState('');
  const [backlogs, setBacklogs] = useState('');

  // Auto-refresh interval reference
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFilters = async () => {
    try {
      const schoolsRes = await api.get('/schools');
      setSchools(schoolsRes.data);
    } catch (err) {
      console.error('Failed to load schools filter options', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const params = {};
      if (schoolId) params.school_id = schoolId;
      if (className) params.class_name = className;
      if (section) params.section = section;
      if (gender) params.gender = gender;
      if (community) params.community = community;
      if (riskLevel) params.risk_level = riskLevel;
      if (difficulty) params.financial_difficulty = difficulty;
      if (labour) params.child_labour_risk = labour;
      if (motivation) params.low_motivation = motivation;
      if (backlogs) params.academic_backlogs = backlogs;

      const [summaryRes, chartsRes, recentRes] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/dashboard/charts', { params }),
        api.get('/dashboard/recent')
      ]);

      setSummary(summaryRes.data);
      setCharts(chartsRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [schoolId, className, section, gender, community, riskLevel, difficulty, labour, motivation, backlogs, refreshKey]);

  // Set up auto refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // SVG Chart download to PNG utility
  const exportChartAsPng = (chartId, filename) => {
    const containerElement = document.getElementById(chartId);
    if (!containerElement) return;
    const svgElement = containerElement.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth || 600;
      canvas.height = svgElement.clientHeight || 400;
      const context = canvas.getContext('2d');
      
      // Draw background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      
      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `${filename}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    image.src = blobURL;
  };

  const riskColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981'
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#a855f7'];

  if (loading && !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Banner */}
      <GlassCard className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Dropout Predictor System Active
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Student Retention Analytics Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Monitor dropout risk metrics, cohort distributions, and causal risk factors using real-time machine learning predictions.
            </p>
          </div>
          <div className="shrink-0 bg-white/50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 px-5 py-3.5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">AI Engine Status</span>
              <div className="flex items-center gap-2 mt-1 text-slate-800 dark:text-white">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black">CatBoost 91.7% Accuracy</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-350 transition-colors"
              title="Manual Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Advanced Filters Panel */}
      <GlassCard className="p-6 border-white/30 dark:border-white/5 space-y-4" hoverEffect={false}>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Advanced Metrics Filtering</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {user?.role === 'admin' && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Target School</label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
              >
                <option value="">All Schools</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.school_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Class</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All Classes</option>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Community Group</label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All Groups</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Risk Status</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All Risks</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Financial Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Child Labour Risk</label>
            <select
              value={labour}
              onChange={(e) => setLabour(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Academic Backlogs</label>
            <select
              value={backlogs}
              onChange={(e) => setBacklogs(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Low Motivation</label>
            <select
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 flex items-center gap-4 h-full" hoverEffect={true}>
          <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Cohort Students</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1 truncate">{summary?.total_students}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 h-full" hoverEffect={true}>
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">High Risk Students</span>
            <h3 className="text-2xl font-black text-red-500 mt-1 truncate">{summary?.high_risk_count}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 h-full" hoverEffect={true}>
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-2xl shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Medium Risk Students</span>
            <h3 className="text-2xl font-black text-amber-500 mt-1 truncate">{summary?.medium_risk_count}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4 h-full" hoverEffect={true}>
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Avg AI Confidence</span>
            <h3 className="text-2xl font-black text-emerald-500 mt-1 truncate">{(summary?.avg_confidence * 100).toFixed(1)}%</h3>
          </div>
        </GlassCard>
      </div>

      {/* Visualizations tab section */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto gap-6">
          {[
            { id: 'risk', label: 'Risk & Trends' },
            { id: 'demographic', label: 'Demographics' },
            { id: 'academic', label: 'Academics & Attendance' },
            { id: 'causal', label: 'Causal Risk Factors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-bold text-xs uppercase border-b-2 tracking-wider transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-550'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content rendering */}
        {activeTab === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="risk-distribution-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Dropout Risk Distribution</h4>
                <button 
                  onClick={() => exportChartAsPng('risk-distribution-card', 'risk_distribution')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts?.risk_distribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {charts?.risk_distribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={riskColors[entry.name] || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="prediction-trend-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Prediction Timeline Trend</h4>
                <button 
                  onClick={() => exportChartAsPng('prediction-trend-card', 'prediction_trend')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.prediction_trend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="High" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Medium" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="Low" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4 lg:col-span-2" hoverEffect={false} id="school-risk-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">School-wise Risk Comparison</h4>
                <button 
                  onClick={() => exportChartAsPng('school-risk-card', 'school_wise_risk')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.school_risk_comparison}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" stackId="a" />
                    <Bar dataKey="Medium" fill="#f59e0b" stackId="a" />
                    <Bar dataKey="Low" fill="#10b981" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'demographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="gender-distribution-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Gender Distribution</h4>
                <button 
                  onClick={() => exportChartAsPng('gender-distribution-card', 'gender_distribution')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts?.gender_distribution} innerRadius={0} outerRadius={85} label dataKey="value">
                      {charts?.gender_distribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="community-distribution-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Community Group Distribution</h4>
                <button 
                  onClick={() => exportChartAsPng('community-distribution-card', 'community_distribution')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.community_distribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1">
                      {charts?.community_distribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="attendance-distribution-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Attendance Percentage Distribution</h4>
                <button 
                  onClick={() => exportChartAsPng('attendance-distribution-card', 'attendance_distribution')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.attendance_distribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="academics-distribution-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Academic Grade Brackets</h4>
                <button 
                  onClick={() => exportChartAsPng('academics-distribution-card', 'academic_marks_distribution')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.academics_distribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4 lg:col-span-2" hoverEffect={false} id="class-risk-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Classroom-wise Risk Distribution</h4>
                <button 
                  onClick={() => exportChartAsPng('class-risk-card', 'classroom_wise_risk')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.class_risk_comparison}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" stackId="b" />
                    <Bar dataKey="Medium" fill="#f59e0b" stackId="b" />
                    <Bar dataKey="Low" fill="#10b981" stackId="b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'causal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="difficulty-analysis-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Financial Difficulty Influence</h4>
                <button 
                  onClick={() => exportChartAsPng('difficulty-analysis-card', 'financial_difficulty_influence')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.financial_difficulty_analysis}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" />
                    <Bar dataKey="Medium" fill="#f59e0b" />
                    <Bar dataKey="Low" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="labour-analysis-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Child Labour Risk Impact</h4>
                <button 
                  onClick={() => exportChartAsPng('labour-analysis-card', 'child_labour_risk_influence')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.child_labour_risk_analysis}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" />
                    <Bar dataKey="Medium" fill="#f59e0b" />
                    <Bar dataKey="Low" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="backlogs-analysis-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Academic Backlogs Correlation</h4>
                <button 
                  onClick={() => exportChartAsPng('backlogs-analysis-card', 'academic_backlogs_influence')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.backlogs_analysis}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" />
                    <Bar dataKey="Medium" fill="#f59e0b" />
                    <Bar dataKey="Low" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4" hoverEffect={false} id="motivation-analysis-card">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Low Motivation Attrition</h4>
                <button 
                  onClick={() => exportChartAsPng('motivation-analysis-card', 'low_motivation_influence')} 
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.motivation_analysis}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" fill="#ef4444" />
                    <Bar dataKey="Medium" fill="#f59e0b" />
                    <Bar dataKey="Low" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Recent Predictions logs and quick navigation links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent predictions activity log */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col justify-between" hoverEffect={false}>
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-500" /> Recent AI Risk Assessments (Auto Refreshing)
              </h3>

              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Brain className="h-10 w-10 text-slate-350 dark:text-slate-700 mb-2 animate-pulse" />
                  <span className="text-xs font-semibold">No active prediction logs recorded yet.</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm bg-white/20 dark:bg-slate-900/10 backdrop-blur-md">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/50 dark:bg-slate-900/50 font-extrabold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-450 border-b border-slate-200/80 dark:border-slate-850">
                      <tr>
                        <th className="px-5 py-3.5">Student</th>
                        <th className="px-5 py-3.5">Risk Level</th>
                        <th className="px-5 py-3.5">Dropout Probability</th>
                        <th className="px-5 py-3.5">School Name</th>
                        <th className="px-5 py-3.5">Predicted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850/80 bg-transparent font-semibold text-slate-700 dark:text-slate-300">
                      {recent.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-150">
                          <td className="px-5 py-4 font-bold text-slate-850 dark:text-white">
                            {p.student_name}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold mt-0.5">{p.student_id}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                              p.risk_level === 'High' ? 'bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20' :
                              p.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-650 dark:text-amber-450 border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20'
                            }`}>
                              {p.risk_level}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800 dark:text-white">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-850 dark:text-white">
                                {p.probability ? `${Math.round(p.probability * 100)}%` : 'N/A'}
                              </span>
                              {p.probability && (
                                <div className="hidden sm:block w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      p.risk_level === 'High' ? 'bg-red-500' :
                                      p.risk_level === 'Medium' ? 'bg-amber-500' :
                                      'bg-emerald-500'
                                    }`}
                                    style={{ width: `${p.probability * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-450 dark:text-slate-400 font-bold">
                            {p.school_name}
                          </td>
                          <td className="px-5 py-4 text-slate-400 dark:text-slate-500 text-[10px]">
                            {new Date(p.predicted_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Predict Action card */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 bg-gradient-to-br from-indigo-900/20 via-slate-900/10 to-transparent flex flex-col justify-between h-full border-white/20 dark:border-white/5" hoverEffect={true}>
            <div className="space-y-4">
              <div className="bg-indigo-650 text-white p-3.5 rounded-2xl w-fit shadow-md shadow-indigo-650/20">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Run AI Risk Analysis</h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">
                Analyze a student's record using our validated CatBoost machine learning pipeline. Get predictions on dropout risk and explore visual diagnostic explanations.
              </p>
            </div>
            
            <Link
              to="/portal/risk-analysis"
              className="mt-8 w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/15"
            >
              Quick Predict <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
