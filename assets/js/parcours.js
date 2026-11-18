/* =========================================================
   Parcours de préparation à la formation initiale — v1.9
   Source unique de la liste des sept modules exigés pour
   ouvrir le module final (questionnaire des acquis et
   attestation). Utilisé par l'accueil, le module final et
   la fin de chaque module 1 à 7.

   Un module est validé quand son bloc de fin a été atteint :
   - soit le drapeau « fini » posé par ce script,
   - soit un compteur d'étapes déverrouillées égal au nombre
     d'étapes du module (progressions antérieures à la v1.9).
   Si une étape est ajoutée à un module, mettre à jour
   « etapes » ci-dessous.
   ========================================================= */
(function(){
  "use strict";

  var MODULES = [
    {id:"m1",  num:1, etapes:5, href:"module-1-etre-idsr.html",          titre:"Être IDSR : rôle, missions et engagement"},
    {id:"m2",  num:2, etapes:5, href:"module-2-organisation.html",       titre:"L'organisation de la sécurité routière en France"},
    {id:"m12", num:3, etapes:7, href:"module-3-posture-idsr.html",       titre:"La posture de l'IDSR : parler au nom de l'État"},
    {id:"m3",  num:4, etapes:6, href:"module-4-enjeux-chiffres.html",    titre:"Enjeux et chiffres de l'accidentalité"},
    {id:"m4",  num:5, etapes:5, href:"module-5-politiques.html",         titre:"Les politiques de sécurité routière"},
    {id:"m5",  num:6, etapes:5, href:"module-6-accident.html",           titre:"Comprendre l'accident"},
    {id:"m6",  num:7, etapes:6, href:"module-7-apports-techniques.html", titre:"Les apports techniques"}
  ];
  var FINAL = "module-final-acquis.html";

  function lire(id){
    try{ return JSON.parse(localStorage.getItem("elearning_idsr_" + id) || "null"); }catch(e){ return null; }
  }
  function valide(m){
    var s = lire(m.id);
    return !!(s && (s.fini === true || (typeof s.unlocked === "number" && s.unlocked >= m.etapes)));
  }
  function etat(){
    var liste = MODULES.map(function(m){
      var s = lire(m.id);
      return {m:m, valide:valide(m), commence:!!(s && typeof s.unlocked === "number" && s.unlocked > 0)};
    });
    var n = liste.filter(function(x){ return x.valide; }).length;
    return {liste:liste, nb:n, total:MODULES.length, complet:n === MODULES.length};
  }

  window.IDSR_PARCOURS = {modules:MODULES, final:FINAL, etat:etat, valide:valide};

  /* ---- Fin d'un module 1 à 7 : drapeau « fini » et note de progression ---- */
  var idPage = document.body && document.body.dataset.module;
  var courant = MODULES.filter(function(m){ return m.id === idPage; })[0];
  if(!courant) return;

  function poserDrapeau(){
    try{
      var s = lire(courant.id) || {};
      if(s.fini === true) return;
      s.fini = true;
      if(typeof s.unlocked !== "number" || s.unlocked < courant.etapes) s.unlocked = courant.etapes;
      localStorage.setItem("elearning_idsr_" + courant.id, JSON.stringify(s));
    }catch(e){}
  }

  function note(){
    var fin = document.querySelector("#bloc-fin .fini");
    if(!fin) return;
    var bloc = fin.querySelector(".parcours-note");
    if(!bloc){
      bloc = document.createElement("div");
      bloc.className = "parcours-note";
      bloc.setAttribute("role", "status");
      bloc.style.cssText = "margin:1.6rem auto 0;max-width:540px;text-align:left;background:#FFF3CC;border:2px solid #FECF41;" +
        "border-radius:12px;padding:1.1rem 1.25rem;font-size:.94rem;color:#3a3a3a;";
      fin.appendChild(bloc);
    }
    var e = etat();
    var pastilles = e.liste.map(function(x){
      return '<span title="Module ' + x.m.num + (x.valide ? " validé" : " à valider") + '" style="display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;' +
        'font-weight:800;font-size:.8rem;margin:0 .2rem .2rem 0;' + (x.valide ? "background:#1f8a4c;color:#fff;" : "background:#fff;color:#6b6b6b;border:2px solid #8c8c8c;") + '">' + x.m.num + '</span>';
    }).join("");
    if(e.complet){
      bloc.innerHTML = '<strong style="display:block;color:#000;margin-bottom:.35rem;">Les sept modules de préparation sont validés.</strong>' +
        '<div aria-hidden="true">' + pastilles + '</div>' +
        '<p style="margin:.5rem 0 .9rem;">Le module final est ouvert : un questionnaire des acquis de quatorze questions, deux par module, puis la génération de l\'attestation de suivi.</p>' +
        '<a class="btn btn-primary" href="' + FINAL + '">Ouvrir le module final →</a>';
    } else {
      bloc.innerHTML = '<strong style="display:block;color:#000;margin-bottom:.35rem;">Préparation de la formation initiale : ' + e.nb + ' module' + (e.nb > 1 ? "s" : "") + ' validé' + (e.nb > 1 ? "s" : "") + ' sur 7</strong>' +
        '<div aria-hidden="true">' + pastilles + '</div>' +
        '<p style="margin:.5rem 0 0;">L\'attestation de suivi n\'est plus délivrée module par module : elle est générée en fin de parcours, dans le module final qui s\'ouvre une fois les sept modules validés.</p>';
    }
  }

  function surveiller(){
    var bloc = document.getElementById("bloc-fin");
    if(!bloc) return;
    function maj(){
      if(bloc.style.display !== "none"){ poserDrapeau(); note(); }
    }
    new MutationObserver(maj).observe(bloc, {attributes:true, attributeFilter:["style"]});
    maj();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", surveiller);
  else surveiller();
})();
