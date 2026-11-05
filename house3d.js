/* ============================================================
   house3d.js — Rumah 3D Ikaaa (v2)
   Satu ruangan cute, karakter billboard jalan keliling,
   5 stasiun misi (outfit, galeri, kue, quiz, surat).
   Menimpa renderMap/moveCp/openCheckpoint/show dari index.html.
   Butuh Three.js r128 (CDN). Kalau gagal load -> fallback tombol.
   ============================================================ */
(function(){
'use strict';

/* ---------- CSS tambahan ---------- */
var css = document.createElement('style');
css.textContent = [
'#mapScene{height:400px;background:#F5E9C8}',
'#mapScene canvas{display:block;width:100%;height:100%;touch-action:none}',
'.map-wrap{position:relative}',
'.house-tag{position:absolute;top:10px;left:10px;z-index:5;background:rgba(255,253,246,.92);border:2.5px solid #113B0F;border-radius:999px;padding:5px 12px;font-weight:900;font-size:13px;pointer-events:none}',
'.cam-pills{position:absolute;top:10px;right:10px;z-index:5;display:flex;gap:6px}',
'.cam-pills button{border:2.5px solid #113B0F;border-radius:999px;background:#FFFDF6;font-weight:900;font-size:12px;padding:6px 10px;cursor:pointer;font-family:inherit;box-shadow:0 2px 0 #113B0F}',
'.cam-pills button.on{background:#E84C06;color:#fff}',
'.joy-base{position:absolute;left:14px;bottom:14px;width:118px;height:118px;border-radius:50%;background:rgba(255,253,246,.55);border:3px solid #113B0F;z-index:5;touch-action:none}',
'.joy-knob{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:#E6AA29;border:3px solid #113B0F;box-shadow:0 3px 0 #113B0F;display:flex;align-items:center;justify-content:center;font-size:24px}',
'.house-prompt{position:absolute;right:10px;bottom:14px;z-index:5;max-width:56%;background:rgba(255,253,246,.95);border:3px solid #113B0F;border-radius:18px;padding:10px 12px;font-weight:800;font-size:14px;line-height:1.4;box-shadow:0 4px 0 rgba(17,59,15,.25)}',
'.house-prompt b{display:block;font-size:15px;margin-bottom:2px}',
'.house-prompt button{margin-top:8px;width:100%;border:2.5px solid #113B0F;border-radius:999px;background:#E84C06;color:#fff;font-weight:900;font-size:15px;padding:9px 10px;cursor:pointer;font-family:inherit}',
'.house-fallback{padding:20px;text-align:center}',
'.house-fallback button{display:block;width:100%;margin-top:10px;padding:14px;border:3px solid #113B0F;border-radius:18px;background:#fff;font-weight:900;font-size:16px;cursor:pointer;font-family:inherit}'
].join('\n');
document.head.appendChild(css);

/* ---------- Referensi ke state lama ---------- */
var C = window.IKAAA_CONTENT;
var $ = function(s){ return document.querySelector(s); };

/* Posisi stasiun di ruangan (x, z). Ruangan: x -8..8, z -6..6 */
var ST = [
  { id:'outfit',  x:-6.7, z:-1.6, approach:{x:-5.6, z:-1.6} },
  { id:'gallery', x:-2.5, z:-5.3, approach:{x:-2.5, z:-4.0} },
  { id:'cake',    x: 4.9, z:-2.4, approach:{x: 3.6, z:-2.4} },
  { id:'quiz',    x: 5.9, z: 3.6, approach:{x: 4.6, z: 3.6} },
  { id:'letter',  x: 3.2, z:-5.3, approach:{x: 3.2, z:-4.0} }
];
function cpMeta(i){ return C.map.checkpoints[i]; }

/* ---------- State 3D ---------- */
var H = {
  ready:false, threeOK: (typeof THREE !== 'undefined'),
  pos:{x:0, z:4.4}, target:null, joy:{x:0, y:0}, keys:{},
  camMode:'follow', camPos:null, lookPt:null, moving:false,
  nearIdx:-1, outfitTex:{}, outfitTexBack:{}, scene:null, camera:null, renderer:null,
  charSprite:null, shadow:null, arrow:null, rings:[], icons:[], labels:[]
};
var BOUND = { x:7.3, zMin:-5.2, zMax:5.2 };
/* Collider perabot: {x,z,hx,hz} */
var SOLIDS = [
  {x:-6.9,z:-4.6,hx:1.2,hz:1.6},   /* kasur */
  {x:-7.3,z:-1.6,hx:0.7,hz:1.3},   /* lemari */
  {x: 3.2,z:-5.5,hx:1.4,hz:0.5},   /* meja surat */
  {x: 4.9,z:-2.4,hx:0.9,hz:0.9},   /* meja kue */
  {x: 5.9,z: 3.6,hx:1.1,hz:1.1},   /* sudut quiz */
  {x:-5.2,z: 3.6,hx:1.6,hz:0.9},   /* sofa */
  {x:-5.2,z: 2.2,hx:0.9,hz:0.5},   /* meja kopi */
  {x: 7.0,z: 0.5,hx:0.6,hz:1.2},   /* rak */
  {x:-2.5,z:-5.6,hx:1.6,hz:0.4}    /* dinding galeri */
];

/* ---------- show() baru: init 3D saat peta dibuka ---------- */
var _origShow = window.show;
window.show = function(id){
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if(id==='screen-map'){ ensure3D(); }
};

/* ---------- renderMap / moveCp / openCheckpoint baru ---------- */
window.renderMap = function(){
  var hero = C.outfits.find(function(o){ return o.id===state.outfit; });
  if(hero) $('#heroChar').src = hero.image;
  $('#starCount').textContent = '⭐ '+state.done.size+' / 5';
  var dots = $('#progressDots'); dots.innerHTML='';
  C.map.checkpoints.forEach(function(cp){
    var d=document.createElement('i'); if(state.done.has(cp.id)) d.className='on'; dots.appendChild(d);
  });
  var nextIdx = C.map.checkpoints.findIndex(function(cp){ return !state.done.has(cp.id); });
  $('#mapHint').textContent = nextIdx>=0 ? ('Checkpoint berikutnya: '+C.map.checkpoints[nextIdx].label+' '+C.map.checkpoints[nextIdx].icon) : 'Semua checkpoint selesai! 🎉';
  $('#mapGo').textContent = nextIdx>=0 ? ('Buka: '+C.map.checkpoints[nextIdx].label+' ▶') : 'Lihat Finale ▶';
  if(nextIdx<0){ $('#mapGo').onclick = function(){ renderLetter(); show('screen-letter'); }; }
  else { $('#mapGo').onclick = function(){ state.cp = nextIdx; openCheckpoint(); }; }
  if(H.ready){
    setCharOutfit();
    updateStationVisuals();
  }
};
window.moveCp = function(d){
  var idx = Math.max(0, Math.min(C.map.checkpoints.length-1, state.cp+d));
  state.cp = idx;
  H.target = { x: ST[idx].approach.x, z: ST[idx].approach.z };
  renderMap();
};
window.openCheckpoint = function(){
  var id = C.map.checkpoints[state.cp].id;
  if(id==='outfit') show('screen-outfit');
  else if(id==='gallery') show('screen-gallery');
  else if(id==='cake'){ show('screen-cake'); }
  else if(id==='quiz'){ renderQuiz(); show('screen-quiz'); }
  else if(id==='letter'){ renderLetter(); show('screen-letter'); }
};

/* ---------- Fallback kalau Three.js gagal ---------- */
function showFallback(msg){
  var scene = $('#mapScene');
  scene.innerHTML = '<div class="house-fallback"><p style="font-weight:900;font-size:17px">🏠 Rumah Ikaaa lagi nggak bisa dibuka 3D-nya</p>'
    + '<p class="muted">'+msg+'</p><div id="fbBtns"></div></div>';
  var box = $('#fbBtns');
  C.map.checkpoints.forEach(function(cp,i){
    var b=document.createElement('button');
    b.textContent = cp.icon+' '+cp.label+(state.done.has(cp.id)?' ✅':'');
    b.addEventListener('click', function(){ state.cp=i; openCheckpoint(); });
    box.appendChild(b);
  });
}

/* ---------- Bangun scene ---------- */
function ensure3D(){
  if(H.ready) { resize3D(); return; }
  if(!H.threeOK){ showFallback('Coba cek koneksi internet, lalu muat ulang halaman ini.'); return; }
  try { buildScene(); } catch(e){
    showFallback('Browser ini tidak mendukung WebGL.');
    return;
  }
  H.ready = true;
  buildOverlay();
  loadOutfitTextures();
  requestAnimationFrame(loop);
  resize3D();
}

function mat(color, opts){
  var o = { color: color };
  if(opts) for(var k in opts) o[k]=opts[k];
  return new THREE.MeshLambertMaterial(o);
}
function box(w,h,d,color,x,y,z,parent){
  var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  m.position.set(x,y,z);
  (parent||H.scene).add(m);
  return m;
}
function cyl(rt,rb,h,color,x,y,z,parent,seg){
  var m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||20), mat(color));
  m.position.set(x,y,z);
  (parent||H.scene).add(m);
  return m;
}
function sph(r,color,x,y,z,parent,sx,sy,sz){
  var m = new THREE.Mesh(new THREE.SphereGeometry(r,18,14), mat(color));
  m.position.set(x,y,z);
  if(sx) m.scale.set(sx,sy,sz);
  (parent||H.scene).add(m);
  return m;
}
function textSprite(text, opts){
  opts = opts || {};
  var fs = opts.font || 30;
  var cv = document.createElement('canvas');
  var ctx = cv.getContext('2d');
  ctx.font = '900 '+fs+'px "Trebuchet MS", sans-serif';
  var w = Math.ceil(ctx.measureText(text).width) + 28;
  cv.width = w; cv.height = fs + 26;
  var c2 = cv.getContext('2d');
  c2.font = '900 '+fs+'px "Trebuchet MS", sans-serif';
  if(opts.pill){
    c2.fillStyle = '#FFFDF6';
    c2.strokeStyle = '#113B0F'; c2.lineWidth = 4;
    roundRect(c2, 2, 2, w-4, fs+22, 20); c2.fill(); c2.stroke();
    c2.fillStyle = '#113B0F';
  } else {
    c2.fillStyle = opts.color || '#113B0F';
  }
  c2.textBaseline = 'middle';
  c2.fillText(text, 14, (fs+26)/2 + 1);
  var tex = new THREE.CanvasTexture(cv);
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true, depthWrite:false }));
  sp.scale.set((opts.scale||1) * w/110, (opts.scale||1) * (fs+26)/110, 1);
  return sp;
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function iconSprite(emoji){
  var cv = document.createElement('canvas'); cv.width=128; cv.height=128;
  var ctx = cv.getContext('2d');
  ctx.beginPath(); ctx.arc(64,64,58,0,Math.PI*2);
  ctx.fillStyle='#FFFDF6'; ctx.fill();
  ctx.lineWidth=7; ctx.strokeStyle='#113B0F'; ctx.stroke();
  ctx.font='62px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(emoji,64,70);
  var tex = new THREE.CanvasTexture(cv);
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true, depthWrite:false }));
  sp.scale.set(1.15,1.15,1);
  return sp;
}

