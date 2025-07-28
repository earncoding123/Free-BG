// netlify/functions/remove-background.js

// node-fetch v2 istemal karein jo Netlify ke sath zyada stable hai
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // --- Rule 1: Sirf POST request qabool karein ---
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // --- Rule 2: API Key hasil karein ---
    const { API_KEY } = process.env;
    const apiUrl = 'https://earncoding-pixelperfect.hf.space/remove-background/';

    if (!API_KEY) {
      console.error("FATAL ERROR: API_KEY environment variable is not set in Netlify.");
      return { statusCode: 500, body: 'Server configuration error: API key is missing.' };
    }
    
    // --- Rule 3: Content-Type header ko check karein ---
    const contentType = event.headers['content-type'];
    if (!contentType) {
        console.error("FUNCTION ERROR: Request is missing the 'Content-Type' header.");
        return { statusCode: 400, body: 'Bad Request: Content-Type header is required.'};
    }

    // --- Rule 4: Browser se anay walay data ko sahi format mein layein ---
    // Netlify body ko base64 mein encode karta hai. Usay wapis binary Buffer mein decode karein.
    const imageBuffer = Buffer.from(event.body, 'base64');

    // --- Rule 5: Asal API ko request bhejein ---
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType, // Browser wala original content type aagay bhejein
        'X-API-Key': API_KEY
      },
      body: imageBuffer,
    });

    // --- Rule 6: Asal API ke response ko handle karein ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EXTERNAL API FAILED. Status: ${response.status}, Details: ${errorText}`);
      return { statusCode: response.status, body: `External API Error: ${errorText}` };
    }

    const responseBuffer = await response.buffer();

    // --- Rule 7: Kamyab response (processed image) wapis browser ko bhejein ---
    return {
      statusCode: 200,
      headers: { 'Content-Type': response.headers.get('content-type') },
      body: responseBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    // --- Agar hamaray apnay function mein koi ghalati ho ---
    const requestId = event.headers['x-nf-request-id'];
    console.error(`UNEXPECTED FUNCTION ERROR. Request ID: ${requestId}`, error);
    return {
      statusCode: 500,
      body: `A critical internal error occurred. Check the function logs on Netlify. ID: ${requestId}`,
    };
  }
};
