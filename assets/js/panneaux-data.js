/* ============================================================
   Base de données des panneaux de signalisation — France
   Outil IDSR — Préfecture des Hauts-de-France
   Sources : arrêté du 24 novembre 1967 modifié (IISR),
   code de la route (partie réglementaire).
   Montants d'amendes forfaitaires indicatifs (juillet 2026) —
   vérifier sur legifrance.gouv.fr.
   ============================================================ */
window.PANNEAUX = (function(){
"use strict";

/* ---------- Sanctions types (référencées par clé) ---------- */
var S = {
  info:{t:"Signal d'information",d:"Aucune infraction n'est directement attachée à ce signal. Il informe ou guide l'usager."},
  danger:{t:"Adaptation de la vitesse exigée",d:"Le panneau n'emporte pas de sanction propre, mais ne pas adapter sa vitesse au danger signalé constitue une vitesse excessive eu égard aux circonstances (art. R413-17) : amende de 4e classe, 135 €."},
  feu_rouge:{t:"Franchissement de feu rouge — art. R412-30",d:"Amende forfaitaire 135 € (minorée 90 €, majorée 375 €), retrait de 4 points, suspension de permis possible jusqu'à 3 ans."},
  stop:{t:"Non-respect de l'arrêt STOP — art. R415-6",d:"Amende forfaitaire 135 € (minorée 90 €), retrait de 4 points, suspension possible jusqu'à 3 ans. L'arrêt doit être complet, à la limite de la chaussée abordée."},
  cedez:{t:"Refus de priorité — art. R415-7",d:"Amende forfaitaire 135 € (minorée 90 €), retrait de 4 points, suspension possible jusqu'à 3 ans."},
  prio_droite:{t:"Refus de priorité à droite — art. R415-5",d:"Amende forfaitaire 135 €, retrait de 4 points, suspension possible jusqu'à 3 ans."},
  sens_interdit:{t:"Circulation en sens interdit — art. R412-28",d:"Amende forfaitaire 135 €, retrait de 4 points, suspension possible jusqu'à 3 ans."},
  acces_interdit:{t:"Non-respect d'une interdiction de circuler — art. R411-8 / arrêté de police",d:"Amende de 4e classe, 135 € (minorée 90 €). Immobilisation du véhicule possible."},
  manoeuvre:{t:"Manœuvre interdite (tourner / demi-tour) — art. R412-28 et s.",d:"Amende de 4e classe, 135 €."},
  depassement:{t:"Dépassement interdit — art. R414-4 et s.",d:"Amende forfaitaire 135 €, retrait de 3 points. Suspension possible en cas de dépassement dangereux."},
  vitesse:{t:"Excès de vitesse — art. R413-14 et L413-1",d:"Excès < 20 km/h : 68 € (135 € si limite ≤ 50 km/h) et 1 point. De 20 à 29 km/h : 135 €, 2 points. De 30 à 39 km/h : 135 €, 3 points. De 40 à 49 km/h : 135 €, 4 points + suspension possible. ≥ 50 km/h : DÉLIT depuis le 31/12/2025 (loi n° 2025-622, art. L413-1) : 3 mois d'emprisonnement et 3 750 € d'amende (amende forfaitaire délictuelle 300 €), retrait de la moitié des points (6 points), suspension jusqu'à 3 ans, confiscation du véhicule possible — obligatoire en récidive."},
  vitesse_min:{t:"Vitesse minimale non respectée — art. R413-19",d:"Amende de 2e classe, 35 € (ex. : circuler à moins de 80 km/h sur la voie la plus à gauche d'une autoroute fluide)."},
  vitesse_conseillee:{t:"Vitesse conseillée",d:"Aucune sanction propre : c'est une recommandation. En revanche, une vitesse inadaptée aux circonstances reste sanctionnable (art. R413-17, 135 €)."},
  stationnement:{t:"Stationnement interdit — art. R417-6 et s.",d:"Stationnement gênant : 35 €. Très gênant (trottoirs, passages piétons, places PMR…) : 135 €. Dangereux (visibilité masquée) : 135 € + 3 points. Mise en fourrière possible dans tous les cas."},
  arret_stat:{t:"Arrêt et stationnement interdits — art. R417-10 et s.",d:"Arrêt ou stationnement gênant : 35 € ; très gênant : 135 € ; dangereux : 135 € + 3 points. Mise en fourrière possible."},
  klaxon:{t:"Usage interdit de l'avertisseur — art. R416-1",d:"Amende de 2e classe, 35 €."},
  interdistance:{t:"Non-respect de l'interdistance — art. R412-12",d:"Amende forfaitaire 135 €, retrait de 3 points."},
  gabarit:{t:"Non-respect d'une limite de gabarit — art. R411-8 / R312-*",d:"Amende de 4e classe, 135 €. Immobilisation du véhicule possible."},
  poids:{t:"Non-respect d'une limite de poids — art. R312-2 et s.",d:"Amende de 4e classe, 135 € ; 5e classe (1 500 €) en cas de dépassement important. Immobilisation possible."},
  mat_dang:{t:"Transport de marchandises dangereuses sur voie interdite",d:"Amende de 4e classe, 135 € (réglementation ADR : sanctions administratives supplémentaires possibles). Immobilisation possible."},
  obligation:{t:"Non-respect d'une obligation signalée",d:"Direction imposée non respectée (art. R412-26) : amende de 2e classe, 35 €. Les autres obligations signalées relèvent de leur texte propre, le plus souvent une contravention de 4e classe (135 €)."},
  voie_reservee:{t:"Circulation sur voie réservée — art. R412-7",d:"Amende forfaitaire 135 € pour l'usager non autorisé circulant sur la voie réservée."},
  chaines:{t:"Chaînes obligatoires (B26) non respectées",d:"Non-respect de l'obligation signalée : amende de 4e classe, 135 € ; l'usage de chaînes hors route enneigée est lui aussi sanctionné (art. R314-3, 4e classe). Immobilisation du véhicule possible."},
  zone_hiver:{t:"Zone d'équipements hivernaux (loi Montagne II)",d:"Point de vigilance : l'obligation d'équipement (1er novembre – 31 mars, décret n° 2020-1264) est réelle, mais AUCUNE amende n'est applicable à ce jour — le décret de verbalisation (135 € annoncés) n'a jamais été publié. Les forces de l'ordre font de la pédagogie. Argument assurantiel : en cas d'accident sur neige sans équipement, la responsabilité peut être discutée."},
  pn:{t:"Franchissement irrégulier d'un passage à niveau — art. R422-3 / R412-30",d:"Franchissement du feu rouge clignotant R24 : 135 €, 4 points, suspension possible 3 ans. S'engager sans pouvoir dégager : mêmes peines."},
  priorite_pieton:{t:"Refus de priorité à un piéton — art. R415-11",d:"Amende forfaitaire 135 €, retrait de 6 points, suspension possible 3 ans."},
  pieton:{t:"Infraction piéton — art. R412-34 et s.",d:"Contravention de 1re classe pour le piéton (amende forfaitaire de 4 €)."},
  ligne_continue:{t:"Franchissement de ligne continue — art. R412-19",d:"Franchissement : 135 €, 3 points. Chevauchement : 135 €, 1 point. Suspension possible en cas de franchissement."},
  arret_bande:{t:"Arrêt d'urgence uniquement",d:"S'arrêter hors cas d'urgence sur ces emplacements ou la bande d'arrêt d'urgence : amende de 2e à 4e classe selon le cas (35 à 135 €)."},
  tunnel:{t:"Règles en tunnel — art. R412-12 / R416-*",d:"Feux de croisement obligatoires, interdistances renforcées (135 €, 3 points en cas de non-respect), demi-tour et arrêt interdits (135 €)."},
  douane:{t:"Refus de s'arrêter — art. R411-8 / code des douanes",d:"Amende de 4e classe, 135 € ; le refus d'obtempérer à une sommation est un délit (L233-1 : jusqu'à 2 ans d'emprisonnement, 15 000 €)."},
  peage:{t:"Défaut de paiement du péage — art. R419-1 et R419-2",d:"Refus d'acquitter ou soustraction au paiement : amende de 4e classe, 135 € (transaction possible avec l'exploitant). Se soustraire de manière habituelle (plus de 5 contraventions en 12 mois) est un délit : 7 500 € d'amende (art. L419-1)."},
  zfe:{t:"Circulation en ZFE sans vignette autorisée — art. R411-19-1",d:"Amende de 3e classe (68 €) pour les véhicules légers, 4e classe (135 €) pour les poids lourds, bus et cars."},
  bus_arret:{t:"Redémarrage d'un bus — art. R412-11",d:"En agglomération, ralentir et au besoin s'arrêter pour laisser le bus quitter son arrêt signalé ; non-respect : amende de 2e classe, 35 €."},
  sas_velo:{t:"Occupation du sas vélo — art. R415-2 / R412-30",d:"S'arrêter dans le sas réservé aux cyclistes équivaut à un non-respect du feu : 135 €, 4 points."}
};

/* ---------- Thèmes ---------- */
var THEMES = [
  {id:"priorite",nom:"Priorités et intersections",ico:"AB4",desc:"Stop, cédez-le-passage, priorité à droite, giratoires : le socle des règles de croisement."},
  {id:"danger",nom:"Dangers",ico:"A14",desc:"Triangles rouges : annoncer un danger 150 m avant hors agglomération, 50 m en ville."},
  {id:"interdiction",nom:"Interdictions",ico:"B1",desc:"Cercles rouges : ce que l'usager ne doit pas faire, du sens interdit aux limites de gabarit."},
  {id:"vitesse",nom:"Vitesse",ico:"B14",desc:"Limitations, fins de limitation, vitesses minimales et conseillées, zones 30."},
  {id:"stationnement",nom:"Arrêt et stationnement",ico:"B6d",desc:"Interdictions d'arrêt et de stationnement, zones réglementées, parkings."},
  {id:"obligation",nom:"Obligations",ico:"B21b",desc:"Cercles bleus : directions, voies et équipements obligatoires."},
  {id:"fin",nom:"Fins de prescription",ico:"B31",desc:"Les panneaux barrés qui lèvent une interdiction ou une obligation."},
  {id:"zones",nom:"Zones réglementées",ico:"B52",desc:"Zone 30, zone de rencontre, aire piétonne, ZFE, équipements hivernaux."},
  {id:"indication",nom:"Indications",ico:"C12",desc:"Panneaux bleus carrés : information utile à la conduite, avec parfois de vraies règles (tunnel, sens unique…)."},
  {id:"services",nom:"Services",ico:"CE1",desc:"Stations, secours, toilettes, recharge : les installations utiles aux usagers."},
  {id:"direction",nom:"Direction et localisation",ico:"EB10",desc:"Jalonnement, entrées d'agglomération et repères de localisation."},
  {id:"pn",nom:"Passages à niveau et balises",ico:"G1",desc:"Croix de Saint-André, feux R24, balises de virage et d'obstacle."},
  {id:"temporaire",nom:"Signalisation temporaire",ico:"AK5",desc:"Panneaux jaunes de chantier et de danger temporaire, feux et flèches de rabattement."},
  {id:"panonceaux",nom:"Panonceaux",ico:"M9c",desc:"Les petits rectangles blancs qui précisent la portée du panneau qu'ils complètent."},
  {id:"feux",nom:"Feux et signaux lumineux",ico:"R11v",desc:"Feux tricolores, feux piétons, affectation de voies, feux de passage à niveau."},
  {id:"marquage",nom:"Marquages au sol",ico:"X-ligne-continue",desc:"Lignes, flèches, zébras et marques colorées : la signalisation horizontale."}
];

/* ---------- Panneaux ----------
   c: code, n: nom officiel abrégé, t: thème, d: définition/pédagogie,
   r: référence réglementaire, s: clé sanction, a: mots-clés recherche,
   img (optionnel) : nom de fichier si différent de c.svg          */
var ITEMS = [];
function P(c,n,t,d,r,s,a){ITEMS.push({c:c,n:n,t:t,d:d,r:r,s:s,a:a||""});}

/* ===== AB — Intersections et priorité ===== */
P("AB1","Priorité à droite (intersection)","priorite","Annonce une intersection où le conducteur doit céder le passage aux véhicules venant de sa droite. C'est le régime par défaut en l'absence de toute signalisation.","IISR art. 42 ; R415-5","prio_droite","priorité droite croix intersection");
P("AB2","Priorité ponctuelle","priorite","Annonce une intersection où les usagers de la route croisée doivent céder le passage. Vous êtes prioritaire à cette seule intersection.","IISR art. 42","info","priorité ponctuelle");
P("AB3a","Cédez le passage — position","priorite","Triangle pointe en bas implanté à l'intersection : céder le passage aux véhicules circulant sur la route croisée, sans obligation d'arrêt si la voie est libre.","R415-7","cedez","cedez le passage triangle inversé");
P("AB3b","Cédez le passage — annonce","priorite","Signal avancé du AB3a, complété par un panonceau de distance : préparez-vous à céder le passage à l'intersection annoncée.","R415-7","cedez","cedez annonce distance");
P("AB4","STOP — position","priorite","Arrêt obligatoire et complet à la limite de la chaussée abordée, puis céder le passage. Seul panneau octogonal : reconnaissable même recouvert de neige.","R415-6","stop","stop octogone arrêt obligatoire");
P("AB5","STOP — annonce","priorite","Signal avancé du STOP avec distance : annonce l'arrêt obligatoire à l'intersection à la distance indiquée.","R415-6","stop","stop annonce 150 m");
P("AB6","Route prioritaire","priorite","Losange jaune : vous circulez sur une route à caractère prioritaire, les routes croisées doivent céder le passage. Placé après chaque intersection importante.","R415-8","info","route prioritaire losange jaune");
P("AB7","Fin de route prioritaire","priorite","Le caractère prioritaire de la route cesse : on retombe dans le régime de la priorité à droite ou de la signalisation rencontrée.","R415-8","info","fin route prioritaire losange barré");
P("AB25","Carrefour à sens giratoire","priorite","Annonce un giratoire où les entrants cèdent le passage à ceux qui circulent sur l'anneau (« Vous n'avez pas la priorité »). À distinguer des anciens ronds-points à priorité à droite.","R415-10","cedez","giratoire rond-point anneau flèches");

/* ===== A — Dangers ===== */
P("A1a","Virage à droite","danger","Annonce un virage à droite dangereux. Adapter l'allure avant le virage : on freine avant, on ne freine pas dedans.","IISR art. 24","danger","virage tournant droite");
P("A1b","Virage à gauche","danger","Annonce un virage à gauche dangereux.","IISR art. 24","danger","virage tournant gauche");
P("A1c","Succession de virages (premier à droite)","danger","Série de virages rapprochés dont le premier tourne à droite. Vigilance prolongée : le panneau vaut pour toute la série.","IISR art. 24","danger","virages succession droite");
P("A1d","Succession de virages (premier à gauche)","danger","Série de virages rapprochés dont le premier tourne à gauche.","IISR art. 24","danger","virages succession gauche");
P("A2a","Cassis ou dos-d'âne","danger","Déformation de la chaussée (creux ou bosse) imposant un net ralentissement.","IISR art. 24","danger","cassis dos d'ane bosse creux");
P("A2b","Ralentisseur type dos-d'âne","danger","Annonce un ralentisseur aménagé. Souvent associé à une limitation à 30 km/h.","IISR art. 24","danger","ralentisseur coussin berlinois");
P("A3","Chaussée rétrécie","danger","Rétrécissement de la chaussée des deux côtés : croisement difficile, anticiper.","IISR art. 24","danger","retrecissement chaussée");
P("A3a","Chaussée rétrécie par la droite","danger","La chaussée se rétrécit côté droit.","IISR art. 24","danger","retrecissement droite");
P("A3b","Chaussée rétrécie par la gauche","danger","La chaussée se rétrécit côté gauche.","IISR art. 24","danger","retrecissement gauche");
P("A4","Chaussée particulièrement glissante","danger","Adhérence réduite (pluie, boue, gel, revêtement). Augmenter les distances, bannir les manœuvres brusques. Souvent complété d'un panonceau précisant la cause.","IISR art. 24","danger","glissant derapage pluie verglas");
P("A6","Pont mobile","danger","Pont pouvant s'ouvrir à la navigation : s'arrêter aux signaux, ne jamais forcer le passage.","IISR art. 24","danger","pont mobile levant");
P("A7","Passage à niveau avec barrières","danger","Passage à niveau muni de barrières ou demi-barrières. Ne jamais s'engager sans pouvoir dégager entièrement.","IISR art. 24 ; R422-3","pn","passage niveau barriere train");
P("A8","Passage à niveau sans barrière","danger","Passage à niveau sans barrière ni demi-barrière : redoubler de prudence, un train peut surgir.","IISR art. 24 ; R422-3","pn","passage niveau sans barriere train");
P("A9a","Traversée de voie de bus","danger","Traversée d'une voie réservée aux services réguliers de transport en commun.","IISR art. 24","danger","bus traversee voie");
P("A9b","Traversée de voie de tramway","danger","Traversée d'une ligne de tramway : le tram est prioritaire et ne peut pas s'arrêter court.","IISR art. 24","danger","tramway traversee rails");
P("A13a","Endroit fréquenté par les enfants","danger","Écoles, terrains de jeux : présence d'enfants, imprévisibles par nature. Vitesse très modérée.","IISR art. 24","danger","enfants ecole sortie");
P("A13b","Passage pour piétons (annonce)","danger","Annonce un passage piéton. Tout conducteur doit céder le passage au piéton engagé ou manifestant l'intention de traverser.","R415-11","priorite_pieton","pieton passage annonce");
P("A14","Autres dangers","danger","Danger sans symbole spécifique, précisé par un panonceau M9 (accotement, sortie d'usine…).","IISR art. 24","danger","autre danger point exclamation");
P("A15a1","Passage d'animaux domestiques","danger","Traversée possible d'animaux domestiques (bétail).","IISR art. 24","danger","vache betail troupeau");
P("A15a2","Passage d'animaux domestiques (variante)","danger","Variante du A15a1.","IISR art. 24","danger","betail animaux");
P("A15b","Passage d'animaux sauvages","danger","Gibier susceptible de traverser, surtout à l'aube et au crépuscule.","IISR art. 24","danger","cerf gibier sanglier sauvage");
P("A15c","Passage de cavaliers","danger","Traversée fréquente de cavaliers.","IISR art. 24","danger","cheval cavalier");
P("A16","Descente dangereuse","danger","Forte pente descendante (pourcentage indiqué) : utiliser le frein moteur pour ne pas surchauffer les freins.","IISR art. 24","danger","pente descente pourcentage frein");
P("A17","Annonce de feux tricolores","danger","Feux tricolores après le panneau, là où on ne les attend pas (hors agglomération, sortie de virage).","IISR art. 24","feu_rouge","feux tricolores annonce");
P("A18","Circulation dans les deux sens","danger","La chaussée devient bidirectionnelle (fin de sens unique ou de chaussées séparées) : serrer à droite, dépassements très prudents.","IISR art. 24","danger","double sens bidirectionnel");
P("A19","Risque de chute de pierres","danger","Chute de pierres possible ou pierres sur la chaussée, en zone de falaise ou montagne.","IISR art. 24","danger","pierres eboulement falaise");
P("A20","Débouché sur un quai ou une berge","danger","La route débouche sur un quai ou une berge : risque de chute dans l'eau.","IISR art. 24","danger","quai berge eau port");
P("A21","Débouché de cyclistes","danger","Cyclistes pouvant déboucher de droite ou de gauche (sortie de piste cyclable).","IISR art. 24","danger","cycliste velo debouche");
P("A23","Traversée d'une aire de danger aérien","danger","Zone survolée à très basse altitude par des aéronefs (base aérienne, aérodrome).","IISR art. 24","danger","avion aerien basse altitude");
P("A24","Vent latéral","danger","Vent latéral fréquent et violent (viaduc, plaine) : tenir fermement le volant, attention aux caravanes et deux-roues.","IISR art. 24","danger","vent lateral rafale manche air");

/* ===== B — Interdictions ===== */
P("B0","Circulation interdite à tout véhicule","interdiction","Cercle rouge vide : circulation interdite dans les deux sens à tout véhicule. Ne pas confondre avec le sens interdit B1.","R411-8","acces_interdit","cercle rouge circulation interdite deux sens");
P("B1","Sens interdit","interdiction","Accès interdit à tout véhicule dans ce sens. L'emprunter, c'est rouler à contresens : l'une des infractions les plus graves en ville.","R412-28","sens_interdit","sens interdit contresens barre rouge");
P("B1j","Rappel de sens interdit (bretelle)","interdiction","Panneau répété sur les bretelles d'autoroute pour éviter les prises à contresens, dramatiquement accidentogènes.","R412-28 ; R421-6","sens_interdit","contresens autoroute bretelle");
P("B2a","Interdiction de tourner à gauche","interdiction","Interdit de tourner à gauche à la prochaine intersection. Se justifie souvent par la dangerosité du cisaillement du flux opposé.","R412-28","manoeuvre","tourner gauche interdit");
P("B2b","Interdiction de tourner à droite","interdiction","Interdit de tourner à droite à la prochaine intersection.","R412-28","manoeuvre","tourner droite interdit");
P("B2c","Interdiction de demi-tour","interdiction","Demi-tour interdit sur la route suivie jusqu'à la prochaine intersection.","R412-28","manoeuvre","demi-tour interdit");
P("B3","Interdiction de dépasser","interdiction","Dépassement interdit de tout véhicule à moteur, sauf deux-roues sans side-car. Vaut jusqu'au panneau de fin B34 ou la prochaine intersection.","R414-4 et s.","depassement","depasser interdit voiture rouge noire");
P("B3a","Interdiction de dépasser (+3,5 t)","interdiction","Les véhicules de transport de marchandises de plus de 3,5 t ne doivent pas dépasser.","R414-4 et s.","depassement","depasser interdit camion poids lourd");
P("B4","Arrêt au poste de douane","interdiction","Arrêt obligatoire au poste de douane.","R411-8","douane","douane arret frontiere");
P("B5a","Arrêt au poste de gendarmerie","interdiction","Arrêt obligatoire au poste de gendarmerie.","R411-8","douane","gendarmerie arret controle");
P("B5b","Arrêt au poste de police","interdiction","Arrêt obligatoire au poste de police.","R411-8","douane","police arret controle");
P("B5c","Arrêt au poste de péage","interdiction","Arrêt obligatoire au poste de péage.","R419-1","peage","peage arret barriere");
P("B6a1","Stationnement interdit","interdiction","Stationnement interdit du côté du panneau, de ce point à la prochaine intersection. L'arrêt (conducteur au volant, bref) reste autorisé.","R417-6","stationnement","stationnement interdit cercle bleu barre");
P("B6a2","Stationnement interdit du 1er au 15","interdiction","Stationnement unilatéral alterné : interdit du 1er au 15 du mois du côté du panneau.","R417-6","stationnement","stationnement quinzaine alterne 1 15");
P("B6a3","Stationnement interdit du 16 à la fin du mois","interdiction","Stationnement interdit du 16 au dernier jour du mois du côté du panneau.","R417-6","stationnement","stationnement quinzaine alterne 16 31");
P("B6d","Arrêt et stationnement interdits","interdiction","Ni arrêt ni stationnement du côté du panneau (deux barres croisées). Même déposer un passager y est interdit.","R417-10","arret_stat","arret stationnement interdit croix");
P("B7a","Interdit aux véhicules à moteur sauf cyclomoteurs","interdiction","Accès interdit aux véhicules à moteur, à l'exception des cyclomoteurs.","R411-8","acces_interdit","vehicule moteur interdit sauf cyclomoteur");
P("B7b","Interdit à tous les véhicules à moteur","interdiction","Accès interdit à tous les véhicules à moteur, y compris cyclomoteurs.","R411-8","acces_interdit","tous vehicules moteur interdits moto voiture");
P("B8","Interdit aux véhicules de transport de marchandises","interdiction","Accès interdit aux véhicules affectés au transport de marchandises ; un panonceau peut limiter l'interdiction à un tonnage.","R411-8","acces_interdit","camion marchandises interdit");
P("B9a","Accès interdit aux piétons","interdiction","Les piétons ne doivent pas s'engager (autoroutes, tunnels, voies rapides).","R411-8 ; R412-34","pieton","pieton interdit");
P("B9b","Accès interdit aux cycles","interdiction","Les cycles ne doivent pas s'engager. À distinguer du B22a qui, lui, leur réserve une voie.","R411-8","acces_interdit","velo cycle interdit");
P("B9c","Accès interdit aux véhicules à traction animale","interdiction","Interdit aux véhicules à traction animale (attelages).","R411-8","acces_interdit","traction animale attelage charrette");
P("B9d","Accès interdit aux véhicules agricoles","interdiction","Interdit aux véhicules agricoles à moteur (tracteurs, automoteurs).","R411-8","acces_interdit","tracteur agricole interdit");
P("B9e","Accès interdit aux voitures à bras","interdiction","Interdit aux voitures à bras (hors celles assimilées aux piétons).","R411-8 ; R412-34","acces_interdit","voiture bras charrette");
P("B9f","Accès interdit aux transports en commun","interdiction","Interdit aux véhicules de transport en commun de personnes.","R411-8","acces_interdit","bus autocar interdit");
P("B9g","Accès interdit aux cyclomoteurs","interdiction","Interdit aux cyclomoteurs (≤ 50 cm³ / 4 kW).","R411-8","acces_interdit","cyclomoteur mobylette scooter interdit");
P("B9h","Accès interdit aux motocyclettes","interdiction","Interdit aux motocyclettes et motocyclettes légères.","R411-8","acces_interdit","moto motocyclette interdit");
P("B9i","Accès interdit aux véhicules tractant une caravane","interdiction","Interdit aux véhicules tractant caravane ou remorque de plus de 250 kg (PTRA ≤ 3,5 t).","R411-8","acces_interdit","caravane remorque interdit");
P("B10a","Limite de longueur","interdiction","Interdit aux véhicules ou ensembles dont la longueur dépasse le nombre indiqué.","R312-11","gabarit","longueur metres limite");
P("B11","Limite de largeur","interdiction","Interdit aux véhicules dont la largeur, chargement compris, dépasse le nombre indiqué (ponts étroits, rues anciennes).","R312-10","gabarit","largeur metres limite");
P("B12","Limite de hauteur","interdiction","Interdit aux véhicules dont la hauteur, chargement compris, dépasse le nombre indiqué (ponts, tunnels). La hauteur signalée ménage une marge réglementaire.","R312-12","gabarit","hauteur pont tunnel limite");
P("B13","Limite de poids total","interdiction","Interdit aux véhicules dont le PTAC/PTRA excède le nombre indiqué (ouvrages d'art, barrières de dégel).","R312-2","poids","tonnage poids total ptac pont");
P("B13a","Limite de poids par essieu","interdiction","Interdit aux véhicules pesant sur un essieu plus que le nombre indiqué.","R312-5","poids","essieu poids limite");
P("B14","Limitation de vitesse","vitesse","Vitesse maximale autorisée à partir du panneau, valable jusqu'au panneau de fin, à un changement de limite ou à la prochaine intersection. C'est une limite, pas un objectif : on adapte toujours aux conditions.","R413-14","vitesse","limitation vitesse 30 50 70 80 90 110 130 km/h");
P("B15","Priorité au sens inverse","interdiction","Passage étroit : céder le passage à la circulation venant en face (flèche rouge = vous). Son pendant prioritaire est le C18.","R415-9","cedez","passage etroit priorite sens inverse");
P("B16","Signaux sonores interdits","interdiction","Usage de l'avertisseur sonore interdit, sauf danger immédiat (hôpitaux, zones résidentielles).","R416-1","klaxon","klaxon avertisseur interdit");
P("B17","Interdistance minimale","interdiction","Interdiction de circuler sans maintenir l'intervalle indiqué entre véhicules (tunnels, ouvrages sensibles au poids).","R412-12","interdistance","interdistance intervalle metres tunnel");
P("B18a","Interdit aux marchandises explosives ou inflammables","interdiction","Accès interdit aux véhicules transportant des marchandises explosives ou facilement inflammables signalées ADR.","R411-8 ; ADR","mat_dang","explosif inflammable adr citerne");
P("B18b","Interdit aux marchandises polluantes pour l'eau","interdiction","Accès interdit aux transports de marchandises susceptibles de polluer les eaux (zones de captage).","R411-8 ; ADR","mat_dang","pollution eau captage adr");
P("B18c","Interdit aux marchandises dangereuses","interdiction","Accès interdit à tout transport signalé « marchandises dangereuses » (plaques oranges).","R411-8 ; ADR","mat_dang","marchandises dangereuses adr plaque orange");
P("B19","Autres interdictions","interdiction","Interdiction dont la nature est inscrite sur le panneau lui-même.","R411-8","acces_interdit","autre interdiction inscription");

/* ===== B — Obligations ===== */
P("B21-1","Obligation de tourner à droite","obligation","Tourner à droite avant le panneau : seule direction autorisée.","R412-26","obligation","tourner droite obligatoire fleche");
P("B21-2","Obligation de tourner à gauche","obligation","Tourner à gauche avant le panneau.","R412-26","obligation","tourner gauche obligatoire fleche");
P("B21a1","Contournement par la droite","obligation","Contourner l'obstacle ou le refuge par la droite (îlots, terre-pleins).","R412-26","obligation","contournement droite ilot");
P("B21a2","Contournement par la gauche","obligation","Contourner l'obstacle par la gauche.","R412-26","obligation","contournement gauche ilot");
P("B21b","Direction obligatoire : tout droit","obligation","À la prochaine intersection, continuer tout droit uniquement.","R412-26","obligation","tout droit obligatoire");
P("B21c1","Direction obligatoire : à droite","obligation","À la prochaine intersection, tourner à droite uniquement.","R412-26","obligation","droite obligatoire intersection");
P("B21c2","Direction obligatoire : à gauche","obligation","À la prochaine intersection, tourner à gauche uniquement.","R412-26","obligation","gauche obligatoire intersection");
P("B21d1","Tout droit ou à droite","obligation","Directions autorisées : tout droit ou à droite.","R412-26","obligation","tout droit droite");
P("B21d2","Tout droit ou à gauche","obligation","Directions autorisées : tout droit ou à gauche.","R412-26","obligation","tout droit gauche");
P("B21e","À droite ou à gauche","obligation","Directions autorisées : à droite ou à gauche (pas tout droit).","R412-26","obligation","droite gauche obligatoire");
P("B22a","Piste ou bande cyclable obligatoire","obligation","Les cyclistes doivent emprunter la piste ou bande réservée ; les autres véhicules ne peuvent ni y circuler ni y stationner.","R431-9 ; R412-7","voie_reservee","piste cyclable obligatoire velo");
P("B22b","Chemin obligatoire pour piétons","obligation","Les piétons doivent emprunter ce chemin, interdit aux véhicules.","R412-34","pieton","chemin pietons obligatoire");
P("B22c","Chemin obligatoire pour cavaliers","obligation","Les cavaliers doivent emprunter ce chemin.","R411-8","obligation","cavaliers chemin obligatoire");
P("B25","Vitesse minimale obligatoire","vitesse","Vitesse minimale imposée (ex. voie de gauche d'autoroute) tant que les circonstances le permettent.","R413-19","vitesse_min","vitesse minimale obligatoire cercle bleu");
P("B26","Chaînes à neige obligatoires","zones","Chaînes obligatoires sur au moins deux roues motrices, sur route enneigée.","R314-1","chaines","chaines neige obligatoires montagne");
P("B27a","Voie réservée aux bus","obligation","Voie réservée aux véhicules des services réguliers de transport en commun ; interdite aux autres usagers.","R412-7","voie_reservee","voie bus reservee couloir");
P("B27b","Voie réservée aux tramways","obligation","Voie réservée aux tramways.","R412-7","voie_reservee","voie tramway reservee");
P("B29","Autres obligations","obligation","Obligation dont la nature est inscrite sur le panneau (ex. « Allumez vos feux »).","R412-26","obligation","autre obligation inscription feux");

/* ===== B — Fins de prescription ===== */
P("B31","Fin de toutes les interdictions","fin","Lève toutes les interdictions signalées en amont aux véhicules en mouvement (vitesse, dépassement, klaxon). Ne concerne pas le stationnement.","IISR art. 63","info","fin interdictions barre grise");
P("B33","Fin de limitation de vitesse","vitesse","La limitation indiquée cesse ; on retombe sur les vitesses générales du code (50 en agglomération, 80/90, 110, 130).","R413-14","info","fin limitation vitesse barre");
P("B34","Fin d'interdiction de dépasser","fin","Lève l'interdiction notifiée par le panneau B3.","IISR art. 63","info","fin depassement");
P("B34a","Fin d'interdiction de dépasser (+3,5 t)","fin","Lève l'interdiction notifiée par le B3a pour les poids lourds.","IISR art. 63","info","fin depassement camion");
P("B35","Fin d'interdiction de l'avertisseur","fin","Lève l'interdiction d'usage des signaux sonores.","IISR art. 63","info","fin klaxon");
P("B39","Fin d'interdiction (inscription)","fin","Lève l'interdiction dont la nature figure sur le panneau.","IISR art. 63","info","fin interdiction inscription");
P("B40","Fin de piste cyclable obligatoire","fin","Lève l'obligation d'emprunter la piste ou bande cyclable.","IISR art. 63","info","fin piste cyclable");
P("B41","Fin de chemin piétons","fin","Lève l'obligation du chemin pour piétons.","IISR art. 63","info","fin chemin pietons");
P("B42","Fin de chemin cavaliers","fin","Lève l'obligation du chemin pour cavaliers.","IISR art. 63","info","fin chemin cavaliers");
P("B43","Fin de vitesse minimale","fin","Lève l'obligation de vitesse minimale.","IISR art. 63","info","fin vitesse minimale");
P("B44","Fin de chaînes obligatoires","fin","Lève l'obligation d'équipement en chaînes à neige.","IISR art. 63","info","fin chaines neige");
P("B45","Fin de voie réservée aux bus","fin","Fin de la voie réservée aux transports en commun et de la limitation qui y était associée.","IISR art. 63","info","fin voie bus");
P("B49","Fin d'obligation (inscription)","fin","Lève l'obligation dont la nature figure sur le panneau.","IISR art. 63","info","fin obligation inscription");

/* ===== B — Zones ===== */
P("B6b1","Zone à stationnement interdit","stationnement","Toutes les voies de la zone sont en stationnement interdit, jusqu'au panneau de sortie B50a. Pas besoin de répéter le panneau à chaque rue.","R417-6","stationnement","zone stationnement interdit entree");
P("B6b2","Zone à stationnement unilatéral alterné","stationnement","Stationnement alterné par quinzaine dans toute la zone.","R417-6 ; R417-2","stationnement","zone alternee quinzaine");
P("B6b3","Zone bleue (disque)","stationnement","Zone à durée limitée avec contrôle par disque européen : apposer le disque, respecter la durée.","R417-3","stationnement","zone bleue disque duree limitee");
P("B6b4","Zone de stationnement payant","stationnement","Stationnement payant dans toute la zone. Depuis 2018, le défaut de paiement relève du forfait post-stationnement (FPS), pas de l'amende pénale.","L2333-87 CGCT","stationnement","zone payante horodateur fps");
P("B6b5","Zone alternée à durée limitée","stationnement","Combinaison : alternance semi-mensuelle et durée limitée par disque.","R417-2 ; R417-3","stationnement","zone alternee disque");
P("B50a","Sortie de zone à stationnement interdit","stationnement","Fin de la zone à stationnement interdit.","IISR art. 63","info","sortie zone stationnement");
P("B50b","Sortie de zone alternée","stationnement","Fin de la zone à stationnement unilatéral alterné.","IISR art. 63","info","sortie zone alternee");
P("B50c","Sortie de zone bleue","stationnement","Fin de la zone à durée limitée par disque.","IISR art. 63","info","sortie zone bleue");
P("B50d","Sortie de zone payante","stationnement","Fin de la zone de stationnement payant.","IISR art. 63","info","sortie zone payante");
P("B50e","Sortie de zone alternée à durée limitée","stationnement","Fin de la zone combinée alternance + disque.","IISR art. 63","info","sortie zone combinee");
P("B30","Zone 30","zones","Entrée d'une zone où la vitesse est limitée à 30 km/h sur toutes les voies. Les piétons et cyclistes y cohabitent avec les véhicules ; double sens cyclable par défaut.","R110-2 ; R413-3","vitesse","zone 30 trente entree");
P("B51","Sortie de zone 30","zones","Fin de la zone 30 ; la limite redevient celle de l'agglomération (50 km/h sauf indication).","R413-3","info","sortie zone 30");
P("B52","Zone de rencontre","zones","Zone limitée à 20 km/h où le piéton est prioritaire sur tous les véhicules et peut circuler sur la chaussée. Stationnement uniquement sur emplacements aménagés.","R110-2 ; R412-35","vitesse","zone rencontre 20 pieton prioritaire");
P("B53","Sortie de zone de rencontre","zones","Fin de la zone de rencontre.","R110-2","info","sortie zone rencontre");
P("B54","Aire piétonne","zones","Zone réservée aux piétons. Cyclistes admis à l'allure du pas ; circulation et stationnement des véhicules motorisés interdits sauf dérogations (riverains, livraisons).","R110-2 ; R431-9","acces_interdit","aire pietonne zone pieton");
P("B55","Sortie d'aire piétonne","zones","Fin de l'aire piétonne.","R110-2","info","sortie aire pietonne");
P("B56","Zone à circulation restreinte (ZFE)","zones","Entrée d'une zone à faibles émissions : seuls les véhicules munis de la vignette Crit'Air autorisée par l'arrêté peuvent circuler. Le panonceau M11d précise les restrictions.","R411-19-1 ; L2213-4-1 CGCT","zfe","zfe crit'air zone faibles emissions circulation restreinte");
P("B57","Sortie de zone à circulation restreinte","zones","Fin de la ZFE.","R411-19-1","info","sortie zfe");
P("B58","Zone d'équipements hivernaux obligatoires","zones","Entrée de zone montagneuse (loi Montagne II) : du 1er novembre au 31 mars, pneus hiver 3PMSF ou chaînes/chaussettes à bord obligatoires.","Décret n° 2020-1264","zone_hiver","loi montagne pneus hiver chaines novembre mars");
P("B59","Sortie de zone d'équipements hivernaux","zones","Fin de la zone d'obligation d'équipements hivernaux.","R314-1","info","sortie zone hivernale");

/* ===== C — Indications ===== */
P("C1a","Parking","stationnement","Lieu aménagé pour le stationnement.","IISR art. 70","info","parking stationnement p");
P("C1b","Parking à disque","stationnement","Stationnement gratuit à durée limitée, contrôlé par disque.","R417-3","stationnement","parking disque gratuit duree");
P("C1c","Parking payant","stationnement","Lieu aménagé pour le stationnement payant.","L2333-87 CGCT","stationnement","parking payant");
P("C3","Risque d'incendie","indication","Section où le risque d'incendie est élevé : ne pas jeter de mégots, ne pas stationner sur les herbes sèches.","IISR art. 70","info","incendie feu foret");
P("C4a","Vitesse conseillée","vitesse","Vitesse recommandée si les circonstances le permettent (bretelles, virages). Non obligatoire mais fortement indicative.","IISR art. 70","vitesse_conseillee","vitesse conseillee carre bleu");
P("C4b","Fin de vitesse conseillée","vitesse","Fin de la vitesse conseillée.","IISR art. 70","info","fin vitesse conseillee");
P("C5","Station de taxis","indication","Station de taxis ; l'arrêt et le stationnement y sont réservés aux taxis en service.","R417-10","arret_stat","taxi station reserve");
P("C6","Arrêt d'autobus","indication","Arrêt de bus : arrêt et stationnement interdits aux autres véhicules sur l'emplacement (très gênant : 135 €). En agglomération, faciliter le redémarrage du bus.","R417-11 ; R415-13","bus_arret","arret bus autobus abribus");
P("C8","Emplacement d'arrêt d'urgence","indication","Refuge réservé aux arrêts d'urgence, sur routes sans bande d'arrêt d'urgence ou en tunnel.","R417-10","arret_bande","arret urgence refuge");
P("C9","Station d'autopartage","indication","Emplacement réservé aux véhicules du service d'autopartage.","R417-10","arret_stat","autopartage station");
P("C12","Circulation à sens unique","indication","La circulation se fait en sens unique dans le sens de la flèche. Ne dispense pas de vigilance : double-sens cyclable possible en zone 30.","IISR art. 70","info","sens unique fleche");
P("C13a","Impasse","indication","Voie sans issue.","IISR art. 70","info","impasse sans issue cul de sac");
P("C13b","Présignalisation d'impasse","indication","Annonce une impasse sur la voie embranchée.","IISR art. 70","info","impasse annonce");
P("C13c","Impasse avec issue piétonne","indication","Impasse pour les véhicules, mais débouché possible pour les piétons.","IISR art. 70","info","impasse issue pietons");
P("C13d","Impasse avec issue piétons et cycles","indication","Impasse pour les véhicules motorisés, avec issue pour piétons et cyclistes.","IISR art. 70","info","impasse issue velo pietons");
P("C14","Praticabilité d'une section","indication","Informe sur la praticabilité d'une route de montagne (ouvert/fermé, équipements exigés).","IISR art. 70","info","col ouvert ferme montagne praticabilite");
P("C18","Priorité par rapport au sens inverse","indication","Passage étroit : vous avez la priorité sur la circulation venant en face (pendant du B15).","R415-9","info","priorite passage etroit fleche bleue");
P("C20a","Passage pour piétons","indication","Position du passage piéton. Céder le passage au piéton engagé ou qui manifeste l'intention de traverser : 6 points en jeu.","R415-11","priorite_pieton","passage pieton position");
P("C20b","Traversée de voie de bus","indication","Position d'une traversée de voie réservée de transport en commun.","IISR art. 70","info","traversee voie bus");
P("C20c","Traversée de voies de tramways","indication","Position d'une traversée de tramway.","IISR art. 70","info","traversee tramway");
P("C23","Stationnement réglementé caravanes","stationnement","Stationnement réglementé pour caravanes et autocaravanes (durée, période — voir panonceau).","R417-6","stationnement","caravane camping-car autocaravane reglemente");
P("C24a","Conditions particulières par voie","indication","Conditions de circulation propres à chaque voie (voie réservée, limitation par voie).","IISR art. 70","info","voies conditions particulieres");
P("C24b","Voies affectées","indication","Affectation des voies en amont d'une intersection (flèches de direction par voie).","IISR art. 70","info","voies affectees fleches");
P("C24c","Conditions sur la voie embranchée","indication","Conditions particulières de circulation sur la route ou voie embranchée.","IISR art. 70","info","voie embranchee conditions");
P("C25a","Limites de vitesse aux frontières","vitesse","Rappel, aux frontières, des vitesses maximales en vigueur en France : 50 agglomération, 80/90 routes, 110 voies rapides, 130 autoroutes.","R413-2","vitesse","frontiere limites france rappel vitesses");
P("C25b","Rappel des limites sur autoroute","vitesse","Rappel des limites : 130 km/h, ramenées à 110 par temps de pluie.","R413-2 ; R413-4","vitesse","autoroute 130 110 pluie rappel");
P("C26a","Voie de détresse à droite","indication","Voie d'échappement en forte descente, à droite, pour véhicule en perte de freins.","IISR art. 70","info","voie detresse echappement frein");
P("C26b","Voie de détresse à gauche","indication","Voie de détresse à gauche.","IISR art. 70","info","voie detresse gauche");
P("C27","Surélévation de chaussée","indication","Plateau surélevé (modération de vitesse), souvent en zone 30.","IISR art. 70","danger","plateau sureleve ralentisseur");
P("C28","Réduction du nombre de voies","indication","Une voie disparaît sur route à chaussées séparées : se rabattre en fermeture éclair.","IISR art. 70","danger","reduction voies rabattement");
P("C29a","Annonce de créneau de dépassement","indication","Un créneau de dépassement (2×2 voies ou 3 voies) est annoncé.","IISR art. 70","info","creneau depassement annonce");
P("C29b","Créneau à 3 voies « 2+1 »","indication","Créneau à trois voies affectées : deux dans votre sens, une en face.","IISR art. 70","info","trois voies creneau");
P("C29c","Section à 3 voies « 1+2 »","indication","Trois voies affectées : une dans votre sens, deux en face — ne pas empiéter.","IISR art. 70","info","trois voies inverse");
P("C30","Fin de créneau de dépassement","indication","Fin du créneau à trois voies : se rabattre.","IISR art. 70","info","fin creneau rabattre");
P("C50","Indications diverses","indication","Panneau d'indications diverses (texte).","IISR art. 70","info","indications diverses");
P("C51a","Début de section à vitesse régulée","vitesse","Section où la vitesse est régulée dynamiquement (panneaux à messages variables).","R413-14","vitesse","vitesse regulee dynamique");
P("C51b","Fin de section à vitesse régulée","vitesse","Fin de la régulation dynamique de vitesse.","IISR art. 70","info","fin vitesse regulee");
P("C62","Annonce de borne de ticket de péage","indication","Présignalisation d'une borne de retrait de ticket.","IISR art. 70","info","peage ticket borne");
P("C64a","Paiement auprès d'un péagiste","indication","Voie de péage tenue par un agent.","R419-1","peage","peage agent voie");
P("C64b","Paiement par carte bancaire","indication","Voie de paiement automatique par carte.","R419-1","peage","peage carte bancaire");
P("C64c1","Paiement en pièces","indication","Voie de paiement automatique en pièces.","R419-1","peage","peage pieces monnaie");
P("C64c2","Paiement en pièces et billets","indication","Voie de paiement automatique acceptant pièces et billets.","R419-1","peage","peage billets pieces");
P("C64d","Télépéage","indication","Voie réservée aux abonnés télépéage (badge). Vitesse limitée à 30 km/h dans les voies « t » ouvertes.","R419-1","peage","telepeage badge t");
P("C65a","Péage en flux libre","indication","Section à péage sans barrière : portiques de détection, paiement en ligne ou en point de vente.","R419-1 ; L419-1","peage","flux libre free flow peage");
P("C65b","Modalités du péage en flux libre","indication","Indique le délai (72 h) et les moyens de paiement pour les non-abonnés.","R419-1","peage","flux libre delai paiement");
P("C65c","Rappel de paiement flux libre","indication","Rappel en sortie de zone : penser à payer son péage.","R419-1","peage","flux libre rappel");
P("C107","Route à accès réglementé","indication","Voie express : réservée aux véhicules à moteur rapides ; piétons, cycles, cyclomoteurs, tracteurs interdits. Arrêt, stationnement, demi-tour et marche arrière interdits.","R421-1 et s.; R432-*","acces_interdit","voie express acces reglemente route");
P("C108","Fin de route à accès réglementé","indication","Fin du statut de voie express.","IISR art. 70","info","fin voie express");
P("C111","Entrée de tunnel","indication","Malgré sa couleur bleue, il emporte des règles : feux de croisement allumés, interdistances renforcées, demi-tour et arrêt interdits hors urgence.","R412-12 ; R416-6","tunnel","tunnel entree feux interdistance");
P("C112","Sortie de tunnel","indication","Fin des prescriptions liées au tunnel.","IISR art. 70","info","tunnel sortie");
P("C113","Piste cyclable conseillée","indication","Piste ou bande conseillée et réservée aux cycles : facultative pour les cyclistes (contrairement au B22a), interdite aux autres véhicules.","R431-9","voie_reservee","piste cyclable conseillee facultative");
P("C114","Fin de piste cyclable conseillée","indication","Fin de l'aménagement cyclable conseillé.","IISR art. 70","info","fin piste conseillee");
P("C115","Voie verte","indication","Voie réservée aux piétons et véhicules non motorisés (et cavaliers selon arrêté). Véhicules motorisés interdits.","R110-2","acces_interdit","voie verte pietons velos");
P("C116","Fin de voie verte","indication","Fin de la voie verte.","R110-2","info","fin voie verte");
P("C117","Tunnel interdit à certaines marchandises dangereuses","indication","Annonce un tunnel classé (catégorie B à E sur panonceau M11c) restreignant les marchandises dangereuses.","ADR ; R411-8","mat_dang","tunnel categorie adr marchandises");
P("C207","Début de section d'autoroute","indication","Début du régime autoroutier : usagers lents interdits, 130 km/h par défaut, arrêt et marche arrière interdits, bande d'arrêt d'urgence réservée aux urgences.","R421-1 et s.","acces_interdit","autoroute debut entree");
P("C208","Fin de section d'autoroute","indication","Fin du régime autoroutier et des règles associées.","R421-*","info","autoroute fin sortie");

/* ===== CE — Services ===== */
P("CE1","Poste de secours","services","Installation de secours à proximité.","IISR art. 73","info","secours croix");
P("CE2a","Poste d'appel d'urgence","services","Borne d'appel d'urgence reliée aux secours.","IISR art. 73","info","borne appel urgence orange");
P("CE2b","Cabine téléphonique publique","services","Téléphone public.","IISR art. 73","info","telephone cabine");
P("CE3a","Informations touristiques","services","Point d'informations sur les services et activités touristiques.","IISR art. 73","info","office tourisme informations");
P("CE3b","Relais d'information service","services","Panneau d'information faisant partie d'un relais d'information service.","IISR art. 73","info","relais information service");
P("CE4a","Camping tentes","services","Terrain de camping pour tentes.","IISR art. 73","info","camping tente");
P("CE4b","Camping caravanes","services","Terrain de camping pour caravanes et autocaravanes.","IISR art. 73","info","camping caravane");
P("CE4c","Camping mixte","services","Terrain pour tentes, caravanes et autocaravanes.","IISR art. 73","info","camping mixte");
P("CE5a","Auberge de jeunesse","services","Auberge de jeunesse.","IISR art. 73","info","auberge jeunesse");
P("CE5b","Chambre d'hôtes ou gîte","services","Hébergement chez l'habitant.","IISR art. 73","info","gite chambre hotes");
P("CE6a","Départ d'itinéraire pédestre","services","Point de départ de randonnée pédestre.","IISR art. 73","info","randonnee sentier depart");
P("CE6b","Départ de ski de fond","services","Point de départ d'un circuit de ski de fond.","IISR art. 73","info","ski fond depart");
P("CE7","Emplacement pique-nique","services","Aire de pique-nique.","IISR art. 73","info","pique-nique table aire");
P("CE8","Gare auto/train","services","Gare permettant l'embarquement des véhicules à bord des trains.","IISR art. 73","info","auto train gare");
P("CE9","Parking sous vidéoprotection","services","Parc de stationnement surveillé par caméras.","IISR art. 73","info","parking video surveille");
P("CE10","Embarcadère","services","Embarcadère (bac, ferry).","IISR art. 73","info","bac ferry embarcadere");
P("CE12","Toilettes publiques","services","Toilettes ouvertes au public.","IISR art. 73","info","wc toilettes");
P("CE14","Installations PMR","services","Installations accessibles aux personnes à mobilité réduite.","IISR art. 73","info","handicap pmr accessible");
P("CE15a","Station-service 24h/24","services","Poste de distribution de carburant ouvert 7 j/7 et 24 h/24.","IISR art. 73","info","essence carburant station");
P("CE15c","Station-service + gaz","services","Station 24 h/24 distribuant aussi GPL, GNV, GNL ou GNC.","IISR art. 73","info","gpl gnv gaz station");
P("CE15g","Station-service + recharge électrique","services","Station 24 h/24 assurant la recharge des véhicules électriques.","IISR art. 73","info","recharge electrique station essence");
P("CE15i","Poste de recharge électrique","services","Poste de recharge de véhicules électriques ouvert 7 j/7, 24 h/24.","IISR art. 73","info","borne recharge electrique");
P("CE16","Restaurant","services","Restaurant ouvert 7 jours sur 7.","IISR art. 73","info","restaurant couverts");
P("CE17","Hôtel ou motel","services","Hôtel ou motel ouvert 7 jours sur 7.","IISR art. 73","info","hotel lit motel");
P("CE18","Débit de boissons","services","Café ou établissement de collations ouvert 7 j/7.","IISR art. 73","info","cafe bar tasse");
P("CE19","Mise à l'eau d'embarcations","services","Cale de mise à l'eau pour embarcations légères.","IISR art. 73","info","bateau cale rampe");
P("CE20a","Gare de téléphérique","services","Gare de téléphérique.","IISR art. 73","info","telepherique gare");
P("CE20b","Télésiège ou télécabine","services","Point de départ d'un télésiège ou d'une télécabine.","IISR art. 73","info","telesiege telecabine");
P("CE21","Point de vue","services","Point de vue remarquable.","IISR art. 73","info","point vue panorama");
P("CE22","Fréquence radio trafic","services","Fréquence de la station radio d'information routière (ex. 107.7).","IISR art. 73","info","radio 107.7 frequence autoroute");
P("CE23","Jeux d'enfants","services","Aire de jeux d'enfants à proximité.","IISR art. 73","info","jeux enfants aire");
P("CE24","Station de vidange","services","Station de vidange pour caravanes, autocaravanes et cars.","IISR art. 73","info","vidange camping-car station");
P("CE25","Distributeur de billets","services","Distributeur automatique de billets de banque.","IISR art. 73","info","distributeur billets dab");
P("CE26","Station de gonflage gratuite","services","Station de gonflage hors station-service, à usage gratuit.","IISR art. 73","info","gonflage pneus air");
P("CE27","Point de détente","services","Aire de détente.","IISR art. 73","info","detente repos aire");
P("CE28","Poste de dépannage","services","Atelier ou poste de dépannage.","IISR art. 73","info","depannage garage cle");
P("CE29","Moyen de lutte contre l'incendie","services","Extincteur ou moyen de lutte contre l'incendie (tunnels, aires).","IISR art. 73","info","extincteur incendie");
P("CE30a","Issue de secours à droite","services","Issue de secours vers la droite (tunnels).","IISR art. 73","info","issue secours droite tunnel");
P("CE30b","Issue de secours à gauche","services","Issue de secours vers la gauche (tunnels).","IISR art. 73","info","issue secours gauche tunnel");
P("CE50","Installations diverses","services","Installations ou services divers.","IISR art. 73","info","services divers");
P("CE52","Aire de covoiturage","services","Lieu aménagé pour la pratique du covoiturage.","IISR art. 73","info","covoiturage aire");

/* ===== Direction et localisation ===== */
P("EB10","Entrée d'agglomération","direction","L'entrée d'agglomération vaut limitation à 50 km/h sur toutes les voies, sans autre panneau. C'est aussi le point de départ des règles urbaines (klaxon, stationnement).","R110-2 ; R413-3","vitesse","agglomeration entree ville 50");
P("EB20","Sortie d'agglomération","direction","Fin des règles d'agglomération ; la vitesse repasse au régime rase campagne (80/90 km/h).","R110-2 ; R413-2","info","agglomeration sortie barre");
P("D42a","Jalonnement de direction","direction","Panneau de direction courante : mentions blanches sur fond bleu (autoroute), vert (grandes liaisons), blanc (local).","IISR 5e partie","info","direction jalonnement mention ville");
P("D21a","Direction par flèche","direction","Panneau de position à pointe de flèche indiquant la direction à l'intersection.","IISR 5e partie","info","fleche direction intersection");

/* ===== G — Passages à niveau ===== */
P("G1","Croix de Saint-André (1 voie)","pn","Position d'un passage à niveau à une voie, sans barrière ni signalisation automatique. S'arrêter si un train approche : le train ne peut pas s'arrêter.","R422-3","pn","croix saint andre passage niveau");
P("G1a","Croix de Saint-André (plusieurs voies)","pn","Position d'un passage à niveau à plusieurs voies ferrées, sans barrière.","R422-3","pn","croix saint andre plusieurs voies");
P("G1bis","Croix de Saint-André + feux (1 voie)","pn","Passage à niveau à une voie muni d'une signalisation automatique lumineuse et sonore, sans barrière.","R422-3","pn","croix feux automatique");
P("G1abis","Croix de Saint-André + feux (plusieurs voies)","pn","Passage à niveau à plusieurs voies muni d'une signalisation automatique, sans barrière.","R422-3","pn","croix feux plusieurs voies");

/* ===== J — Balises ===== */
P("J1","Balise de virage","pn","Balise blanche à bande noire implantée à l'extérieur des virages pour en souligner la courbure.","IISR 1re partie","info","balise virage");
P("J1bis","Balise de virage (neige)","pn","Balise haute pour routes fréquemment enneigées.","IISR 1re partie","info","balise neige montagne");
P("J3","Balise d'intersection","pn","Signale la position d'une intersection.","IISR 1re partie","info","balise intersection");
P("J4","Balise à chevrons","pn","Panneau à chevrons blancs sur fond bleu (ou noir) marquant un virage prononcé : suivre la pointe des chevrons.","IISR 1re partie","danger","chevrons virage bleu");
P("J5","Balise de nez d'îlot","pn","Signale le nez d'un îlot séparateur ou l'origine d'un terre-plein.","IISR 1re partie","info","ilot musoir nez");
P("J6","Délinéateur","pn","Balise de rive délimitant la chaussée, avec dispositif rétroréfléchissant.","IISR 1re partie","info","delineateur rive");
P("J10","Présignalisation de passage à niveau","pn","Balises à barres rouges décroissantes (3-2-1) implantées à 150, 100 et 50 m d'un passage à niveau.","IISR 1re partie","pn","balises passage niveau 3 barres compte rebours");
P("J11","Renforcement de ligne continue","pn","Dispositif renforçant la perception d'un marquage continu.","IISR 1re partie","ligne_continue","renforcement ligne continue");
P("J13","Balise d'obstacle","pn","Signale un obstacle ponctuel (pile de pont, refuge).","IISR 1re partie","info","balise obstacle");
P("J14a","Balise de musoir (demi-cercle)","pn","Marque la divergence des voies en tête d'îlot (bretelles).","IISR 1re partie","info","musoir divergence");
P("J14b","Balise de musoir (chevrons)","pn","Série de chevrons marquant la divergence des voies.","IISR 1re partie","info","musoir chevrons");

/* ===== AK / K / KR — Signalisation temporaire ===== */
P("AK2","Cassis ou dos-d'âne (temporaire)","temporaire","Déformation temporaire de la chaussée (fond jaune).","IISR 8e partie","danger","temporaire cassis jaune");
P("AK3","Chaussée rétrécie (temporaire)","temporaire","Rétrécissement temporaire, souvent en approche de chantier.","IISR 8e partie","danger","temporaire retrecissement jaune");
P("AK4","Chaussée glissante (temporaire)","temporaire","Adhérence réduite temporaire (boue, gravillons, enrobés neufs).","IISR 8e partie","danger","temporaire glissant jaune");
P("AK5","Travaux","temporaire","Annonce une zone de travaux : personnel sur la chaussée, vitesse réduite. Les excès de vitesse y sont particulièrement dangereux pour les agents.","IISR 8e partie","danger","travaux chantier jaune");
P("AK14","Autre danger temporaire","temporaire","Danger temporaire précisé par panonceau KM9.","IISR 8e partie","danger","danger temporaire jaune");
P("AK17","Feux temporaires d'alternat","temporaire","Annonce des feux tricolores réglant une circulation alternée de chantier.","IISR 8e partie","feu_rouge","alternat feux chantier");
P("AK22","Projection de gravillons","temporaire","Risque de projection de gravillons : réduire l'allure et les interdistances.","IISR 8e partie","danger","gravillons projection pare-brise");
P("AK30","Bouchon","temporaire","Annonce un bouchon : risque de collision par l'arrière, allumer ses feux de détresse.","IISR 8e partie","danger","bouchon embouteillage");
P("AK31","Accident","temporaire","Annonce un accident en aval : ralentir fortement, faciliter les secours, corridor de sécurité.","IISR 8e partie","danger","accident annonce");
P("AK32","Brouillard ou fumées","temporaire","Nappes de brouillard ou fumées épaisses : feux de brouillard, vitesse ≤ 50 km/h si visibilité < 50 m.","R413-4","danger","brouillard fumee visibilite 50");
P("K2","Barrage de position","temporaire","Barrage signalant la position de travaux ou d'un obstacle temporaire.","IISR 8e partie","acces_interdit","barrage travaux position");
P("K5a","Cône de chantier","temporaire","Dispositif conique délimitant un chantier ou un obstacle temporaire.","IISR 8e partie","info","cone plot chantier");
P("K8","Barrière de déviation","temporaire","Signale une déviation ou un rétrécissement temporaire de chaussée.","IISR 8e partie","info","barriere deviation");
P("K10","Piquet mobile d'alternat","temporaire","Signal à double face (vert/rouge) manœuvré par un agent pour régler l'alternat. Le non-respect équivaut à un refus de priorité.","R411-28","feu_rouge","piquet k10 alternat agent");
P("K16","Séparateur modulaire","temporaire","Séparateur modulaire de voie protégeant le chantier.","IISR 8e partie","info","separateur beton plastique");
P("KC1","Chantier important","temporaire","Indication de chantier important ou de situation particulière (texte).","IISR 8e partie","info","chantier indication kc1");
P("KD8","Changement de chaussée","temporaire","Présignalisation d'un basculement de chaussée ou changement de trajectoire.","IISR 8e partie","info","basculement chaussee deviation");
P("KD10a","Réduction de voie (temporaire)","temporaire","Annonce la neutralisation d'une voie.","IISR 8e partie","info","reduction voie neutralisation");
P("KD22","Direction de déviation","temporaire","Jalonnement de l'itinéraire de déviation (fond jaune).","IISR 8e partie","info","deviation direction jaune");
P("KR11","Feux tricolores de chantier","temporaire","Feux temporaires réglant l'alternat : mêmes obligations qu'un feu permanent.","R412-30","feu_rouge","feux chantier alternat");
P("KR43","Flèche lumineuse de rabattement","temporaire","Flèche lumineuse sur véhicule ou remorque imposant de changer de voie.","IISR 8e partie","obligation","fleche lumineuse rabattement fourgon");

/* ===== M — Panonceaux ===== */
P("M1","Panonceau de distance","panonceaux","Indique la distance entre le panneau et le point signalé (ex. « 150 m »).","IISR art. 9","info","distance metres panonceau");
P("M2","Panonceau d'étendue","panonceaux","Indique la longueur de section concernée par le panneau (ex. « sur 3 km »).","IISR art. 9","info","etendue sur km");
P("M3a","Panonceau de position de voie","panonceaux","Indique la position de la voie concernée par le panneau complété.","IISR art. 9","info","position voie fleche");
P("M3b","Panonceau directionnel de service","panonceaux","Indique la direction (et la distance) du service signalé.","IISR art. 9","info","direction service fleche");
P("M3d","Panonceau de voie surplombée","panonceaux","Le panneau s'applique à la voie au-dessus de laquelle il est implanté.","IISR art. 9","info","voie surplombee fleche bas");
P("M4a","Catégorie : véhicules < 3,5 t","panonceaux","Restreint le panneau aux véhicules dont le PTAC/PTRA est inférieur à 3,5 t.","IISR art. 9","info","categorie 3.5 tonnes leger");
P("M4b","Catégorie : transports en commun","panonceaux","Restreint le panneau aux véhicules de transport en commun.","IISR art. 9","info","categorie bus car");
P("M4c","Catégorie : motocyclettes","panonceaux","Restreint le panneau aux motocyclettes et motos légères.","IISR art. 9","info","categorie moto");
P("M4d1","Catégorie : cycles","panonceaux","Restreint le panneau aux cycles.","IISR art. 9","info","categorie velo cycle");
P("M4d2","Catégorie : cyclomoteurs","panonceaux","Restreint le panneau aux cyclomoteurs.","IISR art. 9","info","categorie cyclomoteur");
P("M4e","Catégorie : par inscription","panonceaux","Restreint le panneau aux usagers désignés par l'inscription (ex. « sauf riverains », « sauf livraisons »).","IISR art. 9","info","sauf riverains livraisons inscription");
P("M4f","Catégorie : PTAC supérieur au nombre","panonceaux","Restreint le panneau aux véhicules dont le poids excède le nombre indiqué.","IISR art. 9","info","categorie tonnage superieur");
P("M4g","Catégorie : transport de marchandises","panonceaux","Restreint le panneau aux véhicules de transport de marchandises.","IISR art. 9","info","categorie camion marchandises");
P("M4h","Catégorie : PL de marchandises > tonnage","panonceaux","Restreint aux poids lourds de marchandises excédant le tonnage indiqué.","IISR art. 9","info","categorie poids lourd tonnage");
P("M4i","Catégorie : véhicules agricoles","panonceaux","Restreint le panneau aux véhicules agricoles à moteur.","IISR art. 9","info","categorie tracteur");
P("M4n","Catégorie : PMR","panonceaux","Le panneau concerne les installations pour personnes handicapées ou le stationnement réservé (carte CMI).","R417-11","stationnement","handicap pmr cmi fauteuil");
P("M4p","Catégorie : piétons","panonceaux","Restreint le panneau aux piétons.","IISR art. 9","info","categorie pietons");
P("M4x","Catégorie : caravanes","panonceaux","Restreint aux véhicules tractant caravane/remorque > 250 kg.","IISR art. 9","info","categorie caravane remorque");
P("M4z","Catégorie : autopartage","panonceaux","Restreint aux véhicules « autopartage ».","IISR art. 9","info","categorie autopartage");
P("M5","Panonceau STOP à distance","panonceaux","Sous un AB5 : distance jusqu'au STOP.","R415-6","stop","stop distance annonce");
P("M6a","Fourrière / très gênant","panonceaux","Sous un B6 : l'arrêt ou stationnement est gênant ou très gênant, la mise en fourrière possible.","R417-10 ; R325-12","arret_stat","fourriere enlevement gênant");
P("M6b","Alternance semi-mensuelle","panonceaux","Stationnement unilatéral à alternance semi-mensuelle.","R417-2","stationnement","alternance quinzaine");
P("M6c","Durée limitée, disque","panonceaux","Durée maximale de stationnement avec contrôle par disque.","R417-3","stationnement","disque duree limite");
P("M6d","Payant avec parcmètre","panonceaux","Stationnement payant (horodateur).","L2333-87 CGCT","stationnement","payant horodateur");
P("M6h","Réservé carte handicap","panonceaux","Emplacement réservé aux titulaires de la carte mobilité inclusion « stationnement ». Y stationner sans droit : 135 € + fourrière.","R417-11","arret_stat","handicap reserve cmi 135");
P("M6i","Réservé recharge électrique","panonceaux","Emplacement réservé aux véhicules électriques pendant la recharge.","R417-10","stationnement","recharge electrique reserve");
P("M6k1","Réservé covoiturage","panonceaux","Stationnement réservé aux véhicules des usagers pratiquant le covoiturage.","R417-10","stationnement","covoiturage reserve");
P("M7","Panonceau schéma","panonceaux","Représente l'intersection : les branches en trait large sont prioritaires.","IISR art. 9","info","schema intersection branches");
P("M8a","Début de section","panonceaux","La prescription s'applique après le panneau.","IISR art. 9","info","debut section fleche haut");
P("M8b","Fin de section","panonceaux","La prescription s'arrête au panneau.","IISR art. 9","info","fin section fleche bas");
P("M8c","Rappel de section","panonceaux","La prescription s'étend de part et d'autre du panneau (rappel).","IISR art. 9","info","rappel section double fleche");
P("M9a","Aire de danger aérien","panonceaux","Le panneau concerne une aire de danger aérien.","IISR art. 9","info","danger aerien");
P("M9b","Fils de contact < 6 m","panonceaux","Au passage à niveau, hauteur des fils caténaires inférieure à 6 m.","IISR art. 9","gabarit","catenaire hauteur fils");
P("M9c","« Cédez le passage »","panonceaux","Inscription complétant le AB3a/AB3b.","R415-7","cedez","cedez inscription");
P("M9d","Passage piéton surélevé","panonceaux","Le passage piéton est sur un plateau surélevé.","IISR art. 9","priorite_pieton","plateau pieton sureleve");
P("M9j1","Véhicules lents en descente","panonceaux","Risque de heurt de véhicules lents dans la descente.","IISR art. 9","danger","vehicules lents descente");
P("M9v1","« Sauf cyclistes »","panonceaux","La prescription ne s'applique pas aux cyclistes (ex. double-sens cyclable sous un B1).","R412-28-1","info","sauf velo cycliste double sens");
P("M9z","Indications diverses","panonceaux","Texte libre précisant le panneau (ex. « accotement non stabilisé », « rappel »).","IISR art. 9","info","texte rappel divers");
P("M10a","Numéro de route","panonceaux","Cartouche indiquant le numéro de la route ou autoroute (A1, N2, D642…).","IISR art. 9","info","cartouche numero route");
P("M11b2","Prescriptions de zone","panonceaux","Précise les règles applicables dans une aire piétonne, zone de rencontre ou zone 30.","IISR art. 9","info","zone prescriptions");
P("M11c1","Catégorie de tunnel","panonceaux","Lettre B à E indiquant les marchandises dangereuses admises dans le tunnel.","ADR","mat_dang","tunnel categorie lettre");
P("M11d","Restrictions ZFE","panonceaux","Sous le B56 : précise les vignettes Crit'Air et véhicules autorisés dans la zone.","R411-19-1","zfe","zfe critair restrictions");
P("M12a","Cédez-le-passage cycliste au feu","panonceaux","Autorise les cyclistes à franchir le feu rouge dans la direction indiquée, en cédant le passage aux piétons et véhicules prioritaires.","R415-15","info","velo feu rouge tourne droite m12");

/* ===== R — Feux et signaux lumineux (visuels dessinés) ===== */
P("R11v","Feu tricolore","feux","Rouge : arrêt avant la ligne d'effet. Jaune fixe : arrêt sauf impossibilité de s'arrêter en sécurité. Vert : passage si le carrefour peut être dégagé.","R412-30 à R412-33","feu_rouge","feu tricolore rouge vert orange jaune");
P("R11j","Feu tricolore à jaune clignotant","feux","Le vert est remplacé par un jaune clignotant : franchissement autorisé avec prudence, les règles de priorité s'appliquent.","R412-32","info","feu jaune clignotant prudence");
P("R12","Feu piéton","feux","Signal bicolore destiné aux piétons : silhouette verte = traversée autorisée, rouge = interdite. Le piéton engagé au vert reste prioritaire.","R412-38","pieton","feu pieton rouge vert silhouette");
P("R13c","Feu modal cycles","feux","Signal tricolore réservé aux cyclistes (silhouette vélo).","R412-30","feu_rouge","feu velo modal");
P("R14","Feux directionnels","feux","Feux tricolores à flèches : chaque flèche règle la direction qu'elle indique.","R412-30","feu_rouge","feu fleche directionnel");
P("R17","Feu de tramway","feux","Signal spécifique aux transports en commun : barre horizontale = arrêt, barre verticale = passage, point = annonce.","R412-30","feu_rouge","feu tramway barre");
P("R21a","Croix rouge de voie","feux","Signal d'affectation : croix rouge fixe au-dessus d'une voie = voie interdite.","R412-30","obligation","croix rouge voie interdite affectation");
P("R21b","Flèche verte de voie","feux","Flèche verte au-dessus d'une voie = circulation autorisée sur cette voie.","IISR 6e partie","info","fleche verte voie autorisee");
P("R21c","Flèche jaune de rabattement","feux","Flèche jaune clignotante : quitter la voie dans la direction indiquée.","IISR 6e partie","obligation","fleche jaune rabattement voie");
P("R24","Feu rouge clignotant","feux","Un ou deux feux rouges clignotants : arrêt absolu (passages à niveau, ponts mobiles, sorties de secours). Franchir = 135 € et 4 points.","R412-30","pn","feu rouge clignotant passage niveau arret absolu");
P("R25","Signal d'arrêt piéton","feux","Signal lumineux ordonnant l'arrêt aux piétons (traversées de tramway).","R412-38","pieton","signal arret pieton tram");

/* ===== Marquages au sol (visuels dessinés) ===== */
P("X-ligne-continue","Ligne continue","marquage","Ligne axiale infranchissable : interdiction de la franchir ou de la chevaucher pour dépasser. Depuis 2015, chevauchement toléré uniquement pour dépasser un cycliste si la visibilité le permet.","R412-19 ; R414-6","ligne_continue","ligne continue blanche axiale");
P("X-ligne-discontinue","Ligne discontinue (T1)","marquage","Marquage axial franchissable : dépassement autorisé si la manœuvre est sûre.","R412-18","info","ligne discontinue t1 depassement");
P("X-ligne-annonce","Ligne d'annonce (T3)","marquage","Traits rapprochés + flèches de rabattement : une ligne continue approche, terminer son dépassement.","IISR 7e partie","info","ligne annonce t3 fleches rabattement");
P("X-ligne-mixte","Ligne mixte","marquage","Ligne continue doublée d'une discontinue : on ne peut franchir que si la ligne discontinue est de son côté.","R412-20","ligne_continue","ligne mixte double");
P("X-stop","Bande STOP","marquage","Bande blanche continue transversale marquant la limite d'arrêt du STOP.","R415-6","stop","bande stop transversale arret");
P("X-cedez","Ligne de cédez-le-passage","marquage","Triangles blancs (« dents de requin ») pointés vers l'usager qui doit céder le passage.","R415-7","cedez","triangles dents requin cedez");
P("X-effet-feux","Ligne d'effet des feux","marquage","Pointillés transversaux marquant l'endroit où s'arrêter au feu rouge. La franchir au rouge = franchissement du feu.","R412-30","feu_rouge","ligne effet feux pointilles arret");
P("X-passage-pieton","Passage piéton","marquage","Bandes blanches parallèles. Piéton engagé ou manifestant l'intention de traverser = priorité. Stationner dessus ou à moins de 5 m en amont : très gênant, 135 €.","R415-11 ; R417-11","priorite_pieton","passage pieton zebre bandes blanches");
P("X-zebra","Zébra","marquage","Zone hachurée : surface neutralisée, interdiction d'y circuler, s'y arrêter ou stationner.","R412-19 s.","acces_interdit","zebra hachures ilot");
P("X-jaune-continu","Ligne jaune continue (rive)","marquage","Marquage jaune continu en bordure : arrêt et stationnement interdits.","R417-10","arret_stat","jaune continu bordure arret interdit");
P("X-jaune-discontinu","Ligne jaune discontinue (rive)","marquage","Marquage jaune discontinu en bordure : stationnement interdit, arrêt toléré.","R417-6","stationnement","jaune discontinu stationnement interdit");
P("X-zigzag","Zigzag jaune (arrêt bus)","marquage","Marque l'emplacement d'arrêt des bus : arrêt et stationnement des autres véhicules interdits (très gênant, 135 €).","R417-11","arret_stat","zigzag jaune bus arret");
P("X-sas-velo","Sas vélo","marquage","Espace réservé aux cyclistes entre deux lignes d'effet au feu. S'y arrêter en voiture = non-respect du feu : 135 €, 4 points.","R415-2 ; R412-30","sas_velo","sas velo feu espace reserve");
P("X-bande-cyclable","Bande cyclable","marquage","Voie réservée aux cycles marquée sur la chaussée (ligne + pictogrammes vélo). Y circuler ou stationner en voiture : 135 €.","R412-7 ; R417-11","voie_reservee","bande cyclable pictogramme velo");
P("X-chevrons","Chevrons d'interdistance","marquage","Chevrons sur autoroute : garder au moins deux chevrons avec le véhicule qui précède (≈ 2 secondes).","R412-12","interdistance","chevrons distance securite autoroute");
P("X-fleches-rabattement","Flèches de rabattement","marquage","Flèches obliques annonçant une ligne continue ou une fin de voie : se rabattre sans attendre.","IISR 7e partie","info","fleches rabattement obliques");
P("X-fleches-direction","Flèches directionnelles","marquage","Flèches en intersection : la direction prise doit être conforme à la flèche de sa voie.","R412-24","obligation","fleches directionnelles voie");
P("X-voie-bus","Couloir bus (marquage)","marquage","Voie réservée marquée « BUS » : circulation, arrêt et stationnement interdits aux autres véhicules.","R412-7","voie_reservee","couloir bus marquage");

/* ---------- Export ---------- */
return {S:S, THEMES:THEMES, ITEMS:ITEMS};
})();

