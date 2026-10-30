let lenis = null;
let isStoryUnlocked = false;
let unlockedQuestionSecrets = [];
let decryptedPhotoBlobUrls = {};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  initLenisSmoothScroll();
  initStrictScrollLock();
  initStarrySky();
  initAutumnLeavesSystem();
  initRainSystem();
  initAudioSynthesizer();
  initConstellationGate();

  initHeroForestDescentParallax();
  initForestCollagePinAnimation();
  initForestMarquee();

  if (!CONFIG.isEncrypted) {
    initPersonalStoryContent();
  }

  window.addEventListener("resize", () => {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});

function initPersonalStoryContent() {
  initDualClocksAndDistance();
  initIntroCollagePhotos();
  initFullscreenTimelineDOM();
  initCountdowns();
  initFinalLetter();
  initPinnedTimelineScrollytelling();
  initBottomScenesParallax();
}

function initLenisSmoothScroll() {
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5
    });

    lenis.on("scroll", () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.update();
      }
    });

    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    lenis.stop();
  }
}

function initStrictScrollLock() {
  document.documentElement.classList.add("site-locked");
  document.body.classList.add("site-locked");
  window.scrollTo(0, 0);

  const blockScroll = (e) => {
    if (!isStoryUnlocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const blockScrollKeys = (e) => {
    if (!isStoryUnlocked) {
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea") return;
      const blockedKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "End", "Home"];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockScrollKeys, { passive: false });
}

let starCanvas, starCtx, stars = [], shootingStars = [];

function initStarrySky() {
  starCanvas = document.getElementById("star-canvas");
  if (!starCanvas) return;
  starCtx = starCanvas.getContext("2d");

  function resize() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    const count = Math.floor((starCanvas.width * starCanvas.height) / 4500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height * 0.78,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.75 + 0.25,
        twinkleSpeed: Math.random() * 0.018 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: Math.random() > 0.75 ? "#fef08a" : (Math.random() > 0.5 ? "#bae6fd" : "#ffffff")
      });
    }
  }

  window.addEventListener("resize", resize);
  resize();

  setInterval(() => {
    if (Math.random() > 0.35) {
      shootingStars.push({
        x: Math.random() * starCanvas.width * 0.85,
        y: Math.random() * starCanvas.height * 0.35,
        length: Math.random() * 85 + 50,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 5 + (Math.random() * 0.16 - 0.08),
        opacity: 1
      });
    }
  }, 4000);

  function animate() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    for (const star of stars) {
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 1) { star.alpha = 1; star.twinkleDir = -1; }
      else if (star.alpha <= 0.2) { star.alpha = 0.2; star.twinkleDir = 1; }

      starCtx.beginPath();
      starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      starCtx.fillStyle = star.color;
      starCtx.globalAlpha = star.alpha;
      starCtx.fill();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = starCtx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(1, `rgba(251, 191, 36, ${s.opacity})`);

      starCtx.beginPath();
      starCtx.moveTo(tailX, tailY);
      starCtx.lineTo(s.x, s.y);
      starCtx.strokeStyle = grad;
      starCtx.lineWidth = 2;
      starCtx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.016;

      if (s.opacity <= 0) shootingStars.splice(i, 1);
    }

    starCtx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

let autumnCanvas, autumnCtx;
let leaves = [], embers = [];

function initAutumnLeavesSystem() {
  autumnCanvas = document.getElementById("autumn-canvas");
  if (!autumnCanvas) return;
  autumnCtx = autumnCanvas.getContext("2d");

  function resize() {
    autumnCanvas.width = window.innerWidth;
    autumnCanvas.height = window.innerHeight;
    createAutumnParticles();
  }

  function createAutumnParticles() {
    leaves = [];
    embers = [];
    for (let i = 0; i < 18; i++) {
      leaves.push({
        x: Math.random() * autumnCanvas.width,
        y: Math.random() * autumnCanvas.height,
        size: Math.random() * 7 + 6,
        speedY: Math.random() * 0.7 + 0.45,
        speedX: Math.random() * 0.6 - 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.02 - 0.01,
        color: Math.random() > 0.5 ? "#ea580c" : (Math.random() > 0.5 ? "#f59e0b" : "#b45309")
      });
    }
    for (let i = 0; i < 22; i++) {
      embers.push({
        x: Math.random() * autumnCanvas.width,
        y: Math.random() * autumnCanvas.height,
        radius: Math.random() * 2.2 + 1,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: Math.random() * 0.3 - 0.15,
        alpha: Math.random() * 0.65 + 0.25
      });
    }
  }

  window.addEventListener("resize", resize);
  resize();

  function animateAutumn() {
    autumnCtx.clearRect(0, 0, autumnCanvas.width, autumnCanvas.height);

    for (const l of leaves) {
      autumnCtx.save();
      autumnCtx.translate(l.x, l.y);
      autumnCtx.rotate(l.rotation);
      autumnCtx.fillStyle = l.color;
      autumnCtx.globalAlpha = 0.65;

      autumnCtx.beginPath();
      autumnCtx.ellipse(0, 0, l.size, l.size * 0.48, 0, 0, Math.PI * 2);
      autumnCtx.fill();
      autumnCtx.restore();

      l.y += l.speedY;
      l.x += l.speedX;
      l.rotation += l.rotSpeed;

      if (l.y > autumnCanvas.height + 20) {
        l.y = -20;
        l.x = Math.random() * autumnCanvas.width;
      }
    }

    for (const e of embers) {
      autumnCtx.beginPath();
      autumnCtx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      autumnCtx.fillStyle = "#fbbf24";
      autumnCtx.globalAlpha = e.alpha;
      autumnCtx.shadowColor = "#f59e0b";
      autumnCtx.shadowBlur = 8;
      autumnCtx.fill();

      e.y += e.speedY;
      e.x += e.speedX;

      if (e.y < -10) {
        e.y = autumnCanvas.height + 10;
        e.x = Math.random() * autumnCanvas.width;
      }
    }
    autumnCtx.shadowBlur = 0;
    autumnCtx.globalAlpha = 1;

    requestAnimationFrame(animateAutumn);
  }
  animateAutumn();
}

let rainCanvas, rainCtx, raindrops = [];
let audioCtx = null, rainNoiseNode = null, rainGainNode = null, isRainActive = false;

