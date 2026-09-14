/* =========================================================
   Lecteur YouTube interactif, E-learning IDSR
   Mécanique « pause, question, reprise » sur une vidéo YouTube :
   la lecture s'arrête aux points de repère (cues), une question
   s'affiche par-dessus la vidéo, la lecture reprend après la
   bonne réponse. L'avance rapide au-delà du déjà-vu est bloquée.

   UTILISATION :
   <div class="ytv" id="video-1"></div>
   window.VIDEOS_INTERACTIVES = {
     "video-1": {
       videoId: "Qd9AWZ_MdMI",            // identifiant YouTube
       titre: "Organiser ses déplacements",
       cues: [
         { t: 69,                          // seconde de pause
           q: "Question affichée ?",
           options: [
             { txt: "Bonne réponse", ok: true, fb: "Exact : …" },
             { txt: "Mauvaise réponse", fb: "Non : …" }
           ] }
       ],
       onComplete: function(){}           // appelé quand vidéo vue et questions répondues
     }
   };

   Le lecteur passe par le domaine youtube-nocookie.com (mode de
   confidentialité avancée de YouTube). Aucune vidéo n'est stockée
   dans le dépôt. Si l'API YouTube ne se charge pas (réseau filtré),
   le lecteur bascule en mode dégradé : les questions sont posées à
   la suite, avec un lien vers la vidéo, pour que l'étape reste
   franchissable.

   La progression (temps vu, questions réussies) est mémorisée dans
   le stockage local du navigateur : au rechargement de la page, la
   vidéo reprend là où elle en était et les questions déjà réussies
   ne sont pas reposées.
   ========================================================= */
