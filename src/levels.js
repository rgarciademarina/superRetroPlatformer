// Mapa por caracteres
// Leyenda:
//   X: bloque sólido
//   B: ladrillo/plataforma sólido
//   ?: bloque decorativo sólido
//   P: inicio del jugador
//   E: enemigo
//   G: meta/flag
//   -: vacío

export const LEVELS = [
  // Nivel 1 (introducción)
  `
------------------------------------------------------------
------------------------------------------------------------
------------------------------------------------------------
------------------------------------------------------------
-------------------------------B----------------------------
------------------------------BBB---------------------------
---------B-----------------------------------------E--------
--------BBB---------------------------B---------------------
P--------------------E----------------BBB-------------------
XXXXXXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXX--
XXXXXXXXXXXXXXXXXXXXXXXXXXXX-E-XXXXXXXXXXXXXXXXXXXXXXXXXXG-
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-
`.trim(),

  // Nivel 2 (más largo y con huecos, con plataformas más bajas)
  `
 ------------------------------------------------------------
 ----------------------BBB---------------BBB-----------------
 --------------------BBBBB--E-----E----BBBBB----------------
 -----------------BBB------BBB---BBB------BBB----E----------
 --------------BBB------------------------------BBBB--------
 ---------BBB------------------BBB------E-------------BBB--G
 P---------------E---------BBB---------BBB------------------
 XXXXXXX------XXXXXXXXXXXX------XXXXXXXXXXXX------XXXXXXX---
 XXXXXX--------XXXXXXXXXXX------XXXXXXXXXXXXX------XXXXXX---
 XXXXX----------XXXXXXXXXX------XXXXXXXXXXXX--------XXXXX---
 XXXX------------XXXXXXXXX------XXXXXXXXXXX----------XXXX---
 XXX--------------XXXXXXXX------XXXXXXXXXX------------XXX---
 `.trim(),

  // Nivel 3 (final con plataformas)
  `
------------------------------------------------------------
------------------------B-----------------------------------
-----------------------BBB---------------------E------------
----------------------BBBBB---------------------------------
-----------------B--------------B---------------------------
----------------BBB------------BBB-------------------------G
P------------------------------E-E---E---EEE----E--E--E-----
XXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---
XXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---
XXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---
XXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---
XXXXXXXXXXXXXXXXXXXXXXXX---XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX---
`.trim(),

  // Nivel 4 (más enemigos, saltos precisos)
  `
------------------------------------------------------------
---------------------B---------------------B-----------------
--------------------BBB-------------------BBB----------------
-------------------BBBBB-----------------BBBBB---------------
----------E--------------------E-------------------E---------
-----------------B-------------------B---------------------G-
P-----------------------------------------------------------
XXXXXX---XXXXXXXXXXXX-----XXXXXXXXXXXX-----XXXXXXXXXXXX---XXX
XXXXXX---XXXXXXXXXXXX-----XXXXXXXXXXXX-----XXXXXXXXXXXX---XXX
XXXXXX---XXXXXXXXXXXX-----XXXXXXXXXXXX-----XXXXXXXXXXXX---XXX
XXXXXX---XXXXXXXXXXXX-----XXXXXXXXXXXX-----XXXXXXXXXXXX---XXX
XXXXXX-f-XXXXXXXXXXXX---f-XXXXXXXXXXXX-f---XXXXXXXXXXXX-F-XXX
`.trim(),

  // Nivel 5 (plataformas aéreas y enemigos encadenados)
  `
------------------------------------------------------------
----------------B------------------------------B------------
---------------BBB------------E---------------BBB-----------
--------------BBBBB--------------------------BBBBB----------
---------B-----------------------------B--------------------
--------BBB-----------E--------------BBB-------------------G
P--------E--------------E-----------E------E-------------EE-
XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX
XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX
XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX
XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX---XXXX
XXXX-f-XXXX-f-XXXX-f-XXXX-F-XXXX-f-XXXX-f-XXXX-f-XXXX-F-XXXX
`.trim(),

  // Nivel 6 (jefe final: usa 'K' para posición del jefe)
  `
------------------------------------------------------------
------------------------------------------------------------
------------------------B-----------------------------------
-----------------------BBB----------------------------------
----------------------BBBBB---------------------------------
--------------------BB-----BBK-----------------------------G
P-----------------------------------------------------------
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`.trim()
];


