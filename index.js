const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Define your proxy route
const domain = process.env.DOMAIN || 'example.com'; // Using environment variable for domain, defaulting to example.com
const proxyOptions = {
  target: `https://${domain}`,
  changeOrigin: true,
  pathRewrite: {
    '^/https://': `/https://${domain}/https://`, // Replace "https://" with "https://<domain>/https://"
  },
};

// Create the proxy
const proxy = createProxyMiddleware(proxyOptions);

// Use the proxy middleware
app.use('/', proxy);

// Start the server
const port = process.env.PORT || 3000; // Using environment variable for port, defaulting to 3000
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

