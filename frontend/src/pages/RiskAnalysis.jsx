import React, { useState, useEffect } from 'react';
import { 
  Brain, AlertTriangle, CheckCircle, Clock, BookOpen, User, 
  HelpCircle, Sparkles, TrendingUp, ShieldAlert, Award
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';

export default function RiskAnalysis() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch model information on load
  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const res = await api.get('/predictions/model-info');
        setModelInfo(res.data);
      } catch (err) {
        showToast('Failed to load machine learning model details', 'error');
      }
    };
    fetchModelInfo();
  }, []);

  // Search students dynamically
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setStudents([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await api.get('/students', {
          params: { search: searchQuery }
        });
        setStudents(res.data.results || []);
      } catch (err) {
        // Silent catch
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle student selection
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSelectedStudentId(student.id);
    setSearchQuery('');
    setStudents([]);
    setAnalysisResult(null);
    
    // Fetch historical predictions
    try {
      const res = await api.get(`/predictions/history/${student.id}`);
      setHistory(res.data);
    } catch (err) {
      setHistory([]);
    }
  };

  // Run AI analysis
  const handleRunAnalysis = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const res = await api.post(`/predictions/student/${selectedStudentId}`);
      setAnalysisResult(res.data);
      showToast('AI analysis completed successfully!', 'success');
      
      // Refresh prediction history
      const historyRes = await api.get(`/predictions/history/${selectedStudentId}`);
      setHistory(historyRes.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Machine learning model execution failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" /> Explainable AI Risk Analysis
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Real-time dropout prediction and diagnostic explanations powered by our CatBoost model.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Student Picker & Model Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Student Selection Card */}
          <GlassCard className="p-6 relative z-20">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Select Student</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
              />
              
              {searchLoading && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                </div>
              )}
 
              {/* Autocomplete dropdown search results */}
              {students.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <div className="font-bold">{student.full_name}</div>
                      <div className="text-slate-400 mt-0.5">ID: {student.student_id} • Class {student.class_name} ({student.section})</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student profile overview */}
            {selectedStudent && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">{selectedStudent.full_name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{selectedStudent.student_id}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Class / Section</span>
                    <span className="text-slate-800 dark:text-white">Class {selectedStudent.class_name} - {selectedStudent.section}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Attendance</span>
                    <span className="text-slate-800 dark:text-white">{selectedStudent.attendance?.attendance_percentage?.toFixed(1)}%</span>
                  </div>
                </div>

                {!isTeacher && (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={loading}
                    className="w-full mt-4 bg-primary text-white font-bold text-sm py-2.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Running AI Engine...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" /> Analyze Dropout Risk
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </GlassCard>

          {/* Model Metrics Info Card */}
          {modelInfo && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Model Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{modelInfo.model_name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{modelInfo.algorithm}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Accuracy</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ROC AUC</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">{(modelInfo.roc_auc * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-4 space-y-2 text-xs font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precision:</span>
                    <span className="text-slate-800 dark:text-white">{(modelInfo.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recall:</span>
                    <span className="text-slate-800 dark:text-white">{(modelInfo.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">F1 Score:</span>
                    <span className="text-slate-800 dark:text-white">{(modelInfo.f1_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Features Active:</span>
                    <span className="text-slate-800 dark:text-white">{modelInfo.features_count} columns</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* RIGHT PANEL: Diagnostics & recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prediction Results Gauge meters */}
          {analysisResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Risk Level Badge Card */}
              <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">RISK RATING</span>
                <span className={`px-4 py-1.5 rounded-full text-xs uppercase font-black tracking-wider mb-3 ${
                  analysisResult.risk_level === 'High' ? 'bg-red-500/10 text-red-500' :
                  analysisResult.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {analysisResult.risk_level} Risk
                </span>
                
                {analysisResult.risk_level === 'High' ? (
                  <ShieldAlert className="h-10 w-10 text-red-500 animate-pulse mt-2" />
                ) : analysisResult.risk_level === 'Medium' ? (
                  <AlertTriangle className="h-10 w-10 text-amber-500 mt-2" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-emerald-500 mt-2" />
                )}
              </GlassCard>

              {/* Dropout Probability */}
              <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">DROPOUT PROBABILITY</span>
                <div className="relative flex items-center justify-center">
                  {/* Simple Circular Progress Bar */}
                  <svg className="w-20 h-20">
                    <circle
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className={`transition-all duration-500 ${
                        analysisResult.risk_level === 'High' ? 'text-red-500' :
                        analysisResult.risk_level === 'Medium' ? 'text-amber-500' :
                        'text-emerald-500'
                      }`}
                      strokeWidth="6"
                      strokeDasharray="213"
                      strokeDashoffset={213 - (213 * analysisResult.probability)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-800 dark:text-white">
                    {Math.round(analysisResult.probability * 100)}%
                  </span>
                </div>
              </GlassCard>

              {/* Model Confidence */}
              <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">MODEL CONFIDENCE</span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-20 h-20">
                    <circle
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className="text-indigo-500 transition-all duration-500"
                      strokeWidth="6"
                      strokeDasharray="213"
                      strokeDashoffset={213 - (213 * analysisResult.confidence)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-800 dark:text-white">
                    {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
              </GlassCard>

            </div>
          ) : (
            <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed">
              <Brain className="h-14 w-14 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-black text-slate-700 dark:text-white">No Active Analysis</h3>
              <p className="text-slate-500 text-xs font-semibold max-w-sm mt-1">
                Please search and select a student from the sidebar panel, and trigger the prediction engine to view results.
              </p>
            </GlassCard>
          )}

          {/* Contributing Risk Factors & Actionable Recommendations */}
          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Feature Drivers Card */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" /> Key Risk Drivers
                </h3>
                <div className="space-y-4">
                  {analysisResult.top_features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 rounded-xl space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 dark:text-white font-extrabold capitalize">{feature.label}</span>
                        <span className="text-slate-400">Value: <b className="text-slate-700 dark:text-slate-300">{feature.value}</b></span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                        {feature.reason}
                      </p>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${Math.min(feature.importance * 4, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Actions & Recommendations */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Intervention Recommendations
                </h3>
                
                {analysisResult.recommended_actions.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-500">Continue standard monitoring. No active risk triggers recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {analysisResult.recommended_actions.map((action, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 rounded-xl"
                      >
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white">{action}</h4>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            Tailored preventative support item matching student diagnostic indicators.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

            </div>
          )}

          {/* Previous Prediction Run Log (Timeline history) */}
          {selectedStudent && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Historical Analysis Runs
              </h3>
              
              {history.length === 0 ? (
                <p className="text-xs font-semibold text-slate-500 italic p-2">No historical analysis runs logged for this student.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Risk Level</th>
                        <th className="px-4 py-3">Dropout probability</th>
                        <th className="px-4 py-3">Confidence</th>
                        <th className="px-4 py-3">Model Version</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white/20 dark:bg-slate-950/20 font-semibold text-slate-700 dark:text-slate-300">
                      {history.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(item.predicted_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                              item.dropout_risk === 'High' ? 'bg-red-500/10 text-red-500' :
                              item.dropout_risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {item.dropout_risk}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.probability ? `${Math.round(item.probability * 100)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {item.confidence ? `${Math.round(item.confidence * 100)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono">v{item.model_version || '1.0.0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          )}

        </div>

      </div>
    </div>
  );
}