function initRainSystem() {
  rainCanvas = document.getElementById("rain-canvas");
  if (!rainCanvas) return;
  rainCtx = rainCanvas.getContext("2d");

  function resize() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    raindrops = [];
    for (let i = 0; i < 110; i++) {
      raindrops.push({
        x: Math.random() * rainCanvas.width,
        y: Math.random() * rainCanvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 9 + 11
      });
    }
  }
  window.addEventListener("resize", resize);
  resize();

  function animateRain() {
    if (isRainActive) {
      rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
      rainCtx.strokeStyle = "rgba(186, 230, 253, 0.42)";
      rainCtx.lineWidth = 1.2;

      for (const drop of raindrops) {
        rainCtx.beginPath();
        rainCtx.moveTo(drop.x, drop.y);
        rainCtx.lineTo(drop.x + 1, drop.y + drop.length);
        rainCtx.stroke();

        drop.y += drop.speed;
        drop.x += 1;
        if (drop.y > rainCanvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * rainCanvas.width;
        }
      }
    }
    requestAnimationFrame(animateRain);
  }
  animateRain();

  const toggleBtn = document.getElementById("rain-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isRainActive = !isRainActive;
      document.body.classList.toggle("rain-active", isRainActive);
      toggleBtn.classList.toggle("active", isRainActive);

      const label = toggleBtn.querySelector(".btn-text");
      if (label) label.textContent = isRainActive ? "Herbst-Regen: An" : "Herbst-Regen";

      if (isRainActive) {
        if (window._startRainAudio) window._startRainAudio();
      } else {
        if (window._stopRainAudio) window._stopRainAudio();
      }
    });
  }
}

let rainStopTimeout = null;
let cachedRainBuffer = null;

function initAudioSynthesizer() {
  const startRainAudio = () => {
    if (rainStopTimeout) {
      clearTimeout(rainStopTimeout);
      rainStopTimeout = null;
    }

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (!cachedRainBuffer) {
      const sampleRate = audioCtx.sampleRate;
      const bufferSize = sampleRate * 4;
      const fadeSamples = Math.floor(sampleRate * 0.15);
      cachedRainBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
      const output = cachedRainBuffer.getChannelData(0);

      const rawLen = bufferSize + fadeSamples;
      const raw = new Float32Array(rawLen);
      let lastOut = 0.0;
      for (let i = 0; i < rawLen; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        raw[i] = lastOut * 3.2;
      }

      for (let i = 0; i < bufferSize; i++) {
        if (i < fadeSamples) {
          const alpha = i / fadeSamples;
          output[i] = raw[i + fadeSamples] * alpha + raw[bufferSize + i] * (1 - alpha);
        } else {
          output[i] = raw[i + fadeSamples];
        }
      }
    }

    if (!rainNoiseNode) {
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = cachedRainBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(750, audioCtx.currentTime);

      rainGainNode = audioCtx.createGain();
      rainGainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(rainGainNode);
      rainGainNode.connect(audioCtx.destination);
      whiteNoise.start(0);

      rainNoiseNode = whiteNoise;
    }

    if (rainGainNode) {
      const now = audioCtx.currentTime;
      rainGainNode.gain.cancelScheduledValues(now);
      rainGainNode.gain.setValueAtTime(rainGainNode.gain.value, now);
      rainGainNode.gain.linearRampToValueAtTime(0.12, now + 1.2);
    }
  };

  const stopRainAudio = () => {
    if (!rainGainNode || !audioCtx) return;

    if (rainStopTimeout) {
      clearTimeout(rainStopTimeout);
      rainStopTimeout = null;
    }

    const now = audioCtx.currentTime;
    rainGainNode.gain.cancelScheduledValues(now);
    rainGainNode.gain.setValueAtTime(rainGainNode.gain.value, now);
    rainGainNode.gain.linearRampToValueAtTime(0.0, now + 0.45);

    rainStopTimeout = setTimeout(() => {
      if (!isRainActive) {
        try {
          if (rainNoiseNode) {
            rainNoiseNode.stop();
            rainNoiseNode.disconnect();
            rainNoiseNode = null;
          }
          if (rainGainNode) {
            rainGainNode.disconnect();
            rainGainNode = null;
          }
          if (audioCtx && audioCtx.state === "running") {
            audioCtx.suspend();
          }
        } catch (_) {}
      }
    }, 500);
  };

  window._startRainAudio = startRainAudio;
  window._stopRainAudio = stopRainAudio;
  window._playChime = playChime;
}

function playWarmNote(freq, startTime, duration, peakGain) {
  if (!audioCtx) return;

  const oscFund = audioCtx.createOscillator();
  const oscHarm = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const noteGain = audioCtx.createGain();

  oscFund.type = "sine";
  oscFund.frequency.setValueAtTime(freq, startTime);

  oscHarm.type = "triangle";
  oscHarm.frequency.setValueAtTime(freq * 2, startTime);

  const harmGain = audioCtx.createGain();
  harmGain.gain.setValueAtTime(0.12, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(950, startTime);
  filter.Q.setValueAtTime(0.7, startTime);

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.035);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscFund.connect(filter);
  oscHarm.connect(harmGain);
  harmGain.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(audioCtx.destination);

  oscFund.start(startTime);
  oscHarm.start(startTime);
  oscFund.stop(startTime + duration + 0.02);
  oscHarm.stop(startTime + duration + 0.02);

  oscFund.onended = () => {
    try {
      oscFund.disconnect();
      oscHarm.disconnect();
      harmGain.disconnect();
      filter.disconnect();
      noteGain.disconnect();
    } catch (_) {}
  };
}

function playChime(starIndex = 0) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    const starChords = [
      [261.63, 329.63],
      [293.66, 369.99],
      [329.63, 392.00],
      [349.23, 440.00],
      [261.63, 329.63, 392.00, 493.88, 523.25]
    ];

    const notes = starChords[Math.min(starIndex, starChords.length - 1)];
    const isFinalStar = starIndex >= 4;

    notes.forEach((freq, idx) => {
      const delay = isFinalStar ? idx * 0.095 : idx * 0.055;
      const dur = isFinalStar ? 1.75 : 1.25;
      const gain = isFinalStar ? 0.042 : 0.045;
      playWarmNote(freq, now + delay, dur, gain);
    });
  } catch (e) {}
}

let gateCanvas, gateCtx;
let gateNodes = [];
let gateEdges = [];
let solvedQuizCount = 0;

