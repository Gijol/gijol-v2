import '../public/global.css';
import { useState } from 'react';
import Head from 'next/head';
import { getCookie, setCookie } from 'cookies-next';
import NextApp, { AppProps, AppContext } from 'next/app';

import {
  MantineProvider,
  ColorScheme,
  ColorSchemeProvider,
  rem,
  type MantineThemeOverride,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { Analytics } from '@vercel/analytics/react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Layout } from '@components/layouts/layout';

const appTheme: MantineThemeOverride = {
  fontFamily: 'Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  lineHeight: '1.6',
  headings: {
    fontFamily: 'Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 600,
  },
  colors: {
    neutral: [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1f2937',
      '#0f172a',
    ],
  },
  primaryColor: 'dark',
  defaultRadius: 'md',
  globalStyles: () => ({
    '*, *::before, *::after': { boxSizing: 'border-box' },
    body: {
      margin: 0,
      backgroundColor: '#f8fafc',
      color: '#09090b',
      fontFamily: 'Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: '1.6',
    },
  }),
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: (theme, _params, { variant }) => ({
        root: {
          fontWeight: 600,
          ...(variant === 'filled' && {
            backgroundColor: '#0a0a0a',
            color: theme.white,
            '&:hover': { backgroundColor: '#171717' },
          }),
          ...(variant === 'outline' && {
            borderColor: theme.colors.gray[3],
            color: '#09090b',
            '&:hover': { backgroundColor: theme.colors.gray[0] },
          }),
        },
      }),
    },
    Input: {
      defaultProps: { radius: 'md' },
      styles: (theme) => ({
        input: {
          height: rem(40),
          borderColor: theme.colors.gray[3],
          backgroundColor: theme.white,
          color: '#09090b',
          '&::placeholder': { color: theme.colors.gray[5] },
          '&:focus, &:focus-within': {
            borderColor: theme.colors.dark[7],
            boxShadow: `0 0 0 1px ${theme.colors.dark[7]}`,
          },
        },
      }),
    },
    Select: {
      defaultProps: { radius: 'md' },
      styles: (theme) => ({
        input: {
          height: rem(40),
          borderColor: theme.colors.gray[3],
          color: '#09090b',
          '&:focus, &:focus-within': {
            borderColor: theme.colors.dark[7],
            boxShadow: `0 0 0 1px ${theme.colors.dark[7]}`,
          },
        },
      }),
    },
    Paper: {
      defaultProps: { shadow: 'sm' },
      styles: (theme) => ({
        root: {
          border: `1px solid ${theme.colors.gray[2]}`,
          boxShadow: theme.shadows.sm,
        },
      }),
    },
    Card: {
      defaultProps: { shadow: 'sm' },
      styles: (theme) => ({
        root: {
          border: `1px solid ${theme.colors.gray[2]}`,
          boxShadow: theme.shadows.sm,
        },
      }),
    },
  },
};

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
        <MantineProvider theme={{ ...appTheme, colorScheme }} withGlobalStyles withNormalizeCSS>
          <QueryClientProvider client={queryClient}>
            <ModalsProvider>
              <Notifications />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ModalsProvider>
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
