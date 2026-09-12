/* Desktop arrangement is a browser preference; it never changes source files. */
(() => {
  'use strict';
  const clamp = (value, max) => Math.max(0, Math.min(max, value));
  class DesktopIcons {
    constructor(root) {
      this.root = root;
      this.icons = [...root.querySelectorAll('[data-desktop-key]')];
      this.positions = new Map();
      this.storageKey = `sensei-desktop-layout-v1:${location.pathname}`;
      this.saved = {desktop: {}, mobile: {}};
      try {
        const value = JSON.parse(localStorage.getItem(this.storageKey));
        for (const mode of ['desktop', 'mobile']) {
          for (const [key, point] of Object.entries(value?.[mode] || {})) {
            if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
              this.saved[mode][key] = {x: clamp(point.x, 1), y: clamp(point.y, 1)};
            }
          }
        }
      } catch { /* A missing or unavailable preference uses the default layout. */ }
      root.classList.add('is-arrangeable');
      this.spacer = document.createElement('span');
      this.spacer.className = 'desktop-scroll-space';
      this.spacer.setAttribute('aria-hidden', 'true');
      root.append(this.spacer);
      this.events = new AbortController();
      const listen = (element, type, handler, capture = false) => element.addEventListener(type, handler, {signal: this.events.signal, capture});
      listen(root, 'pointerdown', event => this.start(event));
      listen(root, 'pointermove', event => this.move(event));
      listen(root, 'pointerup', event => this.finish(event, true));
      listen(root, 'pointercancel', event => this.finish(event, false));
      listen(root, 'lostpointercapture', event => this.finish(event, false));
      listen(root, 'dragstart', event => event.preventDefault());
      listen(root, 'click', event => {
        if (event.detail && this.suppressed && performance.now() < this.suppressed.until) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.suppressed = null;
        }
      }, true);
      listen(document, 'keydown', event => this.key(event), true);
      this.icons.forEach(icon => icon.setAttribute('aria-description', 'Drag to move. You can also focus this icon and use Alt + arrow keys.'));
      this.observer = new ResizeObserver(() => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.layout());
      });
      this.observer.observe(root);
      this.icons.forEach(icon => this.observer.observe(icon));
      this.layout();
    }

    bounds(icon) {
      return {x: Math.max(0, this.width - icon.offsetWidth), y: Math.max(0, this.height - icon.offsetHeight)};
    }

    place(icon, x, y) {
      const max = this.bounds(icon);
      const point = {x: clamp(x, max.x), y: clamp(y, max.y)};
      this.positions.set(icon, point);
      icon.style.left = `${point.x}px`;
      icon.style.top = `${point.y}px`;
      return point;
    }

    layout() {
      if (this.drag) this.finish(null, false);
      this.mode = window.innerWidth <= 700 ? 'mobile' : 'desktop';
      this.width = this.root.clientWidth;
      const gap = this.mode === 'mobile' ? 10 : 12;
      const cellWidth = Math.max(1, ...this.icons.map(icon => icon.offsetWidth)) + gap;
      const cellHeight = Math.max(1, ...this.icons.map(icon => icon.offsetHeight)) + gap;
      const columns = Math.max(1, Math.floor((this.width + gap) / cellWidth));
      const rows = Math.max(1, Math.floor((this.root.clientHeight + gap) / cellHeight), Math.ceil(this.icons.length / columns));
      this.height = Math.max(this.root.clientHeight, rows * cellHeight - gap);
      this.spacer.style.height = `${this.height}px`;
      const occupied = [];
      const remember = icon => occupied.push({...this.positions.get(icon), width: icon.offsetWidth, height: icon.offsetHeight});
      for (const icon of this.icons) {
        const point = this.saved[this.mode][icon.dataset.desktopKey];
        if (!point) continue;
        const max = this.bounds(icon);
        this.place(icon, point.x * max.x, point.y * max.y);
        remember(icon);
      }
      const slots = Array.from({length: Math.max(this.icons.length, rows * columns)}, (_, index) => ({
        x: Math.max(0, this.width - cellWidth + gap - Math.floor(index / rows) * cellWidth),
        y: (index % rows) * cellHeight
      }));
      for (const icon of this.icons) {
        if (this.saved[this.mode][icon.dataset.desktopKey]) continue;
        const available = slots.findIndex(point => !occupied.some(other =>
          point.x < other.x + other.width && point.x + icon.offsetWidth > other.x &&
          point.y < other.y + other.height && point.y + icon.offsetHeight > other.y));
        const [point] = slots.splice(available < 0 ? 0 : available, 1);
        this.place(icon, point?.x || 0, point?.y || 0);
        remember(icon);
      }
    }

    start(event) {
      const icon = event.target.closest('[data-desktop-key]');
      if (!icon || event.button !== 0 || !event.isPrimary || this.drag) return;
      this.suppressed = null;
      this.drag = {
        icon, id: event.pointerId, x: event.clientX, y: event.clientY,
        scroll: this.root.scrollTop, origin: {...this.positions.get(icon)}, moved: false
      };
      icon.setPointerCapture(event.pointerId);
    }

    move(event) {
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      event.preventDefault();
      if (!drag.moved) {
        drag.moved = true;
        drag.icon.classList.add('is-dragging');
        drag.icon.focus({preventScroll: true});
      }
      this.place(drag.icon, drag.origin.x + dx, drag.origin.y + dy + this.root.scrollTop - drag.scroll);
    }

    finish(event, commit) {
      const drag = this.drag;
      if (!drag || (event && event.pointerId !== drag.id)) return;
      this.drag = null;
      if (drag.moved) {
        event?.preventDefault();
        this.suppressed = {until: performance.now() + 700};
        if (commit) this.save(drag.icon);
        else this.place(drag.icon, drag.origin.x, drag.origin.y);
      }
      drag.icon.classList.remove('is-dragging');
      if (drag.icon.hasPointerCapture(drag.id)) drag.icon.releasePointerCapture(drag.id);
    }

    save(icon) {
      const point = this.positions.get(icon), max = this.bounds(icon);
      this.saved[this.mode][icon.dataset.desktopKey] = {x: max.x ? point.x / max.x : 0, y: max.y ? point.y / max.y : 0};
      try { localStorage.setItem(this.storageKey, JSON.stringify(this.saved)); } catch { /* Moving still works without storage. */ }
    }

    key(event) {
      if (event.key === 'Escape' && this.drag) {
        this.finish(null, false);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const icon = event.target.closest?.('[data-desktop-key]');
      const directions = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
      if (!icon || !this.root.contains(icon) || !event.altKey || event.ctrlKey || event.metaKey || !directions[event.key]) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const [dx, dy] = directions[event.key], step = event.shiftKey ? 40 : 10, point = this.positions.get(icon);
      this.place(icon, point.x + dx * step, point.y + dy * step);
      this.save(icon);
      icon.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }

    reset() {
      this.finish(null, false);
      this.saved = {desktop: {}, mobile: {}};
      try { localStorage.removeItem(this.storageKey); } catch { /* Optional preference. */ }
      this.root.scrollTop = 0;
      this.layout();
    }

    destroy() {
      this.finish(null, false);
      this.events.abort();
      this.observer.disconnect();
      cancelAnimationFrame(this.frame);
      this.spacer.remove();
      this.root.classList.remove('is-arrangeable');
      this.icons.forEach(icon => { icon.style.left = ''; icon.style.top = ''; });
    }
  }
  window.DesktopIcons = DesktopIcons;
})();
