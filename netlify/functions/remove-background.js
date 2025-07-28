// netlify/functions/remove-background.js

exports.handler = async (event) => {
  // 1. Sirf POST requests ko handle karein
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // 2. API key ko environment variables se hasil karein
    const apiKey = process.env.API_KEY;
    const apiUrl = 'https://earncoding-pixelperfect.hf.space/remove-background/';

    // Check karein ke API key mojood hai ya nahi
    if (!apiKey) {
      console.error('FATAL: API_KEY environment variable is not set.');
      return { statusCode: 500, body: 'Server configuration error: API key missing.' };
    }

    // 3. Client se anay wali body base64 encoded hoti hai.
    // Usay wapis buffer (raw data) mein convert karein.
    const requestBodyBuffer = Buffer.from(event.body, 'base64');

    // 4. Asal API ko request bhejein
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        // Client se anay wala Content-Type aagay bhejein, yeh zaroori hai
        'Content-Type': event.headers['content-type'],
        'X-API-Key': apiKey,
      },
      body: requestBodyBuffer, // Raw data bhejein
    });

    // 5. Asal API ke response ko handle karein
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API Error: ${response.status} - ${errorText}`);
      return {
        statusCode: response.status,
        body: `API Error: ${errorText}`,
      };
    }

    const imageBuffer = await response.arrayBuffer();

    // 6. Process shuda image client ko wapis bhejein
    return {
      statusCode: 200,
      headers: { 'Content-Type': response.headers.get('content-type') },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    // Apnay function ki internal ghaltiyon ko log karein
    console.error('Internal function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred. Please check the function logs.' }),
    };
  }
};
