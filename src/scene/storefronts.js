import * as THREE from 'three';
import { BOX, canvasTex, mk, put } from './materials.js';
import { batchStatic } from './props.js';

/** Four small businesses, each with its own facade, window display, and canopy. */
export function createStorefronts({ M, props }) {
  const names = ['NIGHT SHIFT', 'SIDE A', 'SARI SARI', 'AFTER HOURS'];
  const subtitles = ['COFFEE & COMPANY', 'RECORDS & TAPES', 'YOUR CORNER STORE', 'SKATE SUPPLY'];
  const accents = ['#ffc398', '#8bcbc3', '#e4c979', '#f99786'];
  const walls = [0x384047, 0x31423f, 0x484239, 0x3b3949].map((color) => mk(color, { rough: 0.95 }));
  const frames = mk(0x232c30, { rough: 0.7 });
  const signs = names.map((name, k) => {
    const map = canvasTex(512, 160, (g, w, h) => {
      g.fillStyle = k === 2 ? '#3a3c2d' : '#101d24';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = accents[k];
      g.lineWidth = 2;
      if (k !== 1) g.strokeRect(10, 10, w - 20, h - 20);
      g.textAlign = 'center';
      g.fillStyle = accents[k];
      g.font = k === 1 ? 'italic 800 75px sans-serif' : '700 49px sans-serif';
      g.fillText(name, w / 2, 87, w - 44);
      g.font = '17px monospace';
      g.fillStyle = '#dbd4c3';
      g.fillText(subtitles[k], w / 2, 124);
    });
    return new THREE.MeshBasicMaterial({ map });
  });
  const windows = names.map((_, k) => {
    const map = canvasTex(512, 320, (g, w, h) => {
      const light = g.createLinearGradient(0, 0, 0, h);
      light.addColorStop(0, '#36302c');
      light.addColorStop(0.5, ['#b8875e', '#7f948b', '#a29a71', '#9f796c'][k]);
      light.addColorStop(1, '#222c2b');
      g.fillStyle = light;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#20282b';
      if (k === 0) {
        // Pendant lamps, coffee cups, counter, and stools.
        for (const x of [105, 350]) {
          g.fillRect(x - 2, 0, 4, 66);
          g.beginPath();
          g.moveTo(x - 33, 91);
          g.lineTo(x - 17, 62);
          g.lineTo(x + 17, 62);
          g.lineTo(x + 33, 91);
          g.fill();
          g.fillStyle = '#f4cc8f';
          g.fillRect(x - 24, 92, 48, 4);
          g.fillStyle = '#20282b';
        }
        g.fillRect(0, 228, w, 15);
        for (let x = 62; x < w; x += 105) {
          g.fillRect(x, 260, 58, 10);
          g.fillRect(x + 8, 270, 5, 50);
          g.fillRect(x + 45, 270, 5, 50);
          g.fillStyle = '#e6d5b4';
          g.fillRect(x + 16, 207, 23, 20);
          g.fillStyle = '#20282b';
        }
        g.fillRect(360, 163, 73, 61);
      } else if (k === 1) {
        for (let y = 45; y < 240; y += 90)
          for (let x = 27; x < w; x += 88) {
            g.fillStyle = ['#be775e', '#c2b187', '#628c85'][(x + y) % 3];
            g.fillRect(x, y, 62, 68);
            g.fillStyle = '#192326';
            g.beginPath();
            g.arc(x + 31, y + 34, 23, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#d3b17c';
            g.beginPath();
            g.arc(x + 31, y + 34, 6, 0, Math.PI * 2);
            g.fill();
          }
        g.fillStyle = '#26302c';
        g.fillRect(0, 274, w, 46);
      } else if (k === 2) {
        for (let y = 64; y < 290; y += 76) {
          for (let x = 18; x < w; x += 36) {
            g.fillStyle = ['#b46e54', '#b4ac83', '#638b7b', '#baa15b'][Math.floor(x / 36 + y / 76) % 4];
            g.fillRect(x, y, 24, 44);
            g.fillStyle = '#e3d8b5';
            g.fillRect(x + 4, y + 12, 16, 7);
          }
          g.fillStyle = '#242e2d';
          g.fillRect(0, y + 48, w, 9);
        }
      } else {
        for (let i = 0; i < 5; i++) {
          const x = 35 + i * 95;
          g.fillStyle = ['#d7996f', '#698f88', '#d3b77b', '#af796c', '#70989a'][i];
          g.beginPath();
          g.roundRect(x, 44 + (i % 2) * 20, 43, 190, 22);
          g.fill();
          g.fillStyle = '#243435';
          g.fillRect(x + 3, 104 + (i % 2) * 20, 37, 44);
          g.strokeStyle = '#dbcab1';
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(x + 10, 83);
          g.lineTo(x + 30, 189);
          g.stroke();
        }
      }
      // A faint diagonal reflection keeps the display reading as glass.
      g.fillStyle = 'rgba(196,224,225,.07)';
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(95, 0);
      g.lineTo(330, h);
      g.lineTo(235, h);
      g.fill();
    });
    return new THREE.MeshBasicMaterial({ map });
  });
  const awnings = accents.map((accent) => {
    const map = canvasTex(256, 64, (g, w, h) => {
      g.fillStyle = '#293536';
      g.fillRect(0, 0, w, h);
      g.fillStyle = accent;
      for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 15, h);
      const shade = g.createLinearGradient(0, 0, 0, h);
      shade.addColorStop(0, 'rgba(0,0,0,.35)');
      shade.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = shade;
      g.fillRect(0, 0, w, h);
    });
    const material = mk(0xbab5a8, { rough: 1, ds: true });
    material.map = map;
    return material;
  });
  const menuMap = canvasTex(128, 192, (g, w, h) => {
    g.fillStyle = '#1a292a';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ad8e67';
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#ded3b9';
    g.font = '700 20px monospace';
    g.textAlign = 'center';
    g.fillText('TONIGHT', w / 2, 42);
    for (let y = 70; y < 160; y += 22) {
      g.fillRect(22, y, 48, 3);
      g.fillRect(88, y, 17, 3);
    }
  });
  const menuMaterial = new THREE.MeshBasicMaterial({ map: menuMap });

  function build(w, h, k) {
    const kind = k % 4;
    const group = new THREE.Group();
    group.name = `shop-${names[kind].toLowerCase().replaceAll(' ', '-')}`;
    put(BOX(w, h, 2), walls[kind], group, { p: [0, h / 2, 0], shadow: false });
    put(BOX(w + 0.08, 0.09, 2.08), frames, group, { p: [0, h + 0.02, 0], shadow: false });
    put(BOX(w, 0.18, 0.07), frames, group, { p: [0, 0.09, 1.035], shadow: false });
    const windowW = w * 0.64,
      windowX = -w * 0.13;
    put(new THREE.PlaneGeometry(windowW, 0.8), windows[kind], group, { p: [windowX, 0.64, 1.015], shadow: false });
    for (const x of [windowX - windowW / 2, windowX, windowX + windowW / 2]) {
      put(BOX(0.035, 0.84, 0.06), frames, group, { p: [x, 0.64, 1.052], shadow: false });
    }
    put(BOX(windowW + 0.09, 0.065, 0.13), props.wood, group, { p: [windowX, 0.23, 1.075], shadow: false });
    // Recessed glass door, surround, threshold and handle.
    const doorX = w * 0.345;
    put(BOX(0.47, 1.05, 0.07), frames, group, { p: [doorX, 0.525, 1.04], shadow: false });
    put(BOX(0.36, 0.77, 0.018), M.glass, group, { p: [doorX, 0.61, 1.081], shadow: false });
    put(BOX(0.38, 0.12, 0.02), props.wood, group, { p: [doorX, 0.15, 1.081], shadow: false });
    put(BOX(0.017, 0.17, 0.025), props.chrome, group, { p: [doorX - 0.11, 0.56, 1.105], shadow: false });
    put(BOX(0.62, 0.075, 0.36), M.curb, group, { p: [doorX, 0.08, 1.18], shadow: false });
    const signWidth = Math.min(w * 0.8, 2.6);
    put(new THREE.PlaneGeometry(signWidth, signWidth * 0.3125), signs[kind], group, { p: [-w * 0.03, h - 0.4, 1.06], shadow: false });
    // Shade cloth with a separate valance and exposed supports.
    if (kind !== 3) {
      put(new THREE.PlaneGeometry(windowW + 0.14, 0.55), awnings[kind], group, {
        p: [windowX, 1.13, 1.27],
        r: [-Math.PI / 2 + 0.22, 0, 0],
        shadow: false,
      });
      put(new THREE.PlaneGeometry(windowW + 0.14, 0.1), awnings[kind], group, { p: [windowX, 1.02, 1.54], shadow: false });
      for (const x of [windowX - windowW * 0.45, windowX + windowW * 0.45]) {
        put(BOX(0.02, 0.02, 0.49), frames, group, { p: [x, 1.07, 1.27], r: [0.22, 0, 0], shadow: false });
      }
    } else {
      // Slatted timber surround for the skate shop.
      for (let y = 0.25; y < h - 0.5; y += 0.13) {
        put(BOX(0.13, 0.06, 0.04), props.wood, group, { p: [-w * 0.475, y, 1.04], shadow: false });
      }
    }
    if (kind === 0 || kind === 1) {
      const plant = props.planter();
      plant.position.set(w * 0.44, 0.16, 1.65);
      group.add(plant);
    }
    if (kind === 0) {
      put(new THREE.PlaneGeometry(0.38, 0.54), menuMaterial, group, { p: [-w * 0.31, 0.46, 1.96], r: [-0.12, -0.15, 0], shadow: false });
      for (const x of [-w * 0.31 - 0.19, -w * 0.31 + 0.19])
        put(BOX(0.025, 0.64, 0.025), props.wood, group, { p: [x, 0.43, 1.92], r: [-0.12, 0, 0], shadow: false });
    }
    if (kind === 2) {
      // A small wall vent and a projecting corner-store marker.
      put(BOX(0.38, 0.23, 0.11), M.curb, group, { p: [w * 0.34, h + 0.15, 0.87], shadow: false });
      for (let i = 0; i < 5; i++) put(BOX(0.29, 0.012, 0.015), frames, group, { p: [w * 0.34, h + 0.07 + i * 0.038, 0.94], shadow: false });
    }
    return batchStatic(group);
  }
  return { build, signs };
}
