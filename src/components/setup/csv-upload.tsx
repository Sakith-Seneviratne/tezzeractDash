"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface CsvUpload {
  id: string;
  file_name: string;
  file_url: string;
  column_mapping: Record<string, string>;
  uploaded_at: string;
  processed: boolean;
}

export function CsvUpload() {
  const [uploads, setUploads] = useState<CsvUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!selectedOrganization) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `csv-uploads/${selectedOrganization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('csv-uploads')
        .getPublicUrl(filePath);

      // Parse CSV for preview
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreviewData(data);
      setShowPreview(true);

      // Initialize column mapping
      const mapping: Record<string, string> = {};
      headers.forEach(header => {
        mapping[header] = '';
      });
      setColumnMapping(mapping);

      // Save upload record
      const { data: uploadData, error: insertError } = await supabase
        .from('csv_uploads')
        .insert({
          organization_id: selectedOrganization.id,
          file_name: file.name,
          file_url: publicUrl,
          column_mapping: mapping,
          processed: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving upload record:', insertError);
        return;
      }

      setUploads(prev => [uploadData, ...prev]);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleColumnMapping = (csvColumn: string, targetColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: targetColumn,
    }));
  };

  const processUpload = async (uploadId: string) => {
    try {
      const { error } = await supabase
        .from('csv_uploads')
        .update({ 
          column_mapping: columnMapping,
          processed: true 
        })
        .eq('id', uploadId);

      if (error) {
        console.error('Error processing upload:', error);
        return;
      }

      // Update local state
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, column_mapping: columnMapping, processed: true }
          : upload
      ));

      setShowPreview(false);
      setPreviewData([]);
      setColumnMapping({});
    } catch (error) {
      console.error('Error processing upload:', error);
    }
  };

  const deleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      const { error } = await supabase
        .from('csv_uploads')
        .delete()
        .eq('id', uploadId);

      if (error) {
        console.error('Error deleting upload:', error);
        return;
      }

      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
    } catch (error) {
      console.error('Error deleting upload:', error);
    }
  };

  const targetColumns = [
    'date',
    'impressions',
    'reach',
    'engagement',
    'clicks',
    'conversions',
    'platform',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>CSV Upload</span>
        </CardTitle>
        <CardDescription>
          Upload custom data from CSV files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>
          <div className="mt-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload"
            />
            <Button asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                {uploading ? 'Uploading...' : 'Choose File'}
              </label>
            </Button>
          </div>
        </div>

        {/* Column Mapping Preview */}
        {showPreview && previewData.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Map CSV Columns</h3>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Preview of your data (first 5 rows):
              </div>
              
              {/* Data Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(previewData[0]).map((header) => (
                        <th key={header} className="text-left p-2 border-r">
                          <div className="space-y-2">
                            <div className="font-medium">{header}</div>
                            <select
                              value={columnMapping[header] || ''}
                              onChange={(e) => handleColumnMapping(header, e.target.value)}
                              className="w-full p-1 text-xs border rounded"
                            >
                              <option value="">Select mapping...</option>
                              {targetColumns.map((col) => (
                                <option key={col} value={col}>
                                  {col}
                                </option>
                              ))}
                            </select>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-2 border-r text-xs">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => processUpload(uploads[0]?.id)}
                  disabled={Object.values(columnMapping).every(v => !v)}
                >
                  Process Upload
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload History */}
        {uploads.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Upload History</h3>
            {uploads.map((upload) => (
              <div key={upload.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{upload.file_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(upload.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={upload.processed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {upload.processed ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Processed
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(upload.file_url, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUpload(upload.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
