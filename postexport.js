/**
 * Post-export script: injects PWA manifest, service worker, and meta tags into dist/index.html
 * Also copies public/ assets into dist/
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const htmlPath = path.join(distDir, 'index.html');

// 1. Copy public/ files into dist/
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(f => {
    fs.copyFileSync(path.join(publicDir, f), path.join(distDir, f));
    console.log(`Copied: ${f}`);
  });
}

// 2. Also copy logo from assets to dist
const logoSrc = path.join(__dirname, 'assets', 'logo.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(distDir, 'logo-192.png'));
  fs.copyFileSync(logoSrc, path.join(distDir, 'logo-512.png'));
  console.log('Logo copied as PWA icons');
}

// 3. Inject into index.html
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Add manifest link + apple meta tags + service worker registration
  const pwaHead = `
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/logo-192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="SG Fitness">
    <meta name="mobile-web-app-capable" content="yes">
  `;

  const swScript = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW failed:', err));
        });
      }
    </script>
  `;

  // Insert before </head>
  html = html.replace('</head>', pwaHead + '</head>');
  
  // Insert before </body>
  html = html.replace('</body>', swScript + '</body>');

  fs.writeFileSync(htmlPath, html);
  console.log('PWA tags injected into index.html');
} else {
  console.error('dist/index.html not found!');
}

console.log('Post-export complete!');
