import React, { useState, useEffect, useRef } from "react";
import { TrackedKeyword } from "../types";
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Table,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  existingKeywords: string[];
  initialFile?: File | null;
  onImportMappedKeywords: (keywords: Partial<TrackedKeyword>[]) => void;
}

export interface ColumnMapping {
  keyword: string; // Header name mapped to keyword name
  currentRank: string; // Header name mapped to rank
  popularity: string; // Header name mapped to popularity
  difficulty: string; // Header name mapped to difficulty
  notes: string; // Header name mapped to notes
  tags: string; // Header name mapped to tags
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  appName,
  existingKeywords,
  initialFile = null,
  onImportMappedKeywords,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const [mapping, setMapping] = useState<ColumnMapping>({
    keyword: "",
    currentRank: "",
    popularity: "",
    difficulty: "",
    notes: "",
    tags: "",
  });

  // Sync initial file if passed
  useEffect(() => {
    if (initialFile) {
      handleParseFile(initialFile);
    }
  }, [initialFile]);

  if (!isOpen) return null;

  // Simple robust CSV parser handling quoted commas
  const parseCsvText = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if ((char === "," || char === "\t") && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);

    return { headers: rawHeaders, rows };
  };

  const handleParseFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const { headers, rows } = parseCsvText(content);
        setParsedHeaders(headers);
        setParsedRows(rows);

        // Smart Auto-Mapping
        const autoMap: ColumnMapping = {
          keyword: "",
          currentRank: "",
          popularity: "",
          difficulty: "",
          notes: "",
          tags: "",
        };

        headers.forEach((h) => {
          const lower = h.toLowerCase().trim();
          if (
            !autoMap.keyword &&
            (lower.includes("keyword") ||
              lower.includes("term") ||
              lower.includes("phrase") ||
              lower === "query" ||
              lower === "name")
          ) {
            autoMap.keyword = h;
          } else if (
            !autoMap.currentRank &&
            (lower.includes("rank") ||
              lower.includes("position") ||
              lower === "pos" ||
              lower.includes("app store rank"))
          ) {
            autoMap.currentRank = h;
          } else if (
            !autoMap.popularity &&
            (lower.includes("popular") ||
              lower.includes("volume") ||
              lower.includes("asa") ||
              lower.includes("score") ||
              lower === "search volume")
          ) {
            autoMap.popularity = h;
          } else if (
            !autoMap.difficulty &&
            (lower.includes("difficult") || lower.includes("competition") || lower === "diff")
          ) {
            autoMap.difficulty = h;
          } else if (!autoMap.notes && (lower.includes("note") || lower.includes("comment"))) {
            autoMap.notes = h;
          } else if (
            !autoMap.tags &&
            (lower.includes("tag") || lower.includes("label") || lower.includes("category"))
          ) {
            autoMap.tags = h;
          }
        });

        // Fallback: if no keyword match, pick first header
        if (!autoMap.keyword && headers.length > 0) {
          autoMap.keyword = headers[0];
        }

        setMapping(autoMap);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleParseFile(file);
    }
  };

  // Calculate Mapped Data Preview
  const keywordColIndex = parsedHeaders.indexOf(mapping.keyword);
  const rankColIndex = parsedHeaders.indexOf(mapping.currentRank);
  const popColIndex = parsedHeaders.indexOf(mapping.popularity);
  const diffColIndex = parsedHeaders.indexOf(mapping.difficulty);
  const notesColIndex = parsedHeaders.indexOf(mapping.notes);
  const tagsColIndex = parsedHeaders.indexOf(mapping.tags);

  const existingLowerSet = new Set(existingKeywords.map((k) => k.toLowerCase()));

  const mappedPreviewItems = parsedRows.map((row, idx) => {
    const kwRaw = keywordColIndex !== -1 ? row[keywordColIndex] || "" : `Keyword #${idx + 1}`;
    const kwClean = kwRaw.trim();

    const rankRaw = rankColIndex !== -1 ? parseInt(row[rankColIndex]) : NaN;
    const rankVal = !isNaN(rankRaw) && rankRaw > 0 ? rankRaw : null;

    const popRaw = popColIndex !== -1 ? parseInt(row[popColIndex]) : NaN;
    const popVal = !isNaN(popRaw) ? Math.min(100, Math.max(1, popRaw)) : Math.floor(Math.random() * 50) + 30;

    const diffRaw = diffColIndex !== -1 ? parseInt(row[diffColIndex]) : NaN;
    const diffVal = !isNaN(diffRaw) ? Math.min(100, Math.max(1, diffRaw)) : Math.floor(Math.random() * 40) + 20;

    const notesVal = notesColIndex !== -1 ? row[notesColIndex] : "";

    const tagsVal =
      tagsColIndex !== -1 && row[tagsColIndex]
        ? row[tagsColIndex].split(/[,;]/).map((t) => t.trim()).filter(Boolean)
        : ["Imported"];

    const isDuplicate = existingLowerSet.has(kwClean.toLowerCase());

    return {
      id: `import-${idx}-${Date.now()}`,
      keyword: kwClean,
      currentRank: rankVal,
      previousRank: rankVal ? rankVal + (Math.floor(Math.random() * 5) - 2) : null,
      popularity: popVal,
      difficulty: diffVal,
      estimatedInstalls: Math.floor((popVal * 10) / (rankVal || 10)),
      notes: notesVal,
      tags: tagsVal.length > 0 ? tagsVal : ["Imported"],
      isDuplicate,
      isValid: kwClean.length > 0,
    };
  });

  const validItemsToImport = mappedPreviewItems.filter(
    (item) => item.isValid && (!skipDuplicates || !item.isDuplicate)
  );

  const handleFinalizeImport = () => {
    if (validItemsToImport.length === 0) return;
    onImportMappedKeywords(validItemsToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Import & Map Keywords CSV</span>
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                  {appName}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Map your CSV spreadsheet headers to Astro's keyword structure before finalizing import
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* File Selector Zone if no file loaded */}
          {!selectedFile || parsedHeaders.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-950/50 hover:bg-zinc-900/80 rounded-2xl p-10 text-center transition-all cursor-pointer group space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.tsv,.txt"
                className="hidden"
              />
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Click to upload or drag and drop CSV file</p>
                <p className="text-xs text-zinc-400 mt-1">Supports .csv, .tsv or plain text keyword lists</p>
              </div>
            </div>
          ) : (
            <>
              {/* File Selected Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{selectedFile.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Detected <strong className="text-zinc-200">{parsedHeaders.length} columns</strong> and{" "}
                      <strong className="text-zinc-200">{parsedRows.length} keyword rows</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700 font-medium transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Change File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Column Mapping Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <span>Configure Column Mappings</span>
                  </h4>
                  <span className="text-[11px] text-indigo-400 font-medium flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Smart Auto-Mapped</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Mapping 1: Keyword Name (Required) */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Keyword Name *</span>
                      <span className="text-[10px] text-rose-400 font-normal">Required</span>
                    </label>
                    <select
                      value={mapping.keyword}
                      onChange={(e) => setMapping({ ...mapping, keyword: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapping 2: Current Rank */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>App Store Rank</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </label>
                    <select
                      value={mapping.currentRank}
                      onChange={(e) => setMapping({ ...mapping, currentRank: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map (Unranked) --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapping 3: Popularity */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Search Popularity / ASA</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </label>
                    <select
                      value={mapping.popularity}
                      onChange={(e) => setMapping({ ...mapping, popularity: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map (Auto-Score) --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapping 4: Difficulty */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>ASO Difficulty</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </label>
                    <select
                      value={mapping.difficulty}
                      onChange={(e) => setMapping({ ...mapping, difficulty: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map (Auto-Score) --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapping 5: Tags */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Tags / Categories</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </label>
                    <select
                      value={mapping.tags}
                      onChange={(e) => setMapping({ ...mapping, tags: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map (Default: "Imported") --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mapping 6: Notes */}
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Notes & Comments</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </label>
                    <select
                      value={mapping.notes}
                      onChange={(e) => setMapping({ ...mapping, notes: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Do Not Map --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <span>Mapped Data Preview (First 5 Rows)</span>
                  </h4>
                  <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Skip keywords already tracked in this app</span>
                  </label>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[11px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Keyword</th>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Popularity</th>
                        <th className="py-2.5 px-3">Difficulty</th>
                        <th className="py-2.5 px-3">Tags</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      {mappedPreviewItems.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className={item.isDuplicate ? "bg-amber-950/20 text-amber-200" : ""}>
                          <td className="py-2 px-3 font-sans font-bold text-white">{item.keyword || "—"}</td>
                          <td className="py-2 px-3">
                            {item.currentRank ? (
                              <span className="text-emerald-400 font-bold">#{item.currentRank}</span>
                            ) : (
                              <span className="text-zinc-500 font-sans">Unranked</span>
                            )}
                          </td>
                          <td className="py-2 px-3">{item.popularity} / 100</td>
                          <td className="py-2 px-3">{item.difficulty} / 100</td>
                          <td className="py-2 px-3 font-sans">
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((t, i) => (
                                <span key={i} className="bg-zinc-800 text-zinc-300 text-[9px] px-1.5 py-0.2 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-sans">
                            {item.isDuplicate ? (
                              <span className="text-[10px] text-amber-400 font-medium">
                                {skipDuplicates ? "Will Skip (Duplicate)" : "Will Import"}
                              </span>
                            ) : item.isValid ? (
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Ready</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-medium">Invalid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            {parsedRows.length > 0 && mapping.keyword ? (
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Ready to import <strong className="text-white font-bold">{validItemsToImport.length}</strong> keywords
                  out of {parsedRows.length} total rows.
                </span>
              </span>
            ) : (
              <span>Select a Keyword column mapping above to continue.</span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleFinalizeImport}
              disabled={validItemsToImport.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg ${
                validItemsToImport.length > 0
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
              }`}
            >
              <span>Finalize & Import ({validItemsToImport.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
