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
import { Typewriter } from 'react-simple-typewriter';
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
import { Input } from './components/ui/input';
import { QrCodeIcon, CopyIcon, HomeIcon } from 'lucide-react';

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
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();

  function copyToBoard() {
    navigator.clipboard
      .writeText(tinyUrl)
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
        setRecent(data.data.slice(0, 4));
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
                    <DialogContent className='max-w-fit'>
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
                                    <QrCodeIcon className='h-4 w-4 hover:cursor-pointer' />
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

            {onHome && (
              <>
                <div className='flex flex-col bg-background h-full'>
                  <header className='w-full py-8 md:py-12 lg:py-16'>
                    <div className='container mx-auto px-4 md:px-6'>
                      <div className='mx-auto max-w-3xl text-center'>
                        <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl'>
                          Shorten Your Links
                        </h1>
                        <p className='mt-4 text-muted-foreground md:text-xl'>
                          <Typewriter
                            words={[
                              'Simplify your online presence with our powerful URL shortening tool.',
                            ]}
                          />
                        </p>
                        <div className='mt-8 flex w-full items-center gap-2 justify-center'>
                          <Input
                            type='url'
                            placeholder='Enter your long URL'
                            className='flex-1'
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                          />
                          <Input
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            type='text'
                            placeholder='Enter an alias (optional)'
                            className='flex-1'
                          />
                          <Button type='submit' onClick={shorten}>
                            Shorten
                          </Button>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className='flex-1'>
                    <section className='w-full py-8 md:py-12 lg:py-16'>
                      <div className='container mx-auto px-4 md:px-6'>
                        <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl'>
                          Your Recent Shortened URLs
                        </h2>
                        <div className='mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                          {recent.map((link) => (
                            <RecentLink
                              key={link.id}
                              shortUrl={link.shortUrl}
                              clicks={link.clicks}
                              longurl={link.originalUrl}
                            />
                          ))}
                        </div>
                      </div>
                    </section>
                  </main>
                  <footer className=' p-6 md:py-8 mt-12'>
                    <div className='container mx-auto px-4 md:px-6'>
                      <p className='text-center text-sm text-muted-foreground'>
                        &copy; 2024 Scissors. All rights reserved.
                      </p>
                    </div>
                  </footer>
                </div>
              </>
            )}
            {!onHome && (
              <>
                <main className='flex-1'>
                  <section className='w-full py-8 md:py-12 lg:py-16'>
                    <div className='container mx-auto px-4 md:px-6'>
                      <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl'>
                        Your Shortened URL
                      </h2>
                      <div className='mt-6 rounded-md border bg-card p-4 shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>{tinyUrl}</p>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <QrCodeIcon
                                className='h-4 w-4'
                                onClick={() => downloadQrcode(qrcode)}
                              />
                              <span className='sr-only'>Download QR</span>
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <CopyIcon
                                className='h-4 w-4'
                                onClick={copyToBoard}
                              />
                              <span className='sr-only'>Copy</span>
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <HomeIcon className='h-4 w-4' onClick={goHome} />
                              <span className='sr-only'>Home</span>
                            </Button>
                          </div>
                        </div>
                        <p className='mt-2 text-sm text-muted-foreground'>
                          {url}
                        </p>
                      </div>
                    </div>
                  </section>
                </main>
              </>
            )}
          </div>
        )}
      </>
    </ThemeProvider>
  );
}

export default App;
