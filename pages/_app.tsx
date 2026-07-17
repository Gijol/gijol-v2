import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import localFont from 'next/font/local';
import { DefaultSeo } from 'next-seo';
import { Analytics } from '@vercel/analytics/react';
import { SEO } from '../seo.config';
import '../public/global.css';

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

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <DefaultSeo {...SEO} />
      <div className={myFont.className}>{getLayout(<Component {...pageProps} />)}</div>
      <Analytics />
    </>
  );
}
