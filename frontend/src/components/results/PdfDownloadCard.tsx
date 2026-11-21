import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadRoiPdf } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PdfDownloadCardProps {
  uuid?: string;
}

export const PdfDownloadCard = ({ uuid }: PdfDownloadCardProps) => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!uuid) return;
    setDownloading(true);
    try {
      const blob = await downloadRoiPdf(uuid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roi-report-${uuid}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Download started', description: 'Your detailed ROI report is downloading.' });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Could not download the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
          <FileDown className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Detailed report</h3>
          <p className="text-xs text-muted-foreground">Download your full ROI analysis</p>
        </div>
      </div>
      <Button
        className="mt-4 w-full gap-2"
        disabled={!uuid || downloading}
        onClick={handleDownload}
      >
        {downloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating PDF…
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4" aria-hidden="true" /> Download report (PDF)
          </>
        )}
      </Button>
      {!uuid && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" aria-hidden="true" /> Report unavailable — missing calculation ID
        </p>
      )}
    </motion.div>
  );
};
