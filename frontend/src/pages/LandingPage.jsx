import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingDown, ShieldAlert, FileSpreadsheet, Users, 
  Sparkles, Cpu, Database, Server, ArrowRight, ShieldCheck, Mail, MessageSquare
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const features = [
    {
      icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
      title: "Early Dropout Risk Flags",
      description: "Uses machine learning predictions to identify students at risk of dropping out months before the academic term ends."
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6 text-emerald-500" />,
      title: "Seamless Roster Imports",
      description: "Quickly upload student grades, attendance records, and demographic metrics directly using Excel or CSV files."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-amber-500" />,
      title: "Explainable Risk Factors",
      description: "Understand the 'Why' behind every prediction. Views rank factors like attendance dips, behavioral scores, or academic drops."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Actionable Interventions",
      description: "Tiered action items (home visits, parent meetings, counseling) tailored specifically to high and medium-risk cases."
    }
  ];

  const techStack = [
    { name: "FastAPI", category: "Backend", icon: <Server className="h-4 w-4 text-emerald-400" /> },
    { name: "React (Vite)", category: "Frontend", icon: <Cpu className="h-4 w-4 text-sky-400" /> },
    { name: "PostgreSQL", category: "Database", icon: <Database className="h-4 w-4 text-indigo-400" /> },
    { name: "Tailwind CSS", category: "Styling", icon: <Sparkles className="h-4 w-4 text-teal-400" /> },
    { name: "Docker", category: "Infrastructure", icon: <ShieldCheck className="h-4 w-4 text-blue-400" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white bg-gradient-mesh transition-all duration-300">
      
      {/* Home / Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-panel border border-white/40 dark:border-white/10 text-xs font-semibold text-primary dark:text-indigo-400 mb-6 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Warning System
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 dark:from-white dark:via-slate-200 dark:to-slate-400 leading-tight"
          >
            Prevent Student Dropouts Before They Happen
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mt-6 leading-relaxed"
          >
            Empower educators, headmasters, and administrators with predictive insight, explainable risk markers, and structured intervention strategies.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
          >
            <Link
              to="/login"
              className="bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1"
            >
              Access Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="glass-panel hover:bg-white/20 dark:hover:bg-slate-900/50 px-8 py-4 rounded-2xl font-bold border border-white/40 dark:border-slate-800 flex items-center justify-center transition-all duration-300"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Glassmorphic Mock Dashboard UI */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-5xl mt-16 rounded-3xl overflow-hidden glass-panel border border-white/30 dark:border-white/10 p-2 shadow-2xl"
          >
            <div className="rounded-2xl overflow-hidden bg-slate-900/5 dark:bg-slate-950/80 p-4 md:p-6 text-left border border-white/25 dark:border-slate-800">
              {/* Header simulation */}
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500 font-mono ml-2">dropguard_dashboard_v1.0</span>
                </div>
                <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              {/* Grid Content simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-28 rounded-2xl bg-white/50 dark:bg-slate-900 border border-white/30 dark:border-white/5 p-4 flex flex-col justify-between">
                  <div className="text-xs text-slate-500">High Risk Students</div>
                  <div className="text-3xl font-bold text-red-500">14</div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-1/3" />
                  </div>
                </div>
                <div className="h-28 rounded-2xl bg-white/50 dark:bg-slate-900 border border-white/30 dark:border-white/5 p-4 flex flex-col justify-between">
                  <div className="text-xs text-slate-500">Average Attendance</div>
                  <div className="text-3xl font-bold text-emerald-500">82.4%</div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[82%]" />
                  </div>
                </div>
                <div className="h-28 rounded-2xl bg-white/50 dark:bg-slate-900 border border-white/30 dark:border-white/5 p-4 flex flex-col justify-between">
                  <div className="text-xs text-slate-500">Intervention Rate</div>
                  <div className="text-3xl font-bold text-primary">94.1%</div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[94%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Features Tailored for School Success
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            Designed to integrate with existing records systems to simplify analytics and prioritize student care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <GlassCard key={i} delay={i * 0.1}>
              <div className="bg-primary/5 dark:bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 bg-slate-100/50 dark:bg-slate-900/10 border-y border-slate-200/50 dark:border-slate-800/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Our Mission: Keep Every Child in School
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Student dropouts represent a systemic loss. Often, by the time warning flags are caught, the factors compounding a student's departure have been active for months.
              </p>
              <p>
                DropGuard serves as an early-warning registry. It analyzes attendance frequencies, behavioral flags, and subject grades to rate students into tiered risks (High, Medium, Low), suggesting custom support workflows for teachers and headmasters.
              </p>
              <p>
                With decentralized school tracking and multi-tier reports, education administrators have visibility across local districts to deploy resources where they are needed most.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl -z-10" />
            <GlassCard hoverEffect={false} className="border-white/40 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-4">Targeted Interventions</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="bg-red-500/10 text-red-500 text-xs px-2.5 py-1 rounded font-bold uppercase mt-1">High Risk</span>
                  <div>
                    <h4 className="font-semibold text-sm">Critical Assistance</h4>
                    <p className="text-xs text-slate-500">Requires home visits, parent-teacher reviews, or mid-day meal audits.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-slate-200 dark:border-slate-800 pt-4">
                  <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2.5 py-1 rounded font-bold uppercase mt-1">Medium Risk</span>
                  <div>
                    <h4 className="font-semibold text-sm">Active Mentorship</h4>
                    <p className="text-xs text-slate-500">Provides homework tracking, structured mentoring, and weekly check-ins.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-slate-200 dark:border-slate-800 pt-4">
                  <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2.5 py-1 rounded font-bold uppercase mt-1">Low Risk</span>
                  <div>
                    <h4 className="font-semibold text-sm">Passive Tracking</h4>
                    <p className="text-xs text-slate-500">General observation and attendance metrics checks.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="technology" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Engineered For Scale and Security
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            The platform is built on modern, lightweight systems configured for high throughput and modular maintainability.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm"
            >
              {tech.icon}
              <div className="text-left">
                <div className="text-xs text-slate-400 font-medium">{tech.category}</div>
                <div className="text-sm font-semibold">{tech.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call To Action Section */}
      <section id="cta" className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center scroll-mt-20">
        <GlassCard className="relative overflow-hidden p-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-white/40 dark:border-white/5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Support Your Classroom?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Create profiles, configure classrooms, and analyze predictive dropout markers using the administrative portal.
          </p>
          <Link
            to="/login"
            className="inline-flex bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Access Administrator Portal <ArrowRight className="h-5 w-5" />
          </Link>
        </GlassCard>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 md:px-12 max-w-4xl mx-auto text-center scroll-mt-20">
        <h2 className="text-2xl font-bold mb-6">Need Support or Have Questions?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>support@dropguard.org</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Submit a Feedback Ticket</span>
          </div>
        </div>
      </section>
    </div>
  );
}
