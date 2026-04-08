import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { userService } from '../services/userService';
import { careerService } from '../services/careerService';
import { UserProfile, CareerRecommendation } from '../types';
import { Sparkles, TrendingUp, DollarSign, Building2, ArrowRight, RefreshCw, Target, Brain, Bookmark } from 'lucide-react';

interface DashboardProps {
  user: User;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user, profile }) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [profile.uid]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const existing = await userService.getRecommendations(profile.uid);
      if (existing.length > 0) {
        setRecommendations(existing);
      } else {
        await generateNewRecommendations();
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    setGenerating(true);
    try {
      const newRecs = await careerService.generateRecommendations(profile);
      for (const rec of newRecs) {
        await userService.saveRecommendation(rec);
      }
      setRecommendations(newRecs);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !generating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Analyzing Market Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141414]/40">
            <Target className="w-3 h-3" />
            Your Career Architecture
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Welcome back, {profile.displayName?.split(' ')[0]}.</h1>
          <p className="text-[#141414]/60 max-w-xl">Based on your skills in {(profile.skills || []).slice(0, 3).map(s => typeof s === 'string' ? s : s.name).join(', ')} and your {profile.personalityType || 'unique'} profile, we've identified these high-growth paths.</p>
        </div>
        <button 
          onClick={generateNewRecommendations}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 border-2 border-[#141414]/10 rounded-full text-sm font-bold hover:bg-[#141414]/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Regenerating...' : 'Refresh Recommendations'}
        </button>
      </header>

      {generating && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 bg-white rounded-[3rem] border-2 border-dashed border-[#141414]/10 flex flex-col items-center text-center space-y-6"
        >
          <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center animate-bounce shadow-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">AI is architecting your paths...</h3>
            <p className="text-[#141414]/60 max-w-sm mx-auto text-sm">We're cross-referencing your skills with global market trends and salary data.</p>
          </div>
        </motion.div>
      )}

      {/* Profile Snapshot */}
      <section className="bg-white rounded-[3rem] p-10 border border-[#141414]/5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Profile Snapshot</h2>
              <Link 
                to="/profile/edit"
                className="p-2 hover:bg-[#141414]/5 rounded-xl transition-all text-[#141414]/40 hover:text-[#141414]"
                title="Edit Profile"
              >
                <RefreshCw className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#141414]/5 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">Experience</p>
                <p className="text-lg font-bold">{profile.yearsOfExperience} Years</p>
              </div>
              <div className="p-4 bg-[#141414]/5 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">Current Role</p>
                <p className="text-lg font-bold">{profile.currentRole || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-[#141414]/10 rounded-xl text-xs font-bold flex items-center gap-2">
                    {typeof skill === 'string' ? skill : skill.name}
                    {typeof skill !== 'string' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        skill.level === 'Expert' ? 'bg-emerald-500' : 
                        skill.level === 'Intermediate' ? 'bg-blue-500' : 'bg-slate-300'
                      }`}></span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">Domain Knowledge</h4>
              <div className="flex flex-wrap gap-2">
                {(profile.knowledge || []).map((k, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#141414] text-white rounded-xl text-xs font-bold">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">Key Achievements</h4>
              <ul className="space-y-2">
                {(profile.achievements || []).map((a, i) => (
                  <li key={i} className="text-sm text-[#141414]/70 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-[#141414] rounded-full shrink-0"></span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-[#141414]/5">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">Featured Projects</h4>
                <div className="space-y-3">
                  {(profile.projects || []).map((p, i) => (
                    <div key={i} className="p-4 bg-[#141414]/5 rounded-2xl border border-transparent hover:border-[#141414]/10 transition-all">
                      <h5 className="font-bold text-sm mb-1">{p.title}</h5>
                      <p className="text-xs text-[#141414]/60 mb-2 line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.technologies.slice(0, 3).map((t, j) => (
                          <span key={j} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#141414]/5">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(profile.projects || []).length === 0 && <p className="text-xs text-[#141414]/40 italic">No projects added yet.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">Certifications</h4>
                <div className="space-y-3">
                  {(profile.certifications || []).map((c, i) => (
                    <div key={i} className="p-4 bg-[#141414]/5 rounded-2xl border border-transparent hover:border-[#141414]/10 transition-all">
                      <h5 className="font-bold text-sm mb-1">{c.name}</h5>
                      <p className="text-xs text-[#141414]/60">{c.issuer} • {c.date}</p>
                    </div>
                  ))}
                  {(profile.certifications || []).length === 0 && <p className="text-xs text-[#141414]/40 italic">No certifications added yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {recommendations.map((rec, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-sm hover:shadow-2xl transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  rec.marketTrends.growth === 'Booming' ? 'bg-emerald-100 text-emerald-700' : 
                  rec.marketTrends.growth === 'Stable' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {rec.marketTrends.growth}
                </div>
                <div className="text-2xl font-bold text-[#141414]/20">0{i + 1}</div>
              </div>

              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#141414]/60 transition-colors">{rec.title}</h3>
              <p className="text-sm text-[#141414]/60 mb-8 line-clamp-3 flex-grow">{rec.description}</p>

              <div className="space-y-4 pt-6 border-t border-[#141414]/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Mid-Level Salary
                  </span>
                  <span className="font-bold">{rec.salaryData.mid}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Match Score
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#141414]/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#141414]" style={{ width: `${rec.matchScore}%` }}></div>
                    </div>
                    <span className="font-bold">{rec.matchScore}%</span>
                  </div>
                </div>
              </div>

              <Link 
                to={`/career/${rec.id}`}
                className="mt-8 w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform active:scale-95"
              >
                View Roadmap
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/resume-tailor" className="p-8 bg-[#141414] text-white rounded-[2.5rem] group relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-bold">AI Resume Tailor</h3>
            <p className="text-white/60 text-sm max-w-xs">Optimize your resume for any of these roles with AI-driven keyword analysis.</p>
            <div className="inline-flex items-center gap-2 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Try it now <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </Link>
        <Link to="/interview-prep" className="p-8 bg-white border-2 border-[#141414] rounded-[2.5rem] group relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-bold">Interview Prep Bot</h3>
            <p className="text-[#141414]/60 text-sm max-w-xs">Practice mock interviews for your target roles and get instant feedback.</p>
            <div className="inline-flex items-center gap-2 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Start practice <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-[#141414]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </Link>
      </section>

      {/* Saved Items */}
      {(profile.savedRoadmaps?.length || 0) > 0 || (profile.savedSteps?.length || 0) > 0 ? (
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8" />
            Saved for Later
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.savedRoadmaps && profile.savedRoadmaps.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Saved Roadmaps</h4>
                <div className="space-y-3">
                  {profile.savedRoadmaps.map((id, i) => (
                    <Link 
                      key={i} 
                      to={`/career/${id}`}
                      className="block p-4 bg-white border border-[#141414]/5 rounded-2xl hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">View Roadmap</span>
                        <ArrowRight className="w-4 h-4 text-[#141414]/40" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {profile.savedSteps && profile.savedSteps.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Bookmarked Steps</h4>
                <div className="space-y-3">
                  {profile.savedSteps.map((step, i) => (
                    <Link 
                      key={i} 
                      to={`/career/${step.roadmapId}`}
                      className="block p-4 bg-white border border-[#141414]/5 rounded-2xl hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Step {step.stepIndex + 1} in Roadmap</span>
                        <ArrowRight className="w-4 h-4 text-[#141414]/40" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Dashboard;