function initConstellationGate() {
  gateCanvas = document.getElementById("constellation-gate-canvas");
  if (!gateCanvas) return;
  gateCtx = gateCanvas.getContext("2d");

  function resizeGate() {
    gateCanvas.width = window.innerWidth;
    gateCanvas.height = window.innerHeight;
    setupConstellationNodes();
  }

  function setupConstellationNodes() {
    const w = gateCanvas.width;
    const h = gateCanvas.height;

    gateNodes = [
      { x: w * 0.485, y: h * 0.055, solved: gateNodes[0] ? gateNodes[0].solved : false, radius: 5.5, name: "ι Cnc" },
      { x: w * 0.474, y: h * 0.112, solved: gateNodes[1] ? gateNodes[1].solved : false, radius: 6.2, name: "γ Cnc" },
      { x: w * 0.492, y: h * 0.168, solved: gateNodes[2] ? gateNodes[2].solved : false, radius: 7.0, name: "δ Cnc" },
      { x: w * 0.585, y: h * 0.228, solved: gateNodes[3] ? gateNodes[3].solved : false, radius: 7.6, name: "β Cnc" },
      { x: w * 0.408, y: h * 0.218, solved: gateNodes[4] ? gateNodes[4].solved : false, radius: 6.5, name: "α Cnc" }
    ];

    gateEdges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4]
    ];
  }

  window.addEventListener("resize", resizeGate);
  resizeGate();

  function renderConstellation() {
    gateCtx.clearRect(0, 0, gateCanvas.width, gateCanvas.height);

    if (gateNodes.length >= 3) {
      const m44X = (gateNodes[1].x + gateNodes[2].x) * 0.5 - 8;
      const m44Y = (gateNodes[1].y + gateNodes[2].y) * 0.5;
      const clusterSolved = gateNodes[1].solved && gateNodes[2].solved;
      const grad = gateCtx.createRadialGradient(m44X, m44Y, 1, m44X, m44Y, 18);
      grad.addColorStop(0, clusterSolved ? "rgba(254, 240, 138, 0.42)" : "rgba(255, 255, 255, 0.14)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      gateCtx.fillStyle = grad;
      gateCtx.beginPath();
      gateCtx.arc(m44X, m44Y, 18, 0, Math.PI * 2);
      gateCtx.fill();
    }

    for (const [i, j] of gateEdges) {
      const p1 = gateNodes[i];
      const p2 = gateNodes[j];
      if (!p1 || !p2) continue;

      gateCtx.beginPath();
      gateCtx.moveTo(p1.x, p1.y);
      gateCtx.lineTo(p2.x, p2.y);

      if (p1.solved && p2.solved) {
        gateCtx.strokeStyle = "rgba(251, 191, 36, 0.95)";
        gateCtx.lineWidth = 2.8;
        gateCtx.shadowColor = "#fbbf24";
        gateCtx.shadowBlur = 15;
      } else {
        gateCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        gateCtx.lineWidth = 1.5;
        gateCtx.shadowBlur = 0;
      }
      gateCtx.stroke();
      gateCtx.shadowBlur = 0;
    }

    for (let i = 0; i < gateNodes.length; i++) {
      const p = gateNodes[i];
      gateCtx.beginPath();
      gateCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.solved) {
        gateCtx.fillStyle = "#ffffff";
        gateCtx.shadowColor = "#fbbf24";
        gateCtx.shadowBlur = 20;
        gateCtx.fill();

        gateCtx.beginPath();
        gateCtx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        gateCtx.strokeStyle = "rgba(251, 191, 36, 0.65)";
        gateCtx.lineWidth = 1.8;
        gateCtx.stroke();
      } else {
        gateCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
        gateCtx.shadowBlur = 0;
        gateCtx.fill();
      }
      gateCtx.shadowBlur = 0;
    }

    requestAnimationFrame(renderConstellation);
  }
  renderConstellation();

  renderCurrentRiddle();

  const enterBtn = document.getElementById("enter-story-btn");
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {

      const targetScroll = 1450;
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 2.2 });
      } else if (typeof gsap !== "undefined") {
        gsap.to(window, { scrollTo: targetScroll, duration: 2.0, ease: "power2.inOut" });
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    });
  }
}