function buildScene(){
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFFF6DC);
  scene.fog = new THREE.Fog(0xFFF6DC, 18, 34);
  H.scene = scene;
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  H.camera = camera;
  var renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  H.renderer = renderer;
  $('#mapScene').innerHTML = '';
  $('#mapScene').appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  var hemi = new THREE.HemisphereLight(0xFFF6DC, 0x516950, 0.5);
  scene.add(hemi);
  var dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(4, 10, 6);
  scene.add(dir);

  /* ----- Lantai + karpet ----- */
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 12.4), mat(0xE9C98A));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,0,0);
  scene.add(floor);
  /* papan lantai */
  for(var i=-7;i<=7;i++){
    var plank = new THREE.Mesh(new THREE.PlaneGeometry(0.06,12.4), mat(0xD9B878));
    plank.rotation.x=-Math.PI/2; plank.position.set(i,0.005,0); scene.add(plank);
  }
  var rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), mat(0xFFD6E8));
  rug.rotation.x=-Math.PI/2; rug.position.set(0,0.01,0.5); scene.add(rug);
  var rug2 = new THREE.Mesh(new THREE.CircleGeometry(1.9, 32), mat(0xF27FA8));
  rug2.rotation.x=-Math.PI/2; rug2.position.set(0,0.015,0.5); scene.add(rug2);

  /* ----- Dinding ----- */
  var wallMat = mat(0xFFF6DC), sageMat = mat(0x516950);
  var back = box(16.4, 4.4, 0.3, 0x516950, 0, 2.2, -6.2);
  var left = box(0.3, 4.4, 12.4, 0xFFF6DC, -8.2, 2.2, 0);
  var right = box(0.3, 4.4, 12.4, 0xFFF6DC, 8.2, 2.2, 0);
  /* wainscot krem di dinding belakang */
  box(16.4, 1.1, 0.34, 0xFFF6DC, 0, 0.55, -6.18);
  box(16.4, 0.14, 0.36, 0xE6AA29, 0, 1.15, -6.18);
  /* jendela di dinding belakang */
  [-5.5, 5.5].forEach(function(wx){
    box(2.4, 2.0, 0.1, 0xFFFFFF, wx, 2.6, -6.0);
    box(2.0, 1.6, 0.12, 0xA8D8EA, wx, 2.6, -6.0);
    box(0.12, 1.6, 0.14, 0xFFFFFF, wx, 2.6, -6.0);
    box(2.0, 0.12, 0.14, 0xFFFFFF, wx, 2.6, -6.0);
    box(0.5, 2.2, 0.12, 0xF27FA8, wx-1.45, 2.6, -5.95);
    box(0.5, 2.2, 0.12, 0xF27FA8, wx+1.45, 2.6, -5.95);
  });
  /* pintu di dinding kanan (supaya tidak menghalangi kamera dari depan) */
  var door = new THREE.Group();
  door.position.set(8.05, 0, -3.0);
  door.rotation.y = -Math.PI/2;
  box(2.0, 3.4, 0.25, 0x8B5E3C, 0, 1.7, 0, door);
  box(1.6, 3.0, 0.28, 0xA9744F, 0, 1.5, 0.02, door);
  sph(0.09, 0xE6AA29, 0.6, 1.6, 0.2, door);
  scene.add(door);
  /* keset di depan pintu masuk */
  var mat2 = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), mat(0xE6AA29));
  mat2.rotation.x = -Math.PI/2; mat2.position.set(0, 0.015, 5.4); scene.add(mat2);
  /* banner ulang tahun */
  var banner = textSprite('🎉 HAPPY BIRTHDAY IKAAA 🎉', { pill:true, font:34, scale:1.6 });
  banner.position.set(0, 4.0, -5.9);
  scene.add(banner);
  /* bunting */
  var flagCols = [0xE84C06,0xE6AA29,0xA16FCF,0x5BA8C9,0xF27FA8];
  for(var f=0; f<12; f++){
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.22,0.5,4), mat(flagCols[f%5]));
    cone.position.set(-5.5+f*1.0, 3.5, -5.95);
    cone.rotation.x = Math.PI; cone.rotation.y = Math.PI/4;
    scene.add(cone);
  }
  /* lampu gantung */
  cyl(0.03,0.03,1.2,0x113B0F, 0, 4.6, 0.5);
  sph(0.45, 0xE6AA29, 0, 3.9, 0.5);
  sph(0.2, 0xFFF6DC, 0, 3.55, 0.5);

  /* ----- Perabot ----- */
  /* Kasur (kiri belakang) */
  box(2.2, 0.5, 3.0, 0x8B5E3C, -6.9, 0.25, -4.6);
  box(2.0, 0.45, 2.8, 0xFFFDF6, -6.9, 0.7, -4.6);
  box(2.2, 0.9, 0.25, 0x8B5E3C, -6.9, 0.9, -6.0);
  box(1.9, 0.25, 1.6, 0x516950, -6.9, 0.95, -4.0);
  sph(0.5, 0xFFD6E8, -7.3, 1.0, -5.5, null, 1, 0.5, 1);
  sph(0.5, 0xFFD6E8, -6.5, 1.0, -5.5, null, 1, 0.5, 1);
  sph(0.28, 0xE6AA29, -6.9, 1.15, -5.3, null, 1, 0.8, 1);

  /* Lemari — stasiun outfit */
  box(1.3, 3.2, 1.1, 0x113B0F, -7.4, 1.6, -1.6);
  box(0.06, 2.6, 0.45, 0xA8D8EA, -6.72, 1.7, -1.9);
  box(0.06, 2.6, 0.45, 0xA8D8EA, -6.72, 1.7, -1.3);
  sph(0.06, 0xE6AA29, -6.7, 1.6, -1.6);
  box(0.9, 0.5, 0.06, 0xE84C06, -6.7, 2.6, -1.05);
  box(0.9, 0.5, 0.06, 0xA16FCF, -6.7, 2.0, -1.05);

  /* Dinding galeri — stasiun galeri */
  box(3.2, 0.1, 0.08, 0x8B5E3C, -2.5, 2.9, -6.0);
  var galCols = [0xE84C06,0xE6AA29,0xA16FCF,0x5BA8C9,0xF27FA8,0x516950];
  for(var g=0; g<6; g++){
    var gx = -3.9 + (g%3)*1.4, gy = g<3 ? 2.5 : 1.7;
    box(1.0, 0.75, 0.08, 0xFFFFFF, gx, gy, -6.0);
    box(0.85, 0.6, 0.1, galCols[g], gx, gy, -6.0);
  }
  /* lampu string di atas galeri */
  for(var s=0; s<8; s++){
    sph(0.07, s%2? 0xE6AA29 : 0xF27FA8, -4.2+s*0.55, 3.25, -5.95);
  }

  /* Meja kue — stasiun cake */
  cyl(0.85, 0.85, 0.12, 0xFFFDF6, 4.9, 0.95, -2.4);
  cyl(0.12, 0.18, 0.9, 0x8B5E3C, 4.9, 0.45, -2.4);
  cyl(0.55, 0.55, 0.1, 0x8B5E3C, 4.9, 0.05, -2.4);
  cyl(0.42, 0.46, 0.28, 0xF27FA8, 4.9, 1.15, -2.4);
  cyl(0.3, 0.34, 0.22, 0xFFFDF6, 4.9, 1.38, -2.4);
  cyl(0.16, 0.2, 0.16, 0xE84C06, 4.9, 1.56, -2.4);
  [-0.18, 0, 0.18].forEach(function(dx){
    cyl(0.025, 0.025, 0.3, 0xFFFDF6, 4.9+dx, 1.7, -2.4);
    var fl = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), mat(0xE84C06));
    fl.position.set(4.9+dx, 1.92, -2.4); scene.add(fl);
  });
  /* balon */
  sph(0.35, 0xA16FCF, 5.9, 2.2, -3.2, null, 1, 1.25, 1);
  cyl(0.015, 0.015, 1.6, 0x113B0F, 5.9, 1.2, -3.2);
  sph(0.35, 0xE84C06, 4.1, 2.4, -3.4, null, 1, 1.25, 1);
  cyl(0.015, 0.015, 1.8, 0x113B0F, 4.1, 1.3, -3.4);
  sph(0.35, 0x5BA8C9, 5.6, 2.0, -1.4, null, 1, 1.25, 1);

  /* Meja surat — stasiun letter */
  box(2.6, 0.12, 1.0, 0x8B5E3C, 3.2, 0.85, -5.5);
  box(0.12, 0.85, 0.9, 0x8B5E3C, 2.0, 0.42, -5.5);
  box(0.12, 0.85, 0.9, 0x8B5E3C, 4.4, 0.42, -5.5);
  box(1.1, 1.3, 0.08, 0xA8D8EA, 3.2, 2.0, -6.0);
  box(1.3, 1.5, 0.06, 0xE6AA29, 3.2, 2.0, -6.05);
  box(1.1, 1.3, 0.08, 0xA8D8EA, 3.2, 2.0, -6.0);
  box(0.9, 0.6, 0.02, 0xFFFDF6, 2.8, 0.95, -5.5);
  box(0.5, 0.05, 0.3, 0xF27FA8, 3.9, 0.95, -5.5);
  cyl(0.06, 0.1, 0.5, 0x113B0F, 4.3, 1.15, -5.7);
  sph(0.22, 0xE6AA29, 4.3, 1.5, -5.7, null, 1, 0.8, 1);
  /* kursi */
  box(0.8, 0.1, 0.8, 0xA16FCF, 3.2, 0.5, -4.3);
  box(0.8, 0.9, 0.1, 0xA16FCF, 3.2, 0.95, -3.85);
  cyl(0.05, 0.05, 0.5, 0x113B0F, 2.9, 0.25, -4.0);
  cyl(0.05, 0.05, 0.5, 0x113B0F, 3.5, 0.25, -4.0);
  cyl(0.05, 0.05, 0.5, 0x113B0F, 2.9, 0.25, -4.6);
  cyl(0.05, 0.05, 0.5, 0x113B0F, 3.5, 0.25, -4.6);

  /* Sudut quiz — stasiun quiz */
  var quizRug = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), mat(0xE6AA29));
  quizRug.rotation.x=-Math.PI/2; quizRug.position.set(5.9, 0.02, 3.6); scene.add(quizRug);
  sph(0.55, 0xF27FA8, 5.2, 0.3, 3.0, null, 1, 0.55, 1);
  sph(0.55, 0xA16FCF, 6.6, 0.3, 3.0, null, 1, 0.55, 1);
  sph(0.55, 0x5BA8C9, 5.2, 0.3, 4.3, null, 1, 0.55, 1);
  sph(0.55, 0xE84C06, 6.6, 0.3, 4.3, null, 1, 0.55, 1);
  box(0.9, 1.2, 0.1, 0xFFFDF6, 6.6, 1.4, 5.2);
  var qmark = textSprite('?', { font:60, scale:1.0, color:'#E84C06' });
  qmark.position.set(6.6, 1.4, 5.12); scene.add(qmark);

  /* Sofa + meja kopi (dekorasi) */
  box(3.0, 0.7, 1.5, 0x516950, -5.2, 0.35, 3.6);
  box(3.0, 0.9, 0.4, 0x516950, -5.2, 0.85, 4.25);
  box(0.4, 0.6, 1.5, 0x516950, -6.5, 0.9, 3.6);
  box(0.4, 0.6, 1.5, 0x516950, -3.9, 0.9, 3.6);
  sph(0.35, 0xE6AA29, -6.0, 0.85, 3.9, null, 1, 0.8, 1);
  sph(0.35, 0xF27FA8, -4.5, 0.85, 3.9, null, 1, 0.8, 1);
  box(1.7, 0.08, 0.9, 0x8B5E3C, -5.2, 0.45, 2.2);
  box(0.5, 0.3, 0.35, 0xE84C06, -5.5, 0.64, 2.2);
  box(0.5, 0.22, 0.35, 0x5BA8C9, -4.9, 0.6, 2.2);

  /* Rak (kanan) */
  box(0.9, 2.4, 1.8, 0x8B5E3C, 7.5, 1.2, 0.5);
  box(0.7, 0.4, 0.5, 0xE84C06, 7.3, 0.6, 0.0);
  box(0.7, 0.4, 0.5, 0xA16FCF, 7.3, 0.6, 0.9);
  box(0.7, 0.5, 0.5, 0xE6AA29, 7.3, 1.4, 0.4);
  sph(0.3, 0x516950, 7.3, 2.1, 0.4, null, 1, 1.2, 1);

  /* Tanaman */
  cyl(0.3, 0.22, 0.5, 0xE84C06, -7.4, 0.25, 5.0);
  sph(0.45, 0x516950, -7.4, 0.9, 5.0);
  sph(0.35, 0x6FA85E, -7.2, 1.2, 5.0);
  cyl(0.3, 0.22, 0.5, 0xA16FCF, 7.4, 0.25, -4.8);
  sph(0.45, 0x516950, 7.4, 0.9, -4.8);
  sph(0.35, 0x6FA85E, 7.6, 1.2, -4.8);

  /* ----- Stasiun: ring + ikon + label ----- */
  ST.forEach(function(st, i){
    var cp = cpMeta(i);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.0, 32), new THREE.MeshBasicMaterial({ color:0xE84C06, transparent:true, opacity:0.85, side:THREE.DoubleSide }));
    ring.rotation.x = -Math.PI/2;
    ring.position.set(st.approach.x, 0.03, st.approach.z);
    scene.add(ring);
    H.rings.push(ring);
    var icon = iconSprite(cp.icon);
    icon.position.set(st.x, 2.6, st.z);
    scene.add(icon);
    H.icons.push(icon);
    var label = textSprite(cp.label, { pill:true, font:26, scale:1.1 });
    label.position.set(st.x, 1.95, st.z);
    scene.add(label);
    H.labels.push(label);
  });

  /* ----- Panah ke stasiun berikutnya ----- */
  var arrowGeo = new THREE.ConeGeometry(0.3, 0.65, 4);
  var arrowCone = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color:0xE84C06 }));
  arrowCone.rotation.x = Math.PI/2; /* ujung cone menghadap +Z */
  var arrow = new THREE.Group();
  arrow.add(arrowCone);
  arrow.position.set(0, 2.7, 0);
  scene.add(arrow);
  H.arrow = arrow;

  /* ----- Karakter (billboard sprite) ----- */
  var shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ color:0x113B0F, transparent:true, opacity:0.22 }));
  shadow.rotation.x = -Math.PI/2;
  shadow.position.set(H.pos.x, 0.02, H.pos.z);
  scene.add(shadow);
  H.shadow = shadow;

  H.camPos = new THREE.Vector3(H.pos.x, 4.8, H.pos.z + 7.2);
  H.lookPt = new THREE.Vector3(H.pos.x, 1.0, H.pos.z - 1.0);
  camera.position.copy(H.camPos);
  camera.lookAt(H.lookPt);

  /* resize */
  new ResizeObserver(function(){ resize3D(); }).observe($('#mapScene'));
}

