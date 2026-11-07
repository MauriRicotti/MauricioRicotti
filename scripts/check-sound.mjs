// Pruebas del almacenamiento y del silencio. No usa audio real ni servicios externos.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(
  readFileSync(new URL("../src/lib/sound.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const KEY = "mr:sound-enabled";
let checks = 0;

function fixture({ saved, shared, blocked = false, rejectResume = false, ssr = false } = {}) {
  const data = shared || new Map(saved === undefined ? [] : [[KEY, saved]]);
  const events = new Map();
  const stats = { contexts: 0, oscillators: [], reads: 0, writes: 0 };
  const storage = {
    getItem(key) { stats.reads++; if (blocked) throw Error("Storage blocked"); return data.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error("Storage blocked"); stats.writes++; data.set(key, value); },
  };
  class AudioContext {
    state = rejectResume ? "suspended" : "running";
    currentTime = 0;
    destination = {};
    constructor() { stats.contexts++; }
    resume() { return rejectResume ? Promise.reject(Error("Not allowed")) : Promise.resolve(); }
    createOscillator() {
      const oscillator = {
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {}, start() {},
        stops: [], stop(when) { this.stops.push(when); },
      };
      stats.oscillators.push(oscillator);
      return oscillator;
    }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
  }
  const window = {
    localStorage: storage, AudioContext,
    addEventListener(name, handler) { events.set(name, handler); },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, ...(ssr ? {} : { window }) });
  return {
    sound: exports.sound, key: exports.SOUND_STORAGE_KEY, stats, data, storage,
    dispatch(name, event = {}) { events.get(name)?.(event); },
  };
}

{
  const f = fixture({ ssr: true });
  assert.equal(f.sound.getServerSnapshot(), false);
  f.sound.playClick();
  assert.equal(f.stats.contexts, 0);
  checks++;
}
{
  const f = fixture({ saved: "false" });
  assert.equal(f.key, KEY);
  assert.equal(f.sound.getSnapshot(), false);
  f.sound.playClick(); f.sound.playPop(); f.sound.playSnap();
  assert.equal(f.stats.contexts, 0, "Mute debe leerse antes de crear AudioContext");
  assert.equal(f.stats.writes, 0, "Leer no debe sobrescribir lo guardado");
  checks++;
}
{
  const f = fixture({ saved: "true" });
  assert.equal(f.sound.enabled, true);
  f.sound.playClick();
  assert.equal(f.stats.contexts, 1);
  assert.equal(f.stats.oscillators.length, 1);
  checks++;
}
{
  const f = fixture();
  assert.equal(f.sound.enabled, true, "Conservar el valor inicial anterior si no hay elección");
  assert.equal(f.stats.writes, 0);
  f.sound.enabled = false;
  assert.equal(f.data.get(KEY), "false");
  const reopened = fixture({ shared: f.data });
  assert.equal(reopened.sound.enabled, false, "Otra instancia debe restaurar apagado");
  reopened.sound.playPop();
  assert.equal(reopened.stats.contexts, 0);
  reopened.sound.enabled = true;
  assert.equal(fixture({ shared: reopened.data }).sound.enabled, true, "También recordar encendido");
  checks++;
}
{
  const f = fixture({ saved: "false" });
  let updates = 0;
  const unsubscribe = f.sound.subscribe(() => updates++);
  f.sound.enabled = true;
  f.sound.playClick();
  f.sound.enabled = false;
  assert.equal(updates, 2);
  assert.ok(f.stats.oscillators.every((o) => o.stops.at(-1) === undefined), "Apagar debe detener efectos activos");
  unsubscribe(); f.sound.enabled = true;
  assert.equal(updates, 2);
  checks++;
}
{
  const f = fixture({ saved: "true" });
  let updates = 0; f.sound.subscribe(() => updates++);
  f.data.set(KEY, "false");
  f.dispatch("storage", { key: KEY, storageArea: f.storage });
  assert.equal(f.sound.enabled, false);
  assert.equal(updates, 1);
  f.data.set(KEY, "true");
  f.dispatch("storage", { key: "otra-clave", storageArea: f.storage });
  assert.equal(f.sound.enabled, false, "Ignorar claves ajenas");
  f.dispatch("storage", { key: KEY, storageArea: {} });
  assert.equal(f.sound.enabled, false, "Ignorar sessionStorage u otra área");
  f.dispatch("storage", { key: KEY, storageArea: f.storage });
  assert.equal(f.sound.enabled, true);
  checks++;
}
{
  const f = fixture({ saved: "true" });
  f.sound.subscribe(() => {});
  f.data.set(KEY, "false"); f.dispatch("pageshow");
  assert.equal(f.sound.enabled, false, "Releer al volver desde caché de navegación");
  f.data.clear(); f.dispatch("storage", { key: null, storageArea: f.storage });
  assert.equal(f.sound.enabled, true, "Borrar datos reinicia la preferencia");
  checks++;
}
{
  const f = fixture({ blocked: true });
  f.sound.enabled = false;
  f.sound.playClick();
  assert.equal(f.sound.enabled, false, "Storage bloqueado no debe impedir silenciar esta visita");
  assert.equal(f.stats.contexts, 0);
  f.dispatch("pageshow");
  assert.equal(f.sound.enabled, false);
  checks++;
}
{
  const f = fixture({ saved: "dato-inválido" });
  assert.equal(f.sound.enabled, true);
  assert.equal(f.stats.writes, 0);
  f.sound.enabled = false;
  assert.equal(f.data.get(KEY), "false");
  checks++;
}
{
  const f = fixture({ rejectResume: true });
  f.sound.playClick();
  await Promise.resolve(); await Promise.resolve();
  f.sound.enabled = false;
  checks++;
}
console.log(`✓ Sonido: ${checks} pruebas de persistencia, SSR, silencio, sincronización y fallos`);
