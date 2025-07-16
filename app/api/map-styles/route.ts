/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Define types for better type safety
interface MapStyleResponse {
  version: string;
  settings: any;
  elements: any[];
}

export async function GET(request: Request) {
  const headersList = headers();
  const referer = headersList.get('referer') || 'http://localhost:3000/';

  try {
    // Validate environment variable
    if (!process.env.AZURE_MAPS_KEY) {
      throw new Error('Azure Maps key is not configured');
    }

    const response = await fetch(
      'https://atlas.microsoft.com/styling/styles/road?styleVersion=2023-01-01&mcv=361&api-version=2.0',
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
          'cache-control': 'no-cache',
          'map-agent': 'MapControl/3.6.1 (Web)',
          'ms-am-request-origin': 'MapControl',
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'subscription-key': process.env.AZURE_MAPS_KEY,
          'x-edge-shopping-flag': '1',
          'Referer': referer,
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        next: {
          revalidate: 3600 // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Maps API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: MapStyleResponse = await response.json();
    
    // Validate response data
    if (!data || !data.version || !data.settings || !Array.isArray(data.elements)) {
      throw new Error('Invalid response format from Azure Maps API');
    }

    // Set CORS and cache headers
    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    responseHeaders.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error in map-styles API:', error);
    
    const errorResponse = {
      error: 'Failed to fetch map styles',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new NextResponse(null, {
    status: 204,
    headers: headers
  });
} 