function resize3D(){
  if(!H.renderer) return;
  var w = $('#mapScene').clientWidth || 400, h = $('#mapScene').clientHeight || 400;
  H.renderer.setSize(w, h, false);
  H.camera.aspect = w/h;
  H.camera.updateProjectionMatrix();
}

function loadOutfitTextures(){
  var loader = new THREE.TextureLoader();
  C.outfits.forEach(function(o){
    var png = o.image.replace(/\.jpg$/, '.png');
    loader.load(png, function(tex){
      H.outfitTex[o.id] = tex;
      if(state.outfit===o.id) setCharOutfit();
    }, undefined, function(){
      loader.load(o.image, function(tex){ H.outfitTex[o.id]=tex; if(state.outfit===o.id) setCharOutfit(); });
    });
    /* tampak belakang: dipakai saat kamera Belakang / Atas */
    var backPng = o.image.replace(/\.jpg$/, '-back.png');
    loader.load(backPng, function(tex){
      H.outfitTexBack[o.id] = tex;
      if(state.outfit===o.id) setCharOutfit();
    }, undefined, function(){
      loader.load(o.image.replace(/\.jpg$/, '-back.jpg'), function(tex){ H.outfitTexBack[o.id]=tex; if(state.outfit===o.id) setCharOutfit(); });
    });
  });
  /* sprite awal (pakai png pink langsung) */
  loader.load('images/character/outfit-pink-back.png', function(tex){
    H.outfitTexBack['pink'] = tex;
    makeCharSprite();
  }, undefined, function(){
    loader.load('images/character/outfit-pink.png', function(tex){
      H.outfitTex['pink'] = tex; makeCharSprite();
    });
  });
}
/* tekstur karakter sesuai arah kamera: belakang/atas = punggung, depan = wajah */
function charTexture(){
  if(H.camMode==='front'){
    return H.outfitTex[state.outfit] || H.outfitTex['pink'] || H.outfitTexBack[state.outfit];
  }
  return H.outfitTexBack[state.outfit] || H.outfitTexBack['pink'] || H.outfitTex[state.outfit];
}
function makeCharSprite(){
  if(H.charSprite) return;
  var tex = charTexture();
  if(!tex) return;
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true, depthWrite:false }));
  sp.position.set(H.pos.x, 1.0, H.pos.z);
  H.scene.add(sp);
  H.charSprite = sp;
  setCharOutfit();
}
function setCharOutfit(){
  if(!H.charSprite) return;
  var tex = charTexture();
  if(!tex) return;
  H.charSprite.material.map = tex;
  /* jaga proporsi asli gambar supaya tidak melar */
  var img = tex.image;
  if(img && img.width && img.height){
    var h = 1.95, w = h * img.width / img.height;
    H.charSprite.scale.set(w, h, 1);
  }
}

