/* =========================================================
   Repères de parcours — E-learning IDSR
   Correctifs issus de l'audit design du 30 juillet 2026.

   1. Compteur « Étape n sur N », visible et annoncé aux
      lecteurs d'écran, qui manquait sur tout le site.
   2. Focus déplacé sur l'étape affichée : un utilisateur au
      clavier ou de lecteur d'écran sait qu'il a changé d'écran.
   3. Note explicite à côté du bouton « Étape suivante »
      verrouillé : la condition de déverrouillage est écrite.
   4. Avertissement si le navigateur bloque l'enregistrement
      local, faute de quoi l'apprenant perd sa progression
      sans jamais en être informé.

   Ce fichier ne dépend d'aucun module et ne modifie aucune
   logique existante : il observe le DOM et complète l'affichage.
   ========================================================= */
(function(){
  "use strict";

  var etapes = [].slice.call(document.querySelectorAll(".etape"));
  if(!etapes.length) return;
  var TOTAL = etapes.length;

  /* ---- 1. compteur d'étapes ---- */
  var compteur = null;
  var nav = document.querySelector(".stepper");
  if(nav){
    compteur = document.createElement("p");
    compteur.className = "etape-compteur";
    compteur.setAttribute("role", "status");
    compteur.setAttribute("aria-live", "polite");
    nav.insertBefore(compteur, nav.firstChild);
  }

  function libelle(et){
    var t = et.querySelector("h2");
    return t ? t.textContent.trim() : "";
  }

  function majCompteur(et){
    if(!compteur) return;
    var i = +et.dataset.etape;
    compteur.textContent = "Étape " + (i + 1) + " sur " + TOTAL + " · " + libelle(et);
  }

  /* ---- 2. focus sur l'étape affichée ---- */
  var premier = true;
  function focaliser(et){
    if(premier){ premier = false; return; }   /* pas de vol de focus au chargement */
    var titre = et.querySelector("h2") || et;
    titre.setAttribute("tabindex", "-1");
    try{ titre.focus({preventScroll:true}); }catch(e){ titre.focus(); }
  }

  /* ---- 3. note de verrouillage ---- */
  function texteNote(et){
    var aExplorer = et.querySelectorAll(".org").length > 0;
    var aQuestion = et.querySelectorAll(".verrou").length > 0;
    if(aExplorer && aQuestion) return "Ouvrez chaque carte, puis répondez à la question pour débloquer l'étape suivante.";
    if(aQuestion) return "Répondez à la question pour débloquer l'étape suivante.";
    if(aExplorer) return "Ouvrez chaque carte pour débloquer l'étape suivante.";
    return "Terminez l'activité de cette étape pour débloquer la suivante.";
  }

  function majNote(et){
    var suivant = et.querySelector("[data-next]");
    if(!suivant) return;
    var barre = suivant.closest(".nav-etape") || suivant.parentNode;
    var note = et.querySelector(".lock-note");
    if(suivant.disabled){
      if(!note){
        note = document.createElement("p");
        note.className = "lock-note";
        note.setAttribute("role", "status");
        note.textContent = "🔒 " + texteNote(et);
        barre.parentNode.insertBefore(note, barre);
      }
    } else if(note){
      note.remove();
    }
  }

  /* ---- observation : étape active et état du bouton ---- */
  var obs = new MutationObserver(function(mutations){
    var changeEtape = false;
    mutations.forEach(function(m){
      if(m.type === "attributes" && m.attributeName === "class" &&
         m.target.classList.contains("etape")) changeEtape = true;
      if(m.type === "attributes" && m.attributeName === "disabled") majNote(
        m.target.closest(".etape") || document.createElement("div"));
    });
    if(changeEtape){
      var actif = document.querySelector(".etape.active");
      if(actif){ majCompteur(actif); focaliser(actif); majNote(actif); }
    }
  });

  etapes.forEach(function(et){
    obs.observe(et, {attributes:true, attributeFilter:["class"]});
    var suivant = et.querySelector("[data-next]");
    if(suivant) obs.observe(suivant, {attributes:true, attributeFilter:["disabled"]});
    majNote(et);
  });

  var actif = document.querySelector(".etape.active");
  if(actif) majCompteur(actif);

  /* ---- 4. stockage local indisponible ---- */
  function stockageOk(){
    try{
      localStorage.setItem("__test_idsr", "1");
      localStorage.removeItem("__test_idsr");
      return true;
    }catch(e){ return false; }
  }
  if(!stockageOk()){
    var alerte = document.createElement("p");
    alerte.setAttribute("role", "alert");
    alerte.style.cssText = "margin:1rem 0 0;padding:.7rem .9rem;border-radius:8px;" +
      "background:#fdeeec;border-left:5px solid #C0392B;font-size:.9rem;font-weight:600;";
    alerte.textContent = "Votre navigateur bloque l'enregistrement local (navigation privée ou paramètres de confidentialité) : votre progression ne sera pas conservée si vous quittez cette page.";
    var cible = document.querySelector(".etape.active") || etapes[0];
    cible.insertBefore(alerte, cible.firstChild);
  }
})();
