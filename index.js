const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Define your proxy route
const domain = process.env.CYCLIC_URL || 'https://excited-teddy-fish.cyclic.app'; // Using environment variable for domain, defaulting to the provided domain
const proxyOptions = {
  target: domain,
  changeOrigin: true,
};

// Create the proxy
const proxy = createProxyMiddleware(proxyOptions);

// Use the proxy middleware
app.use('/', proxy);

// Middleware to modify the response
app.use(async (req, res, next) => {
  try {
    await proxy(req, res);

    // Intercept the response
    const originalWrite = res.write;
    const originalEnd = res.end;

    let responseBody = '';
    res.write = function (chunk) {
      responseBody += chunk.toString('utf8');
      return originalWrite.apply(res, arguments);
    };

    res.end = async function (chunk) {
      if (chunk) {
        responseBody += chunk.toString('utf8');
      }

      try {
        // Modify the response body
        const modifiedResponseBody = responseBody.replace(/(https:\/\/)(?!.*excited-teddy-fish\.cyclic\.app)/g, `$1${domain}/`);

        // Update the response
        res.setHeader('content-length', Buffer.byteLength(modifiedResponseBody));
        res.write(modifiedResponseBody);
        res.end();
      } catch (err) {
        console.error('Error modifying response body:', err);
        res.end(responseBody);
      }
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    next(error);
  }
});

// Start the server
const port = process.env.PORT || 3000; // Using environment variable for port, defaulting to 3000
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
