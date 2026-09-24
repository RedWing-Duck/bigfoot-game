// Game data reference: docs/AUTHORING.md
// THIS PLACE HAS A BIG FOOTPRINT (Week 01). Room ids map to GDD ids in the comments (R1..R12).
const G = {
  title: "This Place Has a Big Footprint",
  intro: "[placeholder intro] You are Walter Pryce, bookstore investor. Type HELP for commands.",
  start: "elevator",
  aliases: { quit: "menu" },   // verbs add-on

  rooms: {
    elevator: { name: "Private Elevator", desc: "[placeholder R1] A gold elevator.",                                   // R1
      exits: { north: "foyer" } },   // down -> WIN comes in Milestone B
    foyer: { name: "Grand Foyer", desc: "[placeholder R2] Marble, gold, a double staircase.",                         // R2
      exits: { south: "elevator", west: "trophy", east: "salon", north: "dining", up: "landing" } },
    trophy: { name: "Trophy Room", desc: "[placeholder R3] Glass cases.", exits: { east: "foyer" } },                 // R3
    salon: { name: "Music Salon", desc: "[placeholder R4] A mirrored grand piano.", exits: { west: "foyer" } },       // R4
    dining: { name: "Dining Hall", desc: "[placeholder R5] A long table.", exits: { south: "foyer" } },               // R5
    landing: { name: "Upper Landing", desc: "[placeholder R6] A balcony over the foyer.",                             // R6
      exits: { down: "foyer", west: "gallery", east: "office" } },
    gallery: { name: "Gallery Hall", desc: "[placeholder R7] Portraits of the Don.",                                  // R7
      exits: { east: "landing", north: "atrium" } },
    atrium: { name: "Atrium", desc: "[placeholder R8] A bronze hippo fountain.",                                      // R8
      exits: { south: "gallery", north: "aviary" } },
    office: { name: "The Don's Office", desc: "[placeholder R9] Leather and cigars.", exits: { west: "landing" } },   // R9
    aviary: { name: "Aviary", desc: "[placeholder R10] Screaming peacocks.",                                          // R10
      exits: { south: "atrium", north: "terrace" } },
    terrace: { name: "Zoo Terrace", desc: "[placeholder R11] A rooftop zoo.",                                         // R11
      exits: { south: "aviary", east: "enclosure" } },
    enclosure: { name: "Broken Enclosure", desc: "[placeholder R12] Bent steel bars.", exits: { west: "terrace" } }  // R12
  },

  items: {},
  npcs: {},
  events: []
};
