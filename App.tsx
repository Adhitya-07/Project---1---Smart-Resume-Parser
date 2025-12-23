
import React, { useState, useCallback } from 'react';
import { ParsedResume, ProjectReportData } from './types';
import { parseResume, generateProjectReport } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResumeDetail from './components/ResumeDetail';
import ProjectReport from './components/ProjectReport';

const App: React.FC = () => {
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ParsedResume | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectReportData | null>(null);

  const handleFilesSelected = useCallback(async (files: { data: string; type: string; name: string }[]) => {
    setIsLoading(true);
    
    for (const file of files) {
      const tempId = Math.random().toString(36).substring(7);
      
      try {
        const result = await parseResume(file.data, file.type);
        
        const newResume: ParsedResume = {
          id: tempId,
          fileName: file.name,
          status: 'completed',
          ...result
        };
        
        setResumes(prev => [newResume, ...prev]);
      } catch (error) {
        console.error("Error parsing resume:", error);
        alert(`Failed to parse ${file.name}. Ensure it's a clear PDF or image.`);
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateProjectReport();
      setProjectReport(report);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate project report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const removeResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const exportAllToCSV = () => {
    if (resumes.length === 0) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Skills'];
    const rows = resumes.map(r => [
      `"${r.contactInfo.fullName}"`,
      `"${r.contactInfo.email}"`,
      `"${r.contactInfo.phone}"`,
      `"${r.contactInfo.location}"`,
      `"${r.skills.join('; ')}"`
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "parsed_resumes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-glow">Smart Resume Parser</h1>
          </div>
          <p className="text-slate-600 max-w-xl">
            Streamline your hiring workflow. Convert messy resumes into structured data instantly using advanced AI.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className={`flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all border border-slate-200 shadow-sm ${isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Project Report (PDF)</span>
              </>
            )}
          </button>

          {resumes.length > 0 && (
            <button 
              onClick={exportAllToCSV}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-12">
        <FileUpload onFilesSelected={handleFilesSelected} isLoading={isLoading} />

        {/* Results List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>Processed Resumes</span>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-sm">{resumes.length}</span>
            </h2>
          </div>

          {resumes.length === 0 && !isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium italic">No resumes uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div 
                  key={resume.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                        {resume.contactInfo.fullName.charAt(0)}
                      </div>
                      <button 
                        onClick={() => removeResume(resume.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{resume.contactInfo.fullName}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">{resume.contactInfo.email}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {resume.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                          {skill}
                        </span>
                      ))}
                      {resume.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs font-medium rounded">
                          +{resume.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => setSelectedResume(resume)}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono truncate">
                    FILE: {resume.fileName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedResume && (
        <ResumeDetail 
          resume={selectedResume} 
          onClose={() => setSelectedResume(null)} 
        />
      )}

      {projectReport && (
        <ProjectReport 
          report={projectReport} 
          onClose={() => setProjectReport(null)} 
        />
      )}

      {/* Background Decor */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-blue-50/50 rounded-bl-full filter blur-3xl opacity-50" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/3 bg-slate-100/50 rounded-tr-full filter blur-3xl opacity-50" />
    </div>
  );
};

export default App;
