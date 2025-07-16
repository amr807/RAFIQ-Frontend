import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = '`${process.env.NEXT_PUBLIC_Base_URL}'; // Change to your real domain

  // List your static routes here
  const pages = [
    '',
    '/my-account/User/settings',
    '/my-account/User/dashboard',
    // Add more routes as needed
  ];

  const urls = pages.map(
    (page) => `
      <url>
        <loc>${baseUrl}${page}</loc>
      </url>
    `
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 