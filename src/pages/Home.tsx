import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { ArrowRight, CheckCircle2, Globe, Zap, Target, BarChart3, FileText, MessageSquare, LayoutDashboard } from 'lucide-react';

interface HomeProps {
  user: User | null;
  profile: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ user, profile }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414]/5 border border-[#141414]/10 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 text-yellow-500" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-[0.9] tracking-tight">
              Don't just find a job. <br />
              <span className="text-[#141414]/40">Architect a career.</span>
            </h1>
            <p className="text-xl text-[#141414]/60 max-w-lg leading-relaxed">
              Pathfinder uses advanced AI to analyze your skills, temperament, and market trends to build your personalized roadmap to success.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to={user ? (profile ? "/dashboard" : "/onboarding") : "/login"}
                className="px-8 py-4 bg-[#141414] text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-xl"
              >
                {user ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 border border-[#141414]/20 rounded-full font-bold hover:bg-[#141414]/5 transition-colors">
                How it works
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-[#141414] rounded-3xl overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                alt="Collaboration" 
                className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Career Match</p>
                    <p className="text-lg font-bold">Senior Product Designer</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-white"
                  ></motion.div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-[#141414]/5 hidden md:block">
              <BarChart3 className="w-8 h-8 text-[#141414]" />
              <p className="text-[10px] font-bold uppercase mt-2">Market Growth</p>
              <p className="text-xl font-bold text-emerald-600">+24%</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to level up.</h2>
          <p className="text-[#141414]/60">We've combined personality science with market data and AI to give you an unfair advantage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="w-6 h-6" />,
              title: "Skill Gap Analysis",
              desc: "Identify exactly what's missing from your toolkit for your dream role."
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: "Market Insights",
              desc: "Real-world salary data and industry growth trends at your fingertips."
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: "Resume Tailoring",
              desc: "AI-driven keyword optimization to beat the ATS systems."
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              title: "Interview Prep",
              desc: "Practice with a role-specific AI bot that gives instant feedback."
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Learning Roadmaps",
              desc: "Step-by-step guides with curated resources to bridge your gaps."
            },
            {
              icon: <LayoutDashboard className="w-6 h-6" />,
              title: "Work Style Quiz",
              desc: "Match your temperament to the right environment, not just the role."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-[#141414] rounded-2xl flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-[#141414]/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#141414] rounded-[3rem] p-12 md:p-24 text-center text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold tracking-tight">Ready to build your future?</h2>
          <p className="text-white/60 text-lg">Join thousands of professionals who have found their path with Pathfinder AI.</p>
          <Link 
            to="/login"
            className="inline-flex px-10 py-5 bg-white text-[#141414] rounded-full font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-2xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
