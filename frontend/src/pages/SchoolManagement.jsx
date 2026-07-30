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
  const [schoolStudents, setSchoolStudents] = useState([]);
  const [schoolUsers, setSchoolUsers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
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

  const openViewModal = async (school) => {
    setSelectedSchool(school);
    setActiveModal('view');
    setLoadingDetails(true);
    setSchoolStudents([]);
    setSchoolUsers([]);
    try {
      const [studentsRes, usersRes] = await Promise.all([
        api.get('/students', { params: { school_id: school.id, limit: 1000 } }),
        user?.role === 'admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setSchoolStudents(studentsRes.data.results || []);
      setSchoolUsers(usersRes.data || []);
    } catch (err) {
      showToast('Failed to load school detail registry', 'error');
    } finally {
      setLoadingDetails(false);
    }
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
          <GlassCard className="max-w-4xl w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]" hoverEffect={false}>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-400" />
              School Details Registry
            </h2>
            <p className="text-xs text-slate-500 mb-6">Database ID: {selectedSchool.id} • {selectedSchool.school_name}</p>

            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-semibold text-slate-505">Loading enrollment and staff records...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-450 uppercase block">Total Students</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">
                      {schoolStudents.length}
                    </span>
                  </div>
                  <div className="p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/10 text-center">
                    <span className="text-[10px] font-black text-red-500 uppercase block">High Risk</span>
                    <span className="text-xl font-black text-red-600 dark:text-red-400 mt-1 block">
                      {schoolStudents.filter(s => s.predictions?.[0]?.dropout_risk === 'High').length}
                    </span>
                  </div>
                  <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/10 text-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase block">Medium Risk</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                      {schoolStudents.filter(s => s.predictions?.[0]?.dropout_risk === 'Medium').length}
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 text-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase block">Low Risk</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {schoolStudents.filter(s => s.predictions?.[0]?.dropout_risk === 'Low' || !s.predictions?.[0]).length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - School Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-indigo-400 tracking-wider">Institution Profile</h3>
                    <div className="space-y-2.5 text-sm font-medium text-slate-500">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                        <span>Institution Type:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.school_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                        <span>Instruction Medium:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.medium} Medium</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                        <span>District:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.district}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                        <span>Block / Village:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.block} / {selectedSchool.village}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span>Reported Capacity:</span>
                        <span className="font-bold text-slate-850 dark:text-white">{selectedSchool.student_strength} seats</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - School Staff */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-indigo-400 tracking-wider">Assigned Staff Directory</h3>
                    <div className="space-y-4">
                      {/* Headmaster */}
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Headmaster</span>
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                          {schoolUsers.filter(u => u.school_id === selectedSchool.id && u.role === 'headmaster').length > 0 ? (
                            schoolUsers
                              .filter(u => u.school_id === selectedSchool.id && u.role === 'headmaster')
                              .map(hm => (
                                <div key={hm.id} className="text-xs font-bold text-slate-800 dark:text-indigo-300">
                                  {hm.full_name} <span className="text-[10px] text-slate-400 font-semibold font-mono">({hm.email})</span>
                                </div>
                              ))
                          ) : (
                            <span className="text-xs text-slate-450 italic font-semibold">No principal assigned to this node</span>
                          )}
                        </div>
                      </div>

                      {/* Teachers */}
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Teachers</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-h-32 overflow-y-auto space-y-1.5">
                          {schoolUsers.filter(u => u.school_id === selectedSchool.id && u.role === 'teacher').length > 0 ? (
                            schoolUsers
                              .filter(u => u.school_id === selectedSchool.id && u.role === 'teacher')
                              .map(t => (
                                <div key={t.id} className="text-xs font-bold text-slate-700 dark:text-slate-200 flex justify-between">
                                  <span>{t.full_name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal font-mono">{t.email}</span>
                                </div>
                              ))
                          ) : (
                            <span className="text-xs text-slate-450 italic font-semibold">No teachers registered for this school</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student List Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase text-indigo-400 tracking-wider">Registered Student List</h3>
                  <div className="p-1 rounded-xl border border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto bg-slate-950/10">
                    {schoolStudents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-450 font-semibold italic">
                        No students enrolled under this school registry node.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800 select-none">
                          <tr>
                            <th className="px-4 py-2.5">Student ID</th>
                            <th className="px-4 py-2.5">Full Name</th>
                            <th className="px-4 py-2.5">Class/Sec</th>
                            <th className="px-4 py-2.5">Attendance</th>
                            <th className="px-4 py-2.5">Dropout Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                          {schoolStudents.map(student => {
                            const risk = student.predictions?.[0]?.dropout_risk || 'Low';
                            return (
                              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <td className="px-4 py-2.5 font-mono">{student.student_id}</td>
                                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{student.full_name}</td>
                                <td className="px-4 py-2.5">Class {student.class_name} - {student.section}</td>
                                <td className="px-4 py-2.5">{student.attendance?.attendance_percentage?.toFixed(1) || 0}%</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider ${
                                    risk === 'High' ? 'bg-red-500/10 text-red-500' :
                                    risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-emerald-500/10 text-emerald-500'
                                  }`}>
                                    {risk}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
