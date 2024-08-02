import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const RecentLink = ({
  shortUrl,
  clicks,
}: {
  shortUrl: string;
  clicks: number;
}) => {
  const [copyState, setCopyState] = useState('Copy');
  function copyToBoard() {
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        setCopyState('Copied');
        setTimeout(() => {
          setCopyState('Copy');
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }
  return (
    <div className='flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-md'>
      <div>
        <p className='text-sm text-gray-900 dark:text-white mb-1'>{shortUrl}</p>
        <p className='text-xs text-gray-500'>Clicked {clicks} times</p>
      </div>
      <Button variant='ghost' size='sm' onClick={copyToBoard}>
        {copyState}
      </Button>
    </div>
  );
};
