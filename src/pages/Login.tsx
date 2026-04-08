import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { Briefcase, Chrome } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle();
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-[#141414]/5"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Pathfinder</h1>
          <p className="text-[#141414]/60 text-sm">Sign in to start architecting your career path.</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-[#141414] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-[#141414]/40 italic">
            Google authentication is the only supported login method for this preview.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#141414]/40">
          By continuing, you agree to Pathfinder's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