function updateStationVisuals(){
  var nextIdx = C.map.checkpoints.findIndex(function(cp){ return !state.done.has(cp.id); });
  H.rings.forEach(function(ring, i){
    var done = state.done.has(C.map.checkpoints[i].id);
    ring.material.color.set(done ? 0xE6AA29 : (i===nextIdx ? 0xE84C06 : 0x516950));
    ring.material.opacity = (i===nextIdx) ? 0.95 : 0.55;
  });
  updatePrompt();
}

/* ---------- Overlay: joystick, kamera, prompt ---------- */
function buildOverlay(){
  var wrap = document.querySelector('.map-wrap');
  var tag = document.createElement('div');
  tag.className = 'house-tag';
  tag.textContent = '🏠 Rumah Ikaaa';
  wrap.appendChild(tag);

  var pills = document.createElement('div');
  pills.className = 'cam-pills';
  [['follow','🎥 Belakang'],['top','🔭 Atas'],['front','🙂 Depan']].forEach(function(m){
    var b = document.createElement('button');
    b.textContent = m[1];
    b.dataset.mode = m[0];
    if(m[0]===H.camMode) b.classList.add('on');
    b.addEventListener('click', function(){
      H.camMode = m[0];
      pills.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x===b); });
      setCharOutfit();
    });
    pills.appendChild(b);
  });
  wrap.appendChild(pills);

  var joy = document.createElement('div');
  joy.className = 'joy-base';
  joy.innerHTML = '<div class="joy-knob">🕹️</div>';
  wrap.appendChild(joy);
  var knob = joy.querySelector('.joy-knob');
  var joyId = null;
  function joyMove(e){
    var r = joy.getBoundingClientRect();
    var cx = r.left + r.width/2, cy = r.top + r.height/2;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    var len = Math.sqrt(dx*dx + dy*dy), max = 40;
    if(len > max){ dx = dx/len*max; dy = dy/len*max; }
    knob.style.transform = 'translate('+dx+'px,'+dy+'px)';
    H.joy.x = dx/max; H.joy.y = dy/max;
    H.target = null;
  }
  joy.addEventListener('pointerdown', function(e){
    e.preventDefault(); e.stopPropagation();
    joyId = e.pointerId;
    joy.setPointerCapture(e.pointerId);
    joyMove(e);
  });
  joy.addEventListener('pointermove', function(e){
    if(e.pointerId===joyId) joyMove(e);
  });
  function joyEnd(e){
    if(e.pointerId!==joyId) return;
    joyId = null;
    H.joy.x = 0; H.joy.y = 0;
    knob.style.transform = '';
  }
  joy.addEventListener('pointerup', joyEnd);
  joy.addEventListener('pointercancel', joyEnd);

  var prompt = document.createElement('div');
  prompt.className = 'house-prompt';
  prompt.id = 'housePrompt';
  wrap.appendChild(prompt);
  updatePrompt();

  /* keyboard WASD + panah */
  document.addEventListener('keydown', function(e){
    if(!document.getElementById('screen-map').classList.contains('active')) return;
    var k = e.key.toLowerCase();
    if(k==='w' || k==='arrowup') H.keys.up = true;
    if(k==='s' || k==='arrowdown') H.keys.down = true;
    if(k==='a' || k==='arrowleft') H.keys.left = true;
    if(k==='d' || k==='arrowright') H.keys.right = true;
    if(k==='enter') openCheckpoint();
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(k)>=0) e.preventDefault();
  });
  document.addEventListener('keyup', function(e){
    var k = e.key.toLowerCase();
    if(k==='w' || k==='arrowup') H.keys.up = false;
    if(k==='s' || k==='arrowdown') H.keys.down = false;
    if(k==='a' || k==='arrowleft') H.keys.left = false;
    if(k==='d' || k==='arrowright') H.keys.right = false;
  });

  /* ketuk lantai = jalan ke sana; ketuk ikon stasiun = pilih stasiun */
  var downPos = null;
  H.renderer.domElement.addEventListener('pointerdown', function(e){ downPos = {x:e.clientX, y:e.clientY}; });
  H.renderer.domElement.addEventListener('pointerup', function(e){
    if(!downPos) return;
    var moved = Math.hypot(e.clientX-downPos.x, e.clientY-downPos.y);
    downPos = null;
    if(moved > 10) return;
    var rect = H.renderer.domElement.getBoundingClientRect();
    var nx = ((e.clientX-rect.left)/rect.width)*2-1;
    var ny = -((e.clientY-rect.top)/rect.height)*2+1;
    var ray = new THREE.Raycaster();
    ray.setFromCamera({x:nx, y:ny}, H.camera);
    var hits = ray.intersectObjects(H.icons, false);
    if(hits.length){
      var idx = H.icons.indexOf(hits[0].object);
      state.cp = idx;
      H.target = { x: ST[idx].approach.x, z: ST[idx].approach.z };
      renderMap();
      return;
    }
    var plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
    var pt = new THREE.Vector3();
    if(ray.ray.intersectPlane(plane, pt)){
      H.target = { x: Math.max(-BOUND.x, Math.min(BOUND.x, pt.x)), z: Math.max(BOUND.zMin, Math.min(BOUND.zMax, pt.z)) };
    }
  });
}

