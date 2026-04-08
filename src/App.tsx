import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { authService } from './services/authService';
import { userService } from './services/userService';
import { UserProfile } from './types';
import { LogOut, User as UserIcon, Briefcase, BookOpen, FileText, MessageSquare, LayoutDashboard } from 'lucide-react';

// Pages (to be implemented)
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CareerDetail from './pages/CareerDetail';
import ResumeTailor from './pages/ResumeTailor';
import InterviewPrep from './pages/InterviewPrep';

const Layout: React.FC<{ children: React.ReactNode, user: User | null, profile: UserProfile | null }> = ({ children, user, profile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      <nav className="border-b border-[#141414]/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Pathfinder AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {user && profile && (
                <>
                  <Link to="/dashboard" className="text-sm font-medium hover:text-[#141414]/60 transition-colors">Dashboard</Link>
                  <Link to="/resume-tailor" className="text-sm font-medium hover:text-[#141414]/60 transition-colors">Resume Tailor</Link>
                  <Link to="/interview-prep" className="text-sm font-medium hover:text-[#141414]/60 transition-colors">Interview Prep</Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-[#141414]/10" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#141414]/5 flex items-center justify-center border border-[#141414]/10">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-semibold hidden sm:block">{user.displayName || user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-[#141414]/5 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="px-4 py-2 bg-[#141414] text-white text-sm font-semibold rounded-full hover:bg-[#141414]/90 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-[#141414]/10 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#141414] rounded flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">Pathfinder AI</span>
              </div>
              <p className="text-sm text-[#141414]/60 max-w-xs">
                Architecting your future with AI-driven insights, skill gap analysis, and personalized learning roadmaps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-[#141414]/60">
                <li><Link to="/dashboard">Recommendations</Link></li>
                <li><Link to="/resume-tailor">Resume Analysis</Link></li>
                <li><Link to="/interview-prep">Interview Bot</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-[#141414]/60">
                <li><a href="#">About</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#141414]/5 text-center text-xs text-[#141414]/40">
            © {new Date().getFullYear()} Pathfinder AI. Built for the future of work.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await userService.getProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Pathfinder...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user} profile={profile}>
        <Routes>
          <Route path="/" element={<Home user={user} profile={profile} />} />
          <Route path="/login" element={user ? <Navigate to={profile ? "/dashboard" : "/onboarding"} /> : <Login />} />
          <Route 
            path="/onboarding" 
            element={user ? (profile ? <Navigate to="/dashboard" /> : <Onboarding user={user} setProfile={setProfile} />) : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/edit" 
            element={user && profile ? <Onboarding user={user} setProfile={setProfile} initialProfile={profile} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user && profile ? <Dashboard user={user} profile={profile} /> : <Navigate to={user ? "/onboarding" : "/login"} />} 
          />
          <Route 
            path="/career/:id" 
            element={user && profile ? <CareerDetail user={user} profile={profile} setProfile={setProfile} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/resume-tailor" 
            element={user && profile ? <ResumeTailor user={user} profile={profile} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/interview-prep" 
            element={user && profile ? <InterviewPrep user={user} profile={profile} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}
