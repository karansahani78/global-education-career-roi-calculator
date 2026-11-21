import { motion } from 'framer-motion';
import { Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareCardProps {
  shareableUrl?: string;
}

export const ShareCard = ({ shareableUrl }: ShareCardProps) => {
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Share results</h3>
          <p className="text-xs text-muted-foreground">Send this analysis to anyone</p>
        </div>
      </div>
      <Button
        variant="secondary"
        className="mt-4 w-full gap-2"
        onClick={() => {
          const url = shareableUrl || window.location.href;
          navigator.clipboard.writeText(url).then(() => {
            toast({ title: 'Link copied', description: 'Share this link with anyone to view your ROI analysis.' });
          }).catch(() => {
            toast({ title: 'Copy failed', description: 'Please copy the URL from your browser address bar.', variant: 'destructive' });
          });
        }}
      >
        <Copy className="h-4 w-4" aria-hidden="true" /> Copy link
      </Button>
    </motion.div>
  );
};
