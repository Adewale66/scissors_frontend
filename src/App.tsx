import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useEffect, useState } from 'react';
import { RecentLink } from './components/ui/recentLink';
import { ThemeProvider } from './components/theme-provider';
import { useToast } from '@/components/ui/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
import { ArrowDownIcon } from './components/arrow';

interface Link {
  id: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  shortUrl: string;
  qrcode: string;
}

function App() {
  const [recent, setRecent] = useState<Link[]>([]);
  const [url, setUrl] = useState('');
  const [custom, setCustom] = useState('');
  const [onHome, setOnHome] = useState(true);
  const [loader, setLoader] = useState(true);
  const [hloader, sethLoader] = useState(false);
  const [tinyUrl, setTinyUrl] = useState('');
  const [qrcode, setQrCode] = useState('');
  const [history, setHistory] = useState<Link[]>([]);
  const [copyState, setCopyState] = useState('Copy');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();

  function copyToBoard() {
    navigator.clipboard
      .writeText(tinyUrl)
      .then(() => {
        setCopyState('Copied');
        setTimeout(() => {
          setCopyState('Copy');
        }, 1500);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  function changeNext() {
    setCurrentPage((prev) => {
      const newPage = prev + 1;

      fetch(`/api/links?page=${newPage}`)
        .then((res) => res.json())
        .then((data) => {
          sethLoader(true);
          setHistory(data.data);
        })
        .catch((e) => {
          console.log(e);
        });

      setTimeout(() => {
        sethLoader(false);
      }, 1000);

      return newPage;
    });
  }

  function changePrevious() {
    setCurrentPage((prev) => {
      const newPage = prev - 1;

      fetch(`/api/links?page=${newPage}`)
        .then((res) => res.json())
        .then((data) => {
          sethLoader(true);
          setHistory(data.data);
        })
        .catch((e) => {
          console.log(e);
        });

      setTimeout(() => {
        sethLoader(false);
      }, 1000);

      return newPage;
    });
  }

  function downloadQrcode(qrcode: string) {
    const link = document.createElement('a');
    link.href = qrcode;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    toast({
      variant: 'default',
      description: 'QR code downloaded',
      duration: 1500,
    });
    document.body.removeChild(link);
  }

  async function shorten() {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias: custom, originalUrl: url }),
    });
    if (response.status !== 201) {
      const data = await response.json();
      toast({
        variant: 'destructive',
        description: data.message,
        duration: 2000,
      });
    } else {
      setLoader(true);
      const data = await response.json();
      setTinyUrl(data.shortUrl);
      setQrCode(data.qrcode);
      setTimeout(() => {
        setLoader(false);
        setRefresh(!refresh);
      }, 500);
      setOnHome(false);
    }
  }

  function goHome() {
    setUrl('');
    setCustom('');
    setTinyUrl('');
    setQrCode('');
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
    }, 500);
    setOnHome(true);
  }

  useEffect(() => {
    fetch('/api/links')
      .then((res) => res.json())
      .then((data) => {
        setLoader(false);
        setTotalPages(data.totalPages);
        setRecent(data.data.slice(0, 2));
        setHistory(data.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [refresh]);
  return (
    <ThemeProvider>
      <>
        {loader && (
          <div className='flex items-center h-screen justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        )}
        {!loader && (
          <div>
            <header className='flex items-center justify-between px-4 py-3 bg-background shadow'>
              <div className='flex gap-2 ml-auto'>
                <div className='flex gap-2'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className='rounded-md px-4 py-2 text-sm font-medium text-primary-foreground'>
                        History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className=''>
                      <DialogTitle hidden></DialogTitle>
                      <DialogDescription hidden></DialogDescription>
                      {hloader && (
                        <div className='flex items-center  justify-center'>
                          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                        </div>
                      )}
                      {!hloader && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className=''>Short URL</TableHead>
                              <TableHead>Long URL</TableHead>
                              <TableHead>Clicks</TableHead>
                              <TableHead>QRcode</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.map((link) => (
                              <TableRow key={link.id}>
                                <TableCell className='font-medium'>
                                  {link.shortUrl}
                                </TableCell>
                                <TableCell>{link.originalUrl}</TableCell>
                                <TableCell>{link.clicks}</TableCell>
                                <TableCell>
                                  <Button
                                    onClick={() => downloadQrcode(link.qrcode)}
                                  >
                                    <ArrowDownIcon className='h-4 w-4 hover:cursor-pointer' />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                className='hover:cursor-pointer'
                                onClick={changePrevious}
                              />
                            </PaginationItem>
                          )}
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                className='hover:cursor-pointer'
                                onClick={changeNext}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </header>
            <div className='w-full  bg-white dark:bg-gray-800 p-8'>
              <div className='flex flex-col items-center justify-center h-full'>
                <h1 className='text-2xl font-semibold text-gray-900 dark:text-white mb-6'>
                  Scissors
                </h1>
                {onHome && (
                  <>
                    <div className='w-full max-w-md flex flex-col gap-3'>
                      <div className='rounded-md shadow-sm'>
                        <input
                          onChange={(e) => setUrl(e.currentTarget.value)}
                          type='text'
                          placeholder='Enter your URL here'
                          className='block w-full text-lg py-3 px-4 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                      <div className='rounded-md shadow-sm'>
                        <input
                          onChange={(e) => setCustom(e.currentTarget.value)}
                          type='text'
                          placeholder='Enter  alias'
                          className='block w-full text-lg py-3 px-4 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                      <Button
                        className='w-full mt-4 py-2 rounded-b-md'
                        onClick={shorten}
                      >
                        Shorten URL
                      </Button>
                    </div>
                    <div className='w-full max-w-md mt-8'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                        Recently Shortened URLs
                      </h2>
                      <div className='space-y-4'>
                        {recent.map((link) => (
                          <RecentLink
                            key={link.id}
                            clicks={link.clicks}
                            shortUrl={link.shortUrl}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {!onHome && (
                  <>
                    <div className='w-full max-w-md flex flex-col gap-2'>
                      <div className='rounded-md shadow-sm'>
                        <Label htmlFor='longurl'>Your long URL</Label>
                        <input
                          type='text'
                          id='longurl'
                          disabled
                          value={url}
                          className='block w-full text-lg py-3 px-4 placeholder-gray-500 text-gray-900 rounded-t-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                      <div className='rounded-md shadow-sm'>
                        <Label htmlFor='shorturl'>Short URL</Label>
                        <input
                          type='text'
                          id='shorturl'
                          disabled
                          value={tinyUrl}
                          className='block w-full text-lg py-3 px-4 placeholder-gray-500 text-gray-900 rounded-t-md  focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white'
                        />
                      </div>
                      <div className='flex gap-2 '>
                        <Popover>
                          <PopoverTrigger className='w-full'>
                            <Button className='w-full mt-4 py-2 rounded-b-md'>
                              QR code
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className='flex gap-2 items-center'>
                              <img src={qrcode} alt='demo' />
                              <Button onClick={() => downloadQrcode(qrcode)}>
                                Download
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Button
                          className='w-full mt-4 py-2 rounded-b-md'
                          onClick={copyToBoard}
                        >
                          {copyState}
                        </Button>
                        <Button
                          className='w-full mt-4 py-2 rounded-b-md'
                          onClick={goHome}
                        >
                          Shorten another
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </ThemeProvider>
  );
}

export default App;
