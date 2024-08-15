import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const RecentLink = ({
  shortUrl,
  clicks,
  longurl,
}: {
  shortUrl: string;
  clicks: number;
  longurl: string;
}) => {
  const { toast } = useToast();
  function copyToBoard() {
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        toast({
          variant: 'default',
          description: 'Copied to clipboard',
          duration: 1500,
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }
  return (
    <div className='rounded-md border bg-card p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium'>{shortUrl}</p>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm'>
            <CopyIcon className='h-4 w-4' onClick={copyToBoard} />
          </Button>
        </div>
      </div>
      <p className='mt-2 text-sm text-muted-foreground'>{longurl}</p>
      <div className='mt-4 flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>Clicks: {clicks}</p>
      </div>
    </div>
  );
};
