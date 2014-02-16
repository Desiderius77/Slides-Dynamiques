Slides-Dynamiques 
=================

Projet R&amp;D of Liesse NADJI, Philippe BENOIT and Abdoul karim CISSE
Ce projet est la suite de ce qui a été fait par Aurelien GEANT et Julian DEMAREST l'an dernier

Ce projet consiste à diffuser des slides utilisant la technologie SMIL/EAST sur des postes client.
Les changements de slides, les animations sont synchronisés entre tous les utilisateurs grâce aux Websocket.

Aujourd'hui, les animations sont fonctionnelles et le visionnage des slides se fait sans connexion à internet.
    
    
ChangeLog de la version 5.0
----------------------------  

Ajout des fonctionalités suivantes :

    - mise à jours de Node.js
    - mise à jour d'Express
    - éclaircir/nettoyer le code
    - Amélioration de la communication des messages 
    - éviter les chemins en dur 
    - Possibilité de choisir une présentation sur le disque

HOW TO
-----------------------------

Pour faire fonctionner le Projet Slides-Dynamiques :

    https://github.com/aurelien/Slides-Dynamiques/wiki
    
ESSENTIAL FILES
-----------------------------
    - server.js           // Gestion serveur
    - public/index.html   // Interface graphique manipulée par le client (slide, annimation, utilisateur)
    - public/upload.html  // Permet d'uploader une nouvelle présentation sur le serveur
    - public/js/video.js  // Gestion vidéo
    - public/js/pannel.js // Gestion channel de discussion
    - public/js/client.js // Gestion des évenements du client
