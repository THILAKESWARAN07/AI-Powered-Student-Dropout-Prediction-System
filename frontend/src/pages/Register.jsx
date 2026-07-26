import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Loader2, ArrowLeft, User as UserIcon, Mail, Phone, Lock, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/common/GlassCard';

export default function Register() {
  const { register, user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';



  useEffect(() => {
    // Fetch schools list for select input if admin is registering a user
    if (isAdmin) {
      const fetchSchools = async () => {
        try {
          const res = await api.get('/schools');
          setSchools(res.data);
        } catch (err) {
          // Fail silently
        }
      };
      fetchSchools();
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      full_name: fullName,
      email,
      phone: phone || null,
      password,
    };

    // Include admin-only fields if user is admin
    if (isAdmin) {
      payload.role = role;
      payload.school_id = schoolId ? parseInt(schoolId) : null;
    }

    const success = await register(payload);
    setLoading(false);

    if (success) {
      if (isAdmin) {
        showToast('Created user account successfully', 'success');
        // Clear form
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setRole('teacher');
        setSchoolId('');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <GlassCard className="max-w-lg w-full border-white/30 dark:border-white/5 p-8" hoverEffect={false}>
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl mb-3">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? 'Register New User' : 'Create Teacher Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {isAdmin ? 'System administrator enrollment console' : 'Register to log in and view school registries'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm mb-6 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Full Name *</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Admin Role & School Selectors */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="deo">District Officer (DEO)</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Assigned School</label>
                <div className="relative">
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  >
                    <option value="">No Assigned School</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.school_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enrolling user...
              </>
            ) : (
              isAdmin ? 'Create System Account' : 'Register Account'
            )}
          </button>
        </form>

        {!isAdmin && (
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an active account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Portal Sign In
            </Link>
          </div>
        )}

        {/* Back Link */}
        <Link to={isAdmin ? '/portal/users' : '/'} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold mx-auto mt-6 block w-fit">
          <ArrowLeft className="h-4 w-4" /> {isAdmin ? 'Back to User Registry' : 'Return to Landing Page'}
        </Link>
      </GlassCard>


    </div>
  );
}
