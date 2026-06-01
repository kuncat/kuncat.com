// Stub for `three-perf`, which is imported by `@threlte/extras/PerfMonitor.svelte` but pulls in `tweakpane` (UMD-only), which breaks ESM interop when Vite serves it directly. The PerfMonitor component isn't used so it's safe to alias the whole module to this empty stub.
class ThreePerf {
  constructor() {}
  begin() {}
  end() {}
  dispose() {}
  set domElement(_v) {}
  get domElement() {
    return null;
  }
}

export { ThreePerf };
export default ThreePerf;
