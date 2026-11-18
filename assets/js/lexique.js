/* =========================================================
   Lexique des sigles — E-learning IDSR (v1.9)
   Onglet amovible présent sur les pages du parcours :
   recherche instantanée (sigle ou mot de la définition,
   accents ignorés) et fiche PDF téléchargeable.
   Les définitions reprennent celles des modules : toute
   modification d'un module doit être reportée ici.
   Aucune donnée n'est enregistrée ni transmise.
   ========================================================= */
(function(){
  "use strict";

  var LEXIQUE = [
    ["2RM", "Deux-roues motorisés", "Motocyclettes, cyclomoteurs et scooters : un enjeu national du DGO.", "4, 5"],
    ["AAC", "Apprentissage anticipé de la conduite", "La « conduite accompagnée », étape du continuum éducatif ouverte dès 15 ans.", "5"],
    ["ADR", "Accord relatif au transport international des marchandises dangereuses par route", "Cadre européen du transport routier de marchandises dangereuses, signalé par des panneaux dédiés.", "Panneaupédia"],
    ["« Agir »", "Programme « Agir pour la sécurité routière »", "Programme national qui constitue le cadre d'intervention des IDSR.", "1, 3, 5, 6"],
    ["AM", "Permis AM (ex-BSR)", "Catégorie de permis des cyclomoteurs et voiturettes, accessible dès 14 ans avec l'ASSR 1.", "5"],
    ["APER", "Attestation de première éducation à la route", "Délivrée à l'école primaire : premier maillon du continuum éducatif.", "5"],
    ["ASSR", "Attestation scolaire de sécurité routière", "ASSR 1 en classe de 5e (requise pour le permis AM), ASSR 2 en 3e (requise pour s'inscrire à l'examen du permis de conduire).", "5"],
    ["BAAC", "Bulletin d'analyse des accidents corporels", "Fiche remplie par les forces de l'ordre pour chaque accident corporel dont elles ont connaissance : la source de toutes les données d'accidentalité.", "2, 5, 6"],
    ["BSR", "Brevet de sécurité routière", "Ancienne appellation du permis AM.", "5"],
    ["Carsat", "Caisse d'assurance retraite et de la santé au travail", "Organisme de la sécurité sociale qui intervient notamment dans la prévention des risques professionnels, dont le risque routier.", "9"],
    ["CE (marquage)", "Conformité européenne", "Marquage attestant qu'un équipement répond aux exigences européennes, par exemple les gants pour motocyclistes.", "7"],
    ["CGCT", "Code général des collectivités territoriales", "Code qui fixe notamment les pouvoirs de police de la circulation du maire.", "Panneaupédia"],
    ["CISR", "Comité interministériel de la sécurité routière", "Instance de décision de la politique nationale, présidée par le Premier ministre : on y arbitre les mesures qui engagent plusieurs ministères.", "2"],
    ["CMSR", "Chargé de mission sécurité routière", "Apporte une expertise thématique (deux-roues, seniors, risque professionnel…) en appui des actions départementales et régionales.", "2"],
    ["CNAM", "Caisse nationale de l'Assurance maladie", "Coproduit avec la MSA et l'ONISR les chiffres du risque routier professionnel.", "9"],
    ["CNSR", "Conseil national de la sécurité routière", "Créé en 2001, souvent surnommé « le parlement de la sécurité routière » : élus, associations, professionnels.", "2"],
    ["CRS", "Compagnies républicaines de sécurité", "Unités de la police nationale, au nombre des forces de l'ordre qui remplissent les BAAC.", "6"],
    ["CSE", "Comité social et économique", "Instance représentative du personnel dans l'entreprise, associée à la prévention du risque routier professionnel.", "9"],
    ["DDT / DDTM", "Direction départementale des territoires (et de la mer)", "Service de l'État qui, dans la plupart des départements, héberge la coordination sécurité routière.", "2"],
    ["DGO", "Document général d'orientations", "Enjeux prioritaires du département, définis pour cinq ans : quatre enjeux nationaux obligatoires et jusqu'à deux enjeux locaux.", "1, 2, 4, 5, 6"],
    ["DISR", "Délégué(e) interministériel(le) à la sécurité routière", "Coordonne l'action des ministères concernés et pilote la politique nationale au quotidien ; dirige la DSR.", "2"],
    ["DREAL", "Direction régionale de l'environnement, de l'aménagement et du logement", "Service de l'État qui pilote et anime la sécurité routière au niveau régional en Hauts-de-France.", "1, 2, 4, 5"],
    ["Dreets", "Direction régionale de l'économie, de l'emploi, du travail et des solidarités", "Service régional de l'État compétent notamment en santé et sécurité au travail.", "9"],
    ["DSR", "Délégation à la sécurité routière", "Rattachée au ministère de l'Intérieur, elle conçoit et met en œuvre la politique nationale.", "2"],
    ["DUERP", "Document unique d'évaluation des risques professionnels", "Document où l'employeur recense les risques auxquels sont exposés les salariés, risque routier compris.", "9"],
    ["EDPM", "Engins de déplacement personnel motorisés", "Trottinettes électriques, gyroroues, hoverboards…", "4, 5, 7, 8"],
    ["IDSR", "Intervenant départemental de sécurité routière", "Bénévole nommé par arrêté du préfet de département pour mener des actions de prévention, à la demande de la coordination sécurité routière.", "Tous"],
    ["IISR", "Instruction interministérielle sur la signalisation routière", "Arrêté du 24 novembre 1967 modifié : la référence de la désignation des panneaux.", "Panneaupédia"],
    ["INRETS", "Institut national de recherche sur les transports et leur sécurité", "Organisme de recherche, intégré depuis à l'Université Gustave Eiffel ; à l'origine de la méthode d'analyse de la tâche de conduite.", "6"],
    ["INRS", "Institut national de recherche et de sécurité", "Référence de la prévention des accidents du travail et des maladies professionnelles.", "9"],
    ["JORF", "Journal officiel de la République française", "Publication où paraissent les lois et règlements, qui entrent en vigueur après cette publication.", "9"],
    ["MSA", "Mutualité sociale agricole", "Régime de protection sociale du monde agricole ; coproduit les chiffres du risque routier professionnel.", "9"],
    ["ODSR", "Observatoire départemental de sécurité routière", "Suit l'accidentalité locale à partir des données BAAC ; ses analyses fondent le DGO et permettent de cibler les actions des IDSR.", "2"],
    ["ONISR", "Observatoire national interministériel de la sécurité routière", "Recueille, contrôle et analyse les BAAC : la source officielle des chiffres de l'accidentalité.", "2, 3, 4, 5, 6"],
    ["ONU", "Organisation des Nations unies", "A lancé la décennie d'action pour la sécurité routière 2021-2030.", "4"],
    ["PDASR", "Plan départemental d'actions de sécurité routière", "Déclinaison annuelle du DGO en actions concrètes.", "2, 4, 5"],
    ["PMR", "Personne à mobilité réduite", "Catégorie d'usagers visée par certains panneaux et emplacements réservés.", "Panneaupédia"],
    ["PTAC", "Poids total autorisé en charge", "Masse maximale autorisée d'un véhicule chargé.", "9"],
    ["RIPOST (loi)", "Loi n° 2026-798 du 18 août 2026", "En vigueur depuis le 20 août 2026 : protoxyde d'azote, peines de la conduite sous alcool ou stupéfiants.", "7, 8, 9"],
    ["SDIS", "Service départemental d'incendie et de secours", "Les sapeurs-pompiers, partenaires du réseau départemental de sécurité routière.", "2, 8"],
    ["SR", "Sécurité routière", "Abréviation courante, par exemple « animateur SR ».", "2"],
    ["ZFE", "Zone à faibles émissions", "Zone où la circulation de certains véhicules est restreinte selon leur vignette Crit'Air.", "Panneaupédia"]
  ];

  var PDF = "assets/lexique-sigles-idsr.pdf";

  /* chemin relatif vers la racine du site (pages en sous-dossier) */
  var racine = (function(){
    var s = document.currentScript && document.currentScript.getAttribute("src") || "";
    var i = s.indexOf("assets/js/lexique.js");
    return i > 0 ? s.slice(0, i) : "";
  })();

  function norm(s){
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[«»'’]/g, "");
  }
  function esc(s){
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function construire(){
    if(document.getElementById("lex-onglet")) return;

    var css = document.createElement("style");
    css.textContent =
      ".lex-onglet{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:900;background:#000;color:#FECF41;border:none;" +
        "border-radius:10px 0 0 10px;padding:1rem .55rem;font:inherit;font-weight:800;font-size:.86rem;letter-spacing:.04em;cursor:pointer;" +
        "writing-mode:vertical-rl;transform-origin:center;box-shadow:-2px 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;gap:.45rem;}" +
      ".lex-onglet span{transform:rotate(180deg);display:inline-block;}" +
      ".lex-onglet:hover,.lex-onglet:focus-visible{background:#FECF41;color:#000;outline:3px solid #000;outline-offset:-3px;}" +
      ".lex-fond{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:940;opacity:0;pointer-events:none;transition:opacity .25s ease;}" +
      ".lex-fond.ouvert{opacity:1;pointer-events:auto;}" +
      ".lex-panneau{position:fixed;top:0;right:0;height:100%;width:min(440px,100%);background:#fff;z-index:950;box-shadow:-6px 0 24px rgba(0,0,0,.2);" +
        "transform:translateX(105%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;" +
        "font-family:\"Marianne\",\"Segoe UI\",Arial,Helvetica,sans-serif;color:#000;line-height:1.45;}" +
      ".lex-panneau.ouvert{transform:none;}" +
      ".lex-tete{background:#000;color:#fff;padding:1rem 1.1rem .9rem;border-bottom:6px solid #FECF41;}" +
      ".lex-tete h2{margin:0;font-size:1.15rem;color:#fff;border:none;padding:0;}" +
      ".lex-tete p{margin:.25rem 0 0;font-size:.82rem;color:#e6e6e6;}" +
      ".lex-fermer{position:absolute;top:.7rem;right:.7rem;background:#FECF41;color:#000;border:none;border-radius:50%;width:34px;height:34px;font-size:1.1rem;font-weight:800;cursor:pointer;}" +
      ".lex-fermer:focus-visible{outline:3px solid #fff;outline-offset:2px;}" +
      ".lex-outils{padding:.9rem 1.1rem .6rem;border-bottom:1px solid #e2e2e2;}" +
      ".lex-outils label{display:block;font-size:.8rem;font-weight:700;margin:0 0 .3rem;color:#3a3a3a;}" +
      ".lex-outils input{width:100%;box-sizing:border-box;font:inherit;font-size:1rem;padding:.65rem .8rem;border:2px solid #8c8c8c;border-radius:9px;}" +
      ".lex-outils input:focus-visible{outline:3px solid #000;outline-offset:1px;border-color:#000;}" +
      ".lex-ligne{display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin-top:.6rem;flex-wrap:wrap;}" +
      ".lex-compte{font-size:.8rem;color:#3a3a3a;font-weight:600;}" +
      ".lex-pdf{display:inline-flex;align-items:center;gap:.35rem;background:#FECF41;color:#000;text-decoration:none;font-weight:700;font-size:.84rem;border-radius:999px;padding:.4rem .85rem;}" +
      ".lex-pdf:hover,.lex-pdf:focus-visible{background:#E9B400;outline:none;}" +
      ".lex-liste{list-style:none;margin:0;padding:.4rem 1.1rem 1.5rem;overflow-y:auto;flex:1;}" +
      ".lex-liste li{padding:.7rem 0;border-bottom:1px solid #eee;}" +
      ".lex-liste .s{display:inline-block;background:#000;color:#FECF41;font-weight:800;border-radius:6px;padding:.08rem .45rem;font-size:.9rem;margin-right:.35rem;}" +
      ".lex-liste .n{font-weight:700;font-size:.93rem;}" +
      ".lex-liste .d{display:block;margin-top:.25rem;font-size:.87rem;color:#3a3a3a;}" +
      ".lex-liste .m{display:block;margin-top:.2rem;font-size:.74rem;color:#6b6b6b;font-weight:600;}" +
      ".lex-liste mark{background:#FFF3CC;color:inherit;padding:0 .05em;}" +
      ".lex-vide{padding:1rem 1.1rem;font-size:.9rem;color:#3a3a3a;}" +
      "@media (max-width:640px){.lex-onglet{top:auto;bottom:5.2rem;transform:none;padding:.8rem .45rem;font-size:.78rem;}}" +
      "@media print{.lex-onglet,.lex-panneau,.lex-fond{display:none!important;}}";
    document.head.appendChild(css);

    var onglet = document.createElement("button");
    onglet.type = "button";
    onglet.id = "lex-onglet";
    onglet.className = "lex-onglet";
    onglet.setAttribute("aria-haspopup", "dialog");
    onglet.setAttribute("aria-controls", "lex-panneau");
    onglet.innerHTML = '<span aria-hidden="true">📖</span><span>Lexique des sigles</span>';

    var fond = document.createElement("div");
    fond.className = "lex-fond";

    var panneau = document.createElement("div");
    panneau.id = "lex-panneau";
    panneau.className = "lex-panneau";
    panneau.setAttribute("role", "dialog");
    panneau.setAttribute("aria-modal", "true");
    panneau.setAttribute("aria-labelledby", "lex-titre");
    panneau.hidden = true;
    panneau.innerHTML =
      '<div class="lex-tete">' +
        '<h2 id="lex-titre">Lexique des sigles</h2>' +
        '<p>Les ' + LEXIQUE.length + ' sigles employés dans l\'espace e-learning, avec les modules où ils apparaissent.</p>' +
        '<button type="button" class="lex-fermer" aria-label="Fermer le lexique">✕</button>' +
      '</div>' +
      '<div class="lex-outils">' +
        '<label for="lex-recherche">Rechercher un sigle ou un mot</label>' +
        '<input id="lex-recherche" type="search" autocomplete="off" placeholder="Ex. : PDASR, observatoire, permis…">' +
        '<div class="lex-ligne">' +
          '<span class="lex-compte" role="status" aria-live="polite"></span>' +
          '<a class="lex-pdf" href="' + racine + PDF + '" download>⬇ Fiche lexique (PDF)</a>' +
        '</div>' +
      '</div>' +
      '<ul class="lex-liste"></ul>' +
      '<p class="lex-vide" hidden>Aucun sigle ne correspond à cette recherche.</p>';

    document.body.appendChild(onglet);
    document.body.appendChild(fond);
    document.body.appendChild(panneau);

    var champ = panneau.querySelector("input");
    var liste = panneau.querySelector(".lex-liste");
    var compte = panneau.querySelector(".lex-compte");
    var vide = panneau.querySelector(".lex-vide");
    var fermer = panneau.querySelector(".lex-fermer");
    var dernierFocus = null;

    function surligner(txt, q){
      if(!q) return esc(txt);
      var n = norm(txt), i = n.indexOf(q);
      if(i < 0) return esc(txt);
      return esc(txt.slice(0, i)) + "<mark>" + esc(txt.slice(i, i + q.length)) + "</mark>" + esc(txt.slice(i + q.length));
    }

    function afficher(){
      var q = norm(champ.value.trim());
      var html = "", nb = 0;
      LEXIQUE.forEach(function(e){
        if(q && norm(e.join(" ")).indexOf(q) === -1) return;
        nb++;
        html += '<li><span class="s">' + surligner(e[0], q) + '</span><span class="n">' + surligner(e[1], q) + '</span>' +
          '<span class="d">' + surligner(e[2], q) + '</span>' +
          '<span class="m">' + (/^\d/.test(e[3]) ? "Module" + (e[3].indexOf(",") > -1 ? "s " : " ") + e[3] : (e[3] === "Tous" ? "Tous les modules" : e[3])) + '</span></li>';
      });
      liste.innerHTML = html;
      vide.hidden = nb > 0;
      compte.textContent = q ? nb + " résultat" + (nb > 1 ? "s" : "") : LEXIQUE.length + " sigles";
    }

    function ouvrir(){
      dernierFocus = document.activeElement;
      panneau.hidden = false;
      requestAnimationFrame(function(){ panneau.classList.add("ouvert"); fond.classList.add("ouvert"); });
      onglet.setAttribute("aria-expanded", "true");
      afficher();
      setTimeout(function(){ champ.focus(); }, 60);
    }
    function clore(){
      panneau.classList.remove("ouvert"); fond.classList.remove("ouvert");
      onglet.setAttribute("aria-expanded", "false");
      setTimeout(function(){ panneau.hidden = true; }, 300);
      if(dernierFocus && dernierFocus.focus) dernierFocus.focus();
    }

    onglet.addEventListener("click", ouvrir);
    fermer.addEventListener("click", clore);
    fond.addEventListener("click", clore);
    champ.addEventListener("input", afficher);
    panneau.addEventListener("keydown", function(ev){
      if(ev.key === "Escape"){ ev.preventDefault(); clore(); return; }
      if(ev.key !== "Tab") return;
      var f = [].slice.call(panneau.querySelectorAll("button, input, a[href]"));
      var premier = f[0], dernier = f[f.length - 1];
      if(ev.shiftKey && document.activeElement === premier){ ev.preventDefault(); dernier.focus(); }
      else if(!ev.shiftKey && document.activeElement === dernier){ ev.preventDefault(); premier.focus(); }
    });

    /* tout lien ou bouton portant data-lexique ouvre le panneau */
    document.addEventListener("click", function(ev){
      var cible = ev.target.closest && ev.target.closest("[data-lexique]");
      if(cible){ ev.preventDefault(); ouvrir(); }
    });

    afficher();
  }

  window.IDSR_LEXIQUE = LEXIQUE;
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", construire);
  else construire();
})();
