/* ------------------------------------------------------------
   KIM MINCHAN Portfolio
   1) 화면 배율 계산   2) 공구 배치   3) 가로 이동   4) 마우스에 반응하는 공구
------------------------------------------------------------ */
(() => {
  const W = 1920, H = 1080;
  const IDS = ['home', 'about', 'work', 'process', 'contact'];
  const FILES = { h: 'hammer', p: 'pliers', d: 'driver', w: 'wrench', s: 'saw', l: 'level', t: 'tape' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ----- 공구 위치 데이터 -----
     종류, 가운데 x, 가운데 y, 각도, 너비, 높이, (F = 좌우 반전)
     Figma 시안의 값을 그대로 옮긴 것입니다. 순서는 아래에 깔리는 순서입니다. */
  const DATA = {
    home: `
      /* 양옆과 아래 가운데에 더한 공구 */
      h,119,430,-122,102.9,154.4,F t,107,705,-179,104.5,104.5 p,204,658,-76,100.7,151.1,F d,177,438,-129,100.8,151.3
      w,214,516,-136,108.5,162.7,F s,72,553,95,268.0,176.9 h,1887,343,118,106.8,160.2 l,1858,493,-136,258.5,145.5,F
      t,1772,345,115,111.3,111.3 p,1814,640,-84,99.0,148.5,F d,1727,727,4,95.6,143.5 w,1966,510,-178,93.5,140.3,F
      w,1199,981,177,94.6,141.8
      p,1485,891,64,96.3,144.4 d,679,1098,-167,89.7,134.6 w,427,879,-168,105.3,157.9
      /* 양옆을 더 채운 공구 */
      t,50,763,59,108.5,108.5,F h,154,677,26,102.4,153.5 p,120,600,-44,95.6,143.4 d,37,494,-177,102.3,153.5 w,1890,404,-169,93.7,140.6 l,1805,693,41,296.2,166.8,F h,1736,528,81,108.0,161.9,F p,1724,367,-78,92.6,139.0
      /* 아래 가운데와 오른쪽 아래의 빈틈을 채운 공구 */
      t,1320,1108,-152,92.8,92.8 p,958,956,-91,100.8,151.2 h,1117,1109,48,97.9,146.8,F p,1604,927,-10,95.1,142.6,F d,1717,1110,-113,102.5,153.8 w,1724,1007,36,105.6,158.5,F l,1923,871,33,251.3,141.5 h,1646,837,57,97.2,145.9
      /* 진행바 뒤에 뭉친 공구 */
      h,928,1099,90,116.4,174.7,F t,834,984,171,100.1,100.1
      w,1087,1006,169,104.6,156.9 s,1039,1053,-18,231.0,152.4,F h,837,1057,166,115.9,173.9 l,681,1016,-145,259.6,146.2,F
      t,762,1087,161,97.2,97.2 p,1182,1040,-19,97.9,146.8
      /* 아래쪽 가운데에 뭉친 공구 */
      d,492,914,175,102.4,153.6 t,1247,950,152,108.5,108.5,F
      h,1386,900,128,102.3,153.4 t,1308,955,-134,91.8,91.8,F l,350,826,17,252.2,142.0,F
      h,616,964,-113,112.6,169.0,F w,346,957,-71,115.1,172.7
      /* 위쪽 가운데에 뭉친 공구 */
      p,1324,124,98,95.2,142.8,F h,1263,111,-79,105.7,158.5 w,991,89,-26,93.5,140.2
      t,642,120,-86,107.4,107.4 s,1324,60,88,247.2,163.1,F h,927,121,-74,123.6,185.4,F p,1139,65,-90,96.9,145.4
      l,856,69,-9,297.1,167.3 t,1052,71,162,104.0,104.0,F w,703,79,-38,102.1,153.2
      p,915,55,-125,96.9,145.3,F
      /* 가장자리에 뭉쳐 있는 공구. 글자 주변은 비워 둡니다 */
      h,1946,728,82,119.0,178.5,F p,476,75,39,112.2,168.3,F d,202,387,28,90.1,135.2 w,-34,254,8,94.8,142.1,F
      t,178,294,-103,100.0,100.0,F h,123,64,-74,118.3,177.4 p,247,777,106,103.0,154.4 d,318,894,6,99.2,148.9
      w,398,221,-133,98.6,147.9,F t,1461,1029,126,91.8,91.8 s,1479,166,-10,246.8,162.9,F l,1416,153,-91,247.4,139.3
      h,-62,355,-57,121.5,182.2 p,1810,584,-97,110.8,166.2 d,51,250,150,110.6,166.0 w,1726,653,152,98.2,147.3
      t,1552,1045,-102,111.0,111.0 p,1594,247,-116,98.6,147.8 d,1797,754,-132,91.4,137.2,F
      w,483,985,-36,94.8,142.3,F t,1929,237,101,107.7,107.7 s,1192,94,-176,228.5,150.8 l,239,973,-55,293.3,165.1
      h,1982,951,101,110.8,166.2 p,1389,88,-15,103.8,155.7 d,1823,871,-148,103.0,154.5 w,1897,1052,35,108.6,162.9,F
      t,297,228,49,109.0,109.0 h,586,1055,27,113.1,169.7 p,1903,638,143,101.1,151.7 d,1475,228,137,104.8,157.1
      w,1658,127,75,98.1,147.1 t,1860,794,20,97.8,97.8 s,11,178,-95,286.9,189.4 l,1828,57,-38,283.4,159.5
      h,1751,206,160,109.6,164.5,F p,182,757,-160,101.5,152.3 d,1966,117,-179,98.3,147.4 w,562,119,102,102.1,153.1,F
      t,1947,350,43,91.8,91.8 h,1456,953,89,98.8,148.2 p,-36,1090,-144,104.6,156.9 d,1826,1067,-40,103.6,155.4
      w,508,1077,95,115.5,173.3,F t,-18,595,0,102.6,102.6 s,1867,157,-98,248.5,164.0,F
      d,-2,59,92,91.7,137.6 w,113,775,37,97.9,146.9
      t,1792,523,-86,95.3,95.3 h,1539,99,103,103.3,155.0 p,1824,960,-45,109.7,164.5,F d,758,108,-46,96.1,144.2
      w,368,1054,118,106.8,160.1 t,1896,537,-102,94.0,94.0,F s,1797,117,-117,250.3,165.2,F l,1889,979,26,276.6,155.7
      h,1750,279,19,114.9,172.4 p,1925,461,-21,106.9,160.4,F d,405,155,-25,101.3,152.0 w,1731,902,-83,113.4,170.1,F
      t,771,975,-25,96.2,96.2,F h,120,509,140,107.9,161.8 p,293,1116,-62,108.1,162.1 d,1836,382,155,113.1,169.6
      w,556,958,103,111.4,167.0,F t,-52,936,-2,107.5,107.5,F s,1699,62,-15,278.1,183.5 l,342,143,-56,292.2,164.5,F
      h,151,825,-138,102.3,153.5 p,-41,822,-87,112.2,168.3,F d,1763,469,23,104.1,156.2 w,1620,1050,30,95.4,143.1
 t,1741,806,79,109.2,109.2 h,417,947,40,115.9,173.8,F p,37,895,16,93.2,139.7,F `,
    about: `
      t,1566,769,10,110,110 h,892,808,35,93.6,140.4 p,289,757,160,93.5,140.3,F l,1252,781,-9,249.4,140.2
      w,1784,781,-40,92.7,139.4 s,585,757,-8,228.8,152.2 d,150,950,-12,93.5,140.3 t,330,975,10,110,110
      h,500,940,35,93.6,140.4 p,690,965,160,93.5,140.3,F l,900,960,6,249.4,140.2 w,1110,950,-40,92.7,139.4
      s,1330,960,-8,228.8,152.2 h,1540,945,-155,93.6,140.4,F d,1700,960,60,93.5,140.3 p,1850,930,-15,93.5,140.3`,
    work: ``,
    detail: ``,
    process: ``,
    contact: `
      d,170,151,0,72,108 t,320,148,0,95,95 h,470,151,0,72,108 p,620,151,0,72,108 l,770,122,0,145.8,82
      w,920,151,-180,71.8,108,F s,1070,130,0,145.2,96.6 d,1220,151,0,72,108 t,1370,148,0,95,95
      h,1520,151,-180,72,108,F p,1670,151,0,72,108
      p,170,276,0,72,108 l,320,247,0,145.8,82 w,470,276,-180,71.8,108,F s,620,255,0,145.2,96.6
      d,770,276,0,72,108 t,920,273,0,95,95 h,1070,276,-180,72,108,F p,1220,276,0,72,108
      d,1370,276,0,72,108 t,1520,273,0,95,95 h,1670,276,-180,72,108,F
      s,170,780,0,145.2,96.6 d,320,801,0,72,108 t,470,798,0,95,95 h,620,801,-180,72,108,F
      p,770,801,0,72,108 d,920,801,0,72,108 t,1070,798,0,95,95 h,1220,801,-180,72,108,F
      p,1370,801,0,72,108 l,1520,772,0,145.8,82 w,1670,801,0,71.8,108
      h,170,923,-180,72,108,F p,320,923,0,72,108 d,470,923,0,72,108 t,620,920,0,95,95
      h,770,923,-180,72,108,F p,920,923,0,72,108 l,1070,894,0,145.8,82 w,1220,923,0,71.8,108
      s,1370,902,0,145.2,96.6 d,1520,923,0,72,108 t,1670,920,0,95,95`
  };

  const parse = str => str.replace(/\/\*[\s\S]*?\*\//g, '').trim().split(/\s+/).filter(Boolean).map(it => {
    const a = it.split(',');
    return { k: a[0], cx: +a[1], cy: +a[2], deg: +a[3], w: +a[4], h: +a[5], flip: a[6] === 'F' };
  });

  /* ----- 1. 화면 배율 ----- */
  const root = document.documentElement;
  const resize = () => {
    const s = Math.min(innerWidth / W, innerHeight / H);
    root.style.setProperty('--s', s.toFixed(4));
    root.style.setProperty('--sc', Math.max(innerWidth / W, innerHeight / H).toFixed(4));
  };
  addEventListener('resize', resize);
  resize();

  /* ----- 2. 공구 배치 ----- */
  /* 자리 표시: 판 전체에 반듯한 간격으로 공구의 '제자리'를 그림자처럼 깔아 둡니다.
     공구가 쌓여 있을 때는 거의 보이지 않고, 공구가 비켜나면 비어 있던 자리가 드러납니다. */
  function buildGhosts(layer) {
    const kinds = ['d', 't', 'h', 'p', 'l', 'w', 's'];
    const size = { d: [72, 108], t: [95, 95], h: [72, 108], p: [72, 108], l: [146, 82], w: [72, 108], s: [145, 97] };
    const box = document.createElement('div');
    box.className = 'ghosts';
    box.setAttribute('aria-hidden', 'true');
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        const k = kinds[(c + r * 3) % kinds.length], [w, h] = size[k];
        const img = document.createElement('img');
        img.src = `assets/tools/${FILES[k]}.png`;
        img.alt = '';
        img.draggable = false;
        img.style.cssText = `left:${170 + c * 150 - w / 2}px;top:${130 + r * 125 - h / 2}px;width:${w}px;height:${h}px`;
        box.appendChild(img);
      }
    }
    layer.appendChild(box);
    ghostBox = box;
  }
  let ghostBox = null;

  const panels = IDS.map(id => document.getElementById('p-' + id));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- 세로 넘김 (WORK, PROCESS) -----
     가로 이동은 그대로이고, 이 판들 안에서만 내용이 한 장씩 위아래로 바뀝니다.
     한 장에 항목 하나만 보이므로 왼쪽 목록의 켜진 항목도 항상 하나입니다. */
  const WORK = IDS.indexOf('work'), PROCESS = IDS.indexOf('process');
  function makePager(idx, fade, onLand) {
    const panel = panels[idx];
    const wl = panel.querySelector('.worklist');
    const buttons = [...panel.querySelectorAll('.wl-index button')];
    const cases = [...wl.querySelectorAll('.case, .pcase')];
    const inner = wl.querySelector('.wl-inner');
    let i = 0, y = 0, target = 0, anim = false, y0 = 0, t0 = 0, dur = 0;
    const apply = () => { inner.style.transform = `translateY(${-y.toFixed(2)}px)`; };
    function setOn(k) {
      i = k;
      cases.forEach((el, n) => el.classList.toggle('on', n === k));
      buttons.forEach((b, n) => b.classList.toggle('on', n === k));
    }
    const pg = {
      cases, get i() { return i; },
      lock: fade ? 1200 : 1000,
      show(k) {
        k = clamp(k, 0, cases.length - 1);
        const from = i;
        setOn(k);
        if (fade) return;
        if (onLand && k !== from) onLand(cases[k], k > from ? 1 : -1);                       // 겹쳐 놓고 서서히 바뀌는 판은 위치를 옮기지 않습니다
        target = k * wl.clientHeight;
        if (reduce) { y = target; apply(); return; }
        y0 = y; t0 = performance.now();
        dur = 780 + Math.min(Math.abs(target - y) / wl.clientHeight, 4) * 140;
        anim = true;
      },
      jump(k) { k = clamp(k, 0, cases.length - 1); setOn(k); if (fade) return; target = y = k * wl.clientHeight; anim = false; apply(); },
      reset() { y = 0; target = 0; anim = false; apply(); setOn(0); },
      tick() {
        if (!anim) return;
        const p = Math.min(1, (performance.now() - t0) / dur);
        const c1 = 0.95, c3 = c1 + 1, q = p - 1;
        y = y0 + (target - y0) * (1 + c3 * q * q * q + c1 * q * q);        // 빠르게 붙었다가 살짝 지나쳐 앉습니다
        if (p >= 1) { y = target; anim = false; }
        apply();
      }
    };
    buttons.forEach((b, k) => b.addEventListener('click', () => pg.show(k)));
    cases.forEach((el, k) => el.addEventListener('focus', () => { if (k !== i) pg.show(k); }));
    wl.addEventListener('scroll', () => { wl.scrollTop = 0; });   // 초점 이동으로 브라우저가 멋대로 밀지 않게 합니다
    setOn(0);
    return pg;
  }
  const pagers = {};
  // 작업이 한 장 넘어와 자리를 잡을 때쯤, 걸려 있는 화면이 걸이를 축으로 살짝 흔들리다 가라앉습니다
  pagers[WORK] = makePager(WORK, false, (el, sign) => {
    const fr = el.querySelector('.frames');
    swing(fr, swingFrames(sign, 0, 0, 26, 2.5), 2.5, 300);
    swingShots(fr, sign, 8, 3.0, 340);
  });
  pagers[PROCESS] = makePager(PROCESS, true);

  const detail = document.getElementById('detail');
  const toolPanels = [...panels, detail];
  const toolKeys = [...IDS, 'detail'];
  toolPanels.forEach((panel, pi) => {
    const mode = panel.dataset.mode;
    const layer = panel.querySelector('.tools');
    if (panel.id === 'p-home') buildGhosts(layer);
    panel._tools = parse(DATA[toolKeys[pi]]).map((d, i) => {
      const el = document.createElement('div');
      el.className = 'tool' + (mode === 'hang' ? ' hang' : '');
      el.style.cssText = `left:${d.cx - d.w / 2}px;top:${d.cy - d.h / 2}px;width:${d.w}px;height:${d.h}px`;
      const img = document.createElement('img');
      img.src = `assets/tools/${FILES[d.k]}.png`;
      img.alt = '';
      img.draggable = false;
      img.setAttribute('aria-hidden', 'true');
      // Figma 각도(반시계) -> CSS 각도(시계). 반전된 공구는 세로로 한 번 뒤집습니다.
      img.style.transform = `rotate(${-d.deg}deg)${d.flip ? ' scaleY(-1)' : ''}`;
      const drop = document.createElement('div');           // 판이 들어올 때 공구가 걸리는 모션은 이 층에서 처리
      drop.className = 'drop';
      drop.style.setProperty('--i', i);
      drop.appendChild(img);
      el.appendChild(drop);
      layer.appendChild(el);
      const r1 = Math.abs(Math.sin((i + 1) * 12.9898 + pi * 78.233) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin((i + 1) * 39.3468 + pi * 11.135) * 24634.6345) % 1;
      const mass = clamp(Math.max(d.w, d.h) / 150, 0.8, 1.7);       // 큰 공구일수록 덜 움직입니다
      return { el, ...d, ox: 0, oy: 0, vx: 0, vy: 0, rot: 0, vrot: 0, theta: 0, omega: 0, dirty: false,
               mass, spin: (r1 < 0.5 ? -1 : 1) * (0.6 + r2 * 0.8), reach: 0.8 + r1 * 0.5 };
    });
  });

  // 주소창 #값 때문에 브라우저가 화면을 멋대로 스크롤하지 않도록 고정
  addEventListener('scroll', () => { scrollTo(0, 0); document.body.scrollLeft = 0; root.scrollLeft = 0; }, true);

  /* ----- 3. 가로 이동 ----- */
  const track = document.getElementById('track');
  const links = [...document.querySelectorAll('.nav nav a')];
  const bar = document.querySelector('.progress i');
  const prev = document.querySelector('.arrow.prev');
  const next = document.querySelector('.arrow.next');
  let cur = 0;
  let detailOpen = false;
  let dir = 1;               // 마지막으로 넘긴 방향 (1: 오른쪽으로, -1: 왼쪽으로)

  /* 걸리는 모션
     떨어질 때는 점점 빨라지고(중력), 페그에 걸리는 순간 흔들림이 시작되어 점점 줄어듭니다.
     이 곡선을 촘촘하게 계산해서 넣기 때문에 구간마다 끊기지 않고 이어집니다. */
  function hangFrames({ drop, tilt, swing, damping, hz, land, secs }) {
    const N = 90, frames = [];
    for (let n = 0; n <= N; n++) {
      const t = n / N;
      let y, a, o;
      if (t < land) {                       // 떨어지는 중
        const u = t / land;
        y = -drop * (1 - u * u);            // 점점 빨라지며 내려옴
        a = tilt * (1 - u);                 // 처음의 비스듬함이 점점 풀림
        o = Math.min(1, u * 5);
      } else {                              // 걸린 뒤 흔들림
        const tau = (t - land) * secs;
        const decay = Math.exp(-damping * tau);
        a = swing * decay * Math.sin(2 * Math.PI * hz * tau);
        y = -3 * Math.exp(-7 * tau) * Math.sin(2 * Math.PI * 2.4 * tau);   // 걸릴 때 살짝 처졌다 올라옴
        o = 1;
      }
      frames.push({ offset: t, opacity: o, transform: `translateY(${y.toFixed(2)}px) rotate(${a.toFixed(3)}deg)` });
    }
    return frames;
  }
  function playHang(el, delaySec, opts) {
    el.animate(hangFrames(opts), { duration: opts.secs * 1000, delay: delaySec * 1000, fill: 'both', easing: 'linear' });
  }
  /* 걸려 있는 작업 화면이 그 속도에 끌려오듯 들어오는 모션
     판이 옆으로 넘어오면 작업 화면이 걸이(위쪽 가운데)에 매달린 채 끌려 들어오고, 살짝 지나쳤다가 제자리에 앉은 뒤
     걸이를 축으로 좌우로 몇 번 흔들리며 잦아듭니다. 한 덩어리로 움직이고 기울기도 작아서 휘청이지 않습니다. */
  function swingFrames(sign, x0, lean, lift, secs) {
    const N = 120, w = 9.5, z = 0.5, wd = w * Math.sqrt(1 - z * z), frames = [];
    for (let n = 0; n <= N; n++) {
      const tau = (n / N) * secs;
      const e = Math.exp(-z * w * tau);
      const x = sign * x0 * e * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));           // 끌려오다 한 번 지나쳤다가 돌아옴
      const y = -lift * e * Math.cos(wd * tau);                                                      // 살짝 떠서 내려앉음
      const a = -sign * lean * Math.exp(-1.9 * tau) * Math.cos(2 * Math.PI * 1.15 * tau);          // 속도에 뒤처지며 기울었다가 진자처럼 잦아듦
      const u = Math.max(0, (n / N - 0.78) / 0.22), f = 1 - u * u * (3 - 2 * u);                    // 끝에서 정확히 0 으로 수렴
      frames.push({ offset: n / N, transform: `translate(${(x * f).toFixed(2)}px,${(y * f).toFixed(2)}px) rotate(${(a * f).toFixed(3)}deg)` });
    }
    return frames;
  }
  // 화면 한 장 한 장이 자기 못에 매달려 흔들리는 진자 (위쪽 가운데가 기준점)
  function rotFrames(sign, lean, secs, hz, decay) {
    const N = 120, frames = [];
    for (let n = 0; n <= N; n++) {
      const tau = (n / N) * secs;
      const u = Math.max(0, (n / N - 0.78) / 0.22), f = 1 - u * u * (3 - 2 * u);
      const a = -sign * lean * Math.exp(-decay * tau) * Math.cos(2 * Math.PI * hz * tau) * f;
      frames.push({ offset: n / N, transform: `rotate(${a.toFixed(3)}deg)` });
    }
    return frames;
  }
  // 작업 화면 묶음: 묶음은 끌려 들어오고, 그 안의 화면들은 각자 시차를 두고 흔들립니다
  function swingShots(frames, sign, lean, secs, delayMs) {
    const shots = [...frames.querySelectorAll('.shot')];
    const k = shots.length > 1 ? 1 : 0.5;              // 큰 화면 한 장은 기울기를 줄입니다
    shots.forEach((s, i) => swing(s, rotFrames(sign, lean * k * (1 - i * 0.12), secs, 1.15 + i * 0.07, 1.25), secs, delayMs + i * 90));
  }
  function swing(el, frames, secs, delayMs) {
    if (reduce || !el) return;
    el.style.transformOrigin = '50% 0';        // 기준점: 걸이가 있는 위쪽 가운데
    el.getAnimations().forEach(a => { if (!(a instanceof CSSTransition)) a.cancel(); });
    el.animate(frames, { duration: secs * 1000, delay: delayMs, fill: 'backwards', easing: 'linear' });
  }
  function stopHang(panel) {
    panel.querySelectorAll('.rv-hang, .drop, .case .frames, .case .shot').forEach(el => el.getAnimations().forEach(a => a.cancel()));
  }
  function playPanel(panel) {
    if (reduce) return;
    panel.querySelectorAll('.rv-hang').forEach(el => {
      const d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      const opts = panel.id === 'detail'
        ? { drop: 36, tilt: -0.5, swing: 0.6, damping: 3.4, hz: 1.0, land: 0.32, secs: 2.0 }       // 큰 이미지는 거의 흔들리지 않고 가만히 걸립니다
        : { drop: 170, tilt: -5, swing: 5.5, damping: 2.6, hz: 1.25, land: 0.24, secs: 2.6 };
      playHang(el, (panel.id === 'detail' ? 0.45 : 0.4) + d, opts);
    });
    if (panel.id === 'p-work') {
      const fr = panel.querySelector('.case.on .frames');
      swing(fr, swingFrames(dir, 560, 0, 56, 2.7), 2.7, 30);
      swingShots(fr, dir, 12, 3.2, 50);
    }
    if (panel.id === 'p-home') return;
    panel.querySelectorAll('.drop').forEach((el, k) => {
      const i = +el.style.getPropertyValue('--i') || k;
      const amp = 4 + ((i * 7) % 5);           // 공구마다 흔들리는 폭이 조금씩 다릅니다
      playHang(el, 0.55 + i * 0.03, { drop: 140, tilt: ((i % 2) ? 1 : -1) * 4, swing: amp * (i % 2 ? -1 : 1), damping: 3.2, hz: 1.5, land: 0.28, secs: 1.9 });
    });
  }

  const leaveTimers = [];
  function enter() {
    panels.forEach((p, i) => {
      clearTimeout(leaveTimers[i]);
      if (i === cur) {
        if (!p.classList.contains('in')) { p.classList.add('in'); playPanel(p); }
      } else if (p.classList.contains('in')) {
        // 화면 밖으로 완전히 나간 뒤에 초기 상태로 되돌려야 다시 들어올 때 모션이 재생됩니다
        leaveTimers[i] = setTimeout(() => { p.classList.remove('in'); stopHang(p); if (pagers[i]) pagers[i].reset(); }, 1000);
      }
    });
  }
  function paint() {
    enter();
    track.style.transform = `translateX(${-cur * 100}vw)`;
    links.forEach(a => a.classList.toggle('active', +a.dataset.go === cur));
    bar.style.width = ((cur + 1) / IDS.length * 100) + '%';
    prev.hidden = cur === 0;
    next.hidden = cur === IDS.length - 1;
  }
  function go(i) {
    if (detailOpen) { closeDetail(false); history.replaceState(null, '', '#' + IDS[cur]); }
    i = clamp(i, 0, IDS.length - 1);
    if (i === cur) return;
    dir = i > cur ? 1 : -1;
    cur = i;
    paint();
    history.replaceState(null, '', '#' + IDS[cur]);
  }

  document.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); go(+el.dataset.go); }));
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));

  let lockUntil = 0;
  addEventListener('wheel', e => {
    if (detailOpen) return;                       // 작업 상세는 그 화면 안에서 기본 스크롤로 내려갑니다
    e.preventDefault();
    const now = performance.now();
    if (now < lockUntil) { lockUntil = Math.max(lockUntil, now + 160); return; }
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const d = horizontal ? e.deltaX : e.deltaY;
    // WORK, PROCESS 에서는 세로 휠이 한 장씩 넘깁니다. 첫 장 위, 마지막 장 아래에서는 이전/다음 판으로 넘어갑니다.
    const pg = pagers[cur];
    if (pg && !horizontal && Math.abs(d) >= 12) {
      const next = pg.i + (d > 0 ? 1 : -1);
      if (next >= 0 && next < pg.cases.length) { pg.show(next); lockUntil = now + pg.lock; return; }
    }
    if (Math.abs(d) < 12) return;
    go(cur + (d > 0 ? 1 : -1));
    lockUntil = now + 950;
  }, { passive: false });

  addEventListener('keydown', e => {
    if (detailOpen) return;
    const pg = pagers[cur];
    if (pg) {
      const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1 }[e.key];
      if (step && pg.i + step >= 0 && pg.i + step < pg.cases.length) { e.preventDefault(); pg.show(pg.i + step); return; }
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) go(cur + 1);
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) go(cur - 1);
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(IDS.length - 1);
  });

  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null || detailOpen) { tx = null; return; }
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    tx = null;
  }, { passive: true });

  // 주소창의 #about 이 바뀌면(뒤로 가기 등) 그 판으로 이동 (아래 syncFromHash 에서 처리)

  // 주소의 #about 같은 값으로 바로 열기
  const start = IDS.indexOf(location.hash.slice(1).split('/')[0]);
  if (start > 0) { track.classList.add('no-anim'); cur = start; paint(); track.offsetWidth; track.classList.remove('no-anim'); }
  else paint();
  addEventListener('hashchange', () => syncFromHash());
  setTimeout(() => { const s = location.hash.slice(1).split('/'); if (s[0] === 'work' && WORKS[s[1]]) openDetail(s[1], false); }, 0);

  /* ----- 작업 상세 (서브페이지) -----
     WORK 의 작업을 누르면 상세 화면이 옆에서 들어오고, 걸려 있던 이미지가 흔들리며 자리를 잡습니다. */
  const WORKS = {
    zalgagye: { title: '잘가계', cat: 'APP, WEB, VIDEO', type: '졸업작품', kind: 'wide' },
    tensec: { title: '10초', cat: 'UIUX', kind: 'app', type: '조기퇴직 해결 앱',
      stuck: '기획이 바뀌어 막바지에 전부 다시 만들었습니다. 어울리지 않는 색을 감으로 더하다 화면이 어수선해지기도 했습니다.',
      role: '걸고 빼기', roleLine: '기획이 바뀌어 통째로 엎었던 작업입니다.' },
    soomgo: { title: '숨고 리디자인', cat: 'UIUX', kind: 'app', type: '리디자인',
      stuck: '앱 UI를 배운 적이 없어 초반에 방향이 잡히지 않았습니다.',
      role: '판', roleLine: '기초 없이 시작해 막혔던 작업입니다.' },
    typoweb: { title: '타이포웹구현', cat: 'WEB', kind: 'wide', type: '웹 구현',
      stuck: '레이아웃 배치부터 막혀 처음에는 진행하지 못했습니다.',
      role: '판', roleLine: '레이아웃 배치부터 막혔던 작업입니다.' },
    kurly: { title: '마켓컬리 리디자인', cat: 'UIUX', kind: 'app', type: '리디자인',
      stuck: '아이콘 모양에서 태그에 맞는 아이디어가 떠오르지 않았습니다.',
      role: '제자리', roleLine: '아이콘이 놓일 쓰임을 정해야 했던 작업입니다.' },
    rework: { title: 'adidas RE-WORN', cat: 'BRANDING', type: '브랜딩', kind: 'wide' }
  };
  const ORDER = Object.keys(WORKS);
  const $ = id => document.getElementById(id);
  const dstage = $('dstage'), dpage = $('dpage');
  const detailSecs = [...detail.querySelectorAll('.sec')];
  let detailTimer = 0;
  const TBD = '작성 예정';
  function setText(id, v) { const el = $(id); el.textContent = v || TBD; el.classList.toggle('empty', !v); }
  // 화면 폭에 맞춰 줄어든 만큼 페이지 높이도 줄여서, 끝까지 정확히 스크롤되게 합니다
  function fitDetail() {
    const s = parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
    dpage.style.height = Math.ceil(dstage.offsetHeight * s) + 'px';
  }
  addEventListener('resize', fitDetail);
  if ('ResizeObserver' in window) new ResizeObserver(fitDetail).observe(dstage);      // 글꼴이 늦게 들어오거나 종류가 바뀌어도 높이를 다시 맞춥니다
  const seenIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('seen'); }), { root: detail, threshold: 0.12 })
    : null;
  function fillDetail(id) {
    const w = WORKS[id];
    detail.classList.toggle('app', w.kind === 'app');      // 앱 작업은 세로형 화면, 그 외는 가로형 화면
    $('d-title').textContent = w.title;
    $('d-cat').textContent = w.cat;
    $('d-type').textContent = w.type || TBD;
    $('d-period').textContent = TBD;
    setText('d-desc', w.desc);
    setText('d-tools', w.tools);
    setText('d-team', w.team);
    setText('d-stuck', w.stuck);
    setText('d-solved', w.solved);
    const kw = $('d-keyword');
    kw.textContent = w.role || TBD;
    kw.classList.toggle('empty', !w.role);
    $('d-roleline').textContent = w.roleLine || '';
    const next = ORDER[(ORDER.indexOf(id) + 1) % ORDER.length];
    $('d-next').setAttribute('href', '#work/' + next);
    $('d-next-title').textContent = WORKS[next].title;
  }
  function openDetail(id, push) {
    if (!WORKS[id]) return;
    clearTimeout(detailTimer);
    fillDetail(id);
    stopHang(detail);
    detail.classList.remove('in');
    detail.scrollTop = 0;
    detailSecs.forEach(s => s.classList.remove('seen'));
    detailOpen = true;
    document.body.classList.add('detail-open');
    detail.setAttribute('aria-hidden', 'false');
    detail.offsetWidth;
    detail.classList.add('open');
    detail.classList.add('in');
    fitDetail();
    if (seenIO) { seenIO.disconnect(); detailSecs.forEach(s => seenIO.observe(s)); } else detailSecs.forEach(s => s.classList.add('seen'));
    playPanel(detail);
    // 닫았을 때 WORK 목록도 이 작업에서 열리도록 미리 맞춰 둡니다
    const k = ORDER.indexOf(id);
    if (k >= 0 && pagers[WORK]) pagers[WORK].jump(k);
    requestAnimationFrame(() => detail.focus({ preventScroll: true }));
    if (push) history.pushState({ work: id }, '', '#work/' + id);
  }
  function closeDetail(restoreHash) {
    if (!detailOpen) return;
    detailOpen = false;
    document.body.classList.remove('detail-open');
    detail.setAttribute('aria-hidden', 'true');
    detail.classList.remove('open');
    detailTimer = setTimeout(() => { detail.classList.remove('in'); stopHang(detail); }, 950);
    if (restoreHash) history.pushState(null, '', '#work');
  }
  document.querySelectorAll('.case[data-work]').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.work, true));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(el.dataset.work, true); } });
  });
  detail.querySelector('.back').addEventListener('click', e => { e.preventDefault(); closeDetail(true); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(true); });
  // 뒤로 가기 / 앞으로 가기 / 주소 직접 입력
  function syncFromHash() {
    const [base, sub] = location.hash.slice(1).split('/');
    if (sub && WORKS[sub] && base === 'work') { if (cur !== 2) { cur = 2; paint(); } openDetail(sub, false); return; }
    if (detailOpen) closeDetail(false);
    const i = IDS.indexOf(base);
    if (i >= 0 && i !== cur) go(i);
  }
  addEventListener('popstate', syncFromHash);

  /* ----- 4. 마우스에 반응하는 공구 -----
     scatter : 흩어진 공구. 커서가 다가오면 밀려나고, 멀어지면 천천히 제자리로 돌아옵니다.
     hang    : 걸려 있는 공구. 커서가 스치면 위쪽 걸이를 축으로 흔들립니다. */
  const pointer = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, panel: -1, seen: false };
  let lastX = 0, lastY = 0, lastPanel = -1;

  addEventListener('pointermove', e => {
    let pi = -1, px = 0, py = 0;
    if (detailOpen) {                                   // 상세 화면이 열려 있으면 그 화면 기준으로 계산
      const r = detail.getBoundingClientRect();
      const s = Math.min(r.width / W, r.height / H);
      px = (e.clientX - r.left - (r.width - W * s) / 2) / s;
      py = (e.clientY - r.top - (r.height - H * s) / 2) / s;
      if (pointer.seen && lastPanel === -2) {
        pointer.vx = (px - lastX) * 0.6 + pointer.vx * 0.4;
        pointer.vy = (py - lastY) * 0.6 + pointer.vy * 0.4;
      } else { pointer.px = px; pointer.py = py; }
      pointer.x = lastX = px; pointer.y = lastY = py;
      pointer.panel = lastPanel = -2; pointer.seen = true;
      return;
    }
    for (let i = 0; i < panels.length; i++) {
      const r = panels[i].getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX < r.right) {
        const s = panels[i].hasAttribute('data-cover') ? Math.max(r.width / W, r.height / H) : Math.min(r.width / W, r.height / H);
        px = (e.clientX - r.left - (r.width - W * s) / 2) / s;
        py = (e.clientY - r.top - (r.height - H * s) / 2) / s;
        pi = i; break;
      }
    }
    if (pi < 0) { pointer.panel = -1; return; }
    if (pointer.seen && pi === lastPanel) {
      pointer.vx = (px - lastX) * 0.6 + pointer.vx * 0.4;
      pointer.vy = (py - lastY) * 0.6 + pointer.vy * 0.4;
    }
    pointer.x = lastX = px; pointer.y = lastY = py;
    if (pi !== lastPanel) { pointer.px = px; pointer.py = py; }
    pointer.panel = lastPanel = pi; pointer.seen = true;
  });
  document.addEventListener('pointerleave', () => { pointer.panel = -1; });

  const R = 220;           // 커서가 이 거리 안으로 들어오면 공구가 치워지기 시작합니다
  let dt = 1;               // 60fps 기준 프레임 길이 (144Hz 화면에서도 같은 속도로 움직이게)
  function stepScatter(t, p) {
    // 목표 위치: 커서에서 멀어지는 쪽으로 밀어 둔 자리 (커서가 가까울수록 더 멀리)
    let tx = 0, ty = 0, tr = 0;
    if (p) {
      const dx = t.cx - p.x, dy = t.cy - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < R) {
        const ux = dx / d, uy = dy / d;
        const boost = 1 + Math.min(Math.hypot(p.vx, p.vy), 30) / 60;        // 빨리 지나가면 조금 더 세게 쳐냅니다
        const push = (R - d) * 0.8 * t.reach * boost / Math.sqrt(t.mass);
        tx = ux * push; ty = uy * push;
        tr = t.spin * (push / R) * 26;                                      // 치워지면서 살짝 비스듬히 돌아갑니다
      }
    }
    // 밀릴 때는 재빨리 따라붙고(툭), 돌아올 때는 천천히 부드럽게(튕기지 않음)
    const pushing = Math.hypot(tx, ty) > Math.hypot(t.ox, t.oy);
    const k = 1 - Math.pow(1 - (pushing ? 0.26 : 0.07), dt);
    t.ox += (tx - t.ox) * k;
    t.oy += (ty - t.oy) * k;
    t.rot += (tr - t.rot) * k;
    const moving = Math.abs(tx - t.ox) + Math.abs(ty - t.oy) + Math.abs(tr - t.rot) > 0.05 || Math.abs(t.ox) + Math.abs(t.oy) + Math.abs(t.rot) > 0.05;
    if (moving || t.dirty) {
      t.el.style.transform = `translate(${t.ox.toFixed(2)}px,${t.oy.toFixed(2)}px) rotate(${t.rot.toFixed(2)}deg)`;
      t.dirty = moving;
    }
  }

  function stepHang(t, p) {
    if (p && Math.abs(p.vx) > 0.4) {
      // 지난 프레임에서 지금까지 커서가 지나간 길을 따라 공구에 닿았는지 확인 (빠르게 쓸어도 놓치지 않게)
      for (let k = 0; k <= 4; k++) {
        const x = p.px + (p.x - p.px) * k / 4, y = p.py + (p.y - p.py) * k / 4;
        if (x > t.cx - t.w / 2 - 24 && x < t.cx + t.w / 2 + 24 && y > t.cy - t.h / 2 - 24 && y < t.cy + t.h / 2 + 24) {
          t.omega = clamp(t.omega + clamp(p.vx * 0.09, -4, 4), -9, 9);
          break;
        }
      }
    }
    t.omega += -t.theta * 0.02 * dt;
    t.omega *= Math.pow(0.965, dt);
    t.theta = clamp(t.theta + t.omega * dt, -38, 38);
    const moving = Math.abs(t.theta) + Math.abs(t.omega) > 0.02;
    if (moving || t.dirty) {
      t.el.style.transform = `rotate(${t.theta.toFixed(2)}deg)`;
      t.dirty = moving;
    }
  }

  /* 자리 표시: 평소에는 거의 보이지 않다가, 공구가 치워지는 커서 주변에서만 비어 있던 제자리가 또렷해집니다 */
  const gh = { x: -999, y: -999, r: 0 };
  function stepGhosts() {
    if (!ghostBox) return;
    const on = pointer.panel === 0 && !detailOpen;
    const k = 1 - Math.pow(1 - 0.07, dt);
    if (on) { gh.x += (pointer.x - gh.x) * (gh.r < 8 ? 1 : 1 - Math.pow(0.75, dt)); gh.y += (pointer.y - gh.y) * (gh.r < 8 ? 1 : 1 - Math.pow(0.75, dt)); }
    const target = on ? 270 : 0;
    if (Math.abs(target - gh.r) < 0.5 && !on) { if (gh.r !== 0) { gh.r = 0; ghostBox.style.setProperty('--gr', '1px'); } return; }
    gh.r += (target - gh.r) * k;
    ghostBox.style.setProperty('--gx', gh.x.toFixed(1) + 'px');
    ghostBox.style.setProperty('--gy', gh.y.toFixed(1) + 'px');
    ghostBox.style.setProperty('--gr', Math.max(gh.r, 1).toFixed(1) + 'px');
  }

  let lastT = performance.now();
  function frame(now) {
    dt = clamp((now - lastT) / 16.667, 0.2, 3); lastT = now;
    const decay = Math.pow(0.85, dt);
    pointer.vx *= decay; pointer.vy *= decay;
    for (let i = 0; i < panels.length; i++) {
      if (Math.abs(i - cur) > 1) continue;     // 화면 근처 판만 계산
      const p = pointer.panel === i ? pointer : null;
      const step = panels[i].dataset.mode === 'hang' ? stepHang : stepScatter;
      for (const t of panels[i]._tools) step(t, p);
    }
    if (detailOpen || detail._tools.some(t => t.dirty)) {
      const pd = detailOpen && pointer.panel === -2 ? pointer : null;
      for (const t of detail._tools) stepHang(t, pd);
    }
    stepGhosts();
    for (const k in pagers) pagers[k].tick();
    pointer.px = pointer.x; pointer.py = pointer.y;
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);
})();
