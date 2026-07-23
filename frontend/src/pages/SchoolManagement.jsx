import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/common/GlassCard';
import { 
  Search, Plus, Edit, Trash2, Eye, X, Loader2, ArrowLeft, ArrowRight, BookOpen, Users, MapPin, Landmark
} from 'lucide-react';
import api from '../services/api';

export default function SchoolManagement() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'create', 'edit', 'view', null
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Form states
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [village, setVillage] = useState('');
  const [schoolType, setSchoolType] = useState('High School');
  const [medium, setMedium] = useState('English');
  const [headmasterName, setHeadmasterName] = useState('');
  const [studentStrength, setStudentStrength] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isDeo = user?.role === 'deo';

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch (err) {
      showToast('Failed to load schools registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const openCreateModal = () => {
    setSelectedSchool(null);
    setSchoolName('');
    setDistrict('');
    setBlock('');
    setVillage('');
    setSchoolType('High School');
    setMedium('English');
    setHeadmasterName('');
    setStudentStrength(0);
    setActiveModal('create');
  };

  const openEditModal = (school) => {
    setSelectedSchool(school);
    setSchoolName(school.school_name);
    setDistrict(school.district);
    setBlock(school.block);
    setVillage(school.village);
    setSchoolType(school.school_type);
    setMedium(school.medium);
    setHeadmasterName(school.headmaster_name || '');
    setStudentStrength(school.student_strength);
    setActiveModal('edit');
  };

  const openViewModal = (school) => {
    setSelectedSchool(school);
    setActiveModal('view');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/schools/', {
        school_name: schoolName,
        district,
        block,
        village,
        school_type: schoolType,
        medium,
        headmaster_name: headmasterName || null,
        student_strength: parseInt(studentStrength) || 0
      });
      showToast('School added successfully', 'success');
      setActiveModal(null);
      fetchSchools();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not create school', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/schools/${selectedSchool.id}`, {
        school_name: schoolName,
        district,
        block,
        village,
        school_type: schoolType,
        medium,
        headmaster_name: headmasterName || null,
        student_strength: parseInt(studentStrength) || 0
      });
      showToast('School details updated successfully', 'success');
      setActiveModal(null);
      fetchSchools();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not update school', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (schoolId, schoolName) => {
    if (!window.confirm(`Are you sure you want to delete "${schoolName}"? This action is permanent.`)) {
      return;
    }
    try {
      await api.delete(`/schools/${schoolId}`);
      showToast('School deleted successfully', 'success');
      fetchSchools();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not delete school', 'error');
    }
  };

  // Search & Filter
  const filteredSchools = schools.filter(school => 
    school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canEditSchool = (school) => {
    if (isAdmin) return true;
    if (user?.role === 'headmaster' && user?.school_id === school.id) return true;
    return false;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Schools Registry</h1>
          <p className="text-sm text-slate-500">Manage institution information and demographic profiles</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add School Registry
          </button>
        )}
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4 flex items-center gap-3 border-white/30 dark:border-white/5" hoverEffect={false}>
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by school name, district, or block..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
        />
      </GlassCard>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm text-slate-500 font-semibold">Loading registered schools...</span>
        </div>
      ) : paginatedSchools.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/30 dark:border-white/5" hoverEffect={false}>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No registered schools match your query.</p>
        </GlassCard>
      ) : (
        /* Schools Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSchools.map((school) => (
              <GlassCard key={school.id} className="p-6 border-white/30 dark:border-white/5 flex flex-col justify-between" hoverEffect={true}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-primary/20">
                      {school.school_type}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {school.medium} Medium
                    </span>
                  </div>

                  <h3 className="text-lg font-bold line-clamp-1 mb-1">{school.school_name}</h3>
                  
                  {/* Location info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{school.village}, {school.block}, {school.district}</span>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span className="font-semibold flex items-center gap-1"><Landmark className="h-3.5 w-3.5 text-slate-400" /> Headmaster:</span>
                      <span className="font-bold truncate max-w-[120px]">{school.headmaster_name || 'Not Configured'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-400" /> Strength:</span>
                      <span className="font-bold">{school.student_strength} Students</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-6">
                  <button
                    onClick={() => openViewModal(school)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-primary/10 hover:text-primary dark:text-slate-400 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                  {canEditSchool(school) && (
                    <button
                      onClick={() => openEditModal(school)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-amber-500/10 hover:text-amber-500 dark:text-slate-400 transition-colors"
                      title="Edit School"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(school.id, school.school_name)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-red-500/10 hover:text-red-500 dark:text-slate-400 transition-colors"
                      title="Delete School"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 select-none">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE & EDIT MODAL OVERLAY */}
      {activeModal && (activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-xl w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {activeModal === 'create' ? 'Create School Registry' : 'Edit School Registry'}
            </h2>

            <form onSubmit={activeModal === 'create' ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Name *</label>
                <input
                  type="text"
                  placeholder="Government Higher Secondary School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Block *</label>
                  <input
                    type="text"
                    placeholder="Tambaram"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Village *</label>
                  <input
                    type="text"
                    placeholder="Selaiyur"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    <option value="Primary School">Primary School</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="Higher Secondary School">Higher Secondary School</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Instruction Medium</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Headmaster Name</label>
                  <input
                    type="text"
                    placeholder="Principal name"
                    value={headmasterName}
                    onChange={(e) => setHeadmasterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Student Strength</label>
                  <input
                    type="number"
                    value={studentStrength}
                    onChange={(e) => setStudentStrength(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {activeModal === 'create' ? 'Save Registry' : 'Apply Changes'}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* VIEW MODAL OVERLAY */}
      {activeModal === 'view' && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-xl w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-400" />
              School Details View
            </h2>
            <p className="text-xs text-slate-500 mb-6">Database Record UID: {selectedSchool.id}</p>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">School Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedSchool.school_name}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">District Location:</span>
                <span className="font-bold">{selectedSchool.district}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Block & Village:</span>
                <span className="font-bold">{selectedSchool.block} / {selectedSchool.village}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Structure Type:</span>
                <span className="font-bold">{selectedSchool.school_type}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Medium of Study:</span>
                <span className="font-bold">{selectedSchool.medium}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Assigned Headmaster:</span>
                <span className="font-bold text-indigo-400">{selectedSchool.headmaster_name || 'No Principal Assigned'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Current Registered Student Strength:</span>
                <span className="font-bold text-primary">{selectedSchool.student_strength} students</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Created On:</span>
                <span className="font-medium text-xs">{new Date(selectedSchool.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Last Updated:</span>
                <span className="font-medium text-xs">{new Date(selectedSchool.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
