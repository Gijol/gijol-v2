/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://gijol.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/server-sitemap.xml'], // Add any paths to exclude
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/dashboard/*'], // Optional: Disallow crawling of dashboard pages if they are private
      },
    ],
  },
};