function updatePrompt(){
  var el = document.getElementById('housePrompt');
  if(!el) return;
  var nextIdx = C.map.checkpoints.findIndex(function(cp){ return !state.done.has(cp.id); });
  if(H.nearIdx >= 0){
    var cp = cpMeta(H.nearIdx);
    el.innerHTML = '<b>'+cp.icon+' '+cp.label+'</b>Kamu udah sampai! Ketuk Buka buat mulai misinya.'
      + '<button id="houseOpenBtn">Buka ▶</button>';
    el.querySelector('#houseOpenBtn').addEventListener('click', function(){ state.cp = H.nearIdx; openCheckpoint(); });
  } else if(nextIdx >= 0){
    var nx = cpMeta(nextIdx);
    el.innerHTML = '<b>➜ '+nx.icon+' '+nx.label+'</b>Jalan ke stasiun yang berdenyut oranye ya!';
  } else {
    el.innerHTML = '<b>🎉 Semua selesai!</b>Ketuk tombol di bawah buat lihat surat &amp; finale.';
  }
}

/* ---------- Gerakan + kamera ---------- */
function collide(nx, nz){
  var r = 0.4;
  for(var i=0;i<SOLIDS.length;i++){
    var s = SOLIDS[i];
    if(Math.abs(nx - s.x) < s.hx + r && Math.abs(nz - s.z) < s.hz + r){
      /* dorong keluar dari sisi terdekat */
      var dx = nx - s.x, dz = nz - s.z;
      var px = (s.hx + r) - Math.abs(dx), pz = (s.hz + r) - Math.abs(dz);
      if(px < pz) nx = s.x + (dx>=0 ? (s.hx+r) : -(s.hx+r));
      else nz = s.z + (dz>=0 ? (s.hz+r) : -(s.hz+r));
    }
  }
  nx = Math.max(-BOUND.x, Math.min(BOUND.x, nx));
  nz = Math.max(BOUND.zMin, Math.min(BOUND.zMax, nz));
  return { x:nx, z:nz };
}