/* ---------- Visuels : photos réelles et crédits ---------- */
window.PANNEAUX.IMG = {"K5a": "K5a.jpg", "K8": "K8.jpg", "KR11": "KR11.jpg", "KR43": "KR43.jpg", "R11j": "R11j.jpg", "R11v": "R11v.jpg", "R12": "R12.jpg", "R13c": "R13c.jpg", "R17": "R17.jpg", "R25": "R25.jpg", "X-bande-cyclable": "X-bande-cyclable.jpg", "X-fleches-rabattement": "X-fleches-rabattement.jpg", "X-jaune-continu": "X-jaune-continu.jpg", "X-ligne-annonce": "X-ligne-annonce.jpg", "X-ligne-continue": "X-ligne-continue.jpg", "X-passage-pieton": "X-passage-pieton.jpg", "X-sas-velo": "X-sas-velo.jpg", "X-stop": "X-stop.jpg", "A9a": "A9a.png", "M11d": "M11d.png"};
window.PANNEAUX.CREDITS = {"R11v": {"auteur": "User:Wazouille", "licence": "Public domain", "fichier": "Feuvert2.jpg"}, "R11j": {"auteur": "User:Wazouille", "licence": "Public domain", "fichier": "Feu orange.jpg"}, "R12": {"auteur": "Sebleouf", "licence": "CC BY-SA 4.0", "fichier": "Signal R12 vert (Lyon 3e).jpg"}, "R13c": {"auteur": "Chabe01", "licence": "CC BY-SA 4.0", "fichier": "Feux Tricolores Cyclistes Rue Paris - Joinville-le-Pont (FR94) - 2025-12-18 - 1.jpg"}, "R17": {"auteur": "Clicsouris", "licence": "CC BY-SA 3.0", "fichier": "Signalisation T4 - Signal R17 - Arret.jpg"}, "R25": {"auteur": "Gonioul", "licence": "CC BY-SA 3.0", "fichier": "Paris T3 signal pietons.jpg"}, "KR11": {"auteur": "Sebleouf", "licence": "CC BY-SA 4.0", "fichier": "Feu tricolore KR11j Kiloutou (face).jpg"}, "KR43": {"auteur": "Marc Mongenet", "licence": "CC BY-SA 4.0", "fichier": "A49 flèche lumineuse de rabattement, balise J14a.jpg"}, "K5a": {"auteur": "KiwiNeko14", "licence": "CC BY-SA 4.0", "fichier": "FR 86 - Autoroute A10 - Cône K5a et fanion K1.jpg"}, "K8": {"auteur": "Chabe01", "licence": "CC BY-SA 4.0", "fichier": "Barrière Chantier Route Teppe Nayet St Cyr Menthon 2.jpg"}, "X-passage-pieton": {"auteur": "Tabl-trai", "licence": "CC BY-SA 4.0", "fichier": "Passages piétons en deux temps (route de Charmeil, Bellerive-sur-Allier) côté ouest 2025-08-24.JPG"}, "X-sas-velo": {"auteur": "Tabl-trai", "licence": "CC BY-SA 4.0", "fichier": "Sas vélo rue Maréchal-Foch (Vichy) 2025-04-21.JPG"}, "X-fleches-rabattement": {"auteur": "Roulex 45", "licence": "CC BY-SA 3.0", "fichier": "Flèche de rabattement.JPG"}, "X-stop": {"auteur": "Marc Mongenet", "licence": "CC BY-SA 4.0", "fichier": "Gaillard panneau AB4 marquage sol.jpg"}, "X-bande-cyclable": {"auteur": "Triton (Wikimedia Commons)", "licence": "CC BY-SA 4.0", "fichier": "Avenue Gilbert-Roux (Cusset) - Début de bande cyclable (2026)"}, "X-ligne-continue": {"auteur": "Marc Mongenet", "licence": "CC BY-SA 4.0", "fichier": "Triple lignes continues blanche jaune blanche sur la RCEA.jpg"}, "X-ligne-annonce": {"auteur": "Roulex 45", "licence": "CC BY-SA 4.0", "fichier": "Ligne d'annonce non rectiligne.JPG"}, "X-jaune-continu": {"auteur": "Tabl-trai", "licence": "CC BY-SA 3.0", "fichier": "Marquage stationnement et arrêt interdits 2013-11-17.JPG"}, "X-ligne-discontinue": {"auteur": "Roulex_45", "licence": "CC BY-SA 3.0", "fichier": "Marques-T1.svg"}, "X-effet-feux": {"auteur": "Roulex 45", "licence": "CC BY-SA 4.0", "fichier": "Ligne-d'effet-de-feux.svg"}, "X-fleches-direction": {"auteur": "Roulex 45", "licence": "CC BY-SA 4.0", "fichier": "Flèches-directionnelles.svg"}};
