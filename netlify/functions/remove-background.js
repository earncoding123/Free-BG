const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Ensure the request is a POST with a file
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Get the API key from Netlify environment variables
    const API_KEY = process.env.API_KEY;
    const API_URL = 'https://earncoding-pixelperfect.hf.space/remove-background/';

    // Parse the incoming multipart form data
    const contentType = event.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Expected multipart/form-data' }),
      };
    }

    // Since Netlify Functions don't natively parse multipart, we'll forward the raw body
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': contentType,
      },
      body: Buffer.from(event.body, 'base64'), // Netlify sends body as base64
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${response.statusText}` }),
      };
    }

    // Get the response as a buffer
    const buffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="background-removed.png"',
      },
      isBase64Encoded: true,
      body: buffer.toString('base64'),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
