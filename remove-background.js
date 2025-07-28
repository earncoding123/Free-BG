// netlify/functions/remove-background.js

exports.handler = async (event) => {
    // We only want to handle POST requests
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    // Get the API key from Netlify's environment variables
    const apiKey = process.env.API_KEY;
    const apiUrl = 'https://earncoding-pixelperfect.hf.space/remove-background/';
  
    try {
      // We need to use a library to make a fetch request from the function.
      // 'node-fetch' is a good option.
      const fetch = (await import('node-fetch')).default;
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          // Pass through the content-type from the original request
          'Content-Type': event.headers['content-type']
        },
        body: event.body,
      });
  
      if (!response.ok) {
        // If the API returns an error, pass that back
        const errorData = await response.text();
        return {
          statusCode: response.status,
          body: `API Error: ${errorData}`,
        };
      }
  
      // Get the image data from the API response
      const imageBuffer = await response.buffer();
  
      // Return the image data with the correct content type
      return {
        statusCode: 200,
        headers: { 'Content-Type': response.headers.get('content-type') },
        body: imageBuffer.toString('base64'),
        isBase64Encoded: true,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'There was an error processing your request.' }),
      };
    }
  };