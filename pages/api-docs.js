import { useEffect } from 'react';
import Head from 'next/head';

export default function ApiDocs() {
  useEffect(() => {
    // Load Swagger UI
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      window.SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        presets: [
          window.SwaggerUIBundle.presets.apis,
          window.SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout',
        deepLinking: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Head>
        <title>EduX API Documentation</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
        />
        <style>{`
          body {
            margin: 0;
            padding: 0;
          }
          .swagger-ui .topbar {
            display: none;
          }
          .swagger-ui .info {
            margin: 20px 0;
          }
          .swagger-ui .info .title {
            color: #3b82f6;
          }
        `}</style>
      </Head>
      <div id="swagger-ui" />
    </>
  );
}
