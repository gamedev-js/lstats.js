## lstats.js

Visualizing and monitor your performance.

Inspired by [stats.js](https://github.com/mrdoob/stats.js/) and [memory-stats.js](https://github.com/paulirish/memory-stats.js).

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

## License

MIT © 2017 Johnny Wu