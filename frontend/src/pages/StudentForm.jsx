import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/common/GlassCard';
import { 
  ArrowLeft, Loader2, Save, User, Award, ClipboardList, Home, Heart, Cpu
} from 'lucide-react';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  
  const isEdit = !!id;
  const isAdmin = currentUser?.role === 'admin';

  // Tabs state
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [schools, setSchools] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    gender: 'Male',
    age: '',
    Class: '1',
    Section: 'A',
    medium_of_instruction: 'English',
    community: 'General',
    distance_to_school_km: '',
    transport_mode: 'Walking',
    travel_time_min: '',
    school_type: 'Government',
    teacher_student_ratio: '1:35',
    school_id: '',
    academics: {
      previous_year_percentage: '',
      unit_test_average: '',
      quarterly_exam: '',
      half_yearly_exam: '',
      annual_exam: '',
      mathematics_marks: '',
      science_marks: '',
      english_marks: '',
      social_science_marks: '',
      regional_language_marks: '',
      overall_percentage: '',
      number_of_failed_subjects: '0',
      academic_backlogs: 'No'
    },
    attendance: {
      attendance_percentage: '',
      consecutive_absences: '0',
      leave_days: '0',
      late_arrivals: '0'
    },
    behaviour: {
      homework_completion: '',
      assignment_submission_rate: '',
      classroom_participation: 'Medium',
      discipline_incidents: '0',
      teacher_feedback: 'Average',
      participation_in_extracurricular: 'No',
      library_usage: 'Medium',
      low_motivation: 'No',
      bullying_experience: 'No'
    },
    family: {
      family_income: '',
      parents_education: 'Primary',
      parents_occupation: 'Farmer',
      single_parent: 'No',
      number_of_siblings: '0',
      guardian_support: 'Medium',
      home_study_hours: '',
      financial_difficulty: 'No',
      child_labour_risk: 'No',
      frequent_migration: 'No',
      family_issues: 'No'
    },
    health: {
      chronic_illness: 'No',
      nutrition_status: 'Average',
      vision_problems: 'No',
      mental_health_risk: 'Low',
      disability_status: 'No',
      midday_meal_beneficiary: 'No'
    },
    technology: {
      internet_access: 'No',
      smartphone_access: 'No',
      computer_access: 'No',
      electricity_availability: 'Yes'
    }
  });

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
      if (!isEdit && res.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          school_id: currentUser?.school_id || res.data[0].id
        }));
      }
    } catch (err) {}
  };

  const fetchStudentData = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/students/${id}`);
      const d = res.data;
      
      setFormData({
        student_id: d.student_id,
        full_name: d.full_name,
        gender: d.gender,
        age: d.age,
        Class: d.Class || d.class_name,
        Section: d.Section || d.section,
        medium_of_instruction: d.medium_of_instruction,
        community: d.community,
        distance_to_school_km: d.distance_to_school_km || '',
        transport_mode: d.transport_mode || 'Walking',
        travel_time_min: d.travel_time_min || '',
        school_type: d.school_type || 'Government',
        teacher_student_ratio: d.teacher_student_ratio || '1:35',
        school_id: d.school_id,
        academics: d.academics ? {
          previous_year_percentage: d.academics.previous_year_percentage,
          unit_test_average: d.academics.unit_test_average,
          quarterly_exam: d.academics.quarterly_exam,
          half_yearly_exam: d.academics.half_yearly_exam,
          annual_exam: d.academics.annual_exam,
          mathematics_marks: d.academics.mathematics_marks,
          science_marks: d.academics.science_marks,
          english_marks: d.academics.english_marks,
          social_science_marks: d.academics.social_science_marks,
          regional_language_marks: d.academics.regional_language_marks,
          overall_percentage: d.academics.overall_percentage,
          number_of_failed_subjects: d.academics.number_of_failed_subjects,
          academic_backlogs: d.academics.academic_backlogs
        } : formData.academics,
        attendance: d.attendance ? {
          attendance_percentage: d.attendance.attendance_percentage,
          consecutive_absences: d.attendance.consecutive_absences,
          leave_days: d.attendance.leave_days,
          late_arrivals: d.attendance.late_arrivals
        } : formData.attendance,
        behaviour: d.behaviour ? {
          homework_completion: d.behaviour.homework_completion,
          assignment_submission_rate: d.behaviour.assignment_submission_rate,
          classroom_participation: d.behaviour.classroom_participation,
          discipline_incidents: d.behaviour.discipline_incidents,
          teacher_feedback: d.behaviour.teacher_feedback,
          participation_in_extracurricular: d.behaviour.participation_in_extracurricular,
          library_usage: d.behaviour.library_usage,
          low_motivation: d.behaviour.low_motivation,
          bullying_experience: d.behaviour.bullying_experience
        } : formData.behaviour,
        family: d.family ? {
          family_income: d.family.family_income,
          parents_education: d.family.parents_education,
          parents_occupation: d.family.parents_occupation,
          single_parent: d.family.single_parent,
          number_of_siblings: d.family.number_of_siblings,
          guardian_support: d.family.guardian_support,
          home_study_hours: d.family.home_study_hours,
          financial_difficulty: d.family.financial_difficulty,
          child_labour_risk: d.family.child_labour_risk,
          frequent_migration: d.family.frequent_migration,
          family_issues: d.family.family_issues
        } : formData.family,
        health: d.health ? {
          chronic_illness: d.health.chronic_illness,
          nutrition_status: d.health.nutrition_status,
          vision_problems: d.health.vision_problems,
          mental_health_risk: d.health.mental_health_risk,
          disability_status: d.health.disability_status,
          midday_meal_beneficiary: d.health.midday_meal_beneficiary
        } : formData.health,
        technology: d.technology ? {
          internet_access: d.technology.internet_access,
          smartphone_access: d.technology.smartphone_access,
          computer_access: d.technology.computer_access,
          electricity_availability: d.technology.electricity_availability
        } : formData.technology
      });
    } catch (err) {
      showToast('Could not load student profile data', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    if (isEdit) {
      fetchStudentData();
    }
  }, [id]);

  const handleChange = (field, val, subcategory = null) => {
    if (subcategory) {
      setFormData(prev => ({
        ...prev,
        [subcategory]: {
          ...prev[subcategory],
          [field]: val
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: val
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build submission data matching nested schemas
    const submissionData = {
      ...formData,
      age: parseInt(formData.age || '0'),
      distance_to_school_km: formData.distance_to_school_km ? parseFloat(formData.distance_to_school_km) : null,
      travel_time_min: formData.travel_time_min ? parseFloat(formData.travel_time_min) : null,
      school_id: parseInt(formData.school_id),
      academics: {
        ...formData.academics,
        previous_year_percentage: parseFloat(formData.academics.previous_year_percentage || '0'),
        unit_test_average: parseFloat(formData.academics.unit_test_average || '0'),
        quarterly_exam: parseFloat(formData.academics.quarterly_exam || '0'),
        half_yearly_exam: parseFloat(formData.academics.half_yearly_exam || '0'),
        annual_exam: parseFloat(formData.academics.annual_exam || '0'),
        mathematics_marks: parseFloat(formData.academics.mathematics_marks || '0'),
        science_marks: parseFloat(formData.academics.science_marks || '0'),
        english_marks: parseFloat(formData.academics.english_marks || '0'),
        social_science_marks: parseFloat(formData.academics.social_science_marks || '0'),
        regional_language_marks: parseFloat(formData.academics.regional_language_marks || '0'),
        overall_percentage: parseFloat(formData.academics.overall_percentage || '0'),
        number_of_failed_subjects: parseInt(formData.academics.number_of_failed_subjects || '0')
      },
      attendance: {
        ...formData.attendance,
        attendance_percentage: parseFloat(formData.attendance.attendance_percentage || '0'),
        consecutive_absences: parseInt(formData.attendance.consecutive_absences || '0'),
        leave_days: parseInt(formData.attendance.leave_days || '0'),
        late_arrivals: parseInt(formData.attendance.late_arrivals || '0')
      },
      behaviour: {
        ...formData.behaviour,
        homework_completion: parseFloat(formData.behaviour.homework_completion || '0'),
        assignment_submission_rate: parseFloat(formData.behaviour.assignment_submission_rate || '0'),
        discipline_incidents: parseInt(formData.behaviour.discipline_incidents || '0')
      },
      family: {
        ...formData.family,
        family_income: parseFloat(formData.family.family_income || '0'),
        number_of_siblings: parseInt(formData.family.number_of_siblings || '0'),
        home_study_hours: parseFloat(formData.family.home_study_hours || '0')
      }
    };

    try {
      if (isEdit) {
        await api.put(`/students/${id}`, submissionData);
        showToast('Student profile updated', 'success');
      } else {
        await api.post('/students/', submissionData);
        showToast('Student enrolled successfully', 'success');
      }
      navigate('/portal/students');
    } catch (err) {
      showToast(err.response?.data?.detail || 'An error occurred while saving records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Demographics', icon: User },
    { id: 'academic', label: 'Academics', icon: Award },
    { id: 'behaviour', label: 'Behaviour', icon: ClipboardList },
    { id: 'family', label: 'Family Context', icon: Home },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'tech', label: 'Technology', icon: Cpu }
  ];

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm font-semibold text-slate-500">Retrieving student records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <Link to="/portal/students" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isEdit ? `Edit Student: ${formData.student_id}` : 'Enroll New Student'}
          </h1>
          <p className="text-sm text-slate-500">Configure datasets attributes required by predictive metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                    : 'bg-white/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mt-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Student Profile
          </button>
        </div>

        {/* Tab Contents */}
        <GlassCard className="lg:col-span-3 p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
          
          {/* TAB: Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Personal & Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Student ID *</label>
                  <input
                    type="text"
                    disabled={isEdit}
                    placeholder="e.g. STU000001"
                    value={formData.student_id}
                    onChange={(e) => handleChange('student_id', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Class *</label>
                  <select
                    value={formData.Class}
                    onChange={(e) => handleChange('Class', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    {[...Array(12).keys()].map(x => (
                      <option key={x+1} value={String(x+1)}>Class {x+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Section *</label>
                  <select
                    value={formData.Section}
                    onChange={(e) => handleChange('Section', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    {['A', 'B', 'C', 'D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Medium of Instruction *</label>
                  <select
                    value={formData.medium_of_instruction}
                    onChange={(e) => handleChange('medium_of_instruction', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Regional Language">Regional Language</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Community *</label>
                  <input
                    type="text"
                    placeholder="General / OBC / SC / ST / EWS"
                    value={formData.community}
                    onChange={(e) => handleChange('community', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Allocation *</label>
                    <select
                      value={formData.school_id}
                      onChange={(e) => handleChange('school_id', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    >
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.school_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-5">Travel & School Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Distance to School (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_to_school_km}
                    onChange={(e) => handleChange('distance_to_school_km', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Transport Mode</label>
                  <select
                    value={formData.transport_mode}
                    onChange={(e) => handleChange('transport_mode', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-850 dark:text-white"
                  >
                    <option value="Walking">Walking</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Public Bus">Public Bus</option>
                    <option value="School Bus">School Bus</option>
                    <option value="Auto Rickshaw">Auto Rickshaw</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Travel Time (mins)</label>
                  <input
                    type="number"
                    value={formData.travel_time_min}
                    onChange={(e) => handleChange('travel_time_min', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">School Type</label>
                  <select
                    value={formData.school_type}
                    onChange={(e) => handleChange('school_type', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Aided">Aided</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Teacher-Student Ratio</label>
                  <input
                    type="text"
                    placeholder="e.g., 1:35"
                    value={formData.teacher_student_ratio}
                    onChange={(e) => handleChange('teacher_student_ratio', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Academics & Attendance */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Previous Year %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.previous_year_percentage}
                    onChange={(e) => handleChange('previous_year_percentage', e.target.value, 'academics')}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Unit Test Average</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.unit_test_average}
                    onChange={(e) => handleChange('unit_test_average', e.target.value, 'academics')}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Overall Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.overall_percentage}
                    onChange={(e) => handleChange('overall_percentage', e.target.value, 'academics')}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                    required
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-5">Exam Term Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Quarterly Exam %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.quarterly_exam}
                    onChange={(e) => handleChange('quarterly_exam', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Half Yearly Exam %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.half_yearly_exam}
                    onChange={(e) => handleChange('half_yearly_exam', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Annual Exam %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academics.annual_exam}
                    onChange={(e) => handleChange('annual_exam', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-5">Subject Marks</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Mathematics</label>
                  <input
                    type="number"
                    value={formData.academics.mathematics_marks}
                    onChange={(e) => handleChange('mathematics_marks', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Science</label>
                  <input
                    type="number"
                    value={formData.academics.science_marks}
                    onChange={(e) => handleChange('science_marks', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">English</label>
                  <input
                    type="number"
                    value={formData.academics.english_marks}
                    onChange={(e) => handleChange('english_marks', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Social Science</label>
                  <input
                    type="number"
                    value={formData.academics.social_science_marks}
                    onChange={(e) => handleChange('social_science_marks', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Regional Lang</label>
                  <input
                    type="number"
                    value={formData.academics.regional_language_marks}
                    onChange={(e) => handleChange('regional_language_marks', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-5">Backlogs & Failures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Failed Subjects Count</label>
                  <input
                    type="number"
                    value={formData.academics.number_of_failed_subjects}
                    onChange={(e) => handleChange('number_of_failed_subjects', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Academic Backlogs</label>
                  <select
                    value={formData.academics.academic_backlogs}
                    onChange={(e) => handleChange('academic_backlogs', e.target.value, 'academics')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3 pt-8">Attendance Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Attendance Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.attendance.attendance_percentage}
                    onChange={(e) => handleChange('attendance_percentage', e.target.value, 'attendance')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Consecutive Absences</label>
                  <input
                    type="number"
                    value={formData.attendance.consecutive_absences}
                    onChange={(e) => handleChange('consecutive_absences', e.target.value, 'attendance')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Leave Days</label>
                  <input
                    type="number"
                    value={formData.attendance.leave_days}
                    onChange={(e) => handleChange('leave_days', e.target.value, 'attendance')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Late Arrivals</label>
                  <input
                    type="number"
                    value={formData.attendance.late_arrivals}
                    onChange={(e) => handleChange('late_arrivals', e.target.value, 'attendance')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Behaviour */}
          {activeTab === 'behaviour' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Behaviour & Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Homework Completion Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.behaviour.homework_completion}
                    onChange={(e) => handleChange('homework_completion', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Assignment Submission Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.behaviour.assignment_submission_rate}
                    onChange={(e) => handleChange('assignment_submission_rate', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Classroom Participation</label>
                  <select
                    value={formData.behaviour.classroom_participation}
                    onChange={(e) => handleChange('classroom_participation', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Discipline Incidents</label>
                  <input
                    type="number"
                    value={formData.behaviour.discipline_incidents}
                    onChange={(e) => handleChange('discipline_incidents', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Teacher Feedback Description</label>
                  <input
                    type="text"
                    value={formData.behaviour.teacher_feedback}
                    onChange={(e) => handleChange('teacher_feedback', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Extracurricular Activity</label>
                  <select
                    value={formData.behaviour.participation_in_extracurricular}
                    onChange={(e) => handleChange('participation_in_extracurricular', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Library Usage</label>
                  <select
                    value={formData.behaviour.library_usage}
                    onChange={(e) => handleChange('library_usage', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Low Motivation Risk</label>
                  <select
                    value={formData.behaviour.low_motivation}
                    onChange={(e) => handleChange('low_motivation', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Bullying Experience</label>
                  <select
                    value={formData.behaviour.bullying_experience}
                    onChange={(e) => handleChange('bullying_experience', e.target.value, 'behaviour')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Family Details */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Household & Family Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Annual Family Income</label>
                  <input
                    type="number"
                    value={formData.family.family_income}
                    onChange={(e) => handleChange('family_income', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Parents Highest Education</label>
                  <input
                    type="text"
                    value={formData.family.parents_education}
                    onChange={(e) => handleChange('parents_education', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Parents Primary Occupation</label>
                  <input
                    type="text"
                    value={formData.family.parents_occupation}
                    onChange={(e) => handleChange('parents_occupation', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Single Parent Status</label>
                  <select
                    value={formData.family.single_parent}
                    onChange={(e) => handleChange('single_parent', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Number of Siblings</label>
                  <input
                    type="number"
                    value={formData.family.number_of_siblings}
                    onChange={(e) => handleChange('number_of_siblings', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Guardian Support</label>
                  <select
                    value={formData.family.guardian_support}
                    onChange={(e) => handleChange('guardian_support', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Home Study Hours (Daily)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.family.home_study_hours}
                    onChange={(e) => handleChange('home_study_hours', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Financial Difficulty</label>
                  <select
                    value={formData.family.financial_difficulty}
                    onChange={(e) => handleChange('financial_difficulty', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Child Labour Risk</label>
                  <select
                    value={formData.family.child_labour_risk}
                    onChange={(e) => handleChange('child_labour_risk', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Frequent Migration History</label>
                  <select
                    value={formData.family.frequent_migration}
                    onChange={(e) => handleChange('frequent_migration', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Domestic Family Issues</label>
                  <select
                    value={formData.family.family_issues}
                    onChange={(e) => handleChange('family_issues', e.target.value, 'family')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Health details */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Health & Nutrition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Chronic Illness Status</label>
                  <select
                    value={formData.health.chronic_illness}
                    onChange={(e) => handleChange('chronic_illness', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Nutrition Status</label>
                  <select
                    value={formData.health.nutrition_status}
                    onChange={(e) => handleChange('nutrition_status', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Vision Impairments</label>
                  <select
                    value={formData.health.vision_problems}
                    onChange={(e) => handleChange('vision_problems', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Mental Health Risk Category</label>
                  <select
                    value={formData.health.mental_health_risk}
                    onChange={(e) => handleChange('mental_health_risk', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Disability Status</label>
                  <select
                    value={formData.health.disability_status}
                    onChange={(e) => handleChange('disability_status', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Midday Meal Beneficiary</label>
                  <select
                    value={formData.health.midday_meal_beneficiary}
                    onChange={(e) => handleChange('midday_meal_beneficiary', e.target.value, 'health')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Tech Details */}
          {activeTab === 'tech' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-3">Home Technology Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Internet Connection Availability</label>
                  <select
                    value={formData.technology.internet_access}
                    onChange={(e) => handleChange('internet_access', e.target.value, 'technology')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Smartphone Access</label>
                  <select
                    value={formData.technology.smartphone_access}
                    onChange={(e) => handleChange('smartphone_access', e.target.value, 'technology')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Computer / Laptop Access</label>
                  <select
                    value={formData.technology.computer_access}
                    onChange={(e) => handleChange('computer_access', e.target.value, 'technology')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Electricity Availability</label>
                  <select
                    value={formData.technology.electricity_availability}
                    onChange={(e) => handleChange('electricity_availability', e.target.value, 'technology')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </GlassCard>
      </form>
    </div>
  );
}
