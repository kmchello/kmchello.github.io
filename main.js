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
      h,90,340,-62,290,435,F t,70,160,10,290,290 w,280,90,100,270,405,F d,100,420,76,240,360
      t,240,190,40,290,290,F s,1794,75,20,620,410 t,1860,290,-20,290,290,F p,1880,110,66,260,390,F
      w,1480,50,-40,270,405 h,1880,470,100,290,435 l,1840,1000,-38,640,360,F p,1740,980,-155,260,390,F
      t,1580,1070,8,290,290 d,1890,860,95,240,360 w,30,810,-105,270,405,F
      t,160,1030,-12,290,290,F h,80,980,70,290,435 p,370,1050,-18,260,390 d,280,900,115,240,360
      p,1030,70,88,260,390 s,1007,1316,-94,620,410
    `,
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
               mass, spin: (r1 < 0.5 ? -1 : 1) * (0.6 + r2 * 0.8), reach: 0.8 + r1 * 0.5, clear: panel.id === 'p-home' };
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
    if (document.body.classList.contains('lb-open')) { e.preventDefault(); return; }
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
    if (detailOpen || document.body.classList.contains('lb-open')) return;
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
    // imgs: list = WORK 목록 화면(앱은 3장, 가로형은 1장), hero = 상세 맨 위 큰 이미지(가로형),
    //       phones = 상세 맨 위 폰 5장(앱), shots = 상세 '화면' 갤러리 [{src, cap}]
    // tools: [{name, icon, level(사용 빈도 0~100), fill(어도비처럼 아이콘이 이미 둥근 타일이면 true), off(true면 흐리게 비활성 표시)}]
    // team:  [{role, names}]  — 글 한 줄이면 문자열로 적어도 됩니다
    zalgagye: { title: '잘가계', cat: 'APP, WEB, VIDEO', type: '졸업작품', kind: 'wide',
      contrib: { role: '디자인 팀장', sub: '디자인팀 4명을 이끌며 디자인 전반을 맡았습니다.',
        duties: ['메인 컬러와 전체 디자인 시스템', '메인 로고', '앱 로고와 아이콘', '캐릭터 제작', '앱 디자인'], share: 40, approx: true },
      desc: '“헤어졌는데, 같이 쓰던 건 누가 정리하지?”라는 질문에서 시작한 이별 후 오프보딩 서비스입니다. 공동 계정부터 공유 앨범까지, 얽혀 있던 디지털 자산을 서로 다치지 않게 나누도록 네 명의 캐릭터 중재자가 대신 말을 전합니다. 기획부터 캐릭터와 앱 디자인, 모션그래픽, 웹사이트까지 팀 Layer가 함께 만든 졸업작품입니다.',
      tools: [
        { name: 'Figma', icon: 'assets/icons/figma.svg', level: 100 },
        { name: 'Claude', icon: 'assets/icons/claude.svg', level: 90 },
        { name: 'ChatGPT', icon: 'assets/icons/chatgpt.svg', level: 85 },
        { name: 'Photoshop', off: true, icon: 'assets/icons/photoshop.svg', level: 60, fill: true },
        { name: 'Illustrator', off: true, icon: 'assets/icons/illustrator.svg', level: 55, fill: true },
        { name: 'Premiere Pro', off: true, icon: 'assets/icons/premiere.svg', level: 45, fill: true },
        { name: 'After Effects', off: true, icon: 'assets/icons/aftereffects.svg', level: 40, fill: true }
      ],
      team: [
        { role: '기획', names: '곽효진, 이수영' },
        { role: '디자인', names: '김민찬, 김태현, 정희윤, 조태희' }
      ],
      imgs: {
        list: ['assets/work/zalgagye/web-home.jpg'],
        hero: 'assets/work/zalgagye/web-home.jpg',
        // groups: 상세 페이지에서 제목이 있는 구역으로 나뉘어 보입니다 [{label, title, desc, items:[{src, cap} 또는 {video, src(포스터), cap}]}]
        groups: [
          { label: 'APP', title: '앱 디자인', desc: '온보딩부터 홈, 미정산, 중재방, 정산완, 마이까지 앱의 주요 화면입니다.',
            items: [
              { src: 'assets/work/zalgagye/app-screens.jpg?v=3', cap: '온보딩 ①  시작에서 연결 찾기까지' },
              { src: 'assets/work/zalgagye/app-screens-2.jpg?v=3', cap: '온보딩 ②  함께 쓴 흔적 발견에서 시작 완료까지' },
              { src: 'assets/work/zalgagye/app-screens-3.jpg?v=3', cap: '홈 · 미정산' },
              { src: 'assets/work/zalgagye/app-screens-4.jpg?v=3', cap: '중재방' },
              { src: 'assets/work/zalgagye/app-screens-5.jpg?v=3', cap: '정산완 · 마이' }
            ] },
          { label: 'CHARACTER', title: '캐릭터 디자인', desc: '정리를 대신 전해 주는 네 명의 중재자 캐릭터입니다.',
            items: [{ src: 'assets/work/zalgagye/web-chars.jpg', cap: '정산소 자료함 · 캐릭터 이미지' }] },
          { label: 'WEB', title: '웹 디자인', desc: '잘가계 정산소 웹사이트의 화면입니다.',
            items: [
              { src: 'assets/work/zalgagye/web-design.jpg', cap: '정산소 설계서' },
              { src: 'assets/work/zalgagye/web-making.jpg', cap: '정산소 제작서' },
              { src: 'assets/work/zalgagye/web-video.jpg', cap: '정산소 상영관' }
            ] },
          { label: 'VIDEO', title: '영상', desc: '잘가계 소개 영상입니다. (44초)',
            items: [{ video: 'assets/work/zalgagye/goodbye.mp4', src: 'assets/work/zalgagye/video-poster.jpg', cap: '잘가계 소개 영상' }] }
        ]
      } },
    tensec: { title: '10초', cat: 'UIUX', kind: 'wide', type: '조기퇴직 해결 앱',
      contrib: { role: '앱 디자인 · 기획 일부', sub: '앱 디자인과 디자인 시스템 전체를 맡고, 기획에도 참여했습니다.',
        duties: ['앱 디자인', '기획 일부 담당', '앱 로고', '디자인 시스템 전체'], share: 35, shareText: '약 30~40%' },
      desc: '현대 가족의 대화 부족과 중장년층의 조기 퇴직 문제를 함께 해결하는 앱 서비스입니다. 하루 10초씩 가족에게 영상 편지를 보내며 소통을 이어 가고, 적성검사와 취미 탐색, AI 추천으로 나에게 맞는 일과 취미를 찾도록 돕습니다.',
      tools: [
        { name: 'Figma', icon: 'assets/icons/figma.svg', level: 100 },
        { name: 'Photoshop', icon: 'assets/icons/photoshop.svg', level: 85, fill: true }
      ],
      team: [
        { role: '기획', names: '가민진' },
        { role: '디자인', names: '김민찬, 이나경' }
      ],
      imgs: {
        list: ['assets/work/tensec/thumb.jpg'],
        hero: 'assets/work/tensec/hero-wide.jpg', heroH: 961,     // heroH: 큰 이미지 칸 높이(원본 비율대로 보이게)
        groups: [
          { label: 'PLANNING', title: '기획과 리서치', desc: '프로젝트 배경 조사에서 인사이트, 컨셉, 정보구조, 와이어프레임까지의 기획 과정입니다.',
            items: [
              { src: 'assets/work/tensec/plan-1.jpg', cap: '프로젝트 개요', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-2.jpg', cap: '프로젝트 배경', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-3.jpg', cap: '인사이트 도출', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-4.jpg', cap: '3C · SWOT 분석', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-5.jpg', cap: '벤치마킹 · 포지셔닝 맵', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-6.jpg', cap: '핵심 기능 도출 · 컨셉시트', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-7.jpg', cap: '페르소나 · 사용자 여정지도', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-8.jpg', cap: '정보구조도', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-9.jpg', cap: '플로우차트', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-10.jpg', cap: '와이어프레임', ratio: '16/9' },
              { src: 'assets/work/tensec/plan-11.jpg', cap: '메인 페이지 시각화', ratio: '16/9' }
            ] },
          { label: 'APP', title: '앱 디자인', desc: '10초 편지, 하루 편지, 적성검사, 취미 탐색까지 앱의 전체 화면입니다.',
            items: [
              { src: 'assets/work/tensec/app-1.jpg', cap: '시작과 로그인' },
              { src: 'assets/work/tensec/app-2.jpg', cap: '로그인 완료와 홈' },
              { src: 'assets/work/tensec/app-3.jpg', cap: '10초 편지 촬영과 작성' },
              { src: 'assets/work/tensec/app-4.jpg', cap: '메모 작성과 편지 보내기' },
              { src: 'assets/work/tensec/app-5.jpg', cap: '보낸 편지함 · 받은 편지함' },
              { src: 'assets/work/tensec/app-6.jpg', cap: '하루 편지 작성' },
              { src: 'assets/work/tensec/app-7.jpg', cap: '하루 편지 읽기 · 하루 메모' },
              { src: 'assets/work/tensec/app-8.jpg', cap: '적성검사 설문 (22문항 중 5문항)' },
              { src: 'assets/work/tensec/app-9.jpg', cap: '적성검사 결과 · 마이페이지' },
              { src: 'assets/work/tensec/app-10.jpg', cap: '취미 탐색 · AI 추천' }
            ] }
        ]
      },
      stuck: '기획이 바뀌어 막바지에 전부 다시 만들었습니다. 어울리지 않는 색을 감으로 더하다 화면이 어수선해지기도 했습니다.',
      role: '걸고 빼기', roleLine: '기획이 바뀌어 통째로 엎었던 작업입니다.' },
    soomgo: { title: '숨고 리디자인', cat: 'UIUX', kind: 'wide', type: '리디자인',
      desc: '전문가 매칭 플랫폼 숨고의 UI를 다시 디자인한 작업입니다. 아이콘 색상을 통일하고 광고 배너를 더했으며, 커뮤니티 카드와 페이지 구성을 단순하게 정리해 접근성을 높였습니다.',
      tools: [
        { name: 'Figma', icon: 'assets/icons/figma.svg', level: 100 },
        { name: 'Photoshop', icon: 'assets/icons/photoshop.svg', level: 85, fill: true }
      ],
      team: [{ role: '디자인', names: '김민찬' }],
      contrib: { role: '개인 작업', sub: '리디자인의 처음부터 끝까지 혼자 맡았습니다.',
        duties: ['서비스 목표 · 페르소나 · 고객 여정도 정리', '문제점을 도출하고 개선 방향 정하기', '디자인 스타일과 UI 키트 만들기', 'GUI 화면 디자인'], share: 100 },
      imgs: {
        list: ['assets/work/soomgo/thumb.jpg'],
        hero: 'assets/work/soomgo/hero.jpg', heroH: 949,
        groups: [
          { label: 'PROCESS', title: '리디자인 과정', desc: '서비스 목표 설정부터 페르소나, 고객 여정도, 문제점 도출, 디자인 스타일까지의 과정입니다.',
            items: [
              { src: 'assets/work/soomgo/p-1.jpg', cap: '서비스 목표', ratio: '1920/1910' },
              { src: 'assets/work/soomgo/p-2.jpg', cap: '페르소나', ratio: '1920/1190' },
              { src: 'assets/work/soomgo/p-3.jpg', cap: '고객 여정도', ratio: '1920/1200' },
              { src: 'assets/work/soomgo/p-4.jpg', cap: '문제점 도출과 개선사항', ratio: '1920/1720' },
              { src: 'assets/work/soomgo/p-5.jpg', cap: '디자인 스타일 · 컬러 · 컴포넌트 UI 키트', ratio: '1920/2200' }
            ] },
          { label: 'APP', title: '앱 디자인', desc: 'UI 키트를 적용해 개선한 화면입니다.',
            items: [
              { src: 'assets/work/soomgo/g-1.jpg', cap: 'GUI 화면 ① 홈 · 커뮤니티', ratio: '1920/1970' },
              { src: 'assets/work/soomgo/g-2.jpg', cap: 'GUI 화면 ② 커뮤니티 상세', ratio: '1920/1900' }
            ] }
        ]
      },
      stuck: '앱 UI를 배운 적이 없어 초반에 방향이 잡히지 않았습니다.',
      role: '판', roleLine: '기초 없이 시작해 막혔던 작업입니다.' },
    typoweb: { title: '타이포웹구현', cat: 'WEB', kind: 'wide', type: '웹 구현',
      contrib: { role: '개인 작업', sub: '처음부터 끝까지 혼자 맡았습니다.', duties: ['전 과정을 혼자 진행'], share: 100 },
      desc: '프리텐다드와 Inter 두 서체의 이야기와 자간·행간, 크기·무게를 비교하고, 형태와 컬러, 실사 이미지까지 타이포그래피 수업 내용을 웹페이지로 구현한 작업입니다. 각 주제마다 배운 내용을 담은 포스터를 함께 만들었습니다.',
      tools: [
        { name: 'Figma', icon: 'assets/icons/figma.svg', level: 100 },
        { name: 'Photoshop', icon: 'assets/icons/photoshop.svg', level: 85, fill: true }
      ],
      team: [{ role: '디자인', names: '김민찬' }],
      imgs: {
        list: ['assets/work/typoweb/hero.jpg'],
        hero: 'assets/work/typoweb/hero.jpg', heroH: 949,
        // strips: 세로로 긴 웹 화면을 나란히 보여 주는 구역 (값은 이미지 높이 px)
        groups: [
          { label: 'PRETENDARD', title: '프리텐다드', strips: 1500,
            desc: '서체 이야기와 폰트 패밀리, 활용 사례부터 자간·행간, 크기·무게까지 프리텐다드와 Freesentation을 비교했습니다.',
            items: [
              { src: 'assets/work/typoweb/s-1.jpg', cap: '서체 이야기', ratio: '543/2000' },
              { src: 'assets/work/typoweb/s-2.jpg', cap: '자간 · 행간', ratio: '308/2000' },
              { src: 'assets/work/typoweb/s-3.jpg', cap: '크기 · 무게', ratio: '399/2000' }
            ] },
          { label: 'INTER', title: 'INTER', strips: 1500,
            desc: '서체 이야기와 활용 사례, Letter spacing과 Line height, 크기·무게를 Inter와 Roboto로 비교했습니다.',
            items: [
              { src: 'assets/work/typoweb/s-4.jpg', cap: '서체 이야기', ratio: '625/2000' },
              { src: 'assets/work/typoweb/s-5.jpg', cap: '자간 · 행간', ratio: '301/2000' },
              { src: 'assets/work/typoweb/s-6.jpg', cap: '크기 · 무게', ratio: '407/2000' }
            ] },
          { label: 'SHAPE & COLOR', title: '형태와 컬러', strips: 1500,
            desc: '형태의 세 가지와 색상의 3속성을 정리하고, 캣타워와 점선면 포스터로 표현했습니다.',
            items: [{ src: 'assets/work/typoweb/s-7.jpg', cap: '형태와 컬러', ratio: '389/2000' }] },
          { label: 'REALISTIC IMAGE', title: '실사의 위력', strips: 1500,
            desc: '한 사람의 분노와 행복을 대비한 실사 포스터 시리즈입니다. 인물 사진은 ChatGPT로 만들었습니다.',
            items: [{ src: 'assets/work/typoweb/s-8.jpg', cap: '실사의 위력', ratio: '635/2000' }] }
        ]
      },
      stuck: '레이아웃 배치부터 막혀 처음에는 진행하지 못했습니다.',
      role: '판', roleLine: '레이아웃 배치부터 막혔던 작업입니다.' },
    kurly: { title: '마켓컬리 리디자인', cat: 'UIUX', kind: 'app', type: '리디자인',
      contrib: { role: '개인 작업', sub: '처음부터 끝까지 혼자 맡았습니다.', duties: ['전 과정을 혼자 진행'], share: 100 },
      stuck: '아이콘 모양에서 태그에 맞는 아이디어가 떠오르지 않았습니다.',
      role: '제자리', roleLine: '아이콘이 놓일 쓰임을 정해야 했던 작업입니다.' },
    rework: { title: 'adidas RE-WORN', cat: 'BRANDING', type: '브랜딩', kind: 'wide',
      contrib: { role: '개인 작업', sub: '처음부터 끝까지 혼자 맡았습니다.', duties: ['전 과정을 혼자 진행'], share: 100 } }
  };
  const ORDER = Object.keys(WORKS);
  const $ = id => document.getElementById(id);
  const dstage = $('dstage'), dpage = $('dpage');
  const detailSecs = [...detail.querySelectorAll('.sec')];
  let detailTimer = 0;
  const TBD = '작성 예정';
  // 사용 도구: 아이콘 + 이름 + 사용 빈도 게이지 (글 한 줄이면 그대로 글로 보입니다)
  function setTools(list) {
    const el = $('d-tools');
    if (!Array.isArray(list) || !list.length) { setText('d-tools', Array.isArray(list) ? '' : list); return; }
    el.classList.remove('empty');
    el.innerHTML = '<ul class="tools">' + list.map(t =>
      '<li' + (t.off ? ' class="off"' : '') + '><span class="ti' + (t.fill ? ' fill' : '') + '"><img src="' + t.icon + '" alt="" draggable="false"></span>' +
      '<span class="tn">' + t.name + '</span>' +
      '<span class="gauge" role="img" aria-label="사용 빈도 ' + t.level + '%"><i style="--lv:' + t.level + '%"></i></span></li>').join('') +
      '</ul>';
  }
  // 맡은 일: 역할 · 담당 업무 · 기여도(게이지). contrib 가 없으면 '작성 예정'
  function setContrib(c) {
    const role = $('d-role'), sub = $('d-rolesub'), list = $('d-duties'), share = $('d-share');
    if (!c) {
      role.textContent = TBD; role.classList.add('empty'); sub.textContent = '';
      list.innerHTML = '<li class="empty">' + TBD + '</li>'; share.className = 'd-share'; share.innerHTML = ''; return;
    }
    role.classList.remove('empty'); role.textContent = c.role; sub.textContent = c.sub || '';
    list.innerHTML = (c.duties || []).map(d => '<li>' + d + '</li>').join('');
    if (c.share != null) {
      share.className = 'd-share on';
      const txt = c.shareText || ((c.approx ? '약 ' : '') + c.share + '%');
      share.innerHTML = '<span class="k">' + (c.shareLabel || '기여도') + '</span><span class="gauge" role="img" aria-label="기여도 ' + txt + '"><i style="--lv:' + c.share + '%"></i></span><b>' + txt + '</b>';
    } else { share.className = 'd-share'; share.innerHTML = ''; }
  }
  function setTeam(list) {
    const el = $('d-team');
    if (!Array.isArray(list) || !list.length) { setText('d-team', Array.isArray(list) ? '' : list); return; }
    el.classList.remove('empty');
    el.innerHTML = '<ul class="team">' + list.map(m => '<li><b>' + m.role + '</b><span>' + m.names + '</span></li>').join('') + '</ul>';
  }
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
  /* ----- 이미지 넣기 -----
     imgs 가 있는 작업만 이미지를 넣고, 없는 작업은 IMAGE 자리표시를 그대로 둡니다. */
  function putImg(shot, src, alt) {
    const sp = shot.querySelector('span');
    if (sp) sp.hidden = true;
    let img = shot.querySelector('img');
    if (!img) { img = document.createElement('img'); img.draggable = false; shot.appendChild(img); }
    img.alt = alt || '';
    img.src = src;
    shot.classList.add('has-img');
  }
  function shotHTML(s) {
    if (s.video) {                                           // 영상은 눌러서 재생 (소리는 사용자가 켭니다)
      return '<div class="shot has-img video"><video src="' + s.video + '" poster="' + (s.src || '') + '" controls playsinline preload="none" controlslist="nodownload"></video>' +
        (s.cap ? '<span class="cap">' + s.cap + '</span>' : '') + '</div>';
    }
    return '<div class="shot has-img' + (s.ratio === '16/9' ? ' r169' : (s.ratio ? ' rx' : '')) + '"' + (s.ratio && s.ratio !== '16/9' ? ' style="aspect-ratio:' + s.ratio + '"' : '') + '><img src="' + s.src + '" alt="' + (s.cap || '') + '" loading="lazy" draggable="false">' +
      (s.cap ? '<span class="cap">' + s.cap + '</span>' : '') + '</div>';
  }
  Object.keys(WORKS).forEach(id => {                       // WORK 목록의 이미지
    const w = WORKS[id], list = w.imgs && w.imgs.list;
    if (!list) return;
    const art = document.querySelector('.case[data-work="' + id + '"]');
    if (!art) return;
    art.querySelectorAll('.frames .shot').forEach((sh, i) => { if (list[i]) putImg(sh, list[i], w.title); });
  });
  const dHeroBig = dstage.querySelector('.ph.big'), dPhones = dstage.querySelector('.d-phones');
  const dApp = dstage.querySelector('.g-app'), dWide = dstage.querySelector('.g-wide');
  const dDefault = { app: dApp.innerHTML, wide: dWide.innerHTML, phones: dPhones.innerHTML, hero: dHeroBig.innerHTML };
  const dShots = dstage.querySelector('.s-shots'), dGroups = $('d-groups');
  const dHero = dstage.querySelector('.d-hero');
  const grpIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); grpIO.unobserve(e.target); } }), { root: detail, threshold: 0.06 })
    : null;
  function stripHTML(s, h) {                                 // 세로로 긴 이미지: 높이를 맞추고 폭은 비율대로
    return '<figure class="strip"><div class="sshot" style="height:' + h + 'px;aspect-ratio:' + s.ratio + '"><img src="' + s.src + '" alt="' + (s.cap || '') + '" loading="lazy" draggable="false"></div>' +
      (s.cap ? '<figcaption>' + s.cap + '</figcaption>' : '') + '</figure>';
  }
  function groupHTML(g) {                                    // 제목이 있는 한 구역 (앱 / 캐릭터 / 웹 / 영상)
    if (g.strips) {
      return '<section class="sec grp strips"><div class="g-head"><p class="d-label">' + g.label + '</p><h3 class="g-title">' + g.title + '</h3>' +
        (g.desc ? '<p class="g-desc">' + g.desc + '</p>' : '') + '</div><div class="g-list">' + g.items.map(it => stripHTML(it, g.strips)).join('') + '</div></section>';
    }
    return '<section class="sec grp"><div class="g-head"><p class="d-label">' + g.label + '</p><h3 class="g-title">' + g.title + '</h3>' +
      (g.desc ? '<p class="g-desc">' + g.desc + '</p>' : '') + '</div><div class="g-list">' + g.items.map(shotHTML).join('') + '</div></section>';
  }
  function fillImages(w) {                                   // 상세 페이지는 틀을 같이 쓰므로 매번 처음 상태로 되돌린 뒤 채웁니다
    dApp.innerHTML = dDefault.app; dWide.innerHTML = dDefault.wide;
    dPhones.innerHTML = dDefault.phones; dHeroBig.innerHTML = dDefault.hero; dHeroBig.classList.remove('has-img');
    dGroups.innerHTML = ''; dShots.style.display = '';
    dHero.style.height = '';
    const im = w.imgs;
    if (!im) return;
    if (im.groups && im.groups.length) {
      dShots.style.display = 'none';                         // 구역으로 나눈 작업은 기본 '화면' 목록을 감춥니다
      dGroups.innerHTML = im.groups.map(groupHTML).join('');
      dGroups.querySelectorAll('.grp').forEach(g => { if (grpIO) grpIO.observe(g); else g.classList.add('seen'); });
    }
    if (im.hero) putImg(dHeroBig, im.hero, w.title);
    if (im.heroH) dHero.style.height = im.heroH + 'px';
    if (im.phones) dPhones.querySelectorAll('.shot').forEach((sh, i) => { if (im.phones[i]) putImg(sh, im.phones[i], w.title); });
    if (im.shots && im.shots.length) (w.kind === 'app' ? dApp : dWide).innerHTML = im.shots.map(shotHTML).join('');
  }
  function fillDetail(id) {
    const w = WORKS[id];
    detail.classList.toggle('app', w.kind === 'app');      // 앱 작업은 세로형 화면, 그 외는 가로형 화면
    fillImages(w);
    $('d-title').textContent = w.title;
    $('d-cat').textContent = w.cat;
    $('d-type').textContent = w.type || TBD;
    $('d-period').textContent = TBD;
    setText('d-desc', w.desc);
    setTools(w.tools);
    setTeam(w.team);
    setContrib(w.contrib);
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
    dstage.querySelectorAll('video').forEach(v => v.pause());   // 닫을 때 재생 중인 영상은 멈춥니다
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
    // 첫 화면에서는 PORTFOLIO 둘레의 큰 가로 타원 안으로 공구가 밀려 들어오지 않게 합니다
    if (t.clear && (tx || ty)) {
      const ex = 960 + t.w * 0.18, ey = 330 + t.h * 0.18;
      const fr = ((t.cx - 960) / ex) ** 2 + ((t.cy - 540) / ey) ** 2;          // 제자리에서의 위치
      const lim = Math.min(fr, 1);
      let qx = t.cx + tx - 960, qy = t.cy + ty - 540;
      const fq = (qx / ex) ** 2 + (qy / ey) ** 2;
      if (fq < lim) { const k = Math.sqrt(lim / (fq || 1e-6)); qx *= k; qy *= k; tx = qx + 960 - t.cx; ty = qy + 540 - t.cy; }
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
    for (const k in pagers) pagers[k].tick();
    pointer.px = pointer.x; pointer.py = pointer.y;
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);

  /* ----- 프로필 사진 크게 보기 ----- */
  const lb = document.getElementById('lightbox');
  const prof = document.querySelector('#p-about .zoomable');
  function openLb() {
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lb-open');
    lb.querySelector('.lb-close').focus({ preventScroll: true });
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lb-open');
    prof.focus({ preventScroll: true });
  }
  if (prof) {
    prof.addEventListener('click', openLb);
    prof.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
  }
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();
