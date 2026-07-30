import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/common/GlassCard';
import { 
  ArrowLeft, Edit, Trash2, Calendar, User, BookOpen, Clock, Activity, Home, Heart, Cpu, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';

const calculateCompleteness = (s) => {
  const fields = [
    // Core
    { path: ['student_id'], label: 'Student ID' },
    { path: ['full_name'], label: 'Student Full Name' },
    { path: ['gender'], label: 'Gender' },
    { path: ['age'], label: 'Age' },
    { path: ['class_name'], label: 'Class' },
    { path: ['section'], label: 'Section' },
    { path: ['medium_of_instruction'], label: 'Medium of Instruction' },
    { path: ['community'], label: 'Community' },
    { path: ['distance_to_school_km'], label: 'Distance to School' },
    { path: ['transport_mode'], label: 'Transport Mode' },
    { path: ['travel_time_min'], label: 'Travel Time' },
    { path: ['school_type'], label: 'School Type' },
    { path: ['teacher_student_ratio'], label: 'Teacher-Student Ratio' },
    // Academics
    { path: ['academics', 'previous_year_percentage'], label: 'Previous Year Percentage' },
    { path: ['academics', 'unit_test_average'], label: 'Unit Test Average' },
    { path: ['academics', 'quarterly_exam'], label: 'Quarterly Exam' },
    { path: ['academics', 'half_yearly_exam'], label: 'Half Yearly Exam' },
    { path: ['academics', 'annual_exam'], label: 'Annual Exam' },
    { path: ['academics', 'mathematics_marks'], label: 'Mathematics Marks' },
    { path: ['academics', 'science_marks'], label: 'Science Marks' },
    { path: ['academics', 'english_marks'], label: 'English Marks' },
    { path: ['academics', 'social_science_marks'], label: 'Social Science Marks' },
    { path: ['academics', 'regional_language_marks'], label: 'Regional Language Marks' },
    { path: ['academics', 'overall_percentage'], label: 'Overall Percentage' },
    { path: ['academics', 'number_of_failed_subjects'], label: 'Failed Subjects Count' },
    { path: ['academics', 'academic_backlogs'], label: 'Academic Backlogs' },
    // Attendance
    { path: ['attendance', 'attendance_percentage'], label: 'Attendance Percentage' },
    { path: ['attendance', 'consecutive_absences'], label: 'Consecutive Absences' },
    { path: ['attendance', 'leave_days'], label: 'Leave Days' },
    { path: ['attendance', 'late_arrivals'], label: 'Late Arrivals' },
    // Behaviour
    { path: ['behaviour', 'homework_completion'], label: 'Homework Completion' },
    { path: ['behaviour', 'assignment_submission_rate'], label: 'Assignment Submission Rate' },
    { path: ['behaviour', 'classroom_participation'], label: 'Classroom Participation' },
    { path: ['behaviour', 'discipline_incidents'], label: 'Discipline Incidents' },
    { path: ['behaviour', 'teacher_feedback'], label: 'Teacher Feedback' },
    { path: ['behaviour', 'participation_in_extracurricular'], label: 'Extracurricular Participation' },
    { path: ['behaviour', 'library_usage'], label: 'Library Usage' },
    { path: ['behaviour', 'low_motivation'], label: 'Low Motivation' },
    { path: ['behaviour', 'bullying_experience'], label: 'Bullying Experience' },
    // Family
    { path: ['family', 'family_income'], label: 'Family Income' },
    { path: ['family', 'parents_education'], label: 'Parents Education' },
    { path: ['family', 'parents_occupation'], label: 'Parents Occupation' },
    { path: ['family', 'single_parent'], label: 'Single Parent' },
    { path: ['family', 'number_of_siblings'], label: 'Number of Siblings' },
    { path: ['family', 'guardian_support'], label: 'Guardian Support' },
    { path: ['family', 'home_study_hours'], label: 'Home Study Hours' },
    { path: ['family', 'financial_difficulty'], label: 'Financial Difficulty' },
    { path: ['family', 'child_labour_risk'], label: 'Child Labour Risk' },
    { path: ['family', 'frequent_migration'], label: 'Frequent Migration' },
    { path: ['family', 'family_issues'], label: 'Family Issues' },
    // Health
    { path: ['health', 'chronic_illness'], label: 'Chronic Illness' },
    { path: ['health', 'nutrition_status'], label: 'Nutrition Status' },
    { path: ['health', 'vision_problems'], label: 'Vision Problems' },
    { path: ['health', 'mental_health_risk'], label: 'Mental Health Risk' },
    { path: ['health', 'disability_status'], label: 'Disability Status' },
    { path: ['health', 'midday_meal_beneficiary'], label: 'Midday Meal Beneficiary' },
    // Technology
    { path: ['technology', 'internet_access'], label: 'Internet Access' },
    { path: ['technology', 'smartphone_access'], label: 'Smartphone Access' },
    { path: ['technology', 'computer_access'], label: 'Computer Access' },
    { path: ['technology', 'electricity_availability'], label: 'Electricity Availability' },
    // Predictions
    { path: ['predictions', 0, 'dropout_risk'], label: 'Dropout Risk Prediction' },
    { path: ['predictions', 0, 'dropout_status'], label: 'Dropout Status Prediction' }
  ];

  let filledCount = 0;
  const missing = [];

  fields.forEach(f => {
    let val = s;
    for (const key of f.path) {
      if (val && val[key] !== undefined && val[key] !== null) {
        val = val[key];
      } else {
        val = null;
        break;
      }
    }
    
    if (val !== null && val !== undefined && val !== '') {
      filledCount++;
    } else {
      missing.push(f.label);
    }
  });

  const score = Math.round((filledCount / fields.length) * 100);
  return { score, missing };
};


export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('demographics');

  const completeness = student ? calculateCompleteness(student) : { score: 0, missing: [] };

  const isAdmin = currentUser?.role === 'admin';
  const isHeadmaster = currentUser?.role === 'headmaster';
  const isTeacher = currentUser?.role === 'teacher';
  const canMutate = isAdmin || isHeadmaster;
  const canEdit = isAdmin || isHeadmaster;

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students/${id}`);
      setStudent(res.data);
    } catch (err) {
      showToast('Failed to retrieve student profile records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete student "${student.student_id}"?`)) {
      return;
    }
    try {
      await api.delete(`/students/${id}`);
      showToast('Student record deleted successfully', 'success');
      navigate('/portal/students');
    } catch (err) {
      showToast('Failed to delete student', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm font-semibold text-slate-500">Loading student registry details...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-500">Student profile could not be loaded.</p>
        <Link to="/portal/students" className="text-primary hover:underline font-bold">Return to registry list</Link>
      </div>
    );
  }

  // Helper stats definitions
  const latestPrediction = student.predictions && student.predictions.length > 0 
    ? student.predictions[0] 
    : { dropout_risk: 'Low', dropout_status: 'No' };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      case 'Medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link to="/portal/students" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{student.full_name}</h1>
            <p className="text-sm text-slate-500">Student ID: {student.student_id} • Class {student.class_name} - {student.section}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              to={`/portal/students/${student.id}/edit`}
              className="bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Edit className="h-4 w-4" /> Edit Profile
            </Link>
          )}
          {canMutate && (
            <button
              onClick={handleDelete}
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" /> Delete Record
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Core Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Overview Card */}
          <GlassCard className="p-6 text-center border-white/30 dark:border-white/5" hoverEffect={false}>
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl uppercase mx-auto mb-4 border-2 border-primary/20 shadow-inner">
              {student.full_name.charAt(0)}
            </div>
            <h2 className="text-xl font-black">{student.full_name}</h2>
            <span className="text-xs text-slate-400 font-bold block mb-4">{student.school?.school_name}</span>

            {/* Risk Indicator Card */}
            <div className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 ${getRiskColor(latestPrediction.dropout_risk)}`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Dropout Risk Factor</span>
              <span className="text-2xl font-black">{latestPrediction.dropout_risk}</span>
              <span className="text-[10px] font-bold block">Status: {latestPrediction.dropout_status === 'Yes' ? 'Dropout' : 'Active Student'}</span>
            </div>

            {/* Minor Metadata */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-left text-xs font-bold text-slate-500">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Gender</span>
                <span className="text-slate-800 dark:text-white">{student.gender}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Age</span>
                <span className="text-slate-800 dark:text-white">{student.age} Years</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Community</span>
                <span className="text-slate-800 dark:text-white">{student.community}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Instruction Medium</span>
                <span className="text-slate-800 dark:text-white">{student.medium_of_instruction}</span>
              </div>
            </div>
          </GlassCard>

          {/* Completeness Card */}
          <GlassCard className="p-6 border-white/30 dark:border-white/5" hoverEffect={false}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Data Completeness</h3>
              <span className={`text-sm font-black ${completeness.score === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {completeness.score}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800/20 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  completeness.score === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            {completeness.missing.length > 0 ? (
              <div className="text-[10px] text-left">
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Missing features for prediction:</span>
                <div className="max-h-24 overflow-y-auto pr-1 text-slate-450 leading-relaxed font-semibold">
                  {completeness.missing.join(', ')}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle className="h-4 w-4" /> Ready for ML Dropout Prediction
              </div>
            )}
          </GlassCard>

          {/* Academic Timeline Mock Widget */}
          <GlassCard className="p-6 border-white/30 dark:border-white/5" hoverEffect={false}>
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Academic Score Timeline
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-primary/20 rounded-full relative">
                  <div className="absolute top-0 left-0 w-full h-[70%] bg-primary rounded-full" />
                </div>
                <div className="flex-grow text-xs">
                  <span className="font-bold text-slate-800 dark:text-white block">Quarterly Exam</span>
                  <span className="text-slate-400 font-semibold">{student.academics?.quarterly_exam?.toFixed(1) || 0}% Score</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-primary/20 rounded-full relative">
                  <div className="absolute top-0 left-0 w-full h-[65%] bg-primary rounded-full" />
                </div>
                <div className="flex-grow text-xs">
                  <span className="font-bold text-slate-800 dark:text-white block">Half Yearly Exam</span>
                  <span className="text-slate-400 font-semibold">{student.academics?.half_yearly_exam?.toFixed(1) || 0}% Score</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-primary/20 rounded-full relative">
                  <div className="absolute top-0 left-0 w-full h-[80%] bg-primary rounded-full" />
                </div>
                <div className="flex-grow text-xs">
                  <span className="font-bold text-slate-800 dark:text-white block">Annual Exam</span>
                  <span className="text-slate-400 font-semibold">{student.academics?.annual_exam?.toFixed(1) || 0}% Score</span>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>        {/* RIGHT COLUMN: Full Data Metrics Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sub Navigation bar */}
          <div className="flex items-center gap-2 overflow-x-auto bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
            {['demographics', 'academics', 'attendance', 'behaviour', 'family', 'health', 'technology', 'prediction'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  activeSubTab === tab
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub-tab view panel */}
          <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
            
            {/* DEMOGRAPHICS PANEL */}
            {activeSubTab === 'demographics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Demographics & Travel Characteristics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-bold text-slate-500">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Student ID</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.student_id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Full Name</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.full_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Gender</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.gender}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Age</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.age} Years</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Class / Section</span>
                    <span className="text-sm text-slate-800 dark:text-white">Class {student.class_name} - {student.section}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Instruction Medium</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.medium_of_instruction}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Community Group</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.community}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">School Type</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.school_type || 'Government'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Teacher-Student Ratio</span>
                    <span className="text-sm text-slate-800 dark:text-white">{student.teacher_student_ratio || '1:35'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Commute & Travel details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-bold text-slate-500">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Distance to School</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.distance_to_school_km || 0} km</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Transport Mode</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.transport_mode || 'Walking'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Travel Time</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.travel_time_min || 0} mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACADEMICS PANEL */}
            {activeSubTab === 'academics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Academic Records
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-bold text-slate-500">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Previous Year Percentage</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.academics?.previous_year_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Unit Test Average</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.academics?.unit_test_average}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Overall Percentage</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.academics?.overall_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Failed Subjects</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.academics?.number_of_failed_subjects}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Academic Backlogs</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.academics?.academic_backlogs}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Exam Term Marks</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-bold text-slate-500">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Quarterly Exam</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.academics?.quarterly_exam?.toFixed(1) || 0}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Half Yearly Exam</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.academics?.half_yearly_exam?.toFixed(1) || 0}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Annual Exam</span>
                      <span className="text-sm text-slate-800 dark:text-white">{student.academics?.annual_exam?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Subject Wise Marks</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {['Mathematics', 'Science', 'English', 'Social Science', 'Regional Language'].map(sub => {
                      const field = sub.toLowerCase().replace(' ', '_') + '_marks';
                      const val = student.academics?.[field] || 0;
                      return (
                        <div key={sub} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-center border border-slate-200/50 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 block truncate">{sub}</span>
                          <span className="text-base font-black text-slate-800 dark:text-white">{val}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDANCE PANEL */}
            {activeSubTab === 'attendance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Attendance Records
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-bold text-slate-500">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Attendance Percentage</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.attendance?.attendance_percentage?.toFixed(1) || 0}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Consecutive Absences</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.attendance?.consecutive_absences || 0} Days</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Leave Days</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.attendance?.leave_days || 0} Days</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Late Arrivals</span>
                    <span className="text-lg text-slate-800 dark:text-white">{student.attendance?.late_arrivals || 0} Times</span>
                  </div>
                </div>
              </div>
            )}

            {/* BEHAVIOUR PANEL */}
            {activeSubTab === 'behaviour' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Behaviour & Feedback
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Homework Completion Rate</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.homework_completion}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assignment Submission Rate</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.assignment_submission_rate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Classroom Participation</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.classroom_participation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Discipline Logged Incidents</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.discipline_incidents} Incidents</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Extracurricular Activity</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.participation_in_extracurricular}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Library Usage Frequency</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.library_usage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Low Motivation</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.low_motivation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Bullying Experience</span>
                    <span className="text-slate-800 dark:text-white text-sm">{student.behaviour?.bullying_experience}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                  <span className="text-xs font-black uppercase text-slate-400 block mb-1">Teacher Feedback Description</span>
                  <p className="text-sm font-semibold italic text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                    "{student.behaviour?.teacher_feedback || 'No comments logged.'}"
                  </p>
                </div>
              </div>
            )}

            {/* FAMILY CONTEXT PANEL */}
            {activeSubTab === 'family' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" /> Family & Household Context
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Annual Family Income</span>
                    <span className="text-slate-850 dark:text-white text-sm">₹{student.family?.family_income?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Parents Education Level</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.parents_education}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Parents Primary Occupation</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.parents_occupation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Single Parent Household</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.single_parent}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Number of Siblings</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.number_of_siblings}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Guardian Support Quality</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.guardian_support}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Home Study Hours</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.home_study_hours || 0} Hours/Day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Financial Difficulty</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.financial_difficulty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Child Labour Risk</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.child_labour_risk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Frequent Migration history</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.frequent_migration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Domestic Family Issues</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.family?.family_issues}</span>
                  </div>
                </div>
              </div>
            )}

            {/* HEALTH PANEL */}
            {activeSubTab === 'health' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" /> Health & Nutrition
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Chronic Illness</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.chronic_illness}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Nutrition Status</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.nutrition_status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Vision Problems</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.vision_problems}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Mental Health Risk</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.mental_health_risk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Disability Status</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.disability_status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Midday Meal Beneficiary</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.health?.midday_meal_beneficiary}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TECHNOLOGY ACCESS PANEL */}
            {activeSubTab === 'technology' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" /> Technology & Infrastructure
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Internet Access at Home</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.technology?.internet_access}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Smartphone Access</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.technology?.smartphone_access}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Computer / Laptop Access</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.technology?.computer_access}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Electricity Availability</span>
                    <span className="text-slate-850 dark:text-white text-sm">{student.technology?.electricity_availability}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PREDICTIONS HISTORICAL PANEL */}
            {activeSubTab === 'prediction' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" /> Prediction History
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold text-slate-500 mb-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Latest Predicted Dropout Risk</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                      latestPrediction.dropout_risk === 'High' ? 'bg-red-500/10 text-red-500' :
                      latestPrediction.dropout_risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {latestPrediction.dropout_risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Latest Predicted Dropout Status</span>
                    <span className="text-sm text-slate-850 dark:text-white">{latestPrediction.dropout_status === 'Yes' ? 'Dropout' : 'Active'}</span>
                  </div>
                </div>

                {(!student.predictions || student.predictions.length === 0) ? (
                  <p className="text-sm font-semibold text-slate-500">No predictions have been recorded for this student yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Dropout Risk</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Model Version</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/20 dark:bg-slate-950/20">
                        {student.predictions.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                              {p.predicted_at ? new Date(p.predicted_at).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                                p.dropout_risk === 'High' ? 'bg-red-500/10 text-red-500' :
                                p.dropout_risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {p.dropout_risk}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-650 dark:text-slate-350">
                              {p.dropout_status === 'Yes' ? 'Dropout' : 'Enrolled'}
                            </td>
                            <td className="px-4 py-3 text-slate-450 font-mono">v1.0.0 (Baseline CatBoost)</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </GlassCard>

        </div>

      </div>

    </div>
  );
}
