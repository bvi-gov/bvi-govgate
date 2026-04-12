'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Table2,
  Settings,
  Trash2,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

export function AdminImport() {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'import'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dbFields = [
    { key: 'applicantName', label: 'Applicant Name' },
    { key: 'applicantEmail', label: 'Email' },
    { key: 'applicantPhone', label: 'Phone' },
    { key: 'surname', label: 'Surname (Police Cert)' },
    { key: 'givenNames', label: 'Given Names (Police Cert)' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'address', label: 'Address' },
    { key: 'passportNumber', label: 'Passport Number' },
    { key: 'occupation', label: 'Occupation' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    if (uploadedFile.name.endsWith('.csv') || uploadedFile.type === 'text/csv') {
      parseCSV(uploadedFile);
    } else if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
      toast.error('Excel files (.xlsx) are not yet supported. Please use CSV format.');
    } else {
      toast.error('Unsupported file format. Please upload a CSV file.');
    }
  };

  const parseCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error(`Parse errors: ${results.errors.length} errors found`);
        }
        const data = results.data as CSVRow[];
        const cols = results.meta.fields || [];
        setRawData(data);
        setHeaders(cols);
        setStep('preview');
        toast.success(`Parsed ${data.length} records with ${cols.length} columns`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const autoMap = useCallback(() => {
    const autoMapping: ColumnMapping[] = [];
    const fieldKeywords: Record<string, string[]> = {
      applicantName: ['name', 'full name', 'applicant', 'nombre'],
      applicantEmail: ['email', 'correo', 'e-mail', 'mail'],
      applicantPhone: ['phone', 'telefono', 'tel', 'mobile', 'cell'],
      surname: ['surname', 'apellido', 'last name', 'family name'],
      givenNames: ['given', 'first name', 'nombre', 'forename'],
      dateOfBirth: ['birth', 'dob', 'nacimiento', 'fecha nac'],
      nationality: ['nationality', 'nacionalidad', 'citizen'],
      address: ['address', 'direccion', 'residence', 'calle'],
      passportNumber: ['passport', 'pasaporte', 'passport no'],
      occupation: ['occupation', 'ocupacion', 'job', 'employment', 'trabajo'],
    };

    for (const col of headers) {
      const colLower = col.toLowerCase().trim();
      let matched = false;

      for (const [field, keywords] of Object.entries(fieldKeywords)) {
        if (keywords.some(kw => colLower.includes(kw) || kw.includes(colLower))) {
          autoMapping.push({ csvColumn: col, dbField: field });
          matched = true;
          break;
        }
      }

      if (!matched) {
        autoMapping.push({ csvColumn: col, dbField: '_skip' });
      }
    }

    setMapping(autoMapping);
  }, [headers]);

  const handleStartMapping = () => {
    autoMap();
    setStep('mapping');
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setMapping(prev =>
      prev.map(m => m.csvColumn === csvColumn ? { ...m, dbField } : m)
    );
  };

  const handleImport = async () => {
    setImporting(true);
    setStep('import');

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const mappedData: Record<string, string> = {};

      for (const m of mapping) {
        if (m.dbField !== '_skip' && row[m.csvColumn]) {
          mappedData[m.dbField] = row[m.csvColumn].trim();
        }
      }

      try {
        const res = await fetch('/api/import/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceSlug: 'police-certificate',
            data: mappedData,
          }),
        });

        if (res.ok) {
          success++;
        } else {
          const data = await res.json();
          errors.push(`Row ${i + 1}: ${data.error || 'Failed'}`);
          failed++;
        }
      } catch {
        errors.push(`Row ${i + 1}: Network error`);
        failed++;
      }
    }

    setImportResults({ success, failed, errors });
    setImporting(false);
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMapping([]);
    setImportResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#009B3A]/10 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-[#009B3A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bulk Data Import</h1>
            <p className="text-sm text-gray-400">Import records from CSV/Excel files into the system</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'upload', label: 'Upload', icon: Upload },
          { key: 'preview', label: 'Preview', icon: Table2 },
          { key: 'mapping', label: 'Map Fields', icon: Settings },
          { key: 'import', label: 'Import', icon: Database },
        ].map((s, idx) => {
          const stepOrder = ['upload', 'preview', 'mapping', 'import'];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = idx;
          const isActive = thisIdx === currentIdx;
          const isDone = thisIdx < currentIdx;

          return (
            <React.Fragment key={s.key}>
              {idx > 0 && (
                <div className={`flex-1 h-0.5 ${isDone ? 'bg-[#009B3A]' : 'bg-[#1E3A5F]'}`} />
              )}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'bg-[#009B3A] text-white' : isDone ? 'text-[#009B3A]' : 'text-gray-500'
              }`}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <label className="flex flex-col items-center justify-center p-12 bg-[#131F2E] border-2 border-dashed border-[#1E3A5F] rounded-xl hover:border-[#009B3A]/50 transition-all cursor-pointer group">
            <FileSpreadsheet className="w-16 h-16 text-gray-500 group-hover:text-[#009B3A] transition-colors mb-4" />
            <p className="text-white font-medium text-lg mb-1">Upload CSV File</p>
            <p className="text-sm text-gray-400 mb-4">Drop your CSV file here or click to browse</p>
            <Badge variant="outline" className="text-gray-400 border-[#1E3A5F]">.csv files supported</Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="mt-6 bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">CSV Format Requirements</h3>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>First row must contain column headers</li>
              <li>Use comma (,) as delimiter</li>
              <li>Recommended columns: name, email, phone, dob, nationality, address</li>
              <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                File: <span className="text-white">{file?.name}</span> ({rawData.length} records, {headers.length} columns)
              </p>
            </div>
            <Button variant="ghost" onClick={handleReset} className="text-gray-400 text-xs">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Start Over
            </Button>
          </div>

          {/* Data Preview Table */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E3A5F]">
                    <th className="text-left text-[10px] text-gray-500 font-medium p-3 w-10">#</th>
                    {headers.map(h => (
                      <th key={h} className="text-left text-[10px] text-gray-500 font-medium p-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-[#1E3A5F]/50 hover:bg-white/[0.02]">
                      <td className="text-xs text-gray-500 p-3">{idx + 1}</td>
                      {headers.map(h => (
                        <td key={h} className="text-xs text-gray-300 p-3 max-w-[200px] truncate">
                          {row[h] || <span className="text-gray-600">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rawData.length > 10 && (
              <p className="text-xs text-gray-500 p-3 text-center">
                Showing first 10 of {rawData.length} records
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleStartMapping} className="bg-[#009B3A] text-white hover:bg-[#007A2E]">
              Continue to Field Mapping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Mapping */}
      {step === 'mapping' && (
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm text-gray-400">
            Map your CSV columns to database fields. Columns marked &quot;Skip&quot; will be ignored.
          </p>

          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_40px_1fr] text-[10px] text-gray-500 font-medium p-3 border-b border-[#1E3A5F]">
              <span>CSV Column</span>
              <span></span>
              <span>Database Field</span>
            </div>
            {mapping.map((m) => (
              <div key={m.csvColumn} className="grid grid-cols-[1fr_40px_1fr] items-center p-3 border-b border-[#1E3A5F]/50">
                <span className="text-sm text-white font-medium truncate">{m.csvColumn}</span>
                <ArrowRight className="w-4 h-4 text-gray-600 mx-auto" />
                <select
                  value={m.dbField}
                  onChange={(e) => updateMapping(m.csvColumn, e.target.value)}
                  className="bg-[#0C1B2A] border border-[#1E3A5F] text-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#009B3A]"
                >
                  <option value="_skip">-- Skip --</option>
                  {dbFields.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('preview')} className="text-gray-400">
              Back
            </Button>
            <Button onClick={handleImport} className="bg-[#FFD100] text-[#0C1B2A] hover:bg-[#E6BC00] font-semibold">
              Import {rawData.length} Records
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Import Results */}
      {step === 'import' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {importing ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-[#009B3A] animate-spin mx-auto mb-4" />
              <p className="text-lg text-white font-medium">Importing records...</p>
              <p className="text-sm text-gray-400">Please wait while records are being processed</p>
            </div>
          ) : importResults ? (
            <div className="space-y-4">
              <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#009B3A] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Import Complete!</h2>
                <div className="flex justify-center gap-8 mt-4">
                  <div>
                    <div className="text-3xl font-bold text-emerald-400">{importResults.success}</div>
                    <div className="text-xs text-gray-400">Successful</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400">{importResults.failed}</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{rawData.length}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({importResults.errors.length})
                  </h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {importResults.errors.slice(0, 20).map((err, idx) => (
                      <p key={idx} className="text-xs text-red-400/70">{err}</p>
                    ))}
                    {importResults.errors.length > 20 && (
                      <p className="text-xs text-gray-500">...and {importResults.errors.length - 20} more</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={handleReset} className="bg-[#009B3A] text-white hover:bg-[#007A2E]">
                  Import Another File
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
