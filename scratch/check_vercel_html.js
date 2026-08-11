async function checkVercelHtml() {
  try {
    const res = await fetch('https://megaman-frontend.vercel.app/products/6a7549e1040e7bde8a061584/eprel-light-source?sku=MM12282');
    const html = await res.text();
    console.log('HTML Length:', html.length);
    
    // Find all media URLs or PDF URLs in HTML
    const mediaMatches = html.match(/https?:\/\/[^\s"']+/g) || [];
    console.log('--- ALL ABSOLUTE URLS IN HTML ---');
    console.log(mediaMatches.filter(u => u.includes('media') || u.includes('pdf') || u.includes('api') || u.includes('blob') || u.includes('localhost')));

  } catch (err) {
    console.error(err);
  }
}

checkVercelHtml();
