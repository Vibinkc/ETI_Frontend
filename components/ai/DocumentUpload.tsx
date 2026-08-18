"use client";

import { useState } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle, Globe, Link as LinkIcon, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";


export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  const [showSensitivityWarning, setShowSensitivityWarning] = useState(false);
  const [sensitivityWarnings, setSensitivityWarnings] = useState<string[]>([]);
  const [sensitivityFile, setSensitivityFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
      setMessage("");
      setShowSensitivityWarning(false);
      setSensitivityWarnings([]);
    }
  };

  const handleUpload = async (force: boolean = false) => {
    const fileToUpload = force ? sensitivityFile : file;

    if (!fileToUpload) {
      setMessage("Please select a file");
      setUploadStatus("error");
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setMessage("");
    // Don't clear warning if we are forcing, but normally we might
    if (!force) setShowSensitivityWarning(false);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Append force param if true
      const url = `${API_ENDPOINTS.documents.upload}${force ? '?force=true' : ''}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        setUploadStatus("success");
        setMessage(`Document "${fileToUpload.name}" uploaded and processed successfully!`);
        setFile(null);
        setSensitivityFile(null);
        setShowSensitivityWarning(false);
        setSensitivityWarnings([]);
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorData = await res.json();
        console.log("Upload error response:", errorData); // Debugging

        // Check for sensitive data warning
        let detail = errorData.detail;

        // Try to parse if string (handles potential stringified JSON or Python dict string)
        if (typeof detail === 'string') {
          try {
            // Formatting hack: Python dicts use single quotes, JSON uses double. 
            // This is a best-effort to parse if it looks like a dict string.
            if (detail.includes("'code': 'SENSITIVE_DATA_DETECTED'")) {
              detail = JSON.parse(detail.replace(/'/g, '"'));
            } else {
              detail = JSON.parse(detail);
            }
          } catch (e) {
            // If parsing fails, just keep as string
          }
        }

        const isSensitiveData = detail && (detail.code === "SENSITIVE_DATA_DETECTED" || (typeof detail === 'string' && detail.includes("SENSITIVE_DATA_DETECTED")));

        if (res.status === 400 && isSensitiveData) {
          // Use warnings from detail if available
          const warnings = detail.warnings || [];
          if (warnings.length === 0 && typeof detail === 'string') {
            // Extract warnings from string if parsing failed but we detected the code
            const match = detail.match(/warnings': \[(.*?)\]/);
            if (match && match[1]) {
              // Very rough extraction
              setSensitivityWarnings([match[1]]);
            }
          } else {
            setSensitivityWarnings(warnings);
          }

          setSensitivityFile(fileToUpload);
          setShowSensitivityWarning(true);
          setUploadStatus(null);
        } else {
          setUploadStatus("error");
          // Improve message extraction
          let paramsMsg = "Failed to upload document";
          if (typeof detail === 'string') {
            paramsMsg = detail;
          } else if (detail?.message) {
            paramsMsg = detail.message;
          }
          setMessage(paramsMsg);
        }
      }
    } catch (err) {
      setUploadStatus("error");
      setMessage((err instanceof Error ? err.message : "") || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      setMessage("Please enter a website URL");
      setUploadStatus("error");
      return;
    }

    setScraping(true);
    setUploadStatus(null);
    setMessage("");

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(API_ENDPOINTS.documents.scrapeUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ url: url.trim() }),
      });

      if (res.ok) {
        setUploadStatus("success");
        setMessage(`Website content scraped and processed successfully!`);
        setUrl("");
      } else {
        const errorData = await res.json();
        setMessage(errorData.detail || "Failed to scrape website content");
        setUploadStatus("error");
      }
    } catch (err) {
      setUploadStatus("error");
      setMessage((err instanceof Error ? err.message : "") || "Failed to scrape website content");
    } finally {
      setScraping(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };


  return (
    <div className="eti-card p-6 h-full flex flex-col overflow-hidden relative max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Documents for AI Training</h2>

      {/* Upload Section */}
      <div className="mb-8 flex-1 overflow-y-auto space-y-6">
        {/* File Upload Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--eti-ink-muted)]">Upload File</h3>
          <div className="border-2 border-dashed border-[var(--eti-border-strong)] rounded-[12px] p-8 text-center min-h-[200px] flex items-center justify-center">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--eti-ink-subtle)]" />
              <p className="text-[var(--eti-ink-muted)] mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-[var(--eti-ink-subtle)]">
                PDF, Word, Excel, PowerPoint, or Text files
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-[var(--eti-ink-muted)]" />
                <div>
                  <p className="font-medium text-[var(--eti-ink)]">{file.name}</p>
                  <p className="text-sm text-[var(--eti-ink-subtle)]">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setUploadStatus(null);
                  setMessage("");
                  setShowSensitivityWarning(false);
                }}
                className="text-[var(--eti-ink-subtle)] hover:text-[var(--eti-ink-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            onClick={() => handleUpload(false)}
            disabled={!file || uploading}
            className="eti-btn eti-btn-primary mt-4 w-full"
          >
            {uploading ? "Uploading and Processing..." : "Upload Document"}
          </button>
        </div>

        {/* Scrape Website Section */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3 text-[var(--eti-ink-muted)]">Scrape Website</h3>
          <p className="text-sm text-[var(--eti-ink-subtle)] mb-4">
            Enter a URL to scrape text content (e.g., product pages, documentation, blogs)
          </p>
          <div className="relative w-full" style={{ minWidth: '0' }}>
            <Globe
              className="text-[var(--eti-ink-subtle)]"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                paddingLeft: '44px',
                width: '100%',
                display: 'block'
              }}
              className="pr-4 py-3 bg-white border border-[var(--eti-border-strong)] rounded-[10px] outline-none shadow-sm"
            />
          </div>
          <button
            onClick={handleScrapeUrl}
            disabled={!url || scraping}
            className="mt-4 w-full px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {scraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scraping and Processing...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                Scrape Website
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${uploadStatus === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
              }`}
          >
            {uploadStatus === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message}</p>
          </div>
        )}
      </div>

      {/* Sensitive Data Warning Modal Overlay */}
      {showSensitivityWarning && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border-l-4 border-red-500 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-[var(--eti-critical)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--eti-ink)]">Critical Information Detected</h3>
                <p className="text-sm text-[var(--eti-ink-muted)] mt-1">
                  The document contains sensitive information (PII/Secrets).
                  <strong>Please remove the detected lines from the document to prevent data leaks.</strong>
                  <br />
                  If you are sure this is safe, you can proceed to upload.
                </p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-6 max-h-[200px] overflow-y-auto border border-red-100">
              <ul className="list-disc list-inside space-y-2">
                {sensitivityWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-red-800 font-medium font-mono text-xs leading-relaxed">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setFile(null);
                  setSensitivityFile(null);
                  setShowSensitivityWarning(false);
                  setSensitivityWarnings([]);
                }}
                className="eti-btn eti-btn-ghost"
              >
                Remove Document
              </button>
              <button
                onClick={() => handleUpload(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

