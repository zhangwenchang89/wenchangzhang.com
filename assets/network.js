/* Hero background for the Doctoral Students page: a slow field of drifting
 * nodes joined by lines when they come near each other.
 *
 * Tuned to sit beside the video heroes on the other pages — near-black ground,
 * pale marks, motion slow enough to read as texture rather than animation.
 *
 * Stops itself when the tab is hidden or the hero scrolls out of view, and
 * renders a single static frame when the visitor asks for reduced motion.
 */
(function () {
  "use strict";

  var canvas = document.querySelector(".hero-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LINK = 150; // px — join nodes closer than this
  var SPEED = 0.13; // px per frame
  var NODE_ALPHA = 0.45;
  var LINK_ALPHA = 0.16;

  var nodes = [];
  var w = 0;
  var h = 0;
  var raf = null;
  var running = false;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    // density by area, bounded so a wide monitor doesn't turn into a mesh
    var count = Math.max(24, Math.min(78, Math.round((w * h) / 13000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: 0.9 + Math.random() * 1.3
      });
    }
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      else if (n.y > h + 20) n.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i];
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        var fade = 1 - Math.sqrt(d2) / LINK;
        ctx.strokeStyle = "rgba(255,255,255," + (fade * LINK_ALPHA).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(255,255,255," + NODE_ALPHA + ")";
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame() {
    step();
    draw();
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    frame();
  }

  function stop() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = null;
    running = false;
  }

  function build() {
    resize();
    seed();
    draw();
  }

  build();
  start();

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var wasRunning = running;
      stop();
      build();
      if (wasRunning) start();
    }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0 }
    ).observe(canvas);
  }
})();
