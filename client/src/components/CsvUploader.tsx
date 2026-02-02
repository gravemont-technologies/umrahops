import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileUp, X, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { InsertTraveler } from "@shared/routes";
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
}

export function CsvUploader({ groupId }: CsvUploaderProps) {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<InsertTraveler[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreate = useBulkCreateTravelers();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setValidationErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV Error: ${results.errors[0].message}`);
          return;
        }

        const rows = results.data as Record<string, string>[];
        const headers = results.meta.fields || [];

        // Auto-map CSV headers to canonical fields
        const columnMap = autoMapColumns(headers);

        // Validate all rows using canonical schema
        const { valid, invalid, stats } = validateBatch(rows, columnMap);

        if (invalid.length > 0) {
          setValidationErrors(invalid);
        }

        // Convert valid canonical travelers to InsertTraveler format
        const travelers: InsertTraveler[] = valid.map((t: CanonicalTraveler) => ({
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

        setParsedData(travelers);
      },
      error: (err) => {
        setParseError(`Parse Error: ${err.message}`);
      }
    });
  };

  const getErrorMessage = (code: string): string => {
    return errorCodeMessages[code] || code;
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
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          {!parsedData.length ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
              <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
                Expected columns: Passport, Name, Nationality, DOB (YYYY-MM-DD)
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
              {parseError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {parseError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Validation errors summary */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.length} row(s) failed validation
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {validationErrors.slice(0, 5).map((err) => (
                      <div key={err.row} className="text-muted-foreground">
                        Row {err.row}: {err.errors.map(e => getErrorMessage(e.code)).join(', ')}
                      </div>
                    ))}
                    {validationErrors.length > 5 && (
                      <div className="text-muted-foreground italic">...and {validationErrors.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {parsedData.length} valid records. Please review before importing.
                </p>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="text-destructive hover:text-destructive">
                  Clear & Re-upload
                </Button>
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
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{row.passportNumber}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.nationality}</TableCell>
                        <TableCell>{row.dob}</TableCell>
                      </TableRow>
                    ))}
                    {parsedData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground italic">
                          ...and {parsedData.length - 10} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={parsedData.length === 0 || bulkCreate.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {bulkCreate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
