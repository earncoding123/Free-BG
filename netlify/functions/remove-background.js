const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { API_KEY } = process.env;
    const apiUrl = 'https://earncoding-pixelperfect.hf.space/remove-background/';

    if (!API_KEY) {
      console.error("FATAL: API_KEY environment variable is not set.");
      return { statusCode: 500, body: 'Server configuration error: API key is missing.' };
    }
    
    const contentType = event.headers['content-type'];
    if (!contentType) {
      return { statusCode: 400, body: 'Bad Request: Content-Type header is required.'};
    }

    const imageBuffer = Buffer.from(event.body, 'base64');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'X-API-Key': API_KEY
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: `External API Error: ${errorText}` };
    }

    const responseBuffer = await response.buffer();

    return {
      statusCode: 200,
      headers: { 'Content-Type': response.headers.get('content-type') },
      body: responseBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    const requestId = event.headers['x-nf-request-id'];
    console.error(`UNEXPECTED FUNCTION ERROR. Request ID: ${requestId}`, error);
    return {
      statusCode: 500,
      body: `A critical internal error occurred. ID: ${requestId}`,
    };
  }
};
