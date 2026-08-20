import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/common/GlassCard';
import api from '../services/api';
import { 
  ArrowLeft, Upload, Table, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Download, Info
} from 'lucide-react';

export default function ImportWizard() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  // Wizard state: 1: Upload, 2: Map Headers, 3: Import Summary
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [targetSchool, setTargetSchool] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null); // { headers, preview_rows, total_rows }

  // Mapping state
  const [mappings, setMappings] = useState({});

  // Summary Report state
  const [report, setReport] = useState(null);

  // List of expected database fields and labels
  const databaseFields = [
    { key: 'student_id', label: 'Student_Id', required: true },
    { key: 'class_name', label: 'Class', required: true },
    { key: 'distance_to_school_km', label: 'Distance to School (km)', required: false },
    { key: 'transport_mode', label: 'Transport Mode', required: false },
    { key: 'travel_time_min', label: 'Travel Time (mins)', required: false },
    { key: 'gender', label: 'Gender', required: true },
    { key: 'age', label: 'Age', required: true },
    { key: 'previous_year_percentage', label: 'Previous_Year_Percentage', required: true },
    { key: 'current_year_percentage', label: 'Current_Year_Percentage', required: true },
    { key: 'overall_percentage', label: 'Overall_Percentage', required: true },
    { key: 'number_of_failures', label: 'Number_of_Failures', required: true },
    { key: 'number_of_absences', label: 'Number_of_Absences', required: true },
    { key: 'attendance_percentage', label: 'Attendance_Percentage', required: true },
    { key: 'attendance_classification', label: 'Attendance_Classification', required: false },
    { key: 'mother_education', label: 'Mother_Education', required: false },
    { key: 'father_education', label: 'Father_Education', required: false },
    { key: 'family_support', label: 'Family_Support', required: false },
    { key: 'school_support', label: 'School_Support', required: false },
    { key: 'internet_access', label: 'Internet_Access', required: false },
    { key: 'health_status', label: 'Health_Status', required: false },
    { key: 'family_income', label: 'Family_Income', required: true },
    { key: 'financial_difficulty', label: 'Financial_Difficulty', required: false },
    { key: 'homework_completion', label: 'Homework_Completion', required: true },
    { key: 'low_motivation', label: 'Low_Motivation', required: false },
    { key: 'mental_health_risk', label: 'Mental_Health_Risk', required: false },
    { key: 'child_labour_risk', label: 'Child_Labour_Risk', required: false },
    { key: 'computer_access', label: 'Computer_Access', required: false },
    { key: 'smartphone_access', label: 'Smartphone_Access', required: false },
    { key: 'electricity_availability', label: 'Electricity_Availability', required: false }
  ];

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
      if (res.data.length > 0) {
        setTargetSchool(currentUser?.role !== 'admin' ? currentUser?.school_id || '' : '');
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadPreview = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/students/import/preview', formData);
      setPreviewData(res.data);

      // Perform automapping
      const initialMappings = {};
      databaseFields.forEach(dbField => {
        const match = res.data.headers.find(csvHeader => {
          const normCsv = csvHeader.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normDb = dbField.key.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          if (normDb === normCsv) return true;
          if (normDb === 'classname' && normCsv === 'class') return true;
          if (normDb === 'traveltimemin' && normCsv === 'traveltimemins') return true;
          return false;
        });

        if (match) {
          initialMappings[match] = dbField.key;
        }
      });

      setMappings(initialMappings);
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to parse file preview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (csvHeader, dbKey) => {
    setMappings(prev => ({
      ...prev,
      [csvHeader]: dbKey || undefined
    }));
  };

  const handleRunImport = async () => {
    if (!selectedFile) return;
    if (!targetSchool) {
      showToast('Please select a target school before running the import.', 'error');
      return;
    }

    // Check if required fields are mapped
    const mappedDbKeys = Object.values(mappings);
    const missingRequired = databaseFields
      .filter(f => f.required && !mappedDbKeys.includes(f.key))
      .map(f => f.label);

    if (missingRequired.length > 0) {
      showToast(`Missing required column mappings: ${missingRequired.join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Invert mapping from mappings { csv_header: db_key } to server structure { db_key: csv_header }
    const serverMapping = {};
    Object.entries(mappings).forEach(([csvHeader, dbKey]) => {
      if (dbKey) {
        serverMapping[csvHeader] = dbKey;
      }
    });

    formData.append('mapping_json', JSON.stringify(serverMapping));
    formData.append('school_id', targetSchool);

    try {
      const res = await api.post('/students/import/run', formData);
      setReport(res.data);
      setStep(3);
      showToast('Import completed', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Import processing crashed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadFailedRows = () => {
    if (!report || !report.failed_rows_json) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(report.failed_rows_json);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "failed_imported_students.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header controls */}
      <div className="flex items-center gap-3">
        <Link to="/portal/students" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dataset Import Wizard</h1>
          <p className="text-sm text-slate-500">Map and batch upload dataset entries directly to the normalized schema</p>
        </div>
      </div>

      {/* Progress Wizard Steps */}
      <div className="flex items-center justify-center gap-8 max-w-lg mx-auto select-none">
        {[{ step: 1, label: 'Upload' }, { step: 2, label: 'Map Columns' }, { step: 3, label: 'Import Summary' }].map(item => (
          <div key={item.step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
              step >= item.step 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-slate-200 dark:bg-slate-900 text-slate-400 border border-slate-350 dark:border-slate-800'
            }`}>
              {item.step}
            </div>
            <span className={`text-xs font-bold ${step >= item.step ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: FILE SELECTION */}
      {step === 1 && (
        <GlassCard className="max-w-xl mx-auto p-10 border-white/30 dark:border-white/5" hoverEffect={false}>
          <form onSubmit={handleUploadPreview} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-primary/50 rounded-2xl p-10 text-center cursor-pointer transition-all relative">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <span className="text-sm font-bold text-slate-800 dark:text-white block mb-1">
                {selectedFile ? selectedFile.name : 'Select CSV or Excel Dataset'}
              </span>
              <span className="text-xs text-slate-400 block">Drag & drop files here or click to browse files</span>
            </div>

            <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10px] text-slate-500 font-semibold leading-relaxed">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <span>Ensure your file matches the column formatting defined by your trained model schema. The next step allows mapping custom file headers.</span>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload & Map Columns
            </button>
          </form>
        </GlassCard>
      )}

      {/* STEP 2: COLUMN MAPPING PANEL */}
      {step === 2 && previewData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mappings selection card */}
          <GlassCard className="lg:col-span-2 p-8 border-white/30 dark:border-white/5 space-y-6" hoverEffect={false}>
            <div>
              <h2 className="text-xl font-bold mb-1">Map Headers</h2>
              <p className="text-xs text-slate-500">Associate columns inside your CSV/Excel to database schema attributes.</p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {databaseFields.map(dbField => {
                // Find currently selected CSV header for this dbKey
                const mappedCsvHeader = Object.keys(mappings).find(key => mappings[key] === dbField.key) || '';

                return (
                  <div key={dbField.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                        {dbField.label}
                        {dbField.required && <span className="text-red-500 font-black">*</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">Field: {dbField.key}</span>
                    </div>

                    <select
                      value={mappedCsvHeader}
                      onChange={(e) => {
                        // Clear previous mapping if any
                        const targetHeader = e.target.value;
                        
                        // Clear other headers mapped to this same key
                        const cleaned = { ...mappings };
                        Object.keys(cleaned).forEach(k => {
                          if (cleaned[k] === dbField.key) delete cleaned[k];
                        });
                        
                        if (targetHeader) {
                          cleaned[targetHeader] = dbField.key;
                        }
                        setMappings(cleaned);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-white"
                    >
                      <option value="">-- Skip Column --</option>
                      {previewData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Configuration and target parameters */}
          <GlassCard className="lg:col-span-1 p-8 border-white/30 dark:border-white/5 space-y-6 h-fit" hoverEffect={false}>
            <div>
              <h3 className="text-lg font-bold mb-1">Target School</h3>
              <p className="text-xs text-slate-500 mb-4">Allocate all imported rows to this school node.</p>

              <select
                value={targetSchool}
                onChange={(e) => setTargetSchool(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 font-semibold"
              >
                {isAdmin && <option value="">-- Choose Target School --</option>}
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.school_name}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Import Summary</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-400">
                <span>File Name:</span>
                <span className="text-slate-800 dark:text-white truncate font-bold">{selectedFile?.name}</span>
                <span>Total rows:</span>
                <span className="text-slate-800 dark:text-white font-bold">{previewData.total_rows} Records</span>
              </div>
            </div>

            <button
              onClick={handleRunImport}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Run Import Task
            </button>
          </GlassCard>
        </div>
      )}

      {/* STEP 3: SUMMARY REPORT */}
      {step === 3 && report && (
        <GlassCard className="max-w-2xl mx-auto p-8 border-white/30 dark:border-white/5 space-y-8" hoverEffect={false}>
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black">Import Task Completed</h2>
            <p className="text-xs text-slate-500">Database migration and validation loop finished.</p>
          </div>

          {/* Metric grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Rows</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{report.total_records}</span>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-center rounded-2xl text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Imported</span>
              <span className="text-xl font-extrabold">{report.imported}</span>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-center rounded-2xl text-red-500">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Failed</span>
              <span className="text-xl font-extrabold">{report.failed}</span>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-center rounded-2xl text-amber-500">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Duplicates</span>
              <span className="text-xl font-extrabold">{report.duplicates}</span>
            </div>
          </div>

          {/* Validation errors detail */}
          {report.errors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-1.5 text-red-500">
                  <AlertTriangle className="h-4 w-4" /> Validation Error Logs
                </h3>
                {report.failed_rows_json && (
                  <button
                    onClick={downloadFailedRows}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Download Failed Rows
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2">Row Index</th>
                      <th className="px-4 py-2">Student ID</th>
                      <th className="px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/20 dark:bg-slate-950/20">
                    {report.errors.slice(0, 10).map((err, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 font-bold">Row {err.row_index}</td>
                        <td className="px-4 py-2.5 font-mono text-red-400">{err.student_id || 'N/A'}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-500 dark:text-slate-400 leading-normal">
                          {err.errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.errors.length > 10 && (
                <span className="text-[10px] text-slate-400 block text-center font-semibold">
                  Showing first 10 error records. Click "Download Failed Rows" to retrieve the full log sheet.
                </span>
              )}
            </div>
          )}

          <Link
            to="/portal/students"
            className="block text-center w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-md"
          >
            Return to Registry Directory
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
