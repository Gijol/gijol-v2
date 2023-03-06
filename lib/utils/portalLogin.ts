import { LoginProps } from '../types';
import { chromium } from 'playwright-core';

export const portalLogin = async (loginInfo: LoginProps) => {
  const zeusURL = 'https://zeus.gist.ac.kr/sys/lecture/lecture_main.do';
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(zeusURL);
  await page.locator('#login_id').fill(loginInfo.id);
  await page.locator('#login_pw').fill(loginInfo.password);
  await page.click('.s_login_bu_area>li>a>img');
  const cookies = await context.cookies(zeusURL);
  await page.close();
  return cookies;
};
