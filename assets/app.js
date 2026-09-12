/* Sensei NUB Desktop — original, dependency-free interface. Content is generated from Desktop/. */
(() => {
  'use strict';
  const data = window.PORTFOLIO;
  if (!data) { document.body.insertAdjacentHTML('beforeend', '<div class="no-script">Content is missing. Run scripts/build.py to prepare the desktop.</div>'); return; }
  const profile = data.profile;
  document.title=`${profile.alias}’s Desktop — ${profile.name}`;
  document.querySelectorAll('[data-profile]').forEach(el=>{el.textContent=el.dataset.profile==='identity'?`${profile.name} · ${profile.alias}`:profile[el.dataset.profile]||'';});
  document.querySelector('.brand-menu')?.setAttribute('aria-label',`${profile.alias} desktop menu`);
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pathURL = path => path.split('/').map(encodeURIComponent).join('/');
  const safeLink = url => { try { const value = new URL(url); return ['https:', 'http:', 'mailto:'].includes(value.protocol) ? value.href : '#'; } catch { return '#'; } };
  const mail = `mailto:${profile.email}`;
  const store = { get(key, fallback) { try { return localStorage.getItem(`90n-${key}`) || fallback; } catch { return fallback; } }, set(key, value) { try { localStorage.setItem(`90n-${key}`, value); } catch { /* Preferences are optional. */ } } };
  const nodes = new Map();
  const parentOf = path => path.slice(0, path.lastIndexOf('/'));
  function collect(node) { nodes.set(node.path, node); (node.children || []).forEach(collect); }
  collect(data.desktop);
  const totalImages = [...nodes.values()].filter(n => n.kind === 'image' && n.path.startsWith('Desktop/Projects/')).length;
  const projectRoot = nodes.has('Desktop/Projects') ? 'Desktop/Projects' : 'Desktop';
  const displayName = node => data.projects[node.path]?.title || node.name;
  const humanSize = size => size < 1024 ? `${size} bytes` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`;
  const iconPaths = {
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    sliders:'<path d="M4 7h8m5 0h3M4 17h3m5 0h8"/><circle cx="14" cy="7" r="2.5"/><circle cx="9" cy="17" r="2.5"/>',
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12a23 23 0 0 0 18 0M10 13h4"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>',
    tools:'<path d="M14.7 6.3a5.5 5.5 0 0 0-7-3.9l3.4 3.4-3.3 3.3-3.4-3.4a5.5 5.5 0 0 0 7 7l6.8 6.8a2.3 2.3 0 0 0 3.3-3.3l-6.8-6.8a5.5 5.5 0 0 0 0-3.1Z"/><circle cx="19.3" cy="17.9" r=".7"/>',
    terminal:'<path d="m5 7 5 5-5 5m8 0h6"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 8L22 6"/>',
    chat:'<path d="M21 11.5A8.5 8.5 0 0 1 12.5 20H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5z"/><path d="M7 10h10M7 14h6"/>',
    sparkle:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z"/>',
    external:'<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    left:'<path d="m15 5-7 7 7 7"/>', right:'<path d="m9 5 7 7-7 7"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>', minus:'<path d="M5 12h14"/>', maximize:'<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
    grid:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
    list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    play:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3V9z"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    file:'<path d="M14 2H5v20h14V7l-5-5zm0 0v6h5M8 13h8M8 17h6"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    broadcast:'<circle cx="12" cy="9" r="2"/><path d="M6 3a8 8 0 0 0 0 12m12-12a8 8 0 0 1 0 12M8 6a4 4 0 0 0 0 6m8-6a4 4 0 0 1 0 6m-4-1L7 22m5-11 5 11m-8-5h6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 3m0 3h.01"/>',
    keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M7 16h10"/>',
    move:'<path d="M12 2v20M2 12h20m-14-6 4-4 4 4m-8 12 4 4 4-4M6 8l-4 4 4 4m12-8 4 4-4 4"/>',
    desktop:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-5 0h10"/>',
    send:'<path d="m3 3 19 9-19 9 4-9-4-9zm4 9h15"/>',
    music:'<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
    github:'<path d="M9 20c-5 1.5-5-2.5-7-3m14 6v-4a3.5 3.5 0 0 0-1-3c3.3-.4 6.7-1.6 6.7-7.2A5.6 5.6 0 0 0 20.2 5a5.2 5.2 0 0 0-.2-4s-1.3-.4-4.3 1.6a14.8 14.8 0 0 0-7.4 0C5.3.6 4 1 4 1a5.2 5.2 0 0 0-.2 4A5.6 5.6 0 0 0 2.3 8.8C2.3 14.4 5.7 15.6 9 16a3.5 3.5 0 0 0-1 3v4"/>'
  };
  function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`; }
  function folderIcon() {
    const id=`folder-fill-${++graphicId}`;
    return `<svg viewBox="0 0 120 96" fill="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="60" y1="28" x2="60" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="#77d5ff"/><stop offset="1" stop-color="#3aa9eb"/></linearGradient></defs><path d="M7 21a7 7 0 0 1 7-7h29a8 8 0 0 1 6 3l8 9h49a7 7 0 0 1 7 7v47a7 7 0 0 1-7 7H14a7 7 0 0 1-7-7V21Z" fill="#238fce"/><path d="M7 35a7 7 0 0 1 7-7h92a7 7 0 0 1 7 7v45a7 7 0 0 1-7 7H14a7 7 0 0 1-7-7V35Z" fill="url(#${id})"/><path d="M14 29h92a6 6 0 0 1 6 6" stroke="#c6efff" stroke-opacity=".7"/><path d="M8 77v3a6 6 0 0 0 6 6h92a6 6 0 0 0 6-6v-3" stroke="#1688ce" stroke-opacity=".35"/></svg>`;
  }
  const appColors = {about:['#ffcc84','#e9946c'],experience:['#c2936b','#7d523c'],skills:['#64cfca','#178a92'],chat:['#b990f7','#7651de'],contact:['#70c8ff','#267cef'],settings:['#aeb7c4','#667185'],github:['#4d5363','#181c25'],help:['#74b8ff','#427af2'],file:['#ffffff','#dce5f4'],image:['#b5e6c3','#349d84'],music:['#ff879f','#da4b77'],video:['#9379e2','#5240a1']};
  let graphicId = 0;
  function appIcon(name) {
    if (name === 'folder') return folderIcon();
    if (name === 'finder') return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="finder-clip"><rect x="1" y="1" width="62" height="62" rx="13"/></clipPath></defs><g clip-path="url(#finder-clip)"><path d="M0 0h64v64H0z" fill="#78c9ff"/><path d="M35 0h29v64H32V35H23z" fill="#e7f4ff"/><path d="M17 15v9m30-9v9" stroke="#174976" stroke-width="3" stroke-linecap="round"/><path d="M13 40q18 14 38 0" stroke="#174976" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M34 4 26 34h9v25" stroke="#174976" stroke-width="1.5" fill="none" opacity=".8"/></g><rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#ffffff66"/></svg>';
    const colors = appColors[name] || appColors.file;
    const glyph = {about:'user',experience:'briefcase',skills:'tools',chat:'sparkle',contact:'mail',settings:'sliders',github:'github',help:'help',file:'file',image:'image',music:'music',video:'play'}[name] || 'file';
    const id = `app-gradient-${++graphicId}`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect x="1" y="1" width="62" height="62" rx="14" fill="url(#${id})" stroke="#ffffff66"/><svg x="14" y="14" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${name === 'file' ? '#72849c' : '#fff'}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${iconPaths[glyph]}</svg></svg>`;
  }
  const wrapIcon = name => `<span class="icon-wrap">${appIcon(name)}</span>`;
  const fileIcon = node => node.kind === 'folder' ? 'folder' : node.kind === 'audio' ? 'music' : node.kind === 'video' ? 'video' : node.kind === 'image' ? 'image' : 'file';
  iconPaths.skills = iconPaths.tools;
  const apps = {
    about: {name:'Welcome',icon:'about',title:'Welcome to my desktop',render:renderWelcome},
    profile: {name:'About me',icon:'about',title:`About — ${profile.name}`,render:renderProfile},
    finder: {name:'Finder',icon:'finder',title:'Projects',render:renderFinder},
    experience: {name:'Experience',icon:'experience',title:'Experience',render:renderExperience},
    skills: {name:'Skills',icon:'skills',title:'Tools & Skills',render:renderSkills},
    chat: {name:data.assistant.name,icon:'chat',title:`${data.assistant.name} — Portfolio Assistant`,render:renderChat},
    contact: {name:'Contact',icon:'contact',title:'Let’s work together',render:renderContact},
    settings: {name:'System Settings',icon:'settings',title:'System Settings',render:renderSettings},
    help: {name:'Help',icon:'help',title:'A little guide to this desktop',render:renderHelp},
    preview: {name:'Preview',icon:'image',title:'Preview',render:renderPreview},
    document: {name:'TextEdit',icon:'file',title:'Document',render:renderDocument},
    media: {name:'Media',icon:'video',title:'Media',render:renderMedia}
  };
  const windows = new Map();
  const layer = $('#window-layer');
  let z = 10, activeId = null, activeTrigger = null;
  const finder = {path:projectRoot, history:[], query:'', view:store.get('finder-view','grid')};
  const preview = {items:[], index:0,zoom:null};
  let documentNode = null, mediaNode = null;
  const chatHistory = [];
  let aiRuntime, aiModulePromise, chatBusy=false, chatRequest=0, messageId=0;
  let aiState={status:'idle',progress:0,message:'Real AI, running on your device. No API key needed.'};
  const assetBase=new URL('.',document.currentScript.src);
  const assetVersion=new URL(document.currentScript.src).search;
  const profilePhotoURL=()=>pathURL(profile.photo)+(profile.photoVersion?'?v='+profile.photoVersion:'');
  async function getAI(){if(!aiModulePromise)aiModulePromise=import(new URL('ai-runtime.mjs'+assetVersion,assetBase).href).then(runtime=>{aiRuntime=runtime;runtime.subscribe(state=>{aiState=state;updateAIStatus();});return runtime;}).catch(error=>{aiModulePromise=null;throw error;});return aiModulePromise;}
  function aiPanel(){
    const ready=aiState.status==='ready',loading=aiState.status==='loading';
    return `<div class="ai-status-line"><span class="ai-mode ${ready?'ready':''}"><i></i>${ready?'On-device AI':loading?'Preparing AI':'Quick answers'}</span>${ready?'<button data-action="disable-ai">Turn off AI</button>':''}</div>${!ready?`<div class="ai-setup"><p class="ai-description">${esc(aiState.message)}</p>${loading?`<progress max="1" value="${aiState.progress}" aria-label="AI model loading progress"></progress><button class="ai-secondary" data-action="disable-ai">Cancel download</button>`:`<div class="ai-setup-actions"><select id="ai-model" aria-label="AI model size"><option value="balanced" ${aiState.model!=='lite'?'selected':''}>Better answers · ~1 GB</option><option value="lite" ${aiState.model==='lite'?'selected':''}>Smaller model · ~350 MB</option></select><button class="ai-enable" data-action="enable-ai">${aiState.status==='error'?'Retry AI':'Enable AI'}</button></div><small>First use downloads a model. Requires WebGPU; speed and answer quality depend on your device.</small>`}</div>`:`<p class="ai-ready-note">${esc(aiState.message)} · English replies · Messages stay here.</p>`}`;
  }
  function updateAIStatus(){const panel=$('#ai-panel');if(panel)panel.innerHTML=aiPanel();const disclosure=$('#chat-disclosure');if(disclosure)disclosure.textContent=aiState.status==='ready'?'AI-generated from the portfolio. It can make mistakes.':'Quick answers use saved Q&A. Enable AI for natural, context-aware replies.';}
  function stopChat(){chatRequest++;aiRuntime?.stop();if(chatBusy){chatBusy=false;const last=chatHistory.at(-1);if(last?.pending){last.pending=false;last.note='Stopped';if(!last.text){last.text='Reply stopped.';last.error=true;}}}renderApp('chat');}
  async function enableAI(){if(location.protocol==='file:'){aiState={status:'error',message:'Open with Start Portfolio.cmd or GitHub Pages to enable AI. Direct file previews support Quick answers.'};updateAIStatus();return;}try{const model=$('#ai-model')?.value||'balanced';const runtime=await getAI();await runtime.loadModel(model);}catch(error){aiState={status:'error',message:error.message};updateAIStatus();}}
  let toastTimer;
  function toast(message) { const el = $('#toast'); el.textContent = message; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; },3500); }
  let desktopIcons;
  function renderDesktop() {
    desktopIcons?.destroy();
    const order=['Projects','About me','Experience','Skills','Contact','Assistant','Read me.txt'];
    const children=[...data.desktop.children].sort((a,b)=>(order.indexOf(a.name)<0?99:order.indexOf(a.name))-(order.indexOf(b.name)<0?99:order.indexOf(b.name)));
    $('#desktop-apps').innerHTML=children.map(node=>{
      const app=node.app&&apps[node.app],label=app?app.name:node.name;
      return `<button class="desktop-icon" data-desktop-key="${esc(node.path)}" ${app?`data-open="${node.app}"`:`data-path="${esc(node.path)}"`} aria-label="Open ${esc(label)}">${wrapIcon(app?app.icon:fileIcon(node))}<span class="desktop-label">${esc(label)}</span>${!app&&node.kind==='folder'?`<small>${node.children.length} items</small>`:''}</button>`;
    }).join('');
    desktopIcons = new window.DesktopIcons($('#desktop-apps'));
  }
  function sourceFiles(appId) {
    const folder=data.desktop.children.find(node=>node.app===appId);
    return folder?`<div class="source-files"><button class="btn" data-path="${esc(folder.path)}">${icon('folder')}Show files in Finder</button></div>`:'';
  }
  function renderDock() {
    const ids = ['finder','about','experience','skills','chat','contact'];
    const github = profile.links.find(link => link.label === 'GitHub');
    $('#dock').innerHTML = ids.map(id => dockItem(id)).join('') + '<span class="dock-divider" aria-hidden="true"></span>' + (github ? `<a class="dock-item dock-github" href="${esc(safeLink(github.url))}" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub">${wrapIcon('github')}<span class="dock-tooltip">GitHub ${icon('external')}</span></a>` : '') + dockItem('settings');
    updateDock();
  }
  function dockItem(id) { return `<button class="dock-item" data-open="${id}" aria-label="Open ${esc(apps[id].name)}">${wrapIcon(apps[id].icon)}<span class="dock-tooltip">${esc(apps[id].name)}</span></button>`; }
  function updateDock() { $$('.dock-item[data-open]').forEach(el => { const win = windows.get(el.dataset.open); el.classList.toggle('is-open',!!win); el.classList.toggle('is-minimized',!!win?.minimized); }); }
  function focusWindow(id, moveFocus = false) {
    const win = windows.get(id); if (!win) return;
    windows.forEach(w => w.el.classList.remove('is-active'));
    const restoring = win.minimized; win.closing = false;
    win.minimized = false; win.el.hidden = false; win.el.style.zIndex = ++z; win.el.classList.add('is-active'); activeId = id;
    $('#active-app').textContent = apps[id].name;
    if (moveFocus) win.el.focus({preventScroll:true});
    updateDock();
    if (restoring) animateWindow(win, dockFrames(win, id).reverse(), 320);
    else if (win.motion?.playState === 'running' && win.el.classList.contains('is-closing')) { win.motion.cancel(); win.el.classList.remove('is-closing'); }
  }
  function openApp(id, focus = true) {
    if (!apps[id]) return;
    closeMenus();
    if (windows.has(id)) { focusWindow(id, focus); return; }
    const el = document.createElement('section'); el.className = 'window'; el.dataset.app = id; el.setAttribute('role','dialog'); el.setAttribute('aria-label',apps[id].name); el.tabIndex = -1;
    el.innerHTML = `<header class="window-header"><div class="traffic-lights"><button class="traffic close" data-window-action="close" aria-label="Close ${esc(apps[id].name)}">${icon('close')}</button><button class="traffic minimize" data-window-action="minimize" aria-label="Minimize ${esc(apps[id].name)}">${icon('minus')}</button><button class="traffic maximize" data-window-action="maximize" aria-label="Maximize ${esc(apps[id].name)}" aria-pressed="false">${icon('maximize')}</button></div><div class="window-title">${icon(id === 'finder' ? 'folder' : id === 'about' ? 'user' : apps[id].icon)}<span>${esc(apps[id].title)}</span></div><span class="window-header-end">${esc(profile.alias)}</span></header><div class="window-body"></div><div class="resize-handle" aria-hidden="true"></div>`;
    const offset = (windows.size % 4) * 16;
    if (window.innerWidth > 700) {
      const width = Math.min(window.innerWidth - 180, window.innerWidth >= 1400 ? 940 : 880);
      const height = Math.min(layer.clientHeight - 24, 570);
      el.style.cssText = `width:${width}px;height:${height}px;transform:none;left:${Math.max(8,(layer.clientWidth-width)/2+offset)}px;top:${Math.max(8,Math.min(layer.clientHeight-height-8,(layer.clientHeight-height)/2+offset))}px`;
    }
    layer.append(el); windows.set(id,{el,minimized:false,trigger:document.activeElement});
    renderApp(id); setupWindow(el,id); focusWindow(id,focus);
    animateWindow(windows.get(id), [{opacity:0,scale:'.94',translate:'0 14px'},{opacity:1,scale:'1',translate:'0 0'}], 260);
  }
  function renderApp(id) { const win = windows.get(id); if (win) { if(id==='preview')preview.zoom?.destroy(); $('.window-body',win.el).innerHTML = apps[id].render(); if (id === 'finder') updateFinderTitle(); if (id === 'chat') scrollChat(); if (id === 'preview') { updatePreviewTitle(); preview.zoom=new window.PreviewZoom(win.el); const thumbs=$('.preview-thumbs',win.el),selected=$('.preview-thumb.active',win.el); if(thumbs&&selected)thumbs.scrollLeft=Math.max(0,selected.offsetLeft-thumbs.offsetLeft-(thumbs.clientWidth-selected.offsetWidth)/2); } if (id === 'document' && documentNode) setTitle('document',documentNode.name); if (id === 'media' && mediaNode) setTitle('media',mediaNode.name); } }
  function setTitle(id, value) { const el = windows.get(id)?.el; if (el) $('.window-title span',el).textContent = value; }
  function activateNext() { const visible = [...windows.entries()].filter(([,w]) => !w.minimized).sort((a,b) => +b[1].el.style.zIndex - +a[1].el.style.zIndex); if (visible.length) focusWindow(visible[0][0],true); else { activeId=null; $('#active-app').textContent='Finder'; $('#desktop-apps button')?.focus({preventScroll:true}); } }
  function closeWindow(id) {
    const win=windows.get(id); if (!win || win.closing) return;
    if (id === 'chat') stopChat();
    win.closing=true; win.el.classList.add('is-closing');
    const finish=()=>{if(id==='preview'){preview.zoom?.destroy();preview.zoom=null;}win.el.remove();windows.delete(id);updateDock();if(activeId===id)activateNext();if(!activeId&&win.trigger?.isConnected)win.trigger.focus({preventScroll:true});};
    if(win.minimized) { win.motion?.cancel(); finish(); return; }
    animateWindow(win,[{opacity:1,scale:'1'},{opacity:0,scale:'.94'}],180,finish);
  }
  function minimizeWindow(id, activate=true) {
    const win=windows.get(id); if(!win||win.minimized||win.closing)return;
    win.minimized=true;updateDock();
    animateWindow(win,dockFrames(win,id),340,()=>{if(win.minimized)win.el.hidden=true;});
    if(activate)activateNext();
  }
  function maximizeWindow(id) {
    const win=windows.get(id);if(!win||win.closing)return;
    win.motion?.cancel();const before=win.el.getBoundingClientRect();
    const maximized=win.el.classList.toggle('is-maximized');
    $('[data-window-action="maximize"]',win.el).setAttribute('aria-pressed',String(maximized));
    focusWindow(id);const after=win.el.getBoundingClientRect();
    win.el.style.transformOrigin='top left';
    animateWindow(win,[{translate:`${before.left-after.left}px ${before.top-after.top}px`,scale:`${before.width/after.width} ${before.height/after.height}`},{translate:'0 0',scale:'1'}],300,()=>{win.el.style.transformOrigin='';});
  }
  function animateWindow(win, frames, duration, done=()=>{}) {
    win.motion?.cancel();
    if(document.documentElement.dataset.motion==='reduced') { done();return; }
    const animation=win.el.animate(frames,{duration,easing:'cubic-bezier(.22,.7,.2,1)'});
    win.motion=animation;
    animation.onfinish=()=>{if(win.motion===animation){win.motion=null;done();}};
  }
  function dockFrames(win,id) {
    const rect=win.el.getBoundingClientRect();
    const target=$(`#dock [data-open="${id}"]`)||$('#dock [data-open="finder"]');
    const dock=target.getBoundingClientRect();win.el.style.transformOrigin='center';
    return [{opacity:1,scale:'1',translate:'0 0'},{opacity:0,scale:`${Math.max(.06,dock.width/rect.width)} ${Math.max(.06,dock.height/rect.height)}`,translate:`${dock.left+dock.width/2-rect.left-rect.width/2}px ${dock.top+dock.height/2-rect.top-rect.height/2}px`}];
  }
  function setupWindow(el,id) {
    el.addEventListener('pointerdown',() => { if(activeId!==id) focusWindow(id); });
    $('.window-header',el).addEventListener('dblclick',event => { if(!event.target.closest('button')) maximizeWindow(id); });
    el.addEventListener('click',event => { const action=event.target.closest('[data-window-action]')?.dataset.windowAction; if(action==='close') closeWindow(id); if(action==='minimize') minimizeWindow(id); if(action==='maximize') maximizeWindow(id); });
    const bindDrag=(handle,resize=false) => handle.addEventListener('pointerdown',event => {
      if(event.button!==0 || event.target.closest('button') || window.innerWidth<=700 || el.classList.contains('is-maximized')) return;
      event.preventDefault(); windows.get(id)?.motion?.cancel(); const rect=el.getBoundingClientRect(), parent=layer.getBoundingClientRect();
      const startX=event.clientX,startY=event.clientY,left=rect.left-parent.left,top=rect.top-parent.top;
      el.style.transform='none';el.style.left=`${left}px`;el.style.top=`${top}px`;el.style.width=`${rect.width}px`;el.style.height=`${rect.height}px`;
      handle.setPointerCapture(event.pointerId);
      const move=e => { const dx=e.clientX-startX,dy=e.clientY-startY; if(resize){ el.style.width=`${Math.max(Math.min(410,parent.width-16),Math.min(parent.width-left-8,rect.width+dx))}px`;el.style.height=`${Math.max(Math.min(300,parent.height-16),Math.min(parent.height-top-8,rect.height+dy))}px`; } else { el.style.left=`${Math.max(0,Math.min(parent.width-rect.width,left+dx))}px`;el.style.top=`${Math.max(0,Math.min(parent.height-rect.height,top+dy))}px`; } };
      const end=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);};
      handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    });
    bindDrag($('.window-header',el));bindDrag($('.resize-handle',el),true);
  }
  function socialLinks() { return `<div class="social-links">${profile.links.map(link => `<a class="social-link" href="${esc(safeLink(link.url))}" target="_blank" rel="noopener noreferrer">${icon(link.icon)}${esc(link.label)}</a>`).join('')}</div>`; }
  function renderWelcome() {
    return `<div class="welcome-content"><div class="welcome-profile"><img class="profile-photo" src="${esc(profilePhotoURL())}" alt="${esc(profile.name)} at an event" width="225" height="225"><h2>${esc(profile.alias)}</h2><p>${esc(profile.role)}<br>${esc(profile.tagline)}</p><div class="profile-location">${icon('broadcast')}${esc(profile.photoCaption)}</div></div><div class="welcome-copy"><p class="eyebrow">${esc(profile.name)} · HELLO, THAT’S ME</p><h1>${esc(profile.headline)}</h1><p class="intro">${esc(profile.intro)}</p><div class="welcome-actions"><button class="btn primary" data-open="finder">${icon('folder')}Explore projects</button><button class="btn" data-open="contact">Let’s talk ${icon('arrow')}</button></div><div class="welcome-stats">${profile.stats.map(s=>`<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div><button class="welcome-more" data-open="profile">A little more about me ${icon('right')}</button></div></div><footer class="window-footer welcome-footer"><span class="welcome-status">${esc(profile.availability)}</span><span>Made for a closer look. ${icon('sparkle')}</span></footer>`;
  }
  function renderProfile() { return `<article class="document-content"><div class="about-intro"><img src="${esc(profilePhotoURL())}" alt="${esc(profile.name)}"><div><p class="eyebrow">${esc(profile.alias)} · ABOUT ME</p><h1>${esc(profile.name)}</h1><p>${esc(profile.role)} · ${esc(profile.alias)}</p></div></div><p>${esc(profile.bio)}</p><div class="capability-cards">${profile.capabilities.map(card=>`<div class="capability-card">${icon(card.icon)}<h3>${esc(card.title)}</h3><p>${esc(card.description)}</p></div>`).join('')}</div><p class="section-label">FIND ME ELSEWHERE</p>${socialLinks()}${sourceFiles('profile')}</article>`; }
  function renderExperience() { return `<article class="document-content"><div class="document-title">${wrapIcon('experience')}<div><h1>${esc(profile.pages.experience.title)}</h1><p>${esc(profile.pages.experience.subtitle)}</p></div></div><div class="timeline">${profile.experience.map(job=>`<div class="timeline-item"><div class="timeline-date">${esc(job.dates)}</div><div><div class="timeline-company">${esc(job.company)}</div><h2>${esc(job.role)}</h2><p>${esc(job.description)}</p></div></div>`).join('')}</div><div class="experience-note">${icon('broadcast')}${esc(profile.pages.experience.note)}</div>${sourceFiles('experience')}</article>`; }
  function renderSkills() { return `<article class="document-content"><div class="document-title">${wrapIcon('skills')}<div><h1>${esc(profile.pages.skills.title)}</h1><p>${esc(profile.pages.skills.subtitle)}</p></div></div>${profile.skills.map(group=>`<section class="skill-section"><h2>${icon(group.icon)}${esc(group.name)}</h2><div><p>${esc(group.description)}</p><div class="chips">${group.items.map(item=>`<span class="chip">${esc(item)}</span>`).join('')}</div></div></section>`).join('')}${sourceFiles('skills')}</article>`; }
  function renderContact() { return `<article class="contact-content"><div class="contact-heading">${wrapIcon('contact')}<div><h1>${esc(profile.pages.contact.title)}</h1><p>${esc(profile.pages.contact.subtitle)}</p></div></div><p class="contact-lead">${esc(profile.pages.contact.lead)}</p><div class="email-card"><div><small>EMAIL ME</small><a href="${esc(safeLink(mail))}">${esc(profile.email)}</a></div><button class="btn" data-action="copy-email" aria-label="Copy email address">${icon('copy')}Copy</button></div><div class="contact-services">${profile.pages.contact.services.map(service=>`<span class="chip">${esc(service)}</span>`).join('')}</div><a class="btn primary" href="${esc(safeLink(mail))}">${icon('mail')}Start a conversation</a><p class="contact-small">Opens your email app. Include your event dates and production needs.</p><p class="section-label">AROUND THE INTERNET</p>${socialLinks()}${sourceFiles('contact')}</article>`; }
  function updateFinderTitle() { setTitle('finder',displayName(nodes.get(finder.path)||data.desktop)); }
  function navigateFolder(path,back=false) {
    const node=nodes.get(path);if(!node||node.kind!=='folder')return;
    const changed=finder.path!==path, existing=windows.has('finder');
    if(!back&&changed)finder.history.push(finder.path);
    finder.path=path;finder.query='';openApp('finder');renderApp('finder');
    const content=$('.finder-scroll',windows.get('finder').el)||$('#finder-items');
    if(existing&&changed&&content&&document.documentElement.dataset.motion!=='reduced')content.animate([{opacity:.3,translate:`${back?-12:12}px 0`},{opacity:1,translate:'0 0'}],{duration:180,easing:'ease-out'});
  }
  function folderChildren() { const node=nodes.get(finder.path)||data.desktop;const children=node.children||[];const metadata=data.projects[finder.path]; if(metadata?.images){const order=new Map(metadata.images.map((img,i)=>[img.file,i]));return [...children].sort((a,b)=>(order.get(a.name)??999)-(order.get(b.name)??999)||a.name.localeCompare(b.name,undefined,{numeric:true}));}return children; }
  function fileTitle(node) { return data.projects[parentOf(node.path)]?.images?.find(img=>img.file===node.name)?.title?.replace(/^[_\-]+$/,'Event moment').replace(/OVERAL/g,'OVERALL').replace(/PRICEPOOL/g,'PRIZE POOL').replace(/SECOUND/g,'SECOND') || node.name; }
  function renderFinder() {
    const current=nodes.get(finder.path)||data.desktop;
    const metadata=data.projects[finder.path];
    const isDesktop=finder.path==='Desktop';
    const crumbs=finder.path.split('/');
    return `<div class="finder-layout"><aside class="finder-sidebar"><div class="sidebar-label">Favorites</div>${[['Desktop','desktop','Desktop'],[projectRoot,'folder','Projects']].map(([path,ic,label])=>`<button class="sidebar-item ${finder.path===path?'active':''}" data-path="${esc(path)}" aria-label="${label}">${icon(ic)}<span class="sidebar-text">${label}</span></button>`).join('')}${[['profile','user','About me'],['experience','briefcase','Experience'],['skills','tools','Skills'],['contact','mail','Contact']].map(([app,ic,label])=>`<button class="sidebar-item" data-open="${app}" aria-label="${label}">${icon(ic)}<span class="sidebar-text">${label}</span></button>`).join('')}<div class="sidebar-label spaced">Explore</div><button class="sidebar-item" data-open="chat" aria-label="${esc(data.assistant.name)}">${icon('sparkle')}<span class="sidebar-text">${esc(data.assistant.name)}</span></button><div class="sidebar-profile"><img src="${esc(profilePhotoURL())}" alt=""><div><strong>${esc(profile.alias)}</strong><small>Personal portfolio</small></div></div></aside><div class="finder-main"><div class="finder-toolbar"><button class="toolbar-icon" data-action="finder-back" aria-label="Go back" ${finder.history.length?'':'disabled'}>${icon('left')}</button><div class="finder-crumbs">${!isDesktop?`<button data-path="${esc(parentOf(finder.path))}" aria-label="Open parent folder">${esc(crumbs[crumbs.length-2])}</button>${icon('right')}`:''}<span>${esc(isDesktop?'Desktop':current.name==='Projects'?'Projects':metadata?.title||current.name)}</span></div><div class="view-toggle" aria-label="Folder view"><button data-view="grid" class="${finder.view==='grid'?'active':''}" aria-label="Icon view" aria-pressed="${finder.view==='grid'}">${icon('grid')}</button><button data-view="list" class="${finder.view==='list'?'active':''}" aria-label="List view" aria-pressed="${finder.view==='list'}">${icon('list')}</button></div><label class="finder-search">${icon('search')}<input type="search" aria-label="Search this folder" placeholder="Search" value="${esc(finder.query)}"></label></div><div class="finder-scroll ${metadata?'has-project-details':'folder-browser'}">${metadata?`<div class="finder-heading"><div><h2>${esc(metadata?.title || (current.name==='Projects'?'Selected productions':current.name))}</h2><p>${current.name==='Projects'?'A look behind the scenes, one event at a time.':isDesktop?'A few things from my world.':`${current.children.length} items in this folder`}</p></div>${metadata?.link?`<a class="btn" href="${esc(safeLink(metadata.link))}" target="_blank" rel="noopener noreferrer">${icon('play')}Watch broadcast</a>`:''}</div>`:''}${metadata?.description?`<p class="gallery-summary">${esc(metadata.description)}</p>`:''}<div id="finder-items">${renderFinderItems()}</div></div><div class="finder-status" id="finder-status">${current.children.length} items${current.name==='Projects'?` · ${totalImages} production images`:''}</div></div></div>`;
  }
  function renderFinderItems() {
    const children=folderChildren().filter(node=>`${node.name} ${displayName(node)} ${fileTitle(node)}`.toLocaleLowerCase().includes(finder.query.toLocaleLowerCase()));
    if(!children.length)return `<div class="empty-state">${icon(finder.query?'search':'folder')}<h3>${finder.query?'No matching files':'This folder is empty'}</h3><p>${finder.query?'Try another name or clear the search.':'There’s nothing here yet.'}</p></div>`;
    const folders=children.filter(node=>node.kind==='folder');
    const files=children.filter(node=>node.kind!=='folder');
    return (folders.length?`<div class="folder-grid ${finder.view==='list'?'list-view':''}">${folders.map(node=>`<button class="project-folder" title="${esc(displayName(node))}" data-path="${esc(node.path)}" aria-label="Open ${esc(displayName(node))}"><span class="folder-art">${folderIcon()}</span><h3>${esc(displayName(node))}</h3><p>${node.children.length} items</p></button>`).join('')}</div>`:'')+(files.length?`<div class="gallery-grid ${folders.length?'with-folders':''}">${files.map(node=>`<button class="gallery-file" data-path="${esc(node.path)}" aria-label="Open ${esc(node.name)}">${node.kind==='image'?`<img src="${esc(pathURL(node.thumbnail||node.path))}" alt="${esc(fileTitle(node))}" loading="lazy">`:`<span class="file-art">${appIcon(fileIcon(node))}</span>`}<strong>${esc(fileTitle(node))}</strong><small>${esc(node.name)} · ${humanSize(node.size)}</small></button>`).join('')}</div>`:'');
  }
  function openPath(path) { const node=nodes.get(path); if(!node)return; if(node.kind==='folder'){navigateFolder(path);return;} if(node.kind==='image'){preview.items=(nodes.get(parentOf(path))?.children||[]).filter(n=>n.kind==='image');const meta=data.projects[parentOf(path)];if(meta?.images){const order=new Map(meta.images.map((img,i)=>[img.file,i]));preview.items.sort((a,b)=>(order.get(a.name)??999)-(order.get(b.name)??999));}preview.index=preview.items.findIndex(n=>n.path===path);openApp('preview');renderApp('preview');return;}if(node.kind==='text'){documentNode=node;openApp('document');renderApp('document');return;}mediaNode=node;openApp('media');renderApp('media'); }
  function renderPreview() { const node=preview.items[preview.index];if(!node)return '<div class="empty-state">Open an image from a folder.</div>';return `<div class="preview-body"><div class="preview-zoom-toolbar" role="toolbar" aria-label="Image zoom"><div class="preview-zoom-buttons"><button data-zoom="out" aria-label="Zoom out" title="Zoom out (−)" disabled>${icon('minus')}</button><output class="preview-zoom-value" aria-label="Zoom level" aria-live="polite">Loading…</output><button data-zoom="in" aria-label="Zoom in" title="Zoom in (+)" disabled>+</button><span class="zoom-divider" aria-hidden="true"></span><button data-zoom="fit" aria-label="Fit image to window" title="Fit to window (0)" aria-pressed="true" disabled>Fit</button><button data-zoom="actual" aria-label="Actual size, 100 percent" title="Actual size (1)" aria-pressed="false" disabled>100%</button></div><span id="preview-zoom-hint" class="preview-zoom-hint">Scroll or pinch to zoom · Drag to move</span></div><div class="preview-stage"><button class="preview-arrow prev" data-action="prev-image" aria-label="Previous image" ${preview.items.length<2?'disabled':''}>${icon('left')}</button><div class="preview-viewport" tabindex="0" role="region" aria-label="Zoomable image" aria-describedby="preview-zoom-hint"><img class="preview-image" src="${esc(pathURL(node.preview||node.path))}" alt="${esc(fileTitle(node))}" draggable="false"><p class="preview-image-error" role="status" hidden>This image could not load. Try opening it again.</p></div><button class="preview-arrow next" data-action="next-image" aria-label="Next image" ${preview.items.length<2?'disabled':''}>${icon('right')}</button></div><div class="preview-caption"><span class="preview-count">${preview.index+1} / ${preview.items.length}</span><div><strong>${esc(fileTitle(node))}</strong><small>${esc(node.name)} · ${humanSize(node.size)}</small></div><a href="${esc(pathURL(node.path))}" download>${icon('download')}Save image</a></div><div class="preview-thumbs">${preview.items.map((item,i)=>`<button class="preview-thumb ${i===preview.index?'active':''}" data-preview-index="${i}" aria-label="View image ${i+1}: ${esc(fileTitle(item))}" aria-pressed="${i===preview.index}"><img src="${esc(pathURL(item.thumbnail||item.path))}" alt="" loading="lazy"></button>`).join('')}</div></div>`; }
  function updatePreviewTitle(){const node=preview.items[preview.index];if(node)setTitle('preview',node.name);}
  function changeImage(delta,index=null){if(!preview.items.length)return;preview.index=index===null?(preview.index+delta+preview.items.length)%preview.items.length:index;renderApp('preview');}
  function renderDocument(){const node=documentNode;if(!node)return'';return `<div class="textedit-toolbar"><span>${esc(node.name)} · ${humanSize(node.size)}</span><a href="${esc(pathURL(node.path))}" download>${icon('download')}Download</a></div>${node.truncated?'<p class="file-notice">Showing the first 256 KB. Download the file to read it in full.</p>':''}<pre class="text-document" tabindex="0">${esc(node.content||'')}</pre>`;}
  function renderMedia(){const node=mediaNode;if(!node)return'';const url=esc(pathURL(node.path));let body='';if(node.kind==='pdf'){body=`<iframe class="pdf-viewer" src="${location.protocol === 'file:' ? url : 'assets/pdf-viewer.html?file=' + encodeURIComponent(node.path)}" title="${esc(node.name)}"></iframe>`;}else if(node.kind==='audio'||node.kind==='video'){body=`<div class="media-player">${wrapIcon(fileIcon(node))}<h1>${esc(node.name)}</h1><${node.kind} controls preload="metadata" src="${url}" aria-label="${esc(node.name)}">Your browser cannot preview this format.</${node.kind}><p>Playback depends on your browser’s support for this format.</p></div>`;}else{body=`<div class="unsupported-file">${wrapIcon('file')}<h1>${esc(node.name)}</h1><p>This file is available to download. This format doesn’t have an in-desktop preview.</p><a class="btn primary" href="${url}" download>${icon('download')}Download file</a></div>`;}return `<div class="media-layout"><div class="textedit-toolbar"><span>${esc(node.name)} · ${humanSize(node.size)}</span><a href="${url}" download>${icon('download')}Download</a></div>${body}</div>`;}
  function renderSettings(){
    const theme=document.documentElement.dataset.theme, wallpaper=document.documentElement.dataset.wallpaper;
    return `<article class="settings-content"><p class="eyebrow">SYSTEM SETTINGS</p><h1>Make yourself at home.</h1><p>Display, text, and a little change of scenery.</p>${displayControls('settings')}<p class="section-label">Appearance</p><div class="appearance-options">${['light','dark'].map(value=>`<button class="appearance-option" data-theme-value="${value}" aria-pressed="${theme===value}"><span class="appearance-preview"><span class="mini-window"></span></span>${value==='light'?'Light':'Dark'}</button>`).join('')}</div><p class="section-label">Wallpaper</p><div class="wallpaper-options">${['aurora','dusk','midnight'].map(value=>`<button class="wallpaper-option" data-wallpaper-value="${value}" aria-pressed="${wallpaper===value}"><span class="wallpaper-swatch ${value}"></span>${value.charAt(0).toUpperCase()+value.slice(1)}</button>`).join('')}</div><label class="settings-row"><span>Reduce motion<small>Keep window and folder animations to a minimum.</small></span><input type="checkbox" data-preference="motion" ${preferences.motion==='reduced'?'checked':''}></label><button class="btn reset-display" data-action="reset-display">Restore display defaults</button><p class="section-label">Desktop icons</p><p class="desktop-layout-note">Drag app and folder icons to arrange your desktop. Positions are saved in this browser, with separate layouts for phone and desktop.</p><button class="btn" data-action="reset-desktop-layout">Reset desktop layout</button></article>`;
  }
  const preferenceDefaults={brightness:100,textSize:100,font:'system',motion:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'};
  const preferences={...preferenceDefaults};
  const fontFamilies={system:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',clean:'Arial, Helvetica, sans-serif',rounded:'"Trebuchet MS", "Segoe UI", sans-serif'};
  function displayControls(prefix){return `<div class="display-controls"><label class="display-label" for="${prefix}-brightness"><span>☀ &nbsp; Display brightness</span><output data-output="brightness">${preferences.brightness}%</output></label><input id="${prefix}-brightness" aria-label="Display brightness" data-preference="brightness" type="range" min="35" max="100" value="${preferences.brightness}"><label class="display-label" for="${prefix}-textSize"><span>Aa &nbsp; Text size</span><output data-output="textSize">${preferences.textSize}%</output></label><div class="text-size-range"><span>A</span><input id="${prefix}-textSize" aria-label="Text size" data-preference="textSize" type="range" min="90" max="120" step="5" value="${preferences.textSize}"><strong>A</strong></div><label class="display-label font-label" for="${prefix}-font">Font<select id="${prefix}-font" data-preference="font" aria-label="Interface font">${[['system','System'],['clean','Clean'],['rounded','Rounded']].map(([value,label])=>`<option value="${value}" ${preferences.font===value?'selected':''}>${label}</option>`).join('')}</select></label></div>`;}
  function renderControlCenter(){
    $('#control-center').innerHTML=`<div class="control-heading"><h2>Control Center</h2><span>${esc(profile.alias)}</span></div><div class="control-tiles"><button class="control-tile" data-action="toggle-dark" aria-pressed="${document.documentElement.dataset.theme==='dark'}"><span class="control-symbol">◐</span><strong>Dark Mode</strong><small>${document.documentElement.dataset.theme==='dark'?'On':'Off'}</small></button><button class="control-tile" data-action="toggle-motion" aria-pressed="${preferences.motion==='reduced'}"><span class="control-symbol">${icon('sparkle')}</span><strong>Reduce Motion</strong><small>${preferences.motion==='reduced'?'On':'Off'}</small></button></div>${displayControls('control')}<p class="control-note">Adjusts this portfolio’s display. Saved on this browser.</p><button class="control-settings" data-open="settings">System Settings ${icon('right')}</button>`;
  }
  function setPreference(key,value,persist=true){
    if(key==='brightness')value=Math.max(35,Math.min(100,Number(value)||100));
    if(key==='textSize')value=Math.max(90,Math.min(120,Number(value)||100));
    if(key==='font'&&!fontFamilies[value])value='system';
    if(key==='motion')value=value==='reduced'?'reduced':'full';
    preferences[key]=value;if(persist)store.set(key,value);
    if(key==='brightness')$('#display-shade').style.opacity=(100-value)/100;
    if(key==='textSize')document.documentElement.style.fontSize=`${16*value/100}px`;
    if(key==='font')document.documentElement.style.fontFamily=fontFamilies[value];
    if(key==='motion'){document.documentElement.dataset.motion=value;if(value==='reduced')windows.forEach(w=>{try{w.motion?.finish();}catch{}});}
    $$(`[data-preference="${key}"]`).forEach(el=>{if(el.type==='checkbox')el.checked=value==='reduced';else el.value=value;});
    $$(`[data-output="${key}"]`).forEach(el=>el.textContent=`${value}%`);
  }
  function renderHelp(){return `<article class="document-content"><div class="document-title">${wrapIcon('help')}<div><h1>Your backstage pass.</h1><p>A few ways to explore this little desktop.</p></div></div><div class="help-grid"><div class="help-card">${icon('folder')}<h2>Open a folder</h2><p>Click or tap to open an icon; drag it to a new position to arrange the desktop. Your layout stays saved in this browser. Reset it from System Settings. In Finder, open folders to browse images, text, and other files.</p></div><div class="help-card">${icon('move')}<h2>Make some room</h2><p>Drag a window’s title bar to move it. Use the corner to resize. The red, yellow, and green buttons close, minimize, and maximize.</p></div><div class="help-card">${icon('image')}<h2>Look a little closer</h2><p>Open images in Preview. Use +/−, the mouse wheel, or a pinch to zoom; drag to explore details. Fit shows the whole image again. Arrow keys switch images. Text files open in TextEdit.</p></div><div class="help-card">${icon('chat')}<h2>Ask about my work</h2><p>Enable on-device AI for natural replies and follow-up questions. It downloads a model and runs in your browser without an API key. Quick answers are available before AI is loaded.</p></div></div><p class="section-label">Keyboard shortcuts</p><div class="keyboard-row"><span>Search everything</span><kbd>Ctrl / ⌘ K</kbd></div><div class="keyboard-row"><span>Close the front window or search</span><kbd>Esc</kbd></div><div class="keyboard-row"><span>Previous / next image</span><kbd>← / →</kbd></div><div class="keyboard-row"><span>Move a focused desktop icon</span><kbd>Alt + arrow keys</kbd></div><div class="keyboard-row"><span>Move between controls</span><kbd>Tab / Shift Tab</kbd></div></article>`;}
  function renderChat(){return `<div class="chat-layout"><div class="chat-intro">${wrapIcon('chat')}<div><h1>${esc(data.assistant.name)}</h1><p>Your guide to ${esc(profile.name)}’s work</p></div><button class="toolbar-icon" data-path="Desktop/Assistant" aria-label="Show assistant files in Finder" title="Show files in Finder">${icon('folder')}</button><button class="toolbar-icon" data-action="clear-chat" aria-label="Start a new conversation" title="New conversation">${icon('chat')}</button></div><div id="ai-panel" class="ai-panel" aria-live="polite">${aiPanel()}</div><div class="chat-messages" id="chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-busy="${chatBusy}"><div class="chat-message assistant"><span class="message-avatar">${icon('sparkle')}</span><div><span class="message-author">${esc(data.assistant.name)}</span><p>${esc(data.assistant.welcome)}</p></div></div>${chatHistory.map(message=>renderMessage(message)).join('')}${!chatHistory.length?`<div class="chat-suggestions">${data.assistant.suggestions.map(question=>`<button data-question="${esc(question)}">${esc(question)}${icon('arrow')}</button>`).join('')}</div>`:''}</div><div class="chat-composer"><form id="chat-form"><input id="chat-input" placeholder="Ask about projects, skills, or experience…" aria-label="Ask a question" autocomplete="off" maxlength="600" ${chatBusy?'disabled':''} required>${chatBusy?`<button type="button" data-action="stop-chat" aria-label="Stop reply">${icon('close')}</button>`:`<button type="submit" aria-label="Send question">${icon('send')}</button>`}</form><p id="chat-disclosure">${aiState.status==='ready'?'AI-generated from the portfolio. It can make mistakes.':'Quick answers use saved Q&A. Enable AI for natural, context-aware replies.'}</p></div></div>`;}

  function formatChatText(text){return esc(text).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');}
  function renderMessage(message){return `<div class="chat-message ${message.role}" data-message-id="${message.id}">${message.role==='assistant'?`<span class="message-avatar">${icon('sparkle')}</span>`:''}<div><span class="message-author">${message.role==='assistant'?`${esc(data.assistant.name)}${message.mode==='ai'?' · AI':message.mode==='quick'?' · Quick answer':''}`:'You'}</span><p>${formatChatText(message.text||(message.pending?'Thinking…':''))}</p>${message.note?`<small class="message-note">${esc(message.note)}</small>`:''}${message.action?`<button class="chat-action" data-open="${esc(message.action)}">${esc(message.actionLabel||'Explore')}${icon('arrow')}</button>`:''}</div></div>`;}

  function normalize(value){return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}+#]+/gu,' ').trim();}
  const stopWords=new Set(['a','an','the','his','her','he','him','she','is','are','of','to','for','me','you','your','my','i','and','can','does','do','what','how','it','in','on','with','some','please','tell','about','noyon','nazim','90n','sensei','nub']);
  function matchAnswer(input){
    const normalized=normalize(input);const tokens=normalized.split(/\s+/);const meaningful=tokens.filter(token=>!stopWords.has(token));
    const matches=data.assistant.questions.map(qa=>{
      const q=normalize(qa.question);if(q===normalized)return {qa,score:1000};
      const questionTokens=q.split(' ').filter(t=>!stopWords.has(t));let score=0;
      for(const keyword of qa.keywords||[]){const key=normalize(keyword);if(!key)continue; if(key.includes(' ') ? ` ${normalized} `.includes(` ${key} `) : meaningful.includes(key)){score+=key.includes(' ')?7:3;}}
      score+=questionTokens.filter(token=>meaningful.includes(token)).length*2;
      return {qa,score};
    }).sort((a,b)=>b.score-a.score);
    // Unknown subject matter must not inherit an answer merely from a person's name.
    if(matches[0]?.score>=3)return matches[0].qa;
    if(/^(who is|tell me about|about|পরিচয়|কে|ke tumi)/u.test(normalized) && /(noyon|nazim|sensei|nub|90n|you|him|নয়ন|নয়ন|তুমি)/u.test(normalized))return data.assistant.questions.find(q=>q.id==='about');
    return {answer:data.assistant.fallback,action:'contact',actionLabel:'Get in touch'};
  }
  async function askQuestion(value){
    const question=value.trim().slice(0,600);if(!question||chatBusy)return;
    chatHistory.push({id:++messageId,role:'user',text:question});
    if(aiState.status!=='ready'){
      const answer=matchAnswer(question);chatHistory.push({id:++messageId,role:'assistant',mode:'quick',text:answer.answer,action:apps[answer.action]?answer.action:undefined,actionLabel:answer.actionLabel});
      renderApp('chat');$('#chat-input')?.focus();return;
    }
    const history=chatHistory.map(m=>({...m})),reply={id:++messageId,role:'assistant',mode:'ai',text:'',pending:true};
    chatHistory.push(reply);chatBusy=true;const request=++chatRequest;renderApp('chat');
    try{
      const result=await aiRuntime.answer(data,history,text=>{
        if(request!==chatRequest)return;reply.text=text;
        const box=$('#chat-messages'),nearBottom=box&&box.scrollHeight-box.scrollTop-box.clientHeight<90;
        const p=$(`[data-message-id="${reply.id}"] p`);if(p)p.textContent=text||'Thinking…';
        if(nearBottom)scrollChat();
      });
      if(request!==chatRequest)return;
      reply.text=result.text||(result.stopped?'Reply stopped.':'The model did not return an answer. Try rephrasing your question.');
      if(!result.text)reply.error=true;
      if(result.stopped)reply.note='Stopped';else if(result.truncated)reply.note='Reply length limit reached. Ask a follow-up for more detail.';
    }catch(error){if(request!==chatRequest)return;reply.error=true;reply.note=error.message;reply.text=reply.text||'I couldn’t finish that reply. Please try again.';}
    finally{if(request===chatRequest){reply.pending=false;chatBusy=false;renderApp('chat');$('#chat-input')?.focus();}}
  }
  function scrollChat(){const box=$('#chat-messages',windows.get('chat')?.el);if(box)box.scrollTop=box.scrollHeight;}
  function closeMenus(){['system-menu','window-menu','control-center'].forEach(id=>{$(`#${id}`).hidden=true;});$$('[aria-controls="system-menu"],[aria-controls="window-menu"],[aria-controls="control-center"]').forEach(el=>el.setAttribute('aria-expanded','false'));}
  function toggleMenu(id){if(id==='control-center')renderControlCenter();const menu=$(`#${id}`);const opening=menu.hidden;closeMenus();if(id==='window-menu'){menu.innerHTML='<button data-action="show-desktop">Show desktop</button><button data-action="restore-windows">Restore all windows</button><hr><div class="dropdown-label">OPEN WINDOWS</div>'+([...windows].map(([app,w])=>`<button data-open="${app}">${esc(apps[app].name)}<span>${w.minimized?'Minimized':activeId===app?'Active':'Open'}</span></button>`).join('')||'<div class="dropdown-label">No windows open</div>');}menu.hidden=!opening;$(`[aria-controls="${id}"]`)?.setAttribute('aria-expanded',String(opening));}
  const spotlight=$('#spotlight');let searchIndex=0,searchMatches=[];
  function openSearch(){activeTrigger=document.activeElement;closeMenus();if(!spotlight.open)spotlight.showModal();$('#spotlight-input').value='';renderSearch('');$('#spotlight-input').focus();}
  function closeSearch(){spotlight.close();activeTrigger?.isConnected&&activeTrigger.focus({preventScroll:true});}
  function renderSearch(query){const q=normalize(query);searchMatches=[...Object.entries(apps).filter(([id])=>!['preview','document','media'].includes(id)).map(([id,app])=>({name:app.name,subtitle:'Application',icon:app.icon,app:id,terms:app.name+' '+(id==='skills'?profile.skills.flatMap(g=>g.items).join(' '):'')})),...[...nodes.values()].filter(n=>n.path!=='Desktop').map(node=>({name:displayName(node),subtitle:parentOf(node.path),icon:fileIcon(node),path:node.path,terms:node.name+' '+displayName(node)}))].filter(item=>!q||normalize(item.terms).includes(q)).slice(0,24);searchIndex=0;$('#search-results').innerHTML=searchMatches.length?searchMatches.map((item,i)=>`<button class="search-result ${i===0?'active':''}" data-search-index="${i}">${wrapIcon(item.icon)}<span><strong>${esc(item.name)}</strong><small>${esc(item.subtitle)}</small></span>${icon('arrow')}</button>`).join(''):`<div class="empty-state">${icon('search')}<h3>No results found</h3><p>Try a project name, skill, or file name.</p></div>`;}
  function openSearchResult(index){const item=searchMatches[index];if(!item)return;closeSearch();if(item.app)openApp(item.app);else openPath(item.path);}
  function setTheme(theme){document.documentElement.dataset.theme=theme;store.set('theme',theme);renderApp('settings');renderControlCenter();}
  document.documentElement.dataset.theme=store.get('theme','light');document.documentElement.dataset.wallpaper=store.get('wallpaper','aurora');document.documentElement.dataset.motion=store.get('motion',window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full');
  document.addEventListener('click',async event=>{
    const target=event.target.closest('button,a');
    if(!event.target.closest('.dropdown')&&!event.target.closest('[aria-controls]'))closeMenus();
    if(!target)return;
    if(target.dataset.open){if(target.dataset.open==='finder'&&!target.closest('#dock,#window-menu'))navigateFolder(projectRoot);else openApp(target.dataset.open);}
    if(target.dataset.path)openPath(target.dataset.path);
    if(target.dataset.view){finder.view=target.dataset.view;store.set('finder-view',finder.view);renderApp('finder');}
    if(target.dataset.previewIndex!==undefined)changeImage(0,Number(target.dataset.previewIndex));
    if(target.dataset.themeValue)setTheme(target.dataset.themeValue);
    if(target.dataset.wallpaperValue){document.documentElement.dataset.wallpaper=target.dataset.wallpaperValue;store.set('wallpaper',target.dataset.wallpaperValue);renderApp('settings');}
    if(target.dataset.question)askQuestion(target.dataset.question);
    if(target.dataset.searchIndex!==undefined)openSearchResult(Number(target.dataset.searchIndex));
    switch(target.dataset.action){
      case 'control-center':toggleMenu('control-center');break;
      case 'toggle-dark':setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');break;
      case 'toggle-motion':setPreference('motion',preferences.motion==='full'?'reduced':'full');renderControlCenter();renderApp('settings');break;
      case 'reset-desktop-layout':desktopIcons.reset();toast('Desktop icons returned to their original positions.');break;
      case 'reset-display':Object.entries(preferenceDefaults).forEach(([key,value])=>setPreference(key,value));renderApp('settings');renderControlCenter();break;
      case 'system-menu':toggleMenu('system-menu');break;
      case 'window-menu':toggleMenu('window-menu');break;
      case 'spotlight':openSearch();break;
      case 'close-search':closeSearch();break;
      case 'show-desktop':windows.forEach((win,id)=>minimizeWindow(id,false));activateNext();break;
      case 'restore-windows':windows.forEach((win,id)=>focusWindow(id));break;
      case 'finder-back':if(finder.history.length)navigateFolder(finder.history.pop(),true);break;
      case 'prev-image':changeImage(-1);break;
      case 'next-image':changeImage(1);break;
      case 'enable-ai':enableAI();break;
      case 'disable-ai':stopChat();aiRuntime?.cancel();break;
      case 'stop-chat':stopChat();break;
      case 'clear-chat':stopChat();chatHistory.length=0;renderApp('chat');break;
      case 'copy-email':try{await navigator.clipboard.writeText(profile.email);toast('Email address copied.');}catch{toast(`Email: ${profile.email}`);}break;
    }
  });
  document.addEventListener('input',event=>{if(event.target.dataset.preference&&event.target.type==='range')setPreference(event.target.dataset.preference,event.target.value);if(event.target.matches('.finder-search input')){finder.query=event.target.value;$('#finder-items').innerHTML=renderFinderItems();const count=folderChildren().filter(node=>`${node.name} ${displayName(node)} ${fileTitle(node)}`.toLocaleLowerCase().includes(finder.query.toLocaleLowerCase())).length;$('#finder-status').textContent=`${count} item${count===1?'':'s'}${finder.query?' found':''}`;}if(event.target.id==='spotlight-input')renderSearch(event.target.value);});
  document.addEventListener('change',event=>{if(event.target.dataset.preference){setPreference(event.target.dataset.preference,event.target.type==='checkbox'?(event.target.checked?'reduced':'full'):event.target.value);renderControlCenter();}if(event.target.id==='reduce-motion'){const value=event.target.checked?'reduced':'full';document.documentElement.dataset.motion=value;store.set('motion',value);}});
  document.addEventListener('submit',event=>{if(event.target.id==='chat-form'){event.preventDefault();askQuestion($('#chat-input').value);}});
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();spotlight.open?closeSearch():openSearch();return;}
    if(spotlight.open){if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!searchMatches.length)return;searchIndex=(searchIndex+(event.key==='ArrowDown'?1:-1)+searchMatches.length)%searchMatches.length;$$('.search-result').forEach((el,i)=>el.classList.toggle('active',i===searchIndex));$('.search-result.active')?.scrollIntoView({block:'nearest'});}if(event.key==='Enter'){event.preventDefault();openSearchResult(searchIndex);}return;}
    const editing=event.target.matches('input,textarea,[contenteditable="true"]');
    if(event.key==='Escape'){const openMenu=$$('.dropdown').some(el=>!el.hidden);if(openMenu)closeMenus();else if(activeId)closeWindow(activeId);}
    if(!editing&&activeId==='preview'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&preview.zoom?.key(event.key)){event.preventDefault();return;}
    if(!editing&&activeId==='preview'&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();changeImage(event.key==='ArrowLeft'?-1:1);}
  });
  spotlight.addEventListener('cancel',event=>{event.preventDefault();closeSearch();});
  spotlight.addEventListener('click',event=>{if(event.target===spotlight){const rect=spotlight.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeSearch();}});
  window.addEventListener('resize',()=>{if(window.innerWidth<=700)return;windows.forEach(({el})=>{if(el.hidden||el.classList.contains('is-maximized'))return;const rect=el.getBoundingClientRect(),parent=layer.getBoundingClientRect();if(el.style.transform==='none'){el.style.width=`${Math.min(rect.width,parent.width-20)}px`;el.style.height=`${Math.min(rect.height,parent.height-25)}px`;el.style.left=`${Math.max(5,Math.min(rect.left,parent.width-el.offsetWidth-5))}px`;el.style.top=`${Math.max(5,Math.min(rect.top-parent.top,parent.height-el.offsetHeight-8))}px`;}});});
  function clock(){const now=new Date();$('#menu-clock').dateTime=now.toISOString();$('#menu-clock').textContent=new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(now).replace(',','');}
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));Object.entries(preferenceDefaults).forEach(([key,value])=>setPreference(key,store.get(key,value),false));renderControlCenter();renderDesktop();renderDock();clock();setInterval(clock,30000);openApp('about',false);
})();

