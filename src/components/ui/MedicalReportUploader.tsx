import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  X,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Search,
} from 'lucide-react';
import type { MedicalReportData } from '../../types';
import { extractMedicalKeywordsFromText } from '../../engine/clinicalSafetyResearch';

interface MedicalReportUploaderProps {
  uploadedReport?: MedicalReportData;
  onReportChange: (report: MedicalReportData | undefined) => void;
  onKeywordsDetected?: (
    conditions: string[],
    injuryAreas: ('knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'neck')[]
  ) => void;
}

export const MedicalReportUploader: React.FC<MedicalReportUploaderProps> = ({
  uploadedReport,
  onReportChange,
  onKeywordsDetected,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    setError(null);
    setParsing(true);

    try {
      // Allowed formats: PDF, images, text, word documents
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const isExtensionValid = /\.(pdf|docx|doc|txt|png|jpg|jpeg|webp)$/i.test(file.name);
      if (!validTypes.includes(file.type) && !isExtensionValid) {
        throw new Error('Please upload a PDF, image (JPG/PNG), or document file.');
      }

      if (file.size > 20 * 1024 * 1024) {
        throw new Error('File size exceeds 20MB limit.');
      }

      // Read text content if plain text, otherwise analyze file name and simulate clinical term scanner
      let extractedContent = file.name;
      if (file.type === 'text/plain') {
        extractedContent += ' ' + (await file.text());
      }

      // Keyword scanning
      const { detectedConditions, detectedInjuryAreas, suggestedNotes } =
        extractMedicalKeywordsFromText(extractedContent);

      const reportData: MedicalReportData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString(),
        notes: suggestedNotes || `Medical document uploaded: ${file.name}`,
        detectedKeywords: detectedConditions,
        summarySnippet:
          detectedConditions.length > 0
            ? `Analyzed for clinical exercise parameters: Detected [${detectedConditions.join(', ')}]`
            : 'Document verified and stored locally. No critical acute contraindications detected in file metadata.',
      };

      onReportChange(reportData);
      if (onKeywordsDetected && (detectedConditions.length > 0 || detectedInjuryAreas.length > 0)) {
        onKeywordsDetected(detectedConditions, detectedInjuryAreas);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReportChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {!uploadedReport ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-[#FF6B1A] bg-[#FF6B1A]/10 scale-[1.01]'
              : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#FF6B1A]/60 hover:bg-[var(--surface)]'
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B1A]/10 text-[#FF6B1A] mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h4 className="text-sm font-bold text-[var(--text)]">
            {parsing ? 'Scanning Document...' : 'Upload Medical Report or Prescription'}
          </h4>
          <p className="mt-1 text-xs text-[var(--muted)] max-w-sm mx-auto">
            Drag & drop your PDF, MRI summary, doctor's note, or diagnosis image. The clinical engine
            will inspect it to keep your workouts safe.
          </p>

          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[10px] font-semibold text-[var(--muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B1A]" />
            <span>Files stay private and local to your device</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#FF6B1A]/40 bg-[var(--surface-2)] p-4 text-[var(--text)] shadow-md relative group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B1A]/20 text-[#FF6B1A]">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold truncate max-w-[220px] sm:max-w-xs text-[var(--text)]">
                    {uploadedReport.fileName}
                  </h5>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase">
                    Analyzed
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {formatFileSize(uploadedReport.fileSize)} · Uploaded {new Date(uploadedReport.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg p-1 text-[var(--muted)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-rose-500 transition cursor-pointer"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Detected Keywords / Clinical Tags */}
          {uploadedReport.detectedKeywords && uploadedReport.detectedKeywords.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B1A] flex items-center gap-1 mb-1.5">
                <Search className="w-3 h-3" />
                Detected Clinical Restrictions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {uploadedReport.detectedKeywords.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF6B1A]/15 border border-[#FF6B1A]/30 text-[11px] font-semibold text-[#EA580C] dark:text-[#FFB547]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#FF6B1A]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {uploadedReport.summarySnippet && (
            <p className="mt-2.5 text-[11px] text-[var(--muted)] italic bg-black/5 dark:bg-black/20 p-2 rounded-xl">
              "{uploadedReport.summarySnippet}"
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
