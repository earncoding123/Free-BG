// netlify/functions/remove-background.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Rule 1: Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Rule 2: Get API Key from environment variables
    const { API_KEY } = process.env;
    const apiUrl = 'https://earncoding-pixelperfect.hf.space/remove-background/';

    if (!API_KEY) {
      console.error("Function Error: API_KEY is not set in Netlify environment variables.");
      return { statusCode: 500, body: 'Server configuration error: API key is missing.' };
    }
    
    // Rule 3: Check if the client sent a Content-Type header
    const contentType = event.headers['content-type'];
    if (!contentType) {
        console.error("Function Error: Client did not send a Content-Type header.");
        return { statusCode: 400, body: 'Bad Request: Content-Type header is required.'};
    }

    // Rule 4: The body from the browser (sent as ArrayBuffer) is base64 encoded by Netlify.
    // We must decode it back to a binary buffer.
    const imageBuffer = Buffer.from(event.body, 'base64');

    // Rule 5: Call the external API with the correct data and headers
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType, // Forward the original content type
        'X-API-Key': API_KEY
      },
      body: imageBuffer,
    });

    // Rule 6: Handle the response from the external API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API Failed. Status: ${response.status}, Body: ${errorText}`);
      return { statusCode: response.status, body: `External API Error: ${errorText}` };
    }

    const responseBuffer = await response.buffer();

    // Rule 7: Send the successful response (the processed image) back to the browser
    return {
      statusCode: 200,
      headers: { 'Content-Type': response.headers.get('content-type') },
      body: responseBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('An unexpected error occurred in the function:', error);
    return {
      statusCode: 500,
      body: `A critical internal error occurred. Check the function logs on Netlify. Request ID: ${event.headers['x-nf-request-id']}`,
    };
  }
};
