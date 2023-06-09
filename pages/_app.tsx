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
import { Hydrate, QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import RefreshTokenHandler from '../components/RefreshTokenHandler';

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
  /* session refetch interval 설정 */
  const [sessionRefetchInterval, setSessionRefetchInterval] = useState(10000);

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
            <Hydrate state={pageProps.dehydratedState}>
              <SessionProvider session={pageProps.session} refetchInterval={sessionRefetchInterval}>
                <ModalsProvider>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                  <Notifications />
                </ModalsProvider>
                <RefreshTokenHandler setSessionRefetchInterval={setSessionRefetchInterval} />
              </SessionProvider>
            </Hydrate>
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