(function(){
  "use strict";

  var STORE_PREFIX = "elearning_idsr_video_" + ((document.body && document.body.dataset.module) || "x") + "_";
  var apiDemandee = false, apiPrete = false, attente = [];
  var DELAI_SECOURS = 12000; /* ms avant de basculer en mode dégradé */

  /* ---- styles ---- */
  var css = document.createElement("style");
  css.textContent =
    ".ytv-cadre{position:relative;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 4px 18px rgba(0,0,0,.2);padding-top:56.25%;}" +
    ".ytv-cadre iframe,.ytv-cadre .ytv-player{position:absolute;inset:0;width:100%;height:100%;border:0;}" +
    ".ytv-overlay{position:absolute;inset:0;background:rgba(0,0,0,.84);display:none;align-items:center;justify-content:center;padding:1rem;z-index:5;}" +
    ".ytv-overlay.show{display:flex;}" +
    ".ytv-carte{background:#fff;border-radius:12px;border-top:8px solid #FECF41;max-width:560px;width:100%;padding:1.2rem 1.4rem;max-height:94%;overflow:auto;}" +
    ".ytv-carte .ytv-tag{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#3a3a3a;}" +
    ".ytv-carte .ytv-q{font-weight:700;font-size:1.05rem;margin:.35rem 0 .9rem;}" +
    ".ytv-opts{display:grid;gap:.5rem;}" +
    ".ytv-opt{display:block;width:100%;text-align:left;background:#fff;border:2px solid #8c8c8c;border-radius:9px;padding:.7rem .9rem;cursor:pointer;font:inherit;font-size:.95rem;transition:border-color .2s;}" +
    ".ytv-opt:hover:not(:disabled){border-color:#E9B400;}" +
    ".ytv-opt.ok{border-color:#14532D;background:#eafaf0;}" +
    ".ytv-opt.ko{border-color:#c0392b;background:#fdeeec;}" +
    ".ytv-opt:disabled{cursor:default;}" +
    ".ytv-fb{margin:.8rem 0 0;font-weight:600;font-size:.92rem;display:none;line-height:1.45;}" +
    ".ytv-fb.show{display:block;}" +
    ".ytv-fb.ok{color:#14532D;}.ytv-fb.ko{color:#c0392b;}" +
    ".ytv-continuer{margin-top:1rem;display:none;border:none;border-radius:999px;padding:.7rem 1.4rem;font:inherit;font-weight:700;cursor:pointer;background:#FECF41;color:#000;}" +
    ".ytv-continuer.show{display:inline-block;}" +
    ".ytv-continuer:hover{background:#E9B400;}" +
    ".ytv-barre{display:flex;align-items:center;gap:.6rem;margin-top:.7rem;flex-wrap:wrap;font-size:.85rem;color:#3a3a3a;}" +
    ".ytv-points{display:flex;gap:.4rem;flex-wrap:wrap;}" +
    ".ytv-point{width:14px;height:14px;border-radius:50%;background:#e2e2e2;border:2px solid #8c8c8c;display:grid;place-items:center;font-size:9px;color:#fff;font-weight:800;}" +
    ".ytv-point.fait{background:#14532D;border-color:#14532D;}" +
    ".ytv-etat{font-weight:700;}" +
    ".ytv-etat.fini{color:#14532D;}" +
    ".ytv-note{font-size:.82rem;color:#3a3a3a;margin:.5rem 0 0;}" +
    ".ytv-secours{background:#fff3cc;border:2px dashed #E9B400;border-radius:12px;padding:1.1rem 1.3rem;margin-top:.8rem;}" +
    ".ytv-secours p{margin:.2rem 0 .8rem;}" +
    ".ytv-secours a{color:#000;font-weight:700;}" +
    "@media (prefers-reduced-motion: reduce){.ytv-opt,.ytv-continuer{transition:none;}}";
  document.head.appendChild(css);

  /* ---- stockage ---- */
  function lire(id){
    try{ var s = JSON.parse(localStorage.getItem(STORE_PREFIX + id) || "null"); if(s && typeof s.maxVu === "number") return s; }catch(e){}
    return {maxVu:0, faits:[], fini:false};
  }
  function ecrire(id, s){ try{ localStorage.setItem(STORE_PREFIX + id, JSON.stringify(s)); }catch(e){} }

  /* ---- chargement de l'API YouTube (une seule fois) ---- */
  function chargerApi(cb){
    if(apiPrete){ cb(); return; }
    attente.push(cb);
    if(apiDemandee) return;
    apiDemandee = true;
    var precedent = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      apiPrete = true;
      if(typeof precedent === "function") precedent();
      attente.forEach(function(f){ f(); });
      attente = [];
    };
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  }

  /* ---- un lecteur ---- */
  function creer(mount, conf){
    var id = mount.id;
    var etat = lire(id);
    var cues = (conf.cues || []).map(function(c, i){ return {i:i, t:c.t, q:c.q, options:c.options, fait: etat.faits.indexOf(i) > -1}; });
    var enQuestion = false, player = null, minuterie = null, secoursLance = false, termine = etat.fini;

    var cadre = document.createElement("div");
    cadre.className = "ytv-cadre";
    var zone = document.createElement("div");
    zone.className = "ytv-player";
    zone.id = id + "-player";
    cadre.appendChild(zone);
    var overlay = document.createElement("div");
    overlay.className = "ytv-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Question sur la vidéo");
    cadre.appendChild(overlay);
    mount.appendChild(cadre);

    var barre = document.createElement("div");
    barre.className = "ytv-barre";
    var points = document.createElement("div");
    points.className = "ytv-points";
    points.setAttribute("aria-label", "Questions de la vidéo");
    cues.forEach(function(){ var p = document.createElement("span"); p.className = "ytv-point"; p.setAttribute("aria-hidden","true"); points.appendChild(p); });
    var etatTxt = document.createElement("span");
    etatTxt.className = "ytv-etat";
    etatTxt.setAttribute("role", "status");
    barre.appendChild(points);
    barre.appendChild(etatTxt);
    mount.appendChild(barre);
    var note = document.createElement("p");
    note.className = "ytv-note";
    note.textContent = "La vidéo s'arrête " + cues.length + " fois pour vous poser une question. L'avance rapide est désactivée jusqu'à la fin du premier visionnage.";
    mount.appendChild(note);

    function majPoints(){
      var n = 0;
      [].slice.call(points.children).forEach(function(p, i){
        var ok = cues[i].fait; p.classList.toggle("fait", ok); p.textContent = ok ? "✓" : ""; if(ok) n++;
      });
      if(termine){ etatTxt.textContent = "✓ Vidéo terminée, " + n + " question" + (n>1?"s":"") + " sur " + cues.length + " réussie" + (n>1?"s":""); etatTxt.className = "ytv-etat fini"; }
      else etatTxt.textContent = n + " question" + (n>1?"s":"") + " sur " + cues.length;
    }
    majPoints();

    function sauver(){
      etat.faits = cues.filter(function(c){ return c.fait; }).map(function(c){ return c.i; });
      etat.fini = termine;
      ecrire(id, etat);
    }

    function finir(){
      if(termine) return;
      termine = true;
      sauver();
      majPoints();
      note.textContent = "Vidéo terminée : vous pouvez maintenant la revoir librement.";
      if(typeof conf.onComplete === "function") conf.onComplete(id);
    }

    /* ---- carte de question (commune aux deux modes) ---- */
    function poserQuestion(cue, apres){
      enQuestion = true;
      overlay.innerHTML = "";
      var carte = document.createElement("div");
      carte.className = "ytv-carte";
      carte.innerHTML = '<span class="ytv-tag">🔒 Question ' + (cue.i + 1) + ' sur ' + cues.length + ' : la vidéo reprend après la bonne réponse</span>' +
                        '<p class="ytv-q" tabindex="-1"></p><div class="ytv-opts"></div>' +
                        '<p class="ytv-fb" role="status" aria-live="polite"></p>' +
                        '<button type="button" class="ytv-continuer">▶ Reprendre la vidéo</button>';
      carte.querySelector(".ytv-q").textContent = cue.q;
      var box = carte.querySelector(".ytv-opts");
      var fb = carte.querySelector(".ytv-fb");
      var btn = carte.querySelector(".ytv-continuer");
      var opts = cue.options.slice().sort(function(){ return Math.random() - 0.5; });
      opts.forEach(function(o){
        var b = document.createElement("button");
        b.type = "button"; b.className = "ytv-opt"; b.textContent = o.txt;
        b.addEventListener("click", function(){
          if(o.ok){
            b.classList.add("ok");
            box.querySelectorAll(".ytv-opt").forEach(function(x){ x.disabled = true; });
            fb.textContent = o.fb || "Bonne réponse.";
            fb.className = "ytv-fb show ok";
            cue.fait = true; sauver(); majPoints();
            btn.classList.add("show");
            btn.focus();
          } else {
            b.classList.add("ko"); b.disabled = true;
            fb.textContent = o.fb || "Ce n'est pas la bonne réponse, réessayez.";
            fb.className = "ytv-fb show ko";
          }
        });
        box.appendChild(b);
      });
      btn.addEventListener("click", function(){
        overlay.classList.remove("show");
        enQuestion = false;
        apres();
      });
      overlay.appendChild(carte);
      overlay.classList.add("show");
      carte.querySelector(".ytv-q").focus();
    }

    /* ---- mode normal : API YouTube ---- */
    function demarrer(){
      if(secoursLance) return;
      clearTimeout(minuterie);
      var vars = { rel:0, modestbranding:1, playsinline:1, hl:"fr", cc_lang_pref:"fr" };
      if(location.origin && location.origin.indexOf("http") === 0) vars.origin = location.origin;
      player = new YT.Player(zone.id, {
        host: "https://www.youtube-nocookie.com",
        videoId: conf.videoId,
        playerVars: vars,
        events: {
          onReady: function(){
            if(etat.maxVu > 2 && !termine){
              note.textContent = "Vous aviez déjà commencé cette vidéo : la lecture reprendra là où vous vous étiez arrêté (" + Math.floor(etat.maxVu/60) + " min " + (Math.floor(etat.maxVu)%60) + " s).";
            }
            surveiller();
          },
          onStateChange: function(e){
            if(e.data === YT.PlayerState.PLAYING){
              if(enQuestion){ player.pauseVideo(); return; }
              if(etat.maxVu > 2 && player.getCurrentTime() < 1 && !termine){
                /* première lecture après rechargement : on repositionne */
                player.seekTo(Math.max(0, etat.maxVu - 1), true);
              }
            }
            if(e.data === YT.PlayerState.ENDED){
              var manquantes = cues.filter(function(c){ return !c.fait; });
              if(manquantes.length){ poserQuestion(manquantes[0], function(){ /* réponse enregistrée */ if(cues.every(function(c){return c.fait;})) finir(); }); }
              else finir();
            }
          },
          onError: function(e){ secours("La vidéo n'a pas pu être chargée depuis YouTube (code " + (e && e.data) + ")"); }
        }
      });
    }

    function surveiller(){
      setInterval(function(){
        if(!player || typeof player.getCurrentTime !== "function") return;
        var t = player.getCurrentTime();
        if(typeof t !== "number") return;
        if(enQuestion){ if(player.getPlayerState() === YT.PlayerState.PLAYING) player.pauseVideo(); return; }
        if(!termine){
          if(t > etat.maxVu + 1.8){ player.seekTo(etat.maxVu, true); return; } /* saut en avant interdit */
          if(t > etat.maxVu){ etat.maxVu = t; if(Math.floor(t) % 5 === 0) sauver(); }
        }
        var cue = cues.find(function(c){ return !c.fait && t >= c.t && t < c.t + 4; });
        if(cue){
          player.pauseVideo();
          poserQuestion(cue, function(){ player.playVideo(); });
        }
      }, 250);
    }

    /* ---- mode dégradé : questions à la suite, sans vidéo ---- */
    function secours(raison){
      if(secoursLance) return;
      secoursLance = true;
      clearTimeout(minuterie);
      cadre.style.display = "none";
      var bloc = document.createElement("div");
      bloc.className = "ytv-secours";
      bloc.setAttribute("role", "region");
      bloc.setAttribute("aria-label", "Vidéo indisponible");
      var url = "https://www.youtube.com/watch?v=" + conf.videoId;
      var cause = location.protocol === "file:"
        ? " Vous consultez la page comme un fichier local : YouTube refuse la lecture hors d'un site (http). En ligne, la vidéo se lit normalement."
        : " (réseau filtré ou connexion coupée)";
      bloc.innerHTML = '<p><strong>' + (raison || "Le lecteur vidéo YouTube n'a pas pu se charger") + '</strong>' + cause + '</p>' +
        '<p>Regardez la vidéo « ' + (conf.titre || "") + ' » sur <a href="' + url + '" target="_blank" rel="noopener">YouTube dans un nouvel onglet</a>, puis répondez ci-dessous aux questions qui devaient rythmer la lecture.</p>' +
        '<button type="button" class="ytv-continuer show">Répondre aux questions</button>';
      mount.insertBefore(bloc, barre);
      var b = bloc.querySelector("button");
      b.addEventListener("click", function(){
        bloc.style.display = "none";
        cadre.style.display = "block";
        cadre.style.paddingTop = "0";
        cadre.style.minHeight = "340px";
        var z = document.getElementById(zone.id); if(z) z.style.display = "none";
        enchainer(0);
      });
      function enchainer(k){
        var restantes = cues.filter(function(c){ return !c.fait; });
        if(!restantes.length){ overlay.classList.remove("show"); cadre.style.display = "none"; finir(); return; }
        poserQuestion(restantes[0], function(){ enchainer(k+1); });
      }
    }

    if(termine){
      note.textContent = "Vous avez déjà terminé cette vidéo : vous pouvez la revoir librement.";
      if(typeof conf.onComplete === "function") conf.onComplete(id);
    }

    minuterie = setTimeout(function(){ if(!apiPrete) secours("Le lecteur vidéo YouTube ne répond pas"); }, DELAI_SECOURS);
    chargerApi(demarrer);
  }

  function init(){
    var confs = window.VIDEOS_INTERACTIVES;
    if(!confs) return;
    Object.keys(confs).forEach(function(id){
      var mount = document.getElementById(id);
      if(mount && !mount.dataset.ytvInit){ mount.dataset.ytvInit = "1"; creer(mount, confs[id]); }
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
