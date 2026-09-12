import * as pdfjsLib from './vendor/pdfjs/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const base = new URL('../', window.location.href);
const file = new URLSearchParams(window.location.search).get('file') || '';
const status = document.getElementById('status');
const canvas = document.getElementById('page');
const previous = document.getElementById('prev');
const next = document.getElementById('next');
const zoom = document.getElementById('zoom');
let pdf, pageNumber = 1, busy = false, queued = false;

async function renderPage() {
  if (!pdf) return;
  if (busy) { queued = true; return; }
  busy = true; previous.disabled = true; next.disabled = true;
  try {
    const page = await pdf.getPage(pageNumber);
    const width = Math.max(150, document.documentElement.clientWidth - 36);
    const scale = Math.min(width / page.getViewport({scale:1}).width * Number(zoom.value), 2.5);
    const viewport = page.getViewport({scale});
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * ratio); canvas.height = Math.floor(viewport.height * ratio);
    canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
    await page.render({canvasContext:canvas.getContext('2d'), viewport, transform:ratio === 1 ? null : [ratio,0,0,ratio,0,0]}).promise;
    canvas.setAttribute('aria-label',`PDF page ${pageNumber} of ${pdf.numPages}`);
    const text = await page.getTextContent();
    document.getElementById('page-text').textContent = text.items.map(item => item.str || '').join(' ');
    document.getElementById('page-count').textContent = `${pageNumber} / ${pdf.numPages}`;
    status.hidden = true;
  } catch (error) {
    status.hidden = false; status.textContent = 'This page could not be displayed. Use Download to open the original PDF.';
  } finally {
    busy = false; previous.disabled = pageNumber <= 1; next.disabled = pageNumber >= pdf.numPages;
    if (queued) { queued = false; renderPage(); }
  }
}
previous.addEventListener('click',()=>{if(pdf && !busy && pageNumber>1){pageNumber--;renderPage();}});
next.addEventListener('click',()=>{if(pdf && !busy && pageNumber<pdf.numPages){pageNumber++;renderPage();}});
zoom.addEventListener('change',renderPage);
let resizeTimer;
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderPage,120);});
try {
  const url = new URL(file.split('/').map(encodeURIComponent).join('/'),base);
  const desktop = new URL('Desktop/',base);
  if (!file.startsWith('Desktop/') || url.origin !== desktop.origin || !url.pathname.startsWith(desktop.pathname)) throw new Error('Invalid PDF path');
  pdf = await pdfjsLib.getDocument({url:url.href, cMapUrl:new URL('vendor/pdfjs/cmaps/',import.meta.url).href, cMapPacked:true, standardFontDataUrl:new URL('vendor/pdfjs/standard_fonts/',import.meta.url).href, wasmUrl:new URL('vendor/pdfjs/wasm/',import.meta.url).href, isEvalSupported:false, enableXfa:false}).promise;
  await renderPage();
} catch (error) {
  canvas.hidden = true;
  document.getElementById('page-count').textContent = 'PDF';
  status.textContent = error.name === 'PasswordException' ? 'This PDF is password protected. Download it to open it in your PDF reader.' : 'The PDF preview could not load. Use Download to open the original file.';
}
