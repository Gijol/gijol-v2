import { DefaultSeo } from 'next-seo';
import { SEO } from '../seo.config';
import '../public/global.css';
import { useState } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Or keep if dev

import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: '../public/fonts/에이투지체-4Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/에이투지체-7Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-atoz',
});

import { Layout } from '@components/layouts/layout';
import { ThemeProvider } from '@components/theme-provider';
import { Toaster } from '@components/ui/toaster';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <DefaultSeo {...SEO} />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
        <QueryClientProvider client={queryClient}>
          <main className={myFont.className}>
            <Layout>
              <Component {...pageProps} />
              <Toaster />
            </Layout>
          </main>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
      <Analytics />
    </>
  );
}
