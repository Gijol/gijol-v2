import { LoginProps } from '../types';
import { chromium } from 'playwright-core';

export const portalLogin = async (loginInfo: LoginProps) => {
  const zeusURL = 'https://zeus.gist.ac.kr/sys/lecture/lecture_main.do';
  const portalURL = 'https://sportal.gist.ac.kr/login.jsp';
  const zeusMainURL = 'https://zeus.gist.ac.kr/sys/main/main.do';

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(zeusURL);
  await page.on('load', () => {
    console.log('zeus sungang page loaded');
  });
  await page.locator('#login_id').fill(loginInfo.id);
  await page.locator('#login_pw').fill(loginInfo.password);
  await page.click('.s_login_bu_area>li>a>img');
  // const cookies = await context.cookies(zeusURL);

  const newPage = await context.newPage();
  await newPage.goto(portalURL);
  await newPage.on('load', () => {
    console.log('portal page loaded');
  });

  await newPage.locator('#user_id').fill(loginInfo.id);
  await newPage.locator('#user_password').fill(loginInfo.password);
  await newPage.click('.btn_login');
  await newPage.click('.main_menu01 > li > a');

  return await context.cookies(zeusURL);
};
