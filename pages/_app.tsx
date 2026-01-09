import '../public/global.css';
import { useState } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Or keep if dev

import { Layout } from '@components/layouts/layout';
import { ThemeProvider } from '@components/theme-provider';
import { Toaster } from '@components/ui/toaster';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>학교 생활을 편리하게, Gijol</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/public/images/tossfaceCap.png" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
            <Toaster />
          </Layout>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
      <Analytics />
    </>
  );
}