function normalizeAnswer(raw) {
  let s = (raw || "").trim().toLowerCase();
  const replacements = [
    ["ä", "ae"], ["ö", "oe"], ["ü", "ue"], ["ß", "ss"],
    ["á", "a"], ["à", "a"], ["â", "a"], ["ã", "a"],
    ["é", "e"], ["è", "e"], ["ê", "e"], ["ë", "e"],
    ["í", "i"], ["ì", "i"], ["î", "i"],
    ["ó", "o"], ["ò", "o"], ["ô", "o"], ["õ", "o"],
    ["ú", "u"], ["ù", "u"], ["û", "u"],
    ["ç", "c"], ["ñ", "n"]
  ];
  for (const [src, dst] of replacements) {
    s = s.split(src).join(dst);
  }
  s = s.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  return s;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function concatUint8Arrays(arrays) {
  const totalLen = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(totalLen);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

const PureCryptoFallback = (() => {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(msgBytes) {
    const len = msgBytes.length;
    const bitLenHi = Math.floor((len * 8) / 0x100000000);
    const bitLenLo = (len * 8) >>> 0;
    const padLen = ((len + 9 + 63) & ~63);
    const buf = new Uint8Array(padLen);
    buf.set(msgBytes);
    buf[len] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(padLen - 8, bitLenHi, false);
    view.setUint32(padLen - 4, bitLenLo, false);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const W = new Uint32Array(64);

    for (let off = 0; off < padLen; off += 64) {
      for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => outView.setUint32(i * 4, v, false));
    return out;
  }

  function hmacSha256(keyBytes, dataBytes) {
    const blockSize = 64;
    let k = keyBytes.length > blockSize ? sha256(keyBytes) : keyBytes;
    const ipad = new Uint8Array(blockSize + dataBytes.length);
    const opad = new Uint8Array(blockSize + 32);
    for (let i = 0; i < blockSize; i++) {
      const kb = i < k.length ? k[i] : 0;
      ipad[i] = kb ^ 0x36;
      opad[i] = kb ^ 0x5c;
    }
    ipad.set(dataBytes, blockSize);
    const innerHash = sha256(ipad);
    opad.set(innerHash, blockSize);
    return sha256(opad);
  }

  function pbkdf2Sha256(passwordBytes, saltBytes, iterations) {
    const saltInt = new Uint8Array(saltBytes.length + 4);
    saltInt.set(saltBytes);
    saltInt[saltBytes.length + 3] = 1;
    let u = hmacSha256(passwordBytes, saltInt);
    const t = new Uint8Array(u);
    for (let i = 1; i < iterations; i++) {
      u = hmacSha256(passwordBytes, u);
      for (let j = 0; j < 32; j++) t[j] ^= u[j];
    }
    return t;
  }

  const SBOX = new Uint8Array(256);
  const RCON = new Uint8Array([0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]);
  (() => {
    const p = new Uint8Array(256), q = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      p[i] = x;
      q[x] = i;
      x ^= (x << 1) ^ ((x & 0x80) ? 0x11b : 0);
    }
    SBOX[0] = 0x63;
    for (let i = 1; i < 256; i++) {
      let y = p[255 - q[i]];
      let s = y;
      for (let k = 1; k < 5; k++) {
        y = ((y << 1) | (y >>> 7)) & 0xff;
        s ^= y;
      }
      SBOX[i] = s ^ 0x63;
    }
  })();

  function expandKey256(key) {
    const w = new Uint8Array(240);
    w.set(key);
    let i = 32, rconIdx = 1;
    const temp = new Uint8Array(4);
    while (i < 240) {
      temp.set(w.subarray(i - 4, i));
      if (i % 32 === 0) {
        const t = temp[0];
        temp[0] = SBOX[temp[1]] ^ RCON[rconIdx++];
        temp[1] = SBOX[temp[2]];
        temp[2] = SBOX[temp[3]];
        temp[3] = SBOX[t];
      } else if (i % 32 === 16) {
        for (let k = 0; k < 4; k++) temp[k] = SBOX[temp[k]];
      }
      for (let k = 0; k < 4; k++) {
        w[i] = w[i - 32] ^ temp[k];
        i++;
      }
    }
    return w;
  }

  function xtime(a) { return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff; }

  function aesEncryptBlock(block, rk) {
    const s = new Uint8Array(block);
    for (let i = 0; i < 16; i++) s[i] ^= rk[i];
    for (let round = 1; round <= 14; round++) {
      for (let i = 0; i < 16; i++) s[i] = SBOX[s[i]];
      let t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
      t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
      if (round < 14) {
        for (let c = 0; c < 16; c += 4) {
          const a0 = s[c], a1 = s[c + 1], a2 = s[c + 2], a3 = s[c + 3];
          const u = a0 ^ a1 ^ a2 ^ a3;
          s[c] ^= u ^ xtime(a0 ^ a1);
          s[c + 1] ^= u ^ xtime(a1 ^ a2);
          s[c + 2] ^= u ^ xtime(a2 ^ a3);
          s[c + 3] ^= u ^ xtime(a3 ^ a0);
        }
      }
      const roff = round * 16;
      for (let i = 0; i < 16; i++) s[i] ^= rk[roff + i];
    }
    return s;
  }

  function ghashMul(x, y) {
    const z = new Uint8Array(16);
    const v = new Uint8Array(y);
    for (let i = 0; i < 16; i++) {
      let xi = x[i];
      for (let bit = 7; bit >= 0; bit--) {
        if ((xi >> bit) & 1) {
          for (let k = 0; k < 16; k++) z[k] ^= v[k];
        }
        const lsb = v[15] & 1;
        for (let k = 15; k > 0; k--) v[k] = (v[k] >>> 1) | ((v[k - 1] & 1) << 7);
        v[0] >>>= 1;
        if (lsb) v[0] ^= 0xe1;
      }
    }
    return z;
  }

  function aes256GcmDecrypt(keyBytes, ivBytes, ctWithTag) {
    if (ctWithTag.length < 16) return null;
    const ctLen = ctWithTag.length - 16;
    const ct = ctWithTag.subarray(0, ctLen);
    const tag = ctWithTag.subarray(ctLen);

    const rk = expandKey256(keyBytes);
    const H = aesEncryptBlock(new Uint8Array(16), rk);

    const j0 = new Uint8Array(16);
    j0.set(ivBytes.subarray(0, 12), 0);
    j0[15] = 1;

    let ghash = new Uint8Array(16);
    for (let off = 0; off < ctLen; off += 16) {
      const chunk = ct.subarray(off, Math.min(ctLen, off + 16));
      for (let k = 0; k < chunk.length; k++) ghash[k] ^= chunk[k];
      ghash = ghashMul(ghash, H);
    }
    const lenBlock = new Uint8Array(16);
    const dv = new DataView(lenBlock.buffer);
    const bitLen = ctLen * 8;
    dv.setUint32(12, bitLen >>> 0, false);
    dv.setUint32(8, Math.floor(bitLen / 0x100000000), false);
    for (let k = 0; k < 16; k++) ghash[k] ^= lenBlock[k];
    ghash = ghashMul(ghash, H);

    const sJ0 = aesEncryptBlock(j0, rk);
    let diff = 0;
    for (let k = 0; k < 16; k++) {
      diff |= (ghash[k] ^ sJ0[k]) ^ tag[k];
    }
    if (diff !== 0) return null;

    const pt = new Uint8Array(ctLen);
    const ctr = new Uint8Array(j0);
    const ctrView = new DataView(ctr.buffer);
    let counterVal = 1;
    for (let off = 0; off < ctLen; off += 16) {
      counterVal = (counterVal + 1) >>> 0;
      ctrView.setUint32(12, counterVal, false);
      const ks = aesEncryptBlock(ctr, rk);
      const rem = Math.min(16, ctLen - off);
      for (let k = 0; k < rem; k++) pt[off + k] = ct[off + k] ^ ks[k];
    }
    return pt;
  }

  return { sha256, pbkdf2Sha256, aes256GcmDecrypt };
})();

const hasSubtleCrypto = () => Boolean(window.crypto && window.crypto.subtle);

async function sha256Bytes(dataBytes) {
  if (hasSubtleCrypto()) {
    const hashBuf = await window.crypto.subtle.digest("SHA-256", dataBytes);
    return new Uint8Array(hashBuf);
  }
  return PureCryptoFallback.sha256(dataBytes);
}

async function deriveKeyAndDecryptSlot(candidateNorm, slot, iterations) {
  const enc = new TextEncoder();
  const passBytes = enc.encode(candidateNorm);
  const saltBytes = base64ToBytes(slot.salt);
  const ivBytes = base64ToBytes(slot.iv);
  const ctBytes = base64ToBytes(slot.ct);

  if (hasSubtleCrypto()) {
    try {
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        passBytes,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBytes,
          iterations: iterations,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      const ptBuf = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        aesKey,
        ctBytes
      );
      return new Uint8Array(ptBuf);
    } catch (_) {
      return null;
    }
  } else {
    const rawKey = PureCryptoFallback.pbkdf2Sha256(passBytes, saltBytes, iterations);
    return PureCryptoFallback.aes256GcmDecrypt(rawKey, ivBytes, ctBytes);
  }
}

async function aesGcmDecryptWithRawKey(rawKeyBytes, ivB64, ctB64) {
  const ivBytes = base64ToBytes(ivB64);
  const ctBytes = base64ToBytes(ctB64);

  if (hasSubtleCrypto()) {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      rawKeyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    const ptBuf = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      cryptoKey,
      ctBytes
    );
    return new Uint8Array(ptBuf);
  } else {
    const pt = PureCryptoFallback.aes256GcmDecrypt(rawKeyBytes, ivBytes, ctBytes);
    if (!pt) throw new Error("AES-256-GCM decryption failed");
    return pt;
  }
}

async function verifyEncryptedQuestionAnswer(rawInput, quizItem) {
  const fullNorm = normalizeAnswer(rawInput);
  if (!fullNorm) return null;

  const candidates = [fullNorm];
  const words = fullNorm.split(" ").filter((w) => w.length >= 3);
  for (const w of words) {
    if (!candidates.includes(w)) candidates.push(w);
  }

  const iterations = CONFIG.pbkdf2Iterations || 60000;
  const slots = quizItem.encryptedSlots || [];
  const dec = new TextDecoder();

  for (const cand of candidates) {
    for (const slot of slots) {
      const ptBytes = await deriveKeyAndDecryptSlot(cand, slot, iterations);
      if (ptBytes) {
        try {
          return JSON.parse(dec.decode(ptBytes));
        } catch (_) {}
      }
    }
  }
  return null;
}

