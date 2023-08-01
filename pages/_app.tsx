import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Layout } from '../components/Layouts/Layout';
import { SessionProvider } from 'next-auth/react';
import { ModalsProvider } from '@mantine/modals';
import { Analytics } from '@vercel/analytics/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [queryClient] = useState(() => new QueryClient());

  /* 라이트 모드, 다크 모드 설정하는 상태 로직 */
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  return (
    <>
      <Head>
        <title>학교 생활을 편리하게, Gijol</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/public/images/tossfaceCap.png" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <QueryClientProvider client={queryClient}>
            <SessionProvider session={pageProps.session}>
              <ModalsProvider>
                <Notifications />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ModalsProvider>
            </SessionProvider>
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </MantineProvider>
      </ColorSchemeProvider>
      <Analytics />
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};
