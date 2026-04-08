import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { userService } from '../services/userService';
import { careerService } from '../services/careerService';
import { UserProfile, CareerRecommendation, LearningRoadmap } from '../types';
import { BookOpen, CheckCircle2, DollarSign, Building2, TrendingUp, ArrowLeft, Globe, MapPin, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CareerDetailProps {
  user: User;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const CareerDetail: React.FC<CareerDetailProps> = ({ user, profile, setProfile }) => {
  const { id } = useParams<{ id: string }>();
  const [career, setCareer] = useState<CareerRecommendation | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const toggleStepCompletion = async (stepIndex: number) => {
    if (!roadmap || !roadmap.id) return;

    const updatedSteps = [...roadmap.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      completed: !updatedSteps[stepIndex].completed
    };

    const updatedRoadmap = { ...roadmap, steps: updatedSteps };
    setRoadmap(updatedRoadmap);

    try {
      await userService.updateRoadmap(roadmap.id, { steps: updatedSteps });
    } catch (error) {
      console.error("Error updating roadmap step:", error);
      // Revert on error
      setRoadmap(roadmap);
    }
  };

  const toggleRoadmapSave = async () => {
    if (!roadmap || !roadmap.id) return;
    
    try {
      await userService.toggleRoadmapBookmark(profile.uid, roadmap.id);
      const updatedProfile = await userService.getProfile(profile.uid);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (error) {
      console.error("Error toggling roadmap bookmark:", error);
    }
  };

  const toggleStepSave = async (stepIndex: number) => {
    if (!roadmap || !roadmap.id) return;

    try {
      await userService.toggleStepBookmark(profile.uid, roadmap.id, stepIndex);
      const updatedProfile = await userService.getProfile(profile.uid);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (error) {
      console.error("Error toggling step bookmark:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const recs = await userService.getRecommendations(profile.uid);
      const found = recs.find(r => r.id === id);
      if (found) {
        setCareer(found);
        const existingRoadmap = await userService.getRoadmap(profile.uid, found.title);
        if (existingRoadmap) {
          setRoadmap(existingRoadmap);
        } else {
          await generateRoadmap(found);
        }
      }
    } catch (error) {
      console.error("Error loading career data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (careerRec: CareerRecommendation) => {
    setGenerating(true);
    try {
      const newRoadmap = await careerService.generateRoadmap(profile, careerRec.title);
      await userService.saveRoadmap(newRoadmap);
      setRoadmap(newRoadmap);
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !generating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Building Learning Path...</p>
      </div>
    );
  }

  if (!career) return <div>Career not found.</div>;

  return (
    <div className="space-y-12 pb-20">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <header className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold tracking-tight">{career.title}</h1>
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              career.marketTrends.growth === 'Booming' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {career.marketTrends.growth}
            </div>
          </div>
          <p className="text-xl text-[#141414]/60 leading-relaxed">{career.description}</p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#141414]/5 shadow-sm">
              <MapPin className="w-4 h-4 text-[#141414]/40" />
              <span className="text-sm font-bold">Remote: {profile.remotePreference}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#141414]/5 shadow-sm">
              <Globe className="w-4 h-4 text-[#141414]/40" />
              <span className="text-sm font-bold">Global Trends: {career.marketTrends.demand}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] text-white rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Salary Insights
          </h3>
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Entry Level</p>
              <p className="text-2xl font-bold">{career.salaryData.entry}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Mid Level</p>
              <p className="text-2xl font-bold">{career.salaryData.mid}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Senior Level</p>
              <p className="text-2xl font-bold">{career.salaryData.senior}</p>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10">
            <p className="text-xs opacity-60 italic">Estimated based on current market data and AI analysis.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  Learning Roadmap
                </h2>
                {roadmap && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-48 h-2 bg-[#141414]/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${(roadmap.steps.filter(s => s.completed).length / roadmap.steps.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                        {Math.round((roadmap.steps.filter(s => s.completed).length / roadmap.steps.length) * 100)}% Complete
                      </span>
                    </div>
                    <button 
                      onClick={toggleRoadmapSave}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        profile.savedRoadmaps?.includes(roadmap.id!) 
                          ? 'bg-[#141414] text-white' 
                          : 'bg-[#141414]/5 text-[#141414] hover:bg-[#141414]/10'
                      }`}
                    >
                      {profile.savedRoadmaps?.includes(roadmap.id!) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          Saved Roadmap
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save Roadmap
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {generating && <div className="text-xs font-bold animate-pulse">Generating steps...</div>}
            </div>

            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-8 before:bottom-8 before:w-0.5 before:bg-[#141414]/5">
              {roadmap?.steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-[#141414] rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {i + 1}
                  </div>
                  <div className={`bg-white p-8 rounded-[2rem] border transition-all space-y-4 ${step.completed ? 'border-emerald-500/30 bg-emerald-50/10' : 'border-[#141414]/5 shadow-sm hover:shadow-xl'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStepCompletion(i)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            step.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#141414]/10 hover:border-[#141414]'
                          }`}
                        >
                          {step.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <h4 className={`text-xl font-bold ${step.completed ? 'text-[#141414]/40 line-through' : ''}`}>{step.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStepSave(i)}
                          className={`p-2 rounded-xl transition-all ${
                            profile.savedSteps?.some(s => s.roadmapId === roadmap?.id && s.stepIndex === i)
                              ? 'bg-[#141414] text-white'
                              : 'bg-[#141414]/5 text-[#141414]/40 hover:text-[#141414]'
                          }`}
                          title={profile.savedSteps?.some(s => s.roadmapId === roadmap?.id && s.stepIndex === i) ? "Unsave Step" : "Save Step"}
                        >
                          {profile.savedSteps?.some(s => s.roadmapId === roadmap?.id && s.stepIndex === i) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <span className="px-3 py-1 bg-[#141414]/5 rounded-full text-[10px] font-bold uppercase tracking-widest">{step.duration}</span>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${step.completed ? 'text-[#141414]/30' : 'text-[#141414]/60'}`}>{step.description}</p>
                    <div className={`pt-4 space-y-2 ${step.completed ? 'opacity-30' : ''}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Recommended Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res, j) => (
                          <span key={j} className="text-xs font-medium text-[#141414] underline decoration-[#141414]/20 underline-offset-4">{res}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Skill Gaps
            </h3>
            <p className="text-xs text-[#141414]/60">Based on your current profile, these are the key areas you need to focus on:</p>
            <div className="space-y-3">
              {roadmap?.skillGaps.map((gap, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm font-bold text-red-700">{gap}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Top Hiring Companies
            </h3>
            <div className="flex flex-wrap gap-2">
              {career.topCompanies.map((company, i) => (
                <span key={i} className="px-4 py-2 bg-[#141414]/5 rounded-xl text-sm font-bold">{company}</span>
              ))}
            </div>
          </section>

          <div className="p-8 bg-[#141414] text-white rounded-[2.5rem] space-y-4">
            <h3 className="text-xl font-bold">Ready to apply?</h3>
            <p className="text-white/60 text-sm">Tailor your resume specifically for this {career.title} role.</p>
            <Link 
              to="/resume-tailor"
              className="w-full py-4 bg-white text-[#141414] rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Analyze Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;