function loadEncryptedMediaChunk(encObj) {
  return new Promise((resolve, reject) => {
    if (encObj.ct) {
      resolve(encObj.ct);
      return;
    }
    const chunkId = encObj.id;
    const chunkSrc = encObj.src;
    if (!chunkId || !chunkSrc) {
      reject(new Error("Missing encrypted chunk id or src"));
      return;
    }
    if (window.__ENC_MEDIA_CHUNKS__ && window.__ENC_MEDIA_CHUNKS__[chunkId]) {
      const ct = window.__ENC_MEDIA_CHUNKS__[chunkId];
      delete window.__ENC_MEDIA_CHUNKS__[chunkId];
      resolve(ct);
      return;
    }
    const scriptEl = document.createElement("script");
    scriptEl.src = chunkSrc;
    scriptEl.async = true;
    scriptEl.onload = () => {
      scriptEl.remove();
      const ct = window.__ENC_MEDIA_CHUNKS__ && window.__ENC_MEDIA_CHUNKS__[chunkId];
      if (window.__ENC_MEDIA_CHUNKS__) {
        delete window.__ENC_MEDIA_CHUNKS__[chunkId];
      }
      if (ct) {
        resolve(ct);
      } else {
        reject(new Error(`Chunk ${chunkId} leer oder nicht gefunden`));
      }
    };
    scriptEl.onerror = () => {
      scriptEl.remove();
      reject(new Error(`Konnte ${chunkSrc} nicht laden`));
    };
    document.head.appendChild(scriptEl);
  });
}

