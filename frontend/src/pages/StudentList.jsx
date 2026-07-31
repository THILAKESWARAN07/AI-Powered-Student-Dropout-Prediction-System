import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/common/GlassCard';
import { 
  Users, Search, SlidersHorizontal, Edit, Trash2, Eye, Loader2,
  ChevronLeft, ChevronRight, UserPlus, Upload, Download, Trash, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentList() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Role permissions helpers
  const isAdmin = currentUser?.role === 'admin';
  const isHeadmaster = currentUser?.role === 'headmaster';
  const isTeacher = currentUser?.role === 'teacher';
  const isDeo = currentUser?.role === 'deo';
  const canMutate = isAdmin || isHeadmaster;
  const canEdit = isAdmin || isHeadmaster;

  // Data states
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');
  const [attendanceMinFilter, setAttendanceMinFilter] = useState('');
  const [attendanceMaxFilter, setAttendanceMaxFilter] = useState('');
  const [marksMinFilter, setMarksMinFilter] = useState('');
  const [marksMaxFilter, setMarksMaxFilter] = useState('');
  const [dropoutStatusFilter, setDropoutStatusFilter] = useState('');
  const [financialDifficultyFilter, setFinancialDifficultyFilter] = useState('');
  const [childLabourRiskFilter, setChildLabourRiskFilter] = useState('');
  const [lowMotivationFilter, setLowMotivationFilter] = useState('');
  const [academicBacklogsFilter, setAcademicBacklogsFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('student_id');
  const [sortDir, setSortDir] = useState('asc');

  // Bulk Operations
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSection, setBulkSection] = useState('');
  const [bulkSchool, setBulkSchool] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
        sort_by: sortBy,
        sort_dir: sortDir,
      };

      if (search) params.search = search;
      if (schoolFilter) params.school_id = parseInt(schoolFilter);
      if (classFilter) params.class_name = classFilter;
      if (sectionFilter) params.section = sectionFilter;
      if (genderFilter) params.gender = genderFilter;
      if (schoolTypeFilter) params.school_type = schoolTypeFilter;
      if (communityFilter) params.community = communityFilter;
      if (attendanceMinFilter) params.attendance_min = parseFloat(attendanceMinFilter);
      if (attendanceMaxFilter) params.attendance_max = parseFloat(attendanceMaxFilter);
      if (marksMinFilter) params.marks_min = parseFloat(marksMinFilter);
      if (marksMaxFilter) params.marks_max = parseFloat(marksMaxFilter);
      if (dropoutStatusFilter) params.dropout_status = dropoutStatusFilter;
      if (financialDifficultyFilter) params.financial_difficulty = financialDifficultyFilter;
      if (childLabourRiskFilter) params.child_labour_risk = childLabourRiskFilter;
      if (lowMotivationFilter) params.low_motivation = lowMotivationFilter;
      if (academicBacklogsFilter) params.academic_backlogs = academicBacklogsFilter;

      const res = await api.get('/students', { params });
      setStudents(res.data.results);
      setTotal(res.data.total);
    } catch (err) {
      showToast('Failed to load student registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, sortBy, sortDir, schoolFilter, classFilter, sectionFilter, genderFilter, schoolTypeFilter, communityFilter, attendanceMinFilter, attendanceMaxFilter, marksMinFilter, marksMaxFilter, dropoutStatusFilter, financialDifficultyFilter, childLabourRiskFilter, lowMotivationFilter, academicBacklogsFilter]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Delete student modal states
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const executeStudentDelete = async () => {
    if (!studentToDelete) return;
    setDeletingStudent(true);
    try {
      await api.delete(`/students/${studentToDelete.id}`);
      // Optimistically remove student from local state list
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      showToast('✅ Student deleted successfully.', 'success');
      setStudentToDelete(null);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Unable to delete student. Please try again.', 'error');
    } finally {
      setDeletingStudent(false);
    }
  };

  const executeBulkDelete = async () => {
    setBulkSubmitting(true);
    try {
      await api.post('/students/bulk-delete', { student_ids: selectedIds });
      // Optimistically remove student from local state list
      setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      showToast('✅ Selected student records permanently deleted.', 'success');
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Bulk deletion failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Bulk executions
  const handleBulkExecute = async () => {
    if (selectedIds.length === 0) return;
    setBulkSubmitting(true);
    try {
      if (bulkAction === 'update') {
        await api.post('/students/bulk-status-update', {
          student_ids: selectedIds,
          Class: bulkClass || undefined,
          Section: bulkSection || undefined,
          school_id: bulkSchool ? parseInt(bulkSchool) : undefined
        });
        showToast('Selected student records updated', 'success');
      }
      setSelectedIds([]);
      setShowBulkModal(false);
      fetchStudents();
    } catch (err) {
      showToast('Bulk operation failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (schoolFilter) params.school_id = parseInt(schoolFilter);
      if (classFilter) params.class_name = classFilter;
      if (sectionFilter) params.section = sectionFilter;
      if (genderFilter) params.gender = genderFilter;
      if (schoolTypeFilter) params.school_type = schoolTypeFilter;
      if (communityFilter) params.community = communityFilter;
      if (attendanceMinFilter) params.attendance_min = parseFloat(attendanceMinFilter);
      if (attendanceMaxFilter) params.attendance_max = parseFloat(attendanceMaxFilter);
      if (marksMinFilter) params.marks_min = parseFloat(marksMinFilter);
      if (marksMaxFilter) params.marks_max = parseFloat(marksMaxFilter);
      if (dropoutStatusFilter) params.dropout_status = dropoutStatusFilter;
      if (financialDifficultyFilter) params.financial_difficulty = financialDifficultyFilter;
      if (childLabourRiskFilter) params.child_labour_risk = childLabourRiskFilter;
      if (lowMotivationFilter) params.low_motivation = lowMotivationFilter;
      if (academicBacklogsFilter) params.academic_backlogs = academicBacklogsFilter;
      params.export_format = format;

      const res = await api.post('/students/export', null, { 
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_export_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported successfully to ${format.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Student Management
          </h1>
          <p className="text-sm text-slate-500">Search, filter, edit, and bulk import/export student records</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canMutate && (
            <>
              <Link
                to="/portal/students/import"
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Upload className="h-4 w-4" />
                Import CSV/Excel
              </Link>
              <Link
                to="/portal/students/new"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <GlassCard className="p-5 border-white/30 dark:border-white/5" hoverEffect={false}>
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Student Name or Student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              className="bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/95 active:scale-[0.98] transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                showFilters 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-white/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
            {(isAdmin || isDeo) && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">School</label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Schools</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.school_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Classes</option>
                {[...Array(12).keys()].map(x => (
                  <option key={x+1} value={String(x+1)}>Class {x+1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Section</label>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Sections</option>
                {['A', 'B', 'C', 'D'].map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">School Type</label>
              <select
                value={schoolTypeFilter}
                onChange={(e) => setSchoolTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All School Types</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Aided">Aided</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Community</label>
              <select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Communities</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Dropout Status</label>
              <select
                value={dropoutStatusFilter}
                onChange={(e) => setDropoutStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Statuses</option>
                <option value="Yes">Dropout (Yes)</option>
                <option value="No">Active (No)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Financial Difficulty</label>
              <select
                value={financialDifficultyFilter}
                onChange={(e) => setFinancialDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Child Labour Risk</label>
              <select
                value={childLabourRiskFilter}
                onChange={(e) => setChildLabourRiskFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Low Motivation</label>
              <select
                value={lowMotivationFilter}
                onChange={(e) => setLowMotivationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Academic Backlogs</label>
              <select
                value={academicBacklogsFilter}
                onChange={(e) => setAcademicBacklogsFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Attendance Range (%)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={attendanceMinFilter}
                  onChange={(e) => setAttendanceMinFilter(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-slate-950"
                />
                <span className="text-slate-400 font-bold text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={attendanceMaxFilter}
                  onChange={(e) => setAttendanceMaxFilter(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Overall % Range (%)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={marksMinFilter}
                  onChange={(e) => setMarksMinFilter(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-slate-950"
                />
                <span className="text-slate-400 font-bold text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={marksMaxFilter}
                  onChange={(e) => setMarksMaxFilter(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-slate-950"
                />
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <span className="text-sm text-slate-800 dark:text-white font-semibold">
            {selectedIds.length} student records selected
          </span>
          <div className="flex items-center gap-2">
            {canMutate && (
              <button
                onClick={() => { setBulkAction('update'); setShowBulkModal(true); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-all"
              >
                Bulk Edit details
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-650 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Trash className="h-4 w-4" /> Delete Selected
              </button>
            )}
            <button
              onClick={() => handleExport('csv')}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="h-4 w-4" /> Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Export Options */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 select-none">
        <span>Total Records Found: {total}</span>
        <div className="flex items-center gap-3">
          <span>Export All Filters:</span>
          <button onClick={() => handleExport('csv')} className="text-primary hover:underline flex items-center gap-0.5">
            <Download className="h-3 w-3" /> CSV
          </button>
          <button onClick={() => handleExport('xlsx')} className="text-primary hover:underline flex items-center gap-0.5">
            <Download className="h-3 w-3" /> Excel
          </button>
        </div>
      </div>

      {/* Student Registry Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm font-semibold text-slate-500">Loading student profiles...</span>
        </div>
      ) : students.length === 0 ? (
        <GlassCard className="p-16 text-center border-white/30 dark:border-white/5" hoverEffect={false}>
          <p className="text-slate-500 dark:text-slate-400 font-semibold mb-2">No student records match the criteria.</p>
          <p className="text-xs text-slate-400">Try clearing filters or running a new search query.</p>
        </GlassCard>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white/40 dark:bg-slate-950/20 backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900/60 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-4 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === students.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary/50"
                  />
                </th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4">Class/Sec</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/20 dark:bg-slate-950/20">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary/50"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold">{student.student_id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {student.full_name}
                  </td>
                  <td className="px-6 py-4 max-w-[150px] truncate">{student.school?.school_name}</td>
                  <td className="px-6 py-4">Class {student.class_name} - {student.section}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      (student.attendance?.attendance_percentage || 0) < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {student.attendance?.attendance_percentage?.toFixed(1) || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">
                      {student.academics?.overall_percentage?.toFixed(1) || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        to={`/portal/students/${student.id}`}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-primary/10 hover:text-primary text-slate-400 transition-colors"
                        title="View Student Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {canEdit && (
                        <Link
                          to={`/portal/students/${student.id}/edit`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-amber-500/10 hover:text-amber-500 text-slate-400 transition-colors"
                          title="Edit Student Info"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-red-500/30 text-red-650 hover:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 rounded-xl hover:border-red-500/50 transition-all active:scale-[0.98] shadow-sm"
                          title="Permanently Delete Student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination component */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 select-none border-t border-slate-200 dark:border-slate-800/80 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} records
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {[10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkModal && bulkAction === 'update' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-2">Bulk Edit Details</h2>
            <p className="text-xs text-slate-500 mb-6">Updating details for {selectedIds.length} selected records</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Class</label>
                <select
                  value={bulkClass}
                  onChange={(e) => setBulkClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                >
                  <option value="">Do not modify</option>
                  {[...Array(12).keys()].map(x => (
                    <option key={x+1} value={String(x+1)}>Class {x+1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Section</label>
                <select
                  value={bulkSection}
                  onChange={(e) => setBulkSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                >
                  <option value="">Do not modify</option>
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School</label>
                  <select
                    value={bulkSchool}
                    onChange={(e) => setBulkSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white"
                  >
                    <option value="">Do not modify</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.school_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleBulkExecute}
                disabled={bulkSubmitting}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {bulkSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply Updates
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PERMANENT STUDENT DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setStudentToDelete(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              disabled={deletingStudent}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl mb-4 w-fit border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-slate-850 dark:text-white mb-3">
              Delete Student
            </h2>
            <p className="text-sm text-slate-655 dark:text-slate-350 leading-relaxed mb-6">
              Are you sure you want to permanently delete student <strong className="text-slate-900 dark:text-white">{studentToDelete.full_name}</strong> <span className="text-slate-500">(ID: {studentToDelete.student_id})</span>? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={deletingStudent}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeStudentDelete}
                disabled={deletingStudent}
                className="flex-1 bg-red-655 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
              >
                {deletingStudent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PERMANENT BULK DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              disabled={bulkSubmitting}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl mb-4 w-fit border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-slate-850 dark:text-white mb-3 text-left">
              Delete Selected Students
            </h2>
            <p className="text-sm text-slate-655 dark:text-slate-350 leading-relaxed mb-6 text-left">
              Are you sure you want to permanently delete the <strong className="text-red-500">{selectedIds.length}</strong> selected student records? This action cannot be undone and will clean up all academic, prediction, and child dependencies.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkSubmitting}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                disabled={bulkSubmitting}
                className="flex-1 bg-red-655 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
              >
                {bulkSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
