/* =========================================================
   Attestation de suivi — E-learning IDSR
   Génère un PDF 100 % côté navigateur (aucune librairie,
   aucune donnée transmise) + envoi par mail (mailto).
   S'insère automatiquement dans le bloc de fin de module.
   ========================================================= */
(function(){
  "use strict";

  /* ---- CONFIGURATION ---- */
  // TODO : remplacer par l'adresse réelle de la coordination sécurité routière
  var MAIL_COORDINATION = "coordination-sr@exemple.fr";

  /* ---- Infos du module courant ---- */
  function infosModule(){
    var h1 = document.querySelector(".module-hero h1");
    var eyebrow = document.querySelector(".module-hero .eyebrow");
    var num = (eyebrow ? eyebrow.textContent : "").split("·")[0].trim() || "Module";
    return {
      numero: num,
      titre: h1 ? h1.textContent.trim() : document.title.split("|")[0].trim()
    };
  }

  /* ---- Encodage WinAnsi (accents français) ---- */
  var MAP = {0x0152:0x8C,0x0153:0x9C,0x2019:0x92,0x2018:0x91,0x201C:0x93,0x201D:0x94,0x2013:0x96,0x2014:0x97,0x20AC:0x80,0x2026:0x85,0x00A0:0x20};
  function enc(s){
    var out = "";
    for(var i=0;i<s.length;i++){
      var c = s.charCodeAt(0+i);
      if(MAP[c]) c = MAP[c];
      if(c > 255) c = 0x3F; /* ? */
      var ch = String.fromCharCode(c);
      if(ch === "\\" || ch === "(" || ch === ")") out += "\\";
      out += ch;
    }
    return out;
  }

  /* ---- Découpe d'un texte long en lignes ---- */
  function wrap(txt, max){
    var mots = txt.split(" "), lignes = [], l = "";
    mots.forEach(function(m){
      if((l + " " + m).trim().length > max){ lignes.push(l.trim()); l = m; }
      else l += " " + m;
    });
    if(l.trim()) lignes.push(l.trim());
    return lignes;
  }

  /* ---- Générateur PDF minimal (A4 portrait, Helvetica) ---- */
  function genererPDF(nom, mod, dateStr){
    var Y = "0.996 0.812 0.255"; /* jaune #FECF41 */
    var s = [];
    function t(font, size, x, y, str, color){
      s.push("BT /"+font+" "+size+" Tf "+(color||"0 0 0")+" rg "+x+" "+y+" Td ("+enc(str)+") Tj ET");
    }
    /* fond + bandes charte */
    s.push(Y+" rg 0 812 595 30 re f");                 /* bande jaune haut */
    s.push("0 0 0 rg 0 0 595 30 re f");                /* bande noire bas */
    s.push(Y+" rg 60 640 6 90 re f");                  /* barre jaune du titre */

    t("F2", 11, 60, 770, "SÉCURITÉ ROUTIÈRE — RÉSEAU IDSR");
    t("F1", 10, 60, 754, "Préfecture de la région Hauts-de-France");

    t("F2", 26, 80, 700, "ATTESTATION DE SUIVI");
    t("F1", 13, 80, 672, "E-learning des Intervenants Départementaux");
    t("F1", 13, 80, 655, "de Sécurité Routière");

    var y = 585;
    t("F1", 12, 60, y, "Je soussigné(e)"); y -= 26;
    t("F2", 18, 60, y, nom); y -= 34;
    t("F1", 12, 60, y, "atteste avoir suivi dans son intégralité et validé l'ensemble des étapes"); y -= 18;
    t("F1", 12, 60, y, "du module de formation en ligne :"); y -= 30;
    var lignes = wrap(mod.numero + " — " + mod.titre, 55);
    lignes.forEach(function(l){
      t("F2", 14, 60, y, l); y -= 20;
    });
    y -= 14;
    t("F1", 12, 60, y, "Fait le " + dateStr + "."); y -= 60;

    s.push("0.89 0.89 0.89 RG 1 w 60 "+(y+20)+" m 535 "+(y+20)+" l S");
    t("F1", 10, 60, y, "Cette attestation déclarative est générée localement à l'issue du parcours,", "0.42 0.42 0.42"); y -= 14;
    t("F1", 10, 60, y, "sans collecte ni transmission de données personnelles.", "0.42 0.42 0.42"); y -= 14;
    t("F1", 10, 60, y, "Espace e-learning IDSR — formation initiale et continue.", "0.42 0.42 0.42");

    var stream = s.join("\n");
    var objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream"
    ];
    var pdf = "%PDF-1.4\n", offsets = [];
    objs.forEach(function(o, i){
      offsets.push(pdf.length);
      pdf += (i+1) + " 0 obj\n" + o + "\nendobj\n";
    });
    var xref = pdf.length;
    pdf += "xref\n0 " + (objs.length+1) + "\n0000000000 65535 f \n";
    offsets.forEach(function(off){
      pdf += ("0000000000" + off).slice(-10) + " 00000 n \n";
    });
    pdf += "trailer\n<< /Size " + (objs.length+1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";

    var bytes = new Uint8Array(pdf.length);
    for(var i=0;i<pdf.length;i++) bytes[i] = pdf.charCodeAt(i) & 0xFF;
    return new Blob([bytes], {type:"application/pdf"});
  }

  function slug(s){
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  }

  /* ---- Interface ---- */
  function injecter(){
    var fin = document.querySelector("#bloc-fin .fini");
    if(!fin || document.querySelector(".attestation-bloc")) return;
    var mod = infosModule();

    var css = document.createElement("style");
    css.textContent =
      ".attestation-bloc{margin:1.6rem auto 0;max-width:520px;text-align:left;background:var(--jaune-clair,#FFF3CC);border:2px solid var(--jaune,#FECF41);border-radius:12px;padding:1.2rem 1.3rem;}" +
      ".attestation-bloc h4{margin:0 0 .4rem;font-size:1.05rem;}" +
      ".attestation-bloc p{margin:.2rem 0 .8rem;font-size:.92rem;color:#3a3a3a;}" +
      ".attestation-bloc input{width:100%;font:inherit;padding:.7rem .9rem;border:2px solid #e2e2e2;border-radius:9px;margin-bottom:.8rem;box-sizing:border-box;}" +
      ".attestation-bloc input:focus-visible{outline:3px solid #000;outline-offset:1px;}" +
      ".attestation-actions{display:flex;gap:.6rem;flex-wrap:wrap;}" +
      ".attestation-bloc .note{font-size:.78rem;color:#6b6b6b;margin:.8rem 0 0;}" +
      ".attestation-bloc .err{color:#c0392b;font-weight:600;font-size:.88rem;display:none;margin:-.4rem 0 .6rem;}";
    document.head.appendChild(css);

    var bloc = document.createElement("div");
    bloc.className = "attestation-bloc";
    bloc.innerHTML =
      '<h4>📄 Votre attestation de suivi</h4>' +
      '<p>Indiquez votre prénom et votre nom tels qu’ils doivent apparaître sur l’attestation.</p>' +
      '<label class="sr-only" for="attestation-nom" style="position:absolute;left:-9999px;">Prénom et nom</label>' +
      '<input id="attestation-nom" type="text" autocomplete="name" placeholder="Prénom NOM" maxlength="60">' +
      '<p class="err" role="alert">Merci d’indiquer votre prénom et votre nom.</p>' +
      '<div class="attestation-actions">' +
      '<button type="button" class="btn btn-primary" data-pdf>Télécharger l’attestation (PDF)</button>' +
      '<button type="button" class="btn btn-ghost" data-mail>Transmettre par mail</button>' +
      '</div>' +
      '<p class="note">L’attestation est générée sur votre appareil : aucune donnée n’est collectée ni transmise. Pour l’envoi par mail, joignez le PDF téléchargé au message pré-rempli.</p>';
    fin.appendChild(bloc);

    var input = bloc.querySelector("input");
    var err = bloc.querySelector(".err");
    try{ input.value = localStorage.getItem("elearning_idsr_nom") || ""; }catch(e){}

    function nomValide(){
      var n = input.value.trim();
      if(n.length < 3 || n.indexOf(" ") === -1){ err.style.display = "block"; input.focus(); return null; }
      err.style.display = "none";
      try{ localStorage.setItem("elearning_idsr_nom", n); }catch(e){}
      return n;
    }
    function dateFr(){
      return new Date().toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
    }

    bloc.querySelector("[data-pdf]").addEventListener("click", function(){
      var n = nomValide(); if(!n) return;
      var blob = genererPDF(n, mod, dateFr());
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "attestation-" + slug(mod.numero) + "-" + slug(n) + ".pdf";
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    });

    bloc.querySelector("[data-mail]").addEventListener("click", function(){
      var n = nomValide(); if(!n) return;
      var sujet = "Attestation de suivi — " + mod.numero + " (" + n + ")";
      var corps = "Bonjour,\n\nJe vous transmets mon attestation de suivi du " + mod.numero +
        " « " + mod.titre + " » de l’espace e-learning IDSR, validé le " + dateFr() + ".\n\n" +
        "(Attestation PDF jointe — pensez à joindre le fichier téléchargé.)\n\n" +
        "Cordialement,\n" + n;
      window.location.href = "mailto:" + MAIL_COORDINATION +
        "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
    });
  }

  /* Le bloc de fin n'apparaît qu'au terme du parcours : on injecte
     dès maintenant (il est masqué tant que le module n'est pas fini). */
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", injecter);
  } else { injecter(); }
})();
