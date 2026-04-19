/**
 * Self-contained HTML for WebView: COBE WebGL globe (no markers / no pulse UI).
 * Loads `cobe` from esm.sh (Metro does not bundle it for RN).
 */
export const COBE_BACKDROP_WEBVIEW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />
  <style>
    html, body, #wrap { margin: 0; padding: 0; width: 100%; height: 100%; background: #030508; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; }
  </style>
</head>
<body>
  <div id="wrap"><canvas id="c" width="512" height="512"></canvas></div>
  <script type="module">
    import createGlobe from 'https://esm.sh/cobe@0.6.3';

    const wrap = document.getElementById('wrap');
    const canvas = document.getElementById('c');
    let globe = null;
    let phi = 0;
    let resizeTimer = null;

    function sizePx() {
      const w = wrap.clientWidth || window.innerWidth;
      const h = wrap.clientHeight || window.innerHeight;
      return Math.max(2, Math.floor(Math.min(w, h)));
    }

    function start() {
      const size = sizePx();
      if (globe) {
        try { globe.destroy(); } catch (e) {}
        globe = null;
      }
      phi = 0;
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size,
        height: size,
        phi: 0,
        theta: 0.22,
        dark: 1,
        diffuse: 1.45,
        scale: 1.78838,
        mapSamples: 12000,
        mapBrightness: 8,
        mapBaseBrightness: 0.08,
        baseColor: [0.1, 0.13, 0.2],
        markerColor: [0.2, 0.8, 0.9],
        glowColor: [0.04, 0.06, 0.1],
        markers: [],
        opacity: 0.96,
        offset: [0, 0],
        onRender: function (state) {
          phi += 0.0026;
          state.phi = phi;
          state.theta = 0.22;
        },
      });
    }

    start();

    const ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 140);
    });
    ro.observe(wrap);

    window.addEventListener('beforeunload', function () {
      if (globe) {
        try { globe.destroy(); } catch (e) {}
        globe = null;
      }
    });
  </script>
</body>
</html>`;
