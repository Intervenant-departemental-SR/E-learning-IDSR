/* =========================================================
   Lecteur vidéo interactive — E-learning IDSR
   Mécanique « pause → question → reprise » :
   la vidéo se met en pause aux points de repère (cues),
   une question s'affiche, la lecture reprend après la
   bonne réponse. L'avance rapide au-delà du déjà-vu est
   bloquée pour garantir le visionnage complet.

   UTILISATION (voir module-video-demo.html) :
   window.VIDEO_INTERACTIVE = {
     src: "https://votre-hebergeur-video.eu/module.mp4",  // JAMAIS dans le dépôt Git
     poster: "assets/photos/poster.jpg",                  // optionnel
     cues: [
       { t: 42,                                           // seconde de pause
         q: "Question affichée ?",
         options: [
           { txt: "Bonne réponse", ok: true, fb: "Exact ! …" },
           { txt: "Mauvaise réponse", fb: "Non : …" }
         ] }
     ],
     onComplete: function(){}                             // optionnel
   };
   ========================================================= */
(function(){
  "use strict";

  function init(){
    var conf = window.VIDEO_INTERACTIVE;
    var mount = document.getElementById("video-interactive");
    if(!conf || !mount) return;

    /* ---- styles ---- */
    var css = document.createElement("style");
    css.textContent =
      ".vi-cadre{position:relative;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 4px 18px rgba(0,0,0,.2);}" +
      ".vi-cadre video{display:block;width:100%;height:auto;}" +
      ".vi-overlay{position:absolute;inset:0;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;padding:1rem;z-index:5;}" +
      ".vi-overlay.show{display:flex;}" +
      ".vi-carte{background:#fff;border-radius:12px;border-top:8px solid #FECF41;max-width:520px;width:100%;padding:1.3rem 1.4rem;max-height:92%;overflow:auto;}" +
      ".vi-carte .vi-tag{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b6b6b;}" +
      ".vi-carte .vi-q{font-weight:700;font-size:1.08rem;margin:.3rem 0 1rem;}" +
      ".vi-opts{display:grid;gap:.55rem;}" +
      ".vi-opt{display:block;width:100%;text-align:left;background:#fff;border:2px solid #e2e2e2;border-radius:9px;padding:.75rem .9rem;cursor:pointer;font:inherit;transition:border-color .2s;}" +
      ".vi-opt:hover:not(:disabled){border-color:#E9B400;}" +
      ".vi-opt.ok{border-color:#1f8a4c;background:#eafaf0;}" +
      ".vi-opt.ko{border-color:#c0392b;background:#fdeeec;}" +
      ".vi-fb{margin:.8rem 0 0;font-weight:600;font-size:.93rem;display:none;}" +
      ".vi-fb.show{display:block;}" +
      ".vi-fb.ok{color:#1f8a4c;}.vi-fb.ko{color:#c0392b;}" +
      ".vi-continuer{margin-top:1rem;display:none;border:none;border-radius:999px;padding:.7rem 1.4rem;font:inherit;font-weight:700;cursor:pointer;background:#FECF41;}" +
      ".vi-continuer.show{display:inline-block;}" +
      ".vi-progress{display:flex;gap:.4rem;margin-top:.8rem;flex-wrap:wrap;}" +
      ".vi-point{width:12px;height:12px;border-radius:50%;background:#e2e2e2;border:2px solid #bbb;}" +
      ".vi-point.fait{background:#1f8a4c;border-color:#1f8a4c;}";
    document.head.appendChild(css);

    /* ---- structure ---- */
    var cadre = document.createElement("div");
    cadre.className = "vi-cadre";
    var video = document.createElement("video");
    video.src = conf.src;
    if(conf.poster) video.poster = conf.poster;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    cadre.appendChild(video);

    var overlay = document.createElement("div");
    overlay.className = "vi-overlay";
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    cadre.appendChild(overlay);
    mount.appendChild(cadre);

    var points = document.createElement("div");
    points.className = "vi-progress";
    points.setAttribute("aria-label","Questions de la vidéo");
    conf.cues.forEach(function(){ var p=document.createElement("span"); p.className="vi-point"; points.appendChild(p); });
    mount.appendChild(points);

    var cues = conf.cues.map(function(c){ return {t:c.t, q:c.q, options:c.options, fait:false}; });
    var maxVu = 0, enQuestion = false;

    /* ---- anti avance rapide ---- */
    video.addEventListener("timeupdate", function(){
      if(enQuestion){ video.pause(); return; }
      if(video.currentTime > maxVu + 1.5) video.currentTime = maxVu; /* interdit le saut en avant */
      else if(video.currentTime > maxVu) maxVu = video.currentTime;
      var cue = cues.find(function(c){ return !c.fait && video.currentTime >= c.t; });
      if(cue) poserQuestion(cue);
    });

    function poserQuestion(cue){
      enQuestion = true;
      video.pause();
      overlay.innerHTML = "";
      var carte = document.createElement("div");
      carte.className = "vi-carte";
      carte.innerHTML = '<span class="vi-tag">🔒 Question — la vidéo reprend après la bonne réponse</span>' +
                        '<p class="vi-q"></p><div class="vi-opts"></div>' +
                        '<p class="vi-fb" role="status"></p>' +
                        '<button type="button" class="vi-continuer">▶ Reprendre la vidéo</button>';
      carte.querySelector(".vi-q").textContent = cue.q;
      var box = carte.querySelector(".vi-opts");
      var fb = carte.querySelector(".vi-fb");
      var btn = carte.querySelector(".vi-continuer");
      /* mélange des réponses */
      var opts = cue.options.slice().sort(function(){ return Math.random()-0.5; });
      opts.forEach(function(o){
        var b = document.createElement("button");
        b.type = "button"; b.className = "vi-opt"; b.textContent = o.txt;
        b.addEventListener("click", function(){
          if(o.ok){
            b.classList.add("ok");
            box.querySelectorAll(".vi-opt").forEach(function(x){ x.disabled = true; });
            fb.textContent = o.fb || "Bonne réponse !";
            fb.className = "vi-fb show ok";
            btn.classList.add("show");
            btn.focus();
          } else {
            b.classList.add("ko"); b.disabled = true;
            fb.textContent = o.fb || "Ce n'est pas la bonne réponse — réessayez.";
            fb.className = "vi-fb show ko";
          }
        });
        box.appendChild(b);
      });
      btn.addEventListener("click", function(){
        cue.fait = true;
        overlay.classList.remove("show");
        enQuestion = false;
        majPoints();
        video.play();
      });
      overlay.appendChild(carte);
      overlay.classList.add("show");
    }

    function majPoints(){
      var faits = cues.filter(function(c){return c.fait;}).length;
      [].slice.call(points.children).forEach(function(p,i){
        p.classList.toggle("fait", i < faits);
      });
    }

    video.addEventListener("ended", function(){
      if(cues.every(function(c){return c.fait;})){
        var fin = document.getElementById("bloc-fin");
        if(fin){ fin.style.display = "block"; fin.scrollIntoView({behavior:"smooth"}); }
        if(typeof conf.onComplete === "function") conf.onComplete();
      }
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
