/* =========================================================
   Améliorations transverses des quiz — E-learning IDSR
   1. Mélange aléatoire de l'ordre des réponses (la bonne
      réponse n'est plus toujours à la même position).
   2. Feedback annoncé aux lecteurs d'écran (aria-live).
   3. Respect de prefers-reduced-motion.
   ========================================================= */
(function(){
  "use strict";

  function melanger(){
    document.querySelectorAll(".opts").forEach(function(box){
      var opts = [].slice.call(box.children);
      for(var i = opts.length - 1; i > 0; i--){
        var j = Math.floor(Math.random() * (i + 1));
        box.insertBefore(opts[j], opts[i].nextSibling);
        var tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp;
      }
    });
  }

  function ariaFeedback(){
    document.querySelectorAll(".feedback").forEach(function(f){
      f.setAttribute("role", "status");
      f.setAttribute("aria-live", "polite");
    });
  }

  function reducedMotion(){
    var css = document.createElement("style");
    css.textContent = "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important;}}";
    document.head.appendChild(css);
  }

  function init(){ melanger(); ariaFeedback(); reducedMotion(); }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
