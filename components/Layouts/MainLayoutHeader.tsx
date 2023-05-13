import React, { CSSProperties, useState } from 'react';
import { Burger, Header, MediaQuery, Sx, Text, useMantineTheme } from '@mantine/core';
import Link from 'next/link';

export default function MainLayoutHeader() {
  return (
    <Header height={{ base: 50, md: 64 }} p="sm" pos={'sticky'}>
      <div
        style={{
          maxWidth: '1023px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: 'auto',
          height: '100%',
        }}
      >
        <h2 style={{ margin: '0' }}>🎓 Gijol.v2</h2>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', height: '100%' }}>
          <Link
            href="https://choieungi-project.notion.site/Q-A-9e325eabef4e479a8f47e95eb90bb344"
            rel="noreferrer"
            target="_blank"
            style={{ textDecoration: 'unset', height: '100%' }}
          >
            <Text sx={linkStyle}>자주 묻는 질문</Text>
          </Link>
          <Link
            href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f"
            rel="noreferrer"
            target="_blank"
            style={{ textDecoration: 'unset' }}
          >
            <Text sx={linkStyle} size="md">
              팀 소개
            </Text>
          </Link>
          <Link
            href="/dashboard"
            rel="noreferrer"
            target="_blank"
            style={{ textDecoration: 'unset' }}
          >
            <Text sx={linkStyle}>대쉬보드</Text>
          </Link>
        </div>
      </div>
    </Header>
  );
}

const linkStyle: Sx = {
  height: 'fit-content',
  padding: '8px 12px',
  textDecoration: 'unset',
  color: '#6b7684',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  ':hover': {
    backgroundColor: '#f2f4f6',
  },
};
