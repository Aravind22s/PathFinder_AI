import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { careerService } from '../services/careerService';
import { UserProfile } from '../types';
import { FileText, Sparkles, Send, Target, CheckCircle2, AlertCircle, Upload, FileUp, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResumeTailorProps {
  user: User;
  profile: UserProfile;
}

const ResumeTailor: React.FC<ResumeTailorProps> = ({ user, profile }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(file);
      } else {
        alert('Unsupported file type. Please upload a PDF or DOCX file.');
        return;
      }
      setResumeText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
      alert('Failed to extract text from file. Please try copy-pasting your resume.');
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  };

  const extractTextFromDOCX = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleAnalyze = async () => {
    if (!resumeText || !targetRole) return;
    setLoading(true);
    try {
      const result = await careerService.tailorResume(resumeText, targetRole);
      setFeedback(result);
    } catch (error) {
      console.error("Error tailoring resume:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414]/5 border border-[#141414]/10 text-xs font-bold uppercase tracking-widest">
          <FileText className="w-3 h-3" />
          ATS Optimization
        </div>
        <h1 className="text-5xl font-bold tracking-tight">AI Resume Tailor</h1>
        <p className="text-[#141414]/60 max-w-xl mx-auto">Paste your resume and target role to get specific keyword suggestions and bullet point improvements.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60 ml-1">Target Role</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#141414]/40" />
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full pl-12 pr-4 py-4 bg-[#141414]/5 border-2 border-transparent focus:border-[#141414] rounded-2xl outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60">Resume Text</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={extracting}
                    className="px-3 py-1.5 bg-[#141414] text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#141414]/80 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                  >
                    {extracting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload PDF/DOCX
                  </button>
                  {resumeText && (
                    <button 
                      onClick={() => setResumeText('')}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <textarea 
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your current resume text here or upload a file..."
                className="w-full h-96 p-6 bg-[#141414]/5 border-2 border-transparent focus:border-[#141414] rounded-3xl outline-none transition-all text-sm resize-none font-mono"
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading || !resumeText || !targetRole}
              className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Analyze & Optimize
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {feedback ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-xl space-y-6 h-full"
            >
              <div className="flex items-center justify-between border-b border-[#141414]/5 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  AI Recommendations
                </h3>
              </div>
              <div className="prose prose-sm max-w-none text-[#141414]/80 prose-headings:text-[#141414] prose-strong:text-[#141414]">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#141414]/5 rounded-[2.5rem] p-12 border-2 border-dashed border-[#141414]/10 flex flex-col items-center justify-center text-center space-y-6 h-full">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <AlertCircle className="w-8 h-8 text-[#141414]/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#141414]/40">No analysis yet</h3>
                <p className="text-[#141414]/30 text-sm max-w-xs">Fill in your target role and resume text to see AI-powered suggestions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTailor;
