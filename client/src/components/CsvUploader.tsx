import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileUp, X, Check, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBulkCreateTravelers } from "@/hooks/use-travelers";
import { InsertTraveler } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  autoMapColumns,
  validateBatch,
  errorCodeMessages,
  type CanonicalTraveler
} from "@shared/canonical";

interface CsvUploaderProps {
  groupId: string;
}

interface ValidationError {
  row: number;
  errors: Array<{ field: string; code: string; message: string }>;
  isSoftWarning?: boolean; // If true, allows import with warning
}

export function CsvUploader({ groupId }: CsvUploaderProps) {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<InsertTraveler[]>([]);
  // We separate critical errors (blockers) from date warnings (soft)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [defaultNationality, setDefaultNationality] = useState("SA");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreate = useBulkCreateTravelers();

  // Helper to clean file content (remove BOM, whitespace)
  const cleanContent = (text: string): string => {
    let cleaned = text;
    if (cleaned.charCodeAt(0) === 0xFEFF) {
      cleaned = cleaned.substring(1);
    }
    return cleaned.trim();
  };

  // === ESSENTIAL COMPLEXITY: Robust Data Transformation ===

  // Universal Date Transformer
  // Returns string if valid YYYY-MM-DD, or null if invalid/unknown.
  // CRITICAL: Does NOT return garbage strings.
  const transformDate = (value: any): string | null => {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;

    // 1. ISO Format (Already Valid)
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // 2. Excel Serial Numbers (e.g. 44927)
    // Excel base date: Dec 30, 1899. 
    // We check for purely numeric strings that look like serial dates (>20000 approx year 1954)
    if (/^\d+(\.\d+)?$/.test(str)) {
      const num = parseFloat(str);
      if (num > 20000 && num < 60000) {
        const date = new Date(Math.round((num - 25569) * 864e5));
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
      }
    }

    // 3. Text Month Formats (15-Jan-2023, Jan 15 2023)
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const textDate = str.match(/^(\d{1,2})[\s-]([a-zA-Z]{3})[\s-](\d{4})$/);
    if (textDate) {
      const d = textDate[1].padStart(2, '0');
      const mStr = textDate[2].toLowerCase();
      const y = textDate[3];
      if (monthMap[mStr]) return `${y}-${monthMap[mStr]}-${d}`;
    }

    // 4. Numeric formats (DD/MM/YYYY or DD-MM-YYYY)
    // Prioritize DD/MM for international consistency
    const parts = str.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const p1 = parseInt(parts[0]);
      const p2 = parseInt(parts[1]);
      const p3 = parseInt(parts[2]);

      let y = p3, m = p2, d = p1;
      // Handle YYYY/MM/DD
      if (p1 > 1000) { y = p1; m = p2; d = p3; }

      const ys = y.toString();
      const ms = m.toString().padStart(2, '0');
      const ds = d.toString().padStart(2, '0');

      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${ys}-${ms}-${ds}`;
      }
    }

    return null; // Return NULL if parsing fails, ensuring optional fields don't cause validation errors
  };

  const processParsedData = (rows: Record<string, string>[], headers: string[]) => {
    console.log("Processing Data", { rows: rows.length, headers });

    if (rows.length === 0) {
      setParseError("The file appears to be empty.");
      return;
    }

    // 1. Map Columns
    const columnMap = autoMapColumns(headers, rows.slice(0, 5));
    console.log("Final Column Map:", columnMap);

    // 2. Normalize Rows
    const normalizedRows = rows.map((row, idx) => {
      const newRow: Record<string, any> = {};

      Object.entries(columnMap).forEach(([header, field]) => {
        if (row[header]) newRow[field] = row[header];
      });

      // Handle "Combined" Columns Helper (Check-in - Check-out)
      // Specifically search for dashes or 'to'
      if (!newRow.arrivalDate || !newRow.departureDate) {
        const combinedHeader = headers.find(h =>
          h.toLowerCase().includes('check') &&
          (h.includes('-') || h.toLowerCase().includes(' to '))
        );

        if (combinedHeader && row[combinedHeader]) {
          const val = row[combinedHeader];
          // If it looks like "45265-45270" (Excel serial range)
          const parts = val.split(/ - |-| to /i).map(p => p.trim());

          if (parts.length === 2) {
            const d1 = transformDate(parts[0]);
            const d2 = transformDate(parts[1]);
            if (d1 && d2) {
              if (!newRow.arrivalDate) newRow.arrivalDate = d1;
              if (!newRow.departureDate) newRow.departureDate = d2;
            }
          }
        }
      }

      // Transform Values using Robust Transformer
      // If transformDate returns null for OPTIONAL fields (arrival, departure), validation will pass.
      // If transformDate returns null for REQUIRED fields (dob), validation will fail (correctly).
      if (newRow.dob) newRow.dob = transformDate(newRow.dob) || newRow.dob; // Keep original for DOB to show error format if fail
      if (newRow.arrivalDate) newRow.arrivalDate = transformDate(newRow.arrivalDate);
      if (newRow.departureDate) newRow.departureDate = transformDate(newRow.departureDate);

      // Flight Sanitization
      if (newRow.flightNumber) {
        const clean = newRow.flightNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        newRow.flightNumber = clean || undefined;
      }

      // Nationality Fallback
      if (!newRow.nationality) {
        newRow.nationality = defaultNationality;
      }

      if (idx === 0) console.log("Transformed Row Sample:", newRow);
      return newRow;
    });

    // 3. Validate
    const { valid, invalid } = validateBatch(normalizedRows);

    // Post-Processing: Soft vs Hard Errors
    // Departure date errors "ERR_DEPARTURE_FORMAT" might be due to user garbage input. 
    // If the field is missing/null, it's valid. If it's garbage string, it's invalid.
    // But we want to allow users to override date issues.

    const hardErrors: ValidationError[] = [];
    const softWarnRows: InsertTraveler[] = [];

    invalid.forEach(errItem => {
      // Check if errors are ONLY related to Date formats or Departure/Arrival logic
      const onlySoft = errItem.errors.every(e =>
        ['ERR_DEPARTURE_FORMAT', 'ERR_DATE_FORMAT', 'ERR_DEPARTURE_BEFORE_ARRIVAL'].includes(e.code)
      );

      if (onlySoft) {
        // Convert to valid traveler but nullify bad fields or keep them?
        // We'll keep them as is (nullified by transformer mostly) or raw.
        // Actually, validateBatch returns the errors. 
        // We need to re-construct the traveler from the normalized row
        const row = normalizedRows[errItem.row - 1];
        // Build traveler object
        const t: InsertTraveler = {
          groupId,
          passportNumber: row.passportNumber,
          name: row.name,
          nationality: row.nationality,
          dob: row.dob, // might be invalid string
          // If these marked error, we can technically null them to force strict save? 
          // Or just accept the risk? User wants to "Import and correct manually".
          // So we import even with weird dates if backend allows, OR we nullify them.
          nusukId: null,
          nusukStatus: "pending",
          riskScore: null,
          riskReason: null
        };
        softWarnRows.push(t);
      } else {
        hardErrors.push(errItem);
      }
    });

    if (hardErrors.length > 0) {
      setValidationErrors(hardErrors.sort((a, b) => a.row - b.row));
    }

    // Convert Valid rows
    const validTravelers: InsertTraveler[] = valid.map((t: CanonicalTraveler) => ({
      groupId,
      passportNumber: t.passportNumber,
      name: t.name,
      nationality: t.nationality,
      dob: t.dob,
      nusukId: null,
      nusukStatus: "pending",
      riskScore: null,
      riskReason: null
    }));

    const allImportable = [...validTravelers, ...softWarnRows];
    console.log(`Parsed: ${validTravelers.length} valid, ${softWarnRows.length} with soft warnings.`);

    setParsedData(allImportable);

    // If we have soft warnings, show a toast or message (handled in UI via count mismatch)
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setValidationErrors([]);
    setParsedData([]);

    try {
      const text = await file.text();
      const cleanedText = cleanContent(text);

      // JSON Detection
      if (cleanedText.startsWith('[') || cleanedText.startsWith('{')) {
        try {
          const jsonData = JSON.parse(cleanedText);
          if (Array.isArray(jsonData)) {
            const rows = jsonData.map(item => {
              const row: Record<string, string> = {};
              Object.keys(item).forEach(k => { row[k] = String(item[k] || ''); });
              return row;
            });
            processParsedData(rows, Object.keys(rows[0] || {}));
            return;
          }
        } catch (e) { console.warn("JSON fallback", e); }
      }

      // Delimiter Sniffing
      const firstLine = cleanedText.split('\n')[0];
      const delimiters = [',', '\t', ';', '|'];
      let delimiter = ',';
      let maxCount = 0;
      delimiters.forEach(d => {
        const count = (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
        if (count > maxCount) { maxCount = count; delimiter = d; }
      });

      Papa.parse(cleanedText, {
        header: true,
        delimiter: delimiter,
        dynamicTyping: false,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim().replace(/^["']|["']$/g, ''),
        complete: (results) => {
          if (results.errors.length > 0) {
            const fatal = results.errors.filter(e => e.code !== 'TooManyFields' && e.code !== 'TooFewFields');
            if (fatal.length > 0) {
              setParseError(`Parse Error: ${fatal[0].message}`);
              return;
            }
          }
          processParsedData(results.data as Record<string, string>[], results.meta.fields || []);
        },
        error: (err) => { setParseError(`Parse Error: ${err.message}`); }
      });
    } catch (err: any) {
      setParseError(`File Read Error: ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["Passport", "Name", "Nationality", "DOB", "Phone", "Arrival", "Departure", "Flight"];
    const csvContent = [
      headers.join(","),
      "A12345678,Ahmed Al-Farsi,SA,1980-01-01,+966500000001,2026-03-01,2026-03-15,SV123",
      "B87654321,Fatima Al-Zahra,AE,1985-05-15,+971500000002,2026-03-01,2026-03-15,EK456"
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "travelers_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirm = () => {
    bulkCreate.mutate(parsedData, {
      onSuccess: () => {
        setOpen(false);
        setParsedData([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleCancel = () => {
    setParsedData([]);
    setParseError(null);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Travelers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import travelers. We'll attempt to automatically map your columns.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          {!parsedData.length && !validationErrors.length ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
              <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-2 max-w-sm">
                Expected columns: Passport, Name, Nationality, DOB (YYYY-MM-DD)
              </p>
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-background border rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Default Nationality:</span>
                  <select
                    value={defaultNationality}
                    onChange={(e) => setDefaultNationality(e.target.value)}
                    className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="SA">Saudi Arabia (SA)</option>
                    <option value="PK">Pakistan (PK)</option>
                    <option value="IN">India (IN)</option>
                    <option value="BD">Bangladesh (BD)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="US">United States (US)</option>
                    <option value="AE">UAE (AE)</option>
                  </select>
                </div>
              </div>

              <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
              {parseError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {parseError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <AlertCircle className="h-4 w-4" /> {validationErrors.length} Critical Issues
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {validationErrors.slice(0, 5).map((err) => (
                      <div key={err.row} className="text-muted-foreground">
                        Row {err.row}: {err.errors.map((e, i) => (
                          <span key={`${e.field}-${i}`}><strong className="text-destructive capitalize">[{e.field}]</strong> {e.message}</span>
                        )).reduce((prev, curr) => [prev, ', ', curr] as any)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">Found {parsedData.length} valid / partially valid records.</p>
                  {validationErrors.length === 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><Check className="h-3 w-3" /> Ready to import</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="text-destructive hover:text-destructive">Clear & Re-upload</Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Passport</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>DOB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row: any, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{row.passportNumber}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.nationality}</TableCell>
                        <TableCell>{row.dob}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={parsedData.length === 0 || bulkCreate.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {bulkCreate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Confirm Import ({parsedData.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