async function decryptFullStoryVault(onProgress) {
  if (!CONFIG.isEncrypted || !CONFIG.encryptedVault) return;

  const combinedSecrets = concatUint8Arrays(unlockedQuestionSecrets);
  const masterKeyBytes = await sha256Bytes(combinedSecrets);

  const vaultPtBytes = await aesGcmDecryptWithRawKey(
    masterKeyBytes,
    CONFIG.encryptedVault.iv,
    CONFIG.encryptedVault.ct
  );
  const vaultData = JSON.parse(new TextDecoder().decode(vaultPtBytes));
  Object.assign(CONFIG, vaultData);

  const encPhotos = window.__ENCRYPTED_PHOTOS__ || {};
  const entries = Object.entries(encPhotos);
  const totalMedia = entries.length;
  let completedMedia = 0;
  let nextIdx = 0;
  const concurrency = 6;

  async function worker() {
    while (nextIdx < totalMedia) {
      const currentIdx = nextIdx++;
      const [photoPath, encObj] = entries[currentIdx];
      try {
        const ctB64 = await loadEncryptedMediaChunk(encObj);
        const imgBytes = await aesGcmDecryptWithRawKey(masterKeyBytes, encObj.iv, ctB64);
        const blob = new Blob([imgBytes], { type: encObj.mime || "image/jpeg" });
        decryptedPhotoBlobUrls[photoPath] = URL.createObjectURL(blob);
      } catch (err) {
        console.error("Fehler beim Entschlüsseln von Medium:", photoPath, err);
      }
      completedMedia++;
      if (typeof onProgress === "function") {
        onProgress(completedMedia, totalMedia);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, totalMedia); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

function triggerInputShake(inputTrack, inputEl) {
  if (!inputTrack) return;
  inputTrack.classList.remove("shake-error");

  void inputTrack.offsetWidth;
  inputTrack.classList.add("shake-error");
  if (inputEl) {
    inputEl.focus();
    inputEl.select();
  }
}

function renderCurrentRiddle() {
  const stepInd = document.getElementById("riddle-step-indicator");
  const qText = document.getElementById("riddle-question-text");
  const input = document.getElementById("gate-answer-input");
  const inputTrack = document.getElementById("sky-input-track");
  const submitBtn = document.getElementById("gate-submit-btn");
  const unlockedBanner = document.getElementById("gate-unlocked-banner");

  const total = CONFIG.quiz.length;

  if (solvedQuizCount >= total) {
    if (stepInd) stepInd.textContent = "Sternbild vollendet";
    if (qText) qText.textContent = "Entschlüssele unsere Erinnerungen...";
    if (inputTrack) inputTrack.style.display = "none";

    (async () => {
      try {
        if (CONFIG.isEncrypted) {
          await decryptFullStoryVault((done, totalCount) => {
            if (qText) {
              qText.textContent = `Entschlüssele unsere Erinnerungen... (${done} / ${totalCount})`;
            }
          });
          initPersonalStoryContent();
        }
        if (qText) qText.textContent = "Geschafft! Alle 5 Sterne sind verbunden.";
        if (unlockedBanner) unlockedBanner.style.display = "flex";
        unlockStory();
      } catch (err) {
        console.error("Fehler bei der Entschlüsselung:", err);
        if (qText) qText.textContent = "Fehler beim Entschlüsseln der Daten.";
      }
    })();
    return;
  }

  const q = CONFIG.quiz[solvedQuizCount];
  if (stepInd) stepInd.textContent = `Stern ${solvedQuizCount + 1} von ${total}`;
  if (qText) qText.textContent = q.question;
  if (inputTrack) inputTrack.classList.remove("shake-error");
  if (input) {
    input.value = "";
    input.disabled = false;
    input.placeholder = q.placeholder;
    input.focus();
  }
  if (submitBtn) submitBtn.disabled = false;

  let isChecking = false;

  const checkAnswer = async () => {
    if (isChecking) return;
    const val = input.value.trim();
    if (!val) {
      triggerInputShake(inputTrack, input);
      return;
    }

    isChecking = true;
    submitBtn.disabled = true;

    let unlockedSlot = null;
    if (CONFIG.isEncrypted && q.encryptedSlots) {
      unlockedSlot = await verifyEncryptedQuestionAnswer(val, q);
    } else if (q.acceptedAnswers) {
      const lowerVal = val.toLowerCase();
      const matched = q.acceptedAnswers.some((ans) => lowerVal.includes(ans) || ans.includes(lowerVal));
      if (matched) unlockedSlot = { ok: true };
    }

    if (unlockedSlot) {
      if (unlockedSlot.secret) {
        unlockedQuestionSecrets[solvedQuizCount] = base64ToBytes(unlockedSlot.secret);
      }
      if (gateNodes[solvedQuizCount]) gateNodes[solvedQuizCount].solved = true;
      if (window._playChime) window._playChime(solvedQuizCount);

      setTimeout(() => {
        solvedQuizCount++;
        renderCurrentRiddle();
      }, 360);
    } else {
      isChecking = false;
      submitBtn.disabled = false;
      triggerInputShake(inputTrack, input);
    }
  };

  submitBtn.onclick = checkAnswer;
  input.onkeydown = (e) => {
    if (e.key === "Enter") checkAnswer();
  };
}

function unlockStory() {
  isStoryUnlocked = true;
  document.documentElement.classList.remove("site-locked");
  document.body.classList.remove("site-locked");

  if (lenis) {
    lenis.start();
  }

  setupStoryNavigation();

  if (typeof ScrollTrigger !== "undefined") {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  }
}

function initHeroForestDescentParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const heroStage = document.getElementById("scene-gate");
  const skyWrapper = document.getElementById("sky-parallax-wrapper");
  const forestBackdrop = document.getElementById("forest-descent-backdrop");
  const riddlePanel = document.getElementById("gate-riddle-panel");
  const heroContent = document.getElementById("scene-hero");

  if (!heroStage || !skyWrapper) return;

  ScrollTrigger.create({
    trigger: heroStage,
    start: "top top",
    end: "+=2000",
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const scaleSky = 1 + Math.min(0.5, progress) * 0.35;
      const skyOpacity = Math.max(0, 1 - progress * 2.2);
      skyWrapper.style.transform = `scale(${scaleSky})`;
      skyWrapper.style.opacity = skyOpacity;

      if (forestBackdrop) {
        const forestOpacity = Math.min(1, progress * 2.2);
        const forestScale = 1.12 - Math.min(1, progress * 1.4) * 0.12;
        forestBackdrop.style.opacity = forestOpacity;
        forestBackdrop.style.transform = `scale(${forestScale})`;
      }

      if (riddlePanel) {
        const riddleOpacity = Math.max(0, 1 - (progress / 0.28));
        const riddleY = -progress * 150;
        riddlePanel.style.opacity = riddleOpacity;
        riddlePanel.style.transform = `translate3d(0, ${riddleY}px, 0)`;
        riddlePanel.style.pointerEvents = progress > 0.15 ? "none" : "auto";
      }

      if (heroContent) {
        if (progress >= 0.24) {
          const heroProg = Math.min(1, (progress - 0.24) / 0.26);
          heroContent.style.opacity = heroProg;
          heroContent.style.transform = `translate3d(0, ${(1 - heroProg) * 28}px, 0) scale(${0.97 + heroProg * 0.03})`;
          heroContent.style.pointerEvents = "auto";
        } else {
          heroContent.style.opacity = 0;
          heroContent.style.transform = `translate3d(0, 28px, 0) scale(0.97)`;
          heroContent.style.pointerEvents = "none";
        }
      }
    }
  });
}

function initForestCollagePinAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const collageSection = document.getElementById("scene-forest-intro");
  if (!collageSection) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: collageSection,
      start: "top top",
      end: "+=140%",
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  tl.fromTo("#collage-small",
    { y: 40, scale: 0.92, autoAlpha: 0.3 },
    { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
    0
  );

  tl.fromTo("#collage-medium",
    { y: 55, scale: 0.92, autoAlpha: 0.3 },
    { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
    0.05
  );

  tl.fromTo("#collage-narrative",
    { x: 40, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
    0.05
  );

  tl.fromTo("#collage-big",
    { y: 50, scale: 0.94, autoAlpha: 0.3 },
    { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
    0.1
  );

  tl.to({}, { duration: 0.5 });
}

function initForestMarquee() {
  if (typeof gsap === "undefined") return;
  const track = document.getElementById("forest-marquee-track");
  if (!track) return;

  gsap.to(track, {
    xPercent: -50,
    duration: 18,
    ease: "none",
    repeat: -1
  });
}

const MILESTONE_SCENERY = [
  {
    bgImage: "assets/forest-frog-pond.jpg",
    layout: "layout-right-focus",
    sceneLabel: "Waldeule im Herbstgeäst"
  },
  {
    bgImage: "assets/forest-entrance.jpg",
    layout: "layout-right-focus",
    sceneLabel: "Unsere Frösche am Laternen-Teich"
  },
  {
    bgImage: "assets/forest-fox.jpg",
    layout: "layout-right-focus",
    sceneLabel: "Moosfels auf der Glühwürmchen-Lichtung"
  },
  {
    bgImage: "assets/forest-witch-cottage.jpg",
    layout: "layout-split-bottom",
    sceneLabel: "Versteckte Hexenhütte mit Kerzenlicht"
  },
  {
    bgImage: "assets/forest-toad-lantern.jpg",
    layout: "layout-left-focus",
    sceneLabel: "Gemütliche Kröte bei den Leuchtpilzen"
  },
  {
    bgImage: "assets/forest-stag.jpg",
    layout: "layout-left-focus",
    sceneLabel: "Laternenpfad zwischen den alten Tannen"
  },
  {
    bgImage: "assets/forest-pond.jpg",
    layout: "layout-split-bottom",
    sceneLabel: "Stiller nächtlicher Waldteich"
  },
  {
    bgImage: "assets/forest-pumpkin-clearing.jpg",
    layout: "layout-split-reverse",
    sceneLabel: "Lichter & Halloween-Kürbisse im Laub"
  },
  {
    bgImage: "assets/forest-frog-pond.jpg",
    layout: "layout-right-focus",
    sceneLabel: "Zwei Frösche auf dem Seerosenblatt"
  },
  {
    bgImage: "assets/forest-ghost.jpg",
    layout: "layout-left-focus",
    sceneLabel: "Kleiner Geist hinter der alten Eiche"
  },
  {
    bgImage: "assets/forest-bridge.jpg",
    layout: "layout-center-showcase",
    sceneLabel: "Unsere Lichtung im Herbstwald"
  }
];

function isVideoFile(pathStr) {
  if (!pathStr || typeof pathStr !== "string") return false;
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(pathStr.trim());
}

function normalizeImageEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string" && entry.trim() !== "") {
    const clean = entry.trim();
    return { src: clean, caption: "", isVideo: isVideoFile(clean) };
  }
  if (typeof entry === "object") {
    const rawSrc = entry.src || entry.video || entry.image || entry.path || "";
    if (typeof rawSrc === "string" && rawSrc.trim() !== "") {
      const clean = rawSrc.trim();
      const cap = typeof entry.caption === "string" ? entry.caption.trim() : "";
      const isVid = entry.type === "video" || Boolean(entry.video) || isVideoFile(clean);
      return { src: clean, caption: cap, isVideo: isVid };
    }
  }
  return null;
}

function initIntroCollagePhotos() {
  const cardIds = ["collage-small", "collage-medium", "collage-big"];
  const introList = Array.isArray(CONFIG.introPhotos) ? CONFIG.introPhotos : [];

  cardIds.forEach((id, idx) => {
    const cardEl = document.getElementById(id);
    if (!cardEl) return;

    const entry = normalizeImageEntry(introList[idx]);
    if (!entry) return;

    const resolvedSrc = decryptedPhotoBlobUrls[entry.src] || entry.src;
    const safeCaption = (entry.caption || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const captionHtml = entry.caption
      ? `<span class="collage-caption-tag">${entry.caption}</span>`
      : "";

    const mediaTag = entry.isVideo
      ? `<video src="${resolvedSrc}" class="collage-art-img" autoplay loop muted playsinline preload="metadata"></video>`
      : `<img src="${resolvedSrc}" alt="${safeCaption || "Erinnerungsfoto"}" class="collage-art-img" loading="lazy" />`;

    cardEl.setAttribute("onclick", `openPhotoLightbox('${resolvedSrc}', '${safeCaption}', ${entry.isVideo})`);
    cardEl.innerHTML = `
      <div class="photo-inner-wrap">
        ${mediaTag}
      </div>
      ${captionHtml}
    `;
  });
}

function resolveMilestoneImages(m) {
  const list = [];
  const seenSrcs = new Set();

  const addEntry = (item) => {
    const norm = normalizeImageEntry(item);
    if (norm && !seenSrcs.has(norm.src)) {
      seenSrcs.add(norm.src);
      list.push(norm);
    }
  };

  if (Array.isArray(m.images)) {
    for (const img of m.images) addEntry(img);
  }
  if (Array.isArray(m.videos)) {
    for (const vid of m.videos) addEntry(vid);
  }
  if (Array.isArray(m.media)) {
    for (const med of m.media) addEntry(med);
  }
  if (Array.isArray(m.image)) {
    for (const img of m.image) addEntry(img);
  } else if (m.image) {
    addEntry(m.image);
  }
  if (m.video) {
    addEntry(m.video);
  }
  return list;
}

window.openPhotoLightbox = function (src, captionText, isVideo = false) {
  const lb = document.getElementById("photo-lightbox");
  const img = document.getElementById("lightbox-img");
  const vid = document.getElementById("lightbox-video");
  const cap = document.getElementById("lightbox-caption");
  if (!lb) return;

  if (isVideo && vid) {
    if (img) {
      img.style.display = "none";
      img.src = "";
    }
    vid.style.display = "block";
    vid.src = src;
    vid.play().catch(() => {});
  } else if (img) {
    if (vid) {
      vid.pause();
      vid.style.display = "none";
      vid.src = "";
    }
    img.style.display = "block";
    img.src = src;
  }

  if (cap) {
    cap.textContent = captionText || "";
    cap.style.display = captionText ? "block" : "none";
  }
  lb.classList.add("open");
};

window.closePhotoLightbox = function () {
  const lb = document.getElementById("photo-lightbox");
  const vid = document.getElementById("lightbox-video");
  if (vid) {
    vid.pause();
    vid.src = "";
  }
  if (lb) lb.classList.remove("open");
};

function initFullscreenTimelineDOM() {
  const container = document.getElementById("fullscreen-timeline-container");
  if (!container) return;

  container.innerHTML = CONFIG.milestones.map((m, idx) => {
    const spec = MILESTONE_SCENERY[idx % MILESTONE_SCENERY.length];
    const isFirst = idx === 0 ? "first-milestone" : "";
    const rawImages = resolveMilestoneImages(m);

    // Build 1 or multiple photo/video cards in their original aspect ratio with optional captions
    const resolvedPhotos = rawImages.length > 0
      ? rawImages.map((item) => ({
          src: decryptedPhotoBlobUrls[item.src] || item.src,
          caption: item.caption || "",
          isVideo: Boolean(item.isVideo)
        }))
      : [{
          src: spec.bgImage,
          caption: "",
          isVideo: false
        }];

    const countAttr = resolvedPhotos.length <= 7
      ? String(resolvedPhotos.length)
      : "7+";

    const photosHtml = resolvedPhotos.map((p, pIdx) => {
      const safeTitle = (m.title || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const safeCaption = (p.caption || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const lightboxLabel = safeCaption ? `${safeTitle} — ${safeCaption}` : safeTitle;
      const captionBarHtml = p.caption
        ? `<div class="photo-frame-caption"><span>${p.caption}</span></div>`
        : "";

      const mediaElementHtml = p.isVideo
        ? `<video src="${p.src}" class="user-img user-video" autoplay loop muted playsinline preload="metadata"></video>`
        : `<img src="${p.src}" alt="${safeCaption || safeTitle}" class="user-img" loading="lazy" />`;

      return `
        <div class="photo-card-item photo-slot-${pIdx}" onclick="openPhotoLightbox('${p.src}', '${lightboxLabel}', ${p.isVideo})">
          <div class="photo-inner-wrap">
            ${mediaElementHtml}
          </div>
          ${captionBarHtml}
        </div>
      `;
    }).join("");

    return `
      <div class="milestone-stage-item ${isFirst} ${spec.layout}" data-milestone-index="${idx}" id="memory-scene-${idx}">
        <div class="milestone-visual-wrapper">

          <!-- 1. Full-Bleed Storybook Forest Illustration Layer (z-index: 2) -->
          <div class="scene-bg-layer">
            <img src="${spec.bgImage}" alt="${spec.sceneLabel}" class="scene-bg-illustration" loading="${idx < 2 ? 'eager' : 'lazy'}" />
            <div class="scene-bg-scrim"></div>
          </div>

          <!-- 2. Spatially Distributed Responsive Content Grid (z-index: 12 - Maximum Space Utilization!) -->
          <div class="milestone-content-grid" data-photo-count="${countAttr}">

            <!-- Distributed Memory Photo Cards (Preserving Original Aspect Ratio & Optional Captions) -->
            ${photosHtml}

            <!-- Story Text Card -->
            <div class="scene-story-caption">
              <div class="caption-meta-row">
                <span class="caption-date-badge">${m.date}</span>
                <span class="caption-location">${m.location}</span>
              </div>
              <h2 class="caption-title">${m.title}</h2>
              <p class="caption-description">${m.description}</p>
              <span class="caption-tag">[ ${m.tag} ]</span>
            </div>

          </div>

        </div>
      </div>
    `;
  }).join("");
}

function initPinnedTimelineScrollytelling() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section = document.getElementById("scene-timeline");
  if (!section) return;

  const stages = section.querySelectorAll(".milestone-stage-item");
  if (!stages.length) return;

  const firstStage = stages[0];
  const firstVisualWrapper = firstStage.querySelector(".milestone-visual-wrapper");
  const firstCaption = firstStage.querySelector(".scene-story-caption");
  const firstPhotos = firstStage.querySelectorAll(".photo-card-item");
  const firstBg = firstStage.querySelector(".scene-bg-layer");

  const marqueeWrap = document.getElementById("forest-marquee-wrap");
  const hudBar = document.getElementById("timeline-hud-bar");
  const barFill = document.getElementById("timeline-bar-fill");
  const chapterCounter = document.getElementById("hud-chapter-counter");

  const otherStages = Array.from(stages).slice(1);
  const totalCount = stages.length;

  gsap.set([firstCaption, hudBar], { autoAlpha: 0, y: 24 });
  if (firstPhotos.length) gsap.set(firstPhotos, { autoAlpha: 0, y: 28, scale: 0.96 });
  if (firstBg) gsap.set(firstBg, { scale: 1.05, yPercent: -2 });

  otherStages.forEach((stage) => {
    const caption = stage.querySelector(".scene-story-caption");
    const photos = stage.querySelectorAll(".photo-card-item");
    const bg = stage.querySelector(".scene-bg-layer");

    gsap.set(stage, { yPercent: 100, autoAlpha: 1 });
    if (caption) gsap.set(caption, { autoAlpha: 0, y: 30 });
    if (photos.length) gsap.set(photos, { autoAlpha: 0, y: 30, scale: 0.96 });
    if (bg) gsap.set(bg, { scale: 1.08, yPercent: -4 });
  });

  const scrollDistance = window.innerHeight * (totalCount * 1.45);

  const tlMain = gsap.timeline({
    scrollTrigger: {
      id: "forest-timeline-pin",
      trigger: section,
      start: "top top",
      end: "+=" + scrollDistance,
      scrub: 0.9,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (chapterCounter) {
          const idx = Math.min(
            totalCount,
            Math.max(1, Math.ceil(self.progress * totalCount))
          );
          chapterCounter.textContent = `${String(idx).padStart(2, "0")} / ${String(totalCount).padStart(2, "0")}`;
        }
      }
    }
  });

  tlMain.to(firstVisualWrapper, {
    width: "100vw",
    height: "100%",
    duration: 0.5,
    ease: "power1.inOut"
  });

  if (marqueeWrap) {
    tlMain.to(marqueeWrap, {
      autoAlpha: 0,
      scale: 1.06,
      duration: 0.35,
      ease: "power1.out"
    }, "-=0.35");
  }

  tlMain.to([firstCaption, hudBar], {
    autoAlpha: 1,
    y: 0,
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.1");

  if (firstPhotos.length) {
    tlMain.to(firstPhotos, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      stagger: 0.06,
      duration: 0.4,
      ease: "power2.out"
    }, "<");
  }

  if (firstBg) {
    tlMain.to(firstBg, {
      scale: 1,
      yPercent: 0,
      duration: 0.5,
      ease: "power1.out"
    }, "<");
  }

  tlMain.to({}, { duration: 0.85 });

  const expansionEndTime = 0.5;

  otherStages.forEach((currentStage, i) => {
    const prevStage = i === 0 ? firstStage : otherStages[i - 1];
    const prevCaption = prevStage.querySelector(".scene-story-caption");
    const prevPhotos = prevStage.querySelectorAll(".photo-card-item");

    const curCaption = currentStage.querySelector(".scene-story-caption");
    const curPhotos = currentStage.querySelectorAll(".photo-card-item");
    const curBg = currentStage.querySelector(".scene-bg-layer");

    tlMain.to(currentStage, {
      yPercent: 0,
      duration: 0.65,
      ease: "power2.inOut"
    });

    tlMain.to(prevStage, {
      yPercent: -35,
      scale: 0.95,
      autoAlpha: 0,
      duration: 0.65,
      ease: "power2.inOut"
    }, "<");

    if (prevCaption) {
      tlMain.to(prevCaption, {
        autoAlpha: 0,
        y: -20,
        duration: 0.3,
        ease: "power1.in"
      }, "<");
    }

    if (prevPhotos.length) {
      tlMain.to(prevPhotos, {
        autoAlpha: 0,
        y: -20,
        duration: 0.3,
        ease: "power1.in"
      }, "<");
    }

    if (curBg) {
      tlMain.to(curBg, {
        scale: 1,
        yPercent: 0,
        duration: 0.5,
        ease: "power1.out"
      }, "-=0.35");
    }

    if (curCaption) {
      tlMain.to(curCaption, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.25");
    }

    if (curPhotos.length) {
      tlMain.to(curPhotos, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        stagger: 0.06,
        duration: 0.4,
        ease: "power2.out"
      }, "<");
    }

    tlMain.to({}, { duration: 0.9 });
  });

  if (barFill) {
    tlMain.to(barFill, {
      width: "100%",
      ease: "none",
      duration: tlMain.duration() - expansionEndTime
    }, expansionEndTime);
  }
}

function initBottomScenesParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.utils.toArray(".gs-reveal").forEach((elem) => {
    gsap.fromTo(
      elem,
      { y: 50, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 86%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  ["#scene-finale"].forEach((sel) => {
    const scene = document.querySelector(sel);
    if (!scene) return;
    const bg = scene.querySelector(".scene-bg-layer");

    if (bg) {
      gsap.fromTo(
        bg,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: scene,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }
  });
}

function setupStoryNavigation() {
  const nav = document.getElementById("story-nav");
  if (!nav) return;

  const navTargets = [
    { id: "scene-gate", label: "Start & Übersicht" },
    { id: "scene-forest-intro", label: "Einleitung" },
    { id: "scene-timeline", label: "Unser Jahresrückblick" },
    { id: "scene-finale", label: "Countdown & Brief" }
  ];

  nav.innerHTML = navTargets.map((item, i) => `
    <div class="story-dot ${i === 0 ? "active" : ""}" data-target="${item.id}" title="${item.label}"></div>
  `).join("");

  nav.classList.add("visible");

  nav.querySelectorAll(".story-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      if (!isStoryUnlocked) return;
      const targetId = dot.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      if (lenis) {
        lenis.scrollTo(targetEl, { duration: 1.8 });
      } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  if (typeof ScrollTrigger !== "undefined") {
    navTargets.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) updateActiveStoryDot(item.id);
        }
      });
    });
  }
}

function updateActiveStoryDot(activeId) {
  document.querySelectorAll(".story-dot").forEach((dot) => {
    dot.classList.toggle("active", dot.getAttribute("data-target") === activeId);
  });
}

function calculateGreatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function initDualClocksAndDistance() {
  const loc = CONFIG.locations;
  const distKm = calculateGreatCircleDistance(loc.home.lat, loc.home.lon, loc.brazil.lat, loc.brazil.lon);

  const lightMilliseconds = (distKm / 299.792).toFixed(1);
  const lightYears = (distKm / 9.461e12).toExponential(2);

  const distEl = document.getElementById("live-distance");
  const astroEl = document.getElementById("astro-conversion");
  if (distEl) distEl.textContent = `${distKm.toLocaleString("de-DE")} km`;
  if (astroEl) astroEl.textContent = `≈ ${lightMilliseconds} ms Lichtzeit (${lightYears} Lj)`;

  const homeCity = document.getElementById("home-city");
  const brazilCity = document.getElementById("brazil-city");
  if (homeCity) homeCity.textContent = loc.home.city;
  if (brazilCity) brazilCity.textContent = loc.brazil.city;

  function updateClocks() {
    const now = new Date();
    const homeTimeEl = document.getElementById("home-time");
    const brazilTimeEl = document.getElementById("brazil-time");

    if (homeTimeEl) {
      homeTimeEl.textContent = now.toLocaleTimeString("de-DE", {
        timeZone: loc.home.timeZone,
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (brazilTimeEl) {
      brazilTimeEl.textContent = now.toLocaleTimeString("de-DE", {
        timeZone: loc.brazil.timeZone,
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);
}

function initCountdowns() {
  const reunionTarget = new Date(CONFIG.reunionDate).getTime();

  function update() {
    const now = new Date().getTime();
    const diffReunion = reunionTarget - now;

    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");
    const capEl = document.querySelector(".countdown-caption");
    const noteEl = document.getElementById("reunion-days-left");

    if (diffReunion > 0) {
      const days = Math.floor(diffReunion / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffReunion % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffReunion % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffReunion % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
      if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");
      if (noteEl) {
        noteEl.textContent = "Nicht mehr lange, bis ich im Flieger nach Brasilien sitze und wir uns endlich wiedersehen!";
      }
    } else {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minsEl) minsEl.textContent = "00";
      if (secsEl) secsEl.textContent = "00";
      if (capEl) capEl.textContent = "Endlich in Brasilien!";
      if (noteEl) noteEl.textContent = "Zeit für unsere gemeinsame Zeit vor Ort.";
    }
  }

  update();
  setInterval(update, 1000);
}

function initFinalLetter() {
  const fl = CONFIG.finalLetter;
  const title = document.getElementById("final-letter-title");
  const date = document.getElementById("final-letter-date");
  const text = document.getElementById("final-letter-text");

  if (title) title.textContent = fl.title;
  if (date) date.textContent = fl.date;
  if (text) text.textContent = fl.text;
}
