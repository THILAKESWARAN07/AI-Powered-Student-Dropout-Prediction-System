import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { FileText, Download, Printer, Filter, Loader2, Info } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [reportType, setReportType] = useState('summary'); // summary, student, school, class
  
  // Filters
  const [schoolId, setSchoolId] = useState(user?.role !== 'admin' ? user?.school_id || '' : '');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  
  // Data for report preview
  const [previewData, setPreviewData] = useState(null);

  const fetchFiltersAndData = async () => {
    try {
      const schoolsRes = await api.get('/schools');
      setSchools(schoolsRes.data);
      await loadReportPreview();
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  };

  const loadReportPreview = async () => {
    setLoading(true);
    try {
      const params = {};
      if (schoolId) params.school_id = schoolId;
      if (className) params.class_name = className;
      if (section) params.section = section;
      if (riskLevel) params.risk_level = riskLevel;

      const res = await api.get('/dashboard/summary', { params });
      setPreviewData(res.data);
    } catch (err) {
      console.error('Failed to load report preview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndData();
  }, []);

  useEffect(() => {
    loadReportPreview();
  }, [schoolId, className, section, riskLevel, reportType]);

  const handleExportFile = (format) => {
    // Generate download URL
    const baseUrl = 'http://localhost:8000/api/v1/dashboard/reports/export';
    const params = new URLSearchParams();
    params.append('format', format);
    if (schoolId) params.append('school_id', schoolId);
    if (className) params.append('class_name', className);
    if (section) params.append('section', section);
    if (riskLevel) params.append('risk_level', riskLevel);

    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading && !previewData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const reportNames = {
    summary: 'Dropout Risk Summary Report',
    student: 'Detailed Student Risk Registry',
    school: 'Comparative School Analysis Sheet',
    class: 'Classroom Performance Report'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 print:bg-white print:text-black">
      
      {/* Header controls (Hidden during print) */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Reports & Export Compiler</h1>
            <p className="text-sm text-slate-500">Compile custom cohort risk summaries and export prediction details directly to CSV, Excel, or PDF sheets.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportFile('xlsx')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all duration-200"
          >
            <Download className="h-4 w-4 text-emerald-400" /> Export Excel
          </button>
          <button
            onClick={() => handleExportFile('csv')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all duration-200"
          >
            <Download className="h-4 w-4 text-sky-400" /> Export CSV
          </button>
          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Printer className="h-4 w-4" /> Save / Print PDF
          </button>
        </div>
      </div>

      {/* Filter Row (Hidden during print) */}
      <GlassCard className="p-5 flex flex-wrap gap-4 items-center justify-between print:hidden" hoverEffect={false}>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Report Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center flex-grow justify-end">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white font-bold focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="summary">Summary Report</option>
            <option value="student">Student Registry Report</option>
            <option value="school">School Analysis Sheet</option>
            <option value="class">Classroom Report</option>
          </select>

          {user?.role === 'admin' && (
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
          )}

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
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </GlassCard>

      {/* Report Compilation View Sheet */}
      <GlassCard className="p-10 border-white/20 dark:border-white/5 space-y-8 bg-white dark:bg-slate-950 print:border-none print:shadow-none print:bg-transparent print:text-black" hoverEffect={false}>
        
        {/* Report Brand Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">AI Student Risk Assessment System</span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white print:text-black">
              {reportNames[reportType]}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-primary">DropGuard Report Sheet</span>
            <p className="text-xs text-slate-400">Classified: Internal Education Review</p>
          </div>
        </div>

        {/* Informative description */}
        <div className="flex gap-2.5 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-xs text-slate-500 font-semibold leading-relaxed print:hidden">
          <Info className="h-5 w-5 text-indigo-400 shrink-0" />
          <span>The summary metrics shown in this preview correspond to students matching your active sidebar filters. Changing any query filters will update the calculations and PDF/Excel print content dynamically.</span>
        </div>

        {/* Report Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">Evaluated Cohort Size</span>
            <span className="text-2xl font-black text-slate-800 dark:text-black">{previewData.total_students} Students</span>
          </div>

          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">Total Predicted Risks</span>
            <span className="text-2xl font-black text-slate-800 dark:text-black">{previewData.total_predictions} Records</span>
          </div>

          <div className="p-5 border border-red-500/20 bg-red-500/5 rounded-2xl text-red-500">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">High Risk Students</span>
            <span className="text-2xl font-black">{previewData.high_risk_count} Flags</span>
          </div>

          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">Average Model Confidence</span>
            <span className="text-2xl font-black text-slate-800 dark:text-black">{(previewData.avg_confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-white print:text-black uppercase tracking-wider">Cohort Distribution Breakdowns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-350 block border-b border-slate-100 dark:border-slate-800/80 pb-2">Academic Grade Performance Clusters</span>
              <div className="flex justify-between py-1">
                <span>Model Target Accuracy:</span>
                <span className="font-extrabold text-emerald-500">85.32%</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Medium Risk Threshold:</span>
                <span className="font-extrabold text-slate-800 dark:text-white">Probability 40% - 70%</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-350 block border-b border-slate-100 dark:border-slate-800/80 pb-2">Dropout Risk Policy Suggestions</span>
              <div className="flex justify-between py-1">
                <span>High Risk Intervention:</span>
                <span className="font-extrabold text-red-500">Academic Mentorship & Support</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Low Risk Maintenance:</span>
                <span className="font-extrabold text-slate-800 dark:text-white">Quarterly Performance Audits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Footer / Signature */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10 flex justify-between items-center text-xs text-slate-400">
          <span>DropGuard AI Engine v1.0.0</span>
          <div className="text-right">
            <span className="block border-b border-slate-200 dark:border-slate-800 w-32 ml-auto mb-1"></span>
            <span>Reviewed & Signed by School Board</span>
          </div>
        </div>

      </GlassCard>

      {/* Global CSS injected specifically to format PDF Print layout natively */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-transparent {
            background: transparent !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          /* Make report container full screen and print its children */
          .print\\:border-none, .print\\:border-none * {
            visibility: visible;
          }
          .print\\:border-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Hide menus */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