var _fwd = new THREE.Vector3(), _right = new THREE.Vector3(), _up = new THREE.Vector3(0,1,0);
function loop(){
  requestAnimationFrame(loop);
  if(!H.ready) return;
  if(!document.getElementById('screen-map').classList.contains('active')) return;
  var dt = 0.016;

  /* --- arah gerak relatif kamera --- */
  var camDir = new THREE.Vector3();
  H.camera.getWorldDirection(camDir);
  camDir.y = 0; camDir.normalize();
  _fwd.copy(camDir);
  _right.crossVectors(_fwd, _up); /* fwd=(0,0,-1) -> right=(1,0,0). benar. */

  var mx = 0, mz = 0;
  if(H.keys.up) mz -= 1;
  if(H.keys.down) mz += 1;
  if(H.keys.left) mx -= 1;
  if(H.keys.right) mx += 1;
  mx += H.joy.x; mz += H.joy.y;
  var mag = Math.hypot(mx, mz);
  if(mag > 1){ mx/=mag; mz/=mag; }

  var speed = 3.4;
  if(mag > 0.05){
    H.target = null;
    var nx = H.pos.x + (_fwd.x*(-mz) + _right.x*mx) * speed * dt;
    var nz = H.pos.z + (_fwd.z*(-mz) + _right.z*mx) * speed * dt;
    var p = collide(nx, nz);
    H.pos.x = p.x; H.pos.z = p.z;
    H.moving = true;
  } else if(H.target){
    var dx = H.target.x - H.pos.x, dz = H.target.z - H.pos.z;
    var d = Math.hypot(dx, dz);
    if(d < 0.12){ H.target = null; H.moving = false; }
    else {
      var step = Math.min(d, speed*dt);
      var p2 = collide(H.pos.x + dx/d*step, H.pos.z + dz/d*step);
      H.pos.x = p2.x; H.pos.z = p2.z;
      H.moving = true;
    }
  } else {
    H.moving = false;
  }

  /* --- karakter: posisi + goyang jalan --- */
  var t = performance.now()/1000;
  var bob = H.moving ? Math.abs(Math.sin(t*9))*0.08 : Math.sin(t*2)*0.02;
  if(H.charSprite){
    H.charSprite.position.set(H.pos.x, 1.0 + bob, H.pos.z);
    H.charSprite.material.rotation = H.moving ? Math.sin(t*9)*0.04 : 0;
  }
  H.shadow.position.set(H.pos.x, 0.02, H.pos.z);
  var shScale = 1 - bob*1.5;
  H.shadow.scale.set(shScale, shScale, 1);

  /* --- stasiun: ikon melayang, ring berdenyut --- */
  var nextIdx = C.map.checkpoints.findIndex(function(cp){ return !state.done.has(cp.id); });
  H.icons.forEach(function(ic, i){
    ic.position.y = 2.6 + Math.sin(t*2 + i)*0.12;
  });
  H.rings.forEach(function(ring, i){
    var s = 1 + (i===nextIdx ? Math.sin(t*3)*0.08 : 0);
    ring.scale.set(s, s, 1);
  });

  /* --- panah ke stasiun berikutnya --- */
  if(H.arrow){
    if(nextIdx >= 0){
      H.arrow.visible = true;
      var tx = ST[nextIdx].approach.x - H.pos.x, tz = ST[nextIdx].approach.z - H.pos.z;
      H.arrow.position.set(H.pos.x, 2.7 + Math.sin(t*3)*0.1, H.pos.z);
      H.arrow.rotation.y = Math.atan2(tx, tz);
    } else {
      H.arrow.visible = false;
    }
  }

  /* --- deteksi stasiun terdekat --- */
  var near = -1, best = 2.3;
  ST.forEach(function(st, i){
    var d = Math.hypot(st.approach.x - H.pos.x, st.approach.z - H.pos.z);
    if(d < best){ best = d; near = i; }
  });
  if(near !== H.nearIdx){
    H.nearIdx = near;
    if(near >= 0){ state.cp = near; renderMap(); }
    updatePrompt();
  }

  /* --- kamera --- */
  var desired = new THREE.Vector3(), look = new THREE.Vector3();
  if(H.camMode==='top'){
    desired.set(H.pos.x, 10.5, H.pos.z + 4.5);
    look.set(H.pos.x, 0, H.pos.z - 0.5);
  } else if(H.camMode==='front'){
    desired.set(H.pos.x, 2.3, H.pos.z - 5.2);
    look.set(H.pos.x, 1.2, H.pos.z);
  } else {
    desired.set(H.pos.x, 4.8, H.pos.z + 7.2);
    look.set(H.pos.x, 1.0, H.pos.z - 1.0);
  }
  desired.x = Math.max(-8.6, Math.min(8.6, desired.x));
  desired.z = Math.max(-7.2, Math.min(11.5, desired.z));
  desired.y = Math.max(1.6, Math.min(11, desired.y));
  H.camPos.lerp(desired, 0.07);
  H.lookPt.lerp(look, 0.09);
  H.camera.position.copy(H.camPos);
  H.camera.lookAt(H.lookPt);

  H.renderer.render(H.scene, H.camera);
}

/* init HUD saat file dimuat (kalau peta sudah aktif) */
if(document.getElementById('screen-map').classList.contains('active')) ensure3D();
})();
