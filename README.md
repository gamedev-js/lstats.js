## lstats.js

Visualizing and monitor your performance.

Inspired by [stats.js](https://github.com/mrdoob/stats.js/) and [memory-stats.js](https://github.com/paulirish/memory-stats.js).

![mb](https://cloud.githubusercontent.com/assets/174891/24692965/ef448798-1a0d-11e7-9589-36871a81d9b7.png)
![fps](https://cloud.githubusercontent.com/assets/174891/24692966/ef7a3316-1a0d-11e7-9a8c-b8acc623f5ff.png)
![ms](https://cloud.githubusercontent.com/assets/174891/24692967/ef935814-1a0d-11e7-8246-93d44b06e111.png)

## Why

  - Lite (vs pstats.js)
  - Support GC detection when monitor memory (vs stats.js)
  - Drawing fast (vs memory-stats.js)

## Install

```bash
npm install lstats.js
```

## Usage

```javascript
let stats = new LStats(document.body, [
  'fps', 'ms', 'mem'
]);

function render() {
  stats.tick();
  requestAnimationFrame(render);
}

render();
```

NOTE: if you want to monitor memory, Start Chrome with `--enable-precise-memory-info`. Otherwise the results from performance.memory are bucketed and less useful. if you are using `Electron`, start the BrowserWindow with the following code:

```javascript
let win = new BrowserWindow({
  webPreferences: {
    blinkFeatures: 'PreciseMemoryInfo'
  }
});
```

## License

MIT © 2017 Johnny Wu