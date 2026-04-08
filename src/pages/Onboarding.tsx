import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { userService } from '../services/userService';
import { UserProfile } from '../types';
import { ArrowRight, ArrowLeft, Check, Sparkles, Brain, Briefcase, Globe, Target } from 'lucide-react';

interface OnboardingProps {
  user: User;
  setProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, setProfile, initialProfile }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    skills: initialProfile?.skills || [] as { name: string, level: 'Beginner' | 'Intermediate' | 'Expert' }[],
    knowledge: initialProfile?.knowledge || [] as string[],
    yearsOfExperience: initialProfile?.yearsOfExperience || 0,
    pastRoles: initialProfile?.pastRoles || [] as string[],
    achievements: initialProfile?.achievements || [] as string[],
    projects: initialProfile?.projects || [] as { title: string, description: string, link?: string, technologies: string[] }[],
    certifications: initialProfile?.certifications || [] as { name: string, issuer: string, date: string, link?: string }[],
    interests: initialProfile?.interests || [] as string[],
    currentRole: initialProfile?.currentRole || '',
    remotePreference: initialProfile?.remotePreference || 'any' as 'remote' | 'hybrid' | 'onsite' | 'any',
    workStyle: initialProfile?.workStyle || {
      structure: 5,
      collaboration: 5,
      risk: 5,
      pace: 5
    }
  });

  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [knowledgeInput, setKnowledgeInput] = useState('');
  const [pastRoleInput, setPastRoleInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [projectInput, setProjectInput] = useState({ title: '', description: '', link: '', technologies: '' });
  const [certInput, setCertInput] = useState({ name: '', issuer: '', date: '', link: '' });

  const addSkill = () => {
    if (skillInput && !formData.skills.find(s => s.name === skillInput)) {
      setFormData({ ...formData, skills: [...formData.skills, { name: skillInput, level: skillLevel }] });
      setSkillInput('');
    }
  };

  const addKnowledge = () => {
    if (knowledgeInput && !formData.knowledge.includes(knowledgeInput)) {
      setFormData({ ...formData, knowledge: [...formData.knowledge, knowledgeInput] });
      setKnowledgeInput('');
    }
  };

  const addPastRole = () => {
    if (pastRoleInput && !formData.pastRoles.includes(pastRoleInput)) {
      setFormData({ ...formData, pastRoles: [...formData.pastRoles, pastRoleInput] });
      setPastRoleInput('');
    }
  };

  const addAchievement = () => {
    if (achievementInput && !formData.achievements.includes(achievementInput)) {
      setFormData({ ...formData, achievements: [...formData.achievements, achievementInput] });
      setAchievementInput('');
    }
  };

  const addInterest = () => {
    if (interestInput && !formData.interests.includes(interestInput)) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput] });
      setInterestInput('');
    }
  };

  const addProject = () => {
    if (projectInput.title && projectInput.description) {
      setFormData({ 
        ...formData, 
        projects: [...formData.projects, { 
          ...projectInput, 
          technologies: projectInput.technologies.split(',').map(t => t.trim()).filter(t => t) 
        }] 
      });
      setProjectInput({ title: '', description: '', link: '', technologies: '' });
    }
  };

  const addCert = () => {
    if (certInput.name && certInput.issuer) {
      setFormData({ ...formData, certifications: [...formData.certifications, certInput] });
      setCertInput({ name: '', issuer: '', date: '', link: '' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      ...formData,
      createdAt: new Date().toISOString()
    };

    try {
      await userService.saveProfile(profile);
      setProfile(profile);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Step {step} of 6</span>
            {initialProfile && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline text-left mt-1"
              >
                Cancel Editing
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= step ? 'bg-[#141414]' : 'bg-[#141414]/10'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Your Experience</h2>
              <p className="text-[#141414]/60">Tell us about your professional background.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Current Role</label>
                <input 
                  type="text" 
                  value={formData.currentRole}
                  onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Years of Experience</label>
                <input 
                  type="number" 
                  value={formData.yearsOfExperience}
                  onChange={e => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Past Roles</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={pastRoleInput}
                    onChange={e => setPastRoleInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addPastRole()}
                    placeholder="e.g. Web Developer, Intern"
                    className="flex-1 p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                  />
                  <button 
                    onClick={addPastRole}
                    className="p-4 bg-[#141414] text-white rounded-2xl hover:scale-105 transition-transform active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.pastRoles.map((role, i) => (
                    <span key={`${role}-${i}`} className="px-3 py-1 bg-[#141414]/5 border border-[#141414]/10 rounded-full text-sm font-medium flex items-center gap-2">
                      {role}
                      <button onClick={() => setFormData({ ...formData, pastRoles: formData.pastRoles.filter(r => r !== role) })} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.currentRole}
              className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95 disabled:opacity-50"
            >
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Skills & Knowledge</h2>
              <p className="text-[#141414]/60">What are you an expert in?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Skills & Proficiency</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      placeholder="e.g. React, Python"
                      className="flex-1 p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                    />
                    <select 
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value as any)}
                      className="p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button 
                      onClick={addSkill}
                      className="p-4 bg-[#141414] text-white rounded-2xl hover:scale-105 transition-transform active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills.map((skill, i) => (
                    <span key={`${skill.name}-${i}`} className="px-3 py-1 bg-[#141414]/5 border border-[#141414]/10 rounded-full text-sm font-medium flex items-center gap-2">
                      {skill.name} ({skill.level})
                      <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s.name !== skill.name) })} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Domain Knowledge</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={knowledgeInput}
                    onChange={e => setKnowledgeInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addKnowledge()}
                    placeholder="e.g. Cloud Computing, FinTech"
                    className="flex-1 p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                  />
                  <button 
                    onClick={addKnowledge}
                    className="p-4 bg-[#141414] text-white rounded-2xl hover:scale-105 transition-transform active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.knowledge.map((k, i) => (
                    <span key={`${k}-${i}`} className="px-3 py-1 bg-[#141414]/5 border border-[#141414]/10 rounded-full text-sm font-medium flex items-center gap-2">
                      {k}
                      <button onClick={() => setFormData({ ...formData, knowledge: formData.knowledge.filter(item => item !== k) })} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold hover:bg-[#141414]/5 transition-all">Back</button>
              <button 
                onClick={nextStep}
                disabled={formData.skills.length === 0}
                className="flex-[2] py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95 disabled:opacity-50"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Achievements & Interests</h2>
              <p className="text-[#141414]/60">What are you proud of and what do you love?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Key Achievements</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={achievementInput}
                    onChange={e => setAchievementInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addAchievement()}
                    placeholder="e.g. Led a team of 5, Reduced costs by 20%"
                    className="flex-1 p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                  />
                  <button 
                    onClick={addAchievement}
                    className="p-4 bg-[#141414] text-white rounded-2xl hover:scale-105 transition-transform active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.achievements.map((a, i) => (
                    <span key={`${a}-${i}`} className="px-3 py-1 bg-[#141414]/5 border border-[#141414]/10 rounded-full text-sm font-medium flex items-center gap-2">
                      {a}
                      <button onClick={() => setFormData({ ...formData, achievements: formData.achievements.filter(item => item !== a) })} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Interests</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={interestInput}
                    onChange={e => setInterestInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addInterest()}
                    placeholder="Add an interest (e.g. AI, Sustainability)"
                    className="flex-1 p-4 bg-white border-2 border-[#141414]/10 rounded-2xl outline-none focus:border-[#141414] transition-all"
                  />
                  <button 
                    onClick={addInterest}
                    className="p-4 bg-[#141414] text-white rounded-2xl hover:scale-105 transition-transform active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.interests.map((interest, i) => (
                    <span key={`${interest}-${i}`} className="px-3 py-1 bg-[#141414]/5 border border-[#141414]/10 rounded-full text-sm font-medium flex items-center gap-2">
                      {interest}
                      <button onClick={() => setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) })} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold hover:bg-[#141414]/5 transition-all">Back</button>
              <button 
                onClick={nextStep}
                className="flex-[2] py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Projects & Certifications</h2>
              <p className="text-[#141414]/60">Showcase your practical work and formal credentials.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Featured Projects</label>
                <div className="p-4 bg-[#141414]/5 rounded-2xl space-y-3">
                  <input 
                    type="text" 
                    placeholder="Project Title"
                    value={projectInput.title}
                    onChange={e => setProjectInput({ ...projectInput, title: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                  />
                  <textarea 
                    placeholder="Brief description of what you built"
                    value={projectInput.description}
                    onChange={e => setProjectInput({ ...projectInput, description: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm h-20"
                  />
                  <input 
                    type="text" 
                    placeholder="Technologies used (comma separated)"
                    value={projectInput.technologies}
                    onChange={e => setProjectInput({ ...projectInput, technologies: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Project Link (optional)"
                    value={projectInput.link}
                    onChange={e => setProjectInput({ ...projectInput, link: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                  />
                  <button 
                    onClick={addProject}
                    className="w-full py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
                  >
                    Add Project
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.projects.map((p, i) => (
                    <div key={i} className="p-3 border border-[#141414]/10 rounded-xl flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <p className="text-xs text-[#141414]/60 line-clamp-1">{p.description}</p>
                      </div>
                      <button onClick={() => setFormData({ ...formData, projects: formData.projects.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Certifications</label>
                <div className="p-4 bg-[#141414]/5 rounded-2xl space-y-3">
                  <input 
                    type="text" 
                    placeholder="Certification Name"
                    value={certInput.name}
                    onChange={e => setCertInput({ ...certInput, name: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Issuing Organization"
                    value={certInput.issuer}
                    onChange={e => setCertInput({ ...certInput, issuer: e.target.value })}
                    className="w-full p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Date (e.g. Jan 2024)"
                      value={certInput.date}
                      onChange={e => setCertInput({ ...certInput, date: e.target.value })}
                      className="flex-1 p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Credential Link (optional)"
                      value={certInput.link}
                      onChange={e => setCertInput({ ...certInput, link: e.target.value })}
                      className="flex-1 p-3 bg-white border border-[#141414]/10 rounded-xl outline-none focus:border-[#141414] transition-all text-sm"
                    />
                  </div>
                  <button 
                    onClick={addCert}
                    className="w-full py-3 bg-[#141414] text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
                  >
                    Add Certification
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.certifications.map((c, i) => (
                    <div key={i} className="p-3 border border-[#141414]/10 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm">{c.name}</h4>
                        <p className="text-xs text-[#141414]/60">{c.issuer} • {c.date}</p>
                      </div>
                      <button onClick={() => setFormData({ ...formData, certifications: formData.certifications.filter((_, idx) => idx !== i) })} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold hover:bg-[#141414]/5 transition-all">Back</button>
              <button 
                onClick={nextStep}
                className="flex-[2] py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Work Style & Preferences</h2>
              <p className="text-[#141414]/60">How do you prefer to work?</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Remote Preference</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['remote', 'hybrid', 'onsite', 'any'].map(pref => (
                    <button
                      key={pref}
                      onClick={() => setFormData({ ...formData, remotePreference: pref as any })}
                      className={`p-3 rounded-xl text-sm font-bold capitalize transition-all border-2 ${formData.remotePreference === pref ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]/30'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { key: 'structure', label: 'Structure', left: 'Chaos/Flexible', right: 'Highly Structured' },
                { key: 'collaboration', label: 'Collaboration', left: 'Solo Work', right: 'Team Oriented' },
                { key: 'risk', label: 'Risk Appetite', left: 'Safe/Stable', right: 'High Risk/Reward' },
                { key: 'pace', label: 'Pace', left: 'Slow/Deliberate', right: 'Fast/Urgent' }
              ].map(item => (
                <div key={item.key} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold uppercase tracking-widest text-[#141414]">{item.label}</label>
                    <span className="text-xs font-mono bg-[#141414] text-white px-2 py-0.5 rounded">{(formData.workStyle as any)[item.key]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={(formData.workStyle as any)[item.key]}
                    onChange={e => setFormData({ 
                      ...formData, 
                      workStyle: { ...formData.workStyle, [item.key]: parseInt(e.target.value) } 
                    })}
                    className="w-full h-2 bg-[#141414]/10 rounded-lg appearance-none cursor-pointer accent-[#141414]"
                  />
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                    <span>{item.left}</span>
                    <span>{item.right}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold hover:bg-[#141414]/5 transition-all">Back</button>
              <button 
                onClick={nextStep}
                className="flex-[2] py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-[#141414] rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Ready to build?</h2>
              <p className="text-[#141414]/60">We have everything we need to generate your career architecture.</p>
            </div>

            <div className="p-6 bg-white border-2 border-[#141414]/5 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <span>Detailed Experience Logged</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <span>Skills & Knowledge Mapped</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <span>Work Style Analyzed</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold hover:bg-[#141414]/5 transition-all">Back</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {initialProfile ? 'Update Profile' : 'Generate My Path'}
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
