import type { Place } from "@/lib/types";

/**
 * Places along I-80 in Nebraska, ordered west → east by mile marker.
 * Mile markers count up from the Wyoming state line (MM 1) to the
 * Missouri River at Omaha (MM 454). Exit numbers match the mile markers.
 */
export const places: Place[] = [
  {
    slug: "kimball",
    name: "Kimball",
    county: "Kimball County",
    mileMarker: "20–29",
    exit: "Exit 20, 22, 29",
    lat: 41.2358,
    lon: -103.663,
    population: 2400,
    blurb:
      "The western gateway to Nebraska, where I-80 climbs out of the high plains toward the Wyoming line. Wind, winter closures and long empty stretches define the drive.",
    knownFor: ["Western gateway", "High-plains weather", "I-80 rest areas"],
    nearby: ["Sidney", "Bushnell"],
    featured: false,
  },
  {
    slug: "sidney",
    name: "Sidney",
    county: "Cheyenne County",
    mileMarker: "55–65",
    exit: "Exit 55, 59, 65",
    lat: 41.1428,
    lon: -102.9777,
    population: 6400,
    blurb:
      "Home of the Cheyenne County seat and Cabela's original store, Sidney is the last full-service stop before the climb to Kimball and the Wyoming border.",
    knownFor: ["Cabela's", "Cheyenne County seat", "Last big stop westbound"],
    nearby: ["Kimball", "Lodgepole", "Ogallala"],
    featured: true,
  },
  {
    slug: "ogallala",
    name: "Ogallala",
    county: "Keith County",
    mileMarker: "126–133",
    exit: "Exit 126, 133",
    lat: 41.1281,
    lon: -101.7199,
    population: 4800,
    blurb:
      "Lake McConaughy's hometown and the I-80/I-76 junction country. Summer traffic, boat traffic and cattle country all share the same exits.",
    knownFor: ["Lake McConaughy", "I-76 junction", "Front Street"],
    nearby: ["Paxton", "Brule", "North Platte"],
    featured: true,
  },
  {
    slug: "north-platte",
    name: "North Platte",
    county: "Lincoln County",
    mileMarker: "177–190",
    exit: "Exit 177, 179, 183, 186, 190",
    lat: 41.1239,
    lon: -100.7654,
    population: 23000,
    blurb:
      "The big stop in west-central Nebraska: Union Pacific's Bailey Yard, the Golden Spike Tower, and the last dense cluster of services for 100 miles in either direction.",
    knownFor: ["Bailey Yard", "Golden Spike Tower", "Buffalo Bill history"],
    nearby: ["Sutherland", "Hershey", "Paxton"],
    featured: true,
  },
  {
    slug: "lexington",
    name: "Lexington",
    county: "Dawson County",
    mileMarker: "237–247",
    exit: "Exit 237, 248",
    lat: 40.7808,
    lon: -99.7415,
    population: 10300,
    blurb:
      "A meatpacking and farming hub on the Platte, Lexington anchors the stretch between Kearney and North Platte. Traffic here is a mix of freight, ag equipment and commuters.",
    knownFor: ["Platte River valley", "Agriculture", "Dawson County"],
    nearby: ["Cozad", "Overton", "Gothenburg"],
    featured: false,
  },
  {
    slug: "kearney",
    name: "Kearney",
    county: "Buffalo County",
    mileMarker: "272–281",
    exit: "Exit 272, 275, 279",
    lat: 40.6995,
    lon: -99.0817,
    population: 34000,
    blurb:
      "Central Nebraska's biggest city and a regional hospital, retail and university hub. Kearney is where a lot of I-80 travelers stop for the night.",
    knownFor: ["University of Nebraska at Kearney", "The Archway", "Platte River"],
    nearby: ["Gibbon", "Elm Creek", "Lexington", "Hastings"],
    featured: true,
  },
  {
    slug: "hastings",
    name: "Hastings",
    county: "Adams County",
    mileMarker: "Spur via Exit 312",
    exit: "US-281 south from Exit 312",
    lat: 40.5861,
    lon: -98.3884,
    population: 25000,
    blurb:
      "Not on the interstate, but close enough to matter: Hastings sits 25 miles south of I-80 via US-281 and is a major ag, manufacturing and media market for the corridor.",
    knownFor: ["Adams County seat", "Kool-Aid birthplace", "Ag manufacturing"],
    nearby: ["Grand Island", "Kearney", "Aurora"],
    featured: false,
  },
  {
    slug: "grand-island",
    name: "Grand Island",
    county: "Hall County",
    mileMarker: "306–318",
    exit: "Exit 306, 309, 312, 314",
    lat: 40.9247,
    lon: -98.342,
    population: 53000,
    blurb:
      "The corridor's midpoint metro: a railroad and manufacturing town with the state fairgrounds, a busy hospital system and four I-80 interchanges.",
    knownFor: ["Nebraska State Fair", "Hall County seat", "Rail and manufacturing"],
    nearby: ["Aurora", "Wood River", "Hastings"],
    featured: true,
  },
  {
    slug: "york",
    name: "York",
    county: "York County",
    mileMarker: "348–353",
    exit: "Exit 348, 353",
    lat: 40.8681,
    lon: -97.592,
    population: 8100,
    blurb:
      "A county seat and ag-services town at the US-81 junction, York is a common fuel-and-food stop between Lincoln and Grand Island.",
    knownFor: ["US-81 junction", "York County seat", "Ag services"],
    nearby: ["Waco", "Aurora", "Seward"],
    featured: false,
  },
  {
    slug: "seward",
    name: "Seward",
    county: "Seward County",
    mileMarker: "373–388",
    exit: "Exit 373, 379, 382, 388",
    lat: 40.9072,
    lon: -97.0986,
    population: 7200,
    blurb:
      "Concordia University, a classic courthouse square and some of the busiest ag land in the state. Seward County's I-80 stretch includes Milford and Beaver Crossing.",
    knownFor: ["Concordia University", "Fourth of July celebration", "Ag country"],
    nearby: ["Milford", "Beaver Crossing", "Lincoln"],
    featured: false,
  },
  {
    slug: "lincoln",
    name: "Lincoln",
    county: "Lancaster County",
    mileMarker: "395–401",
    exit: "Exit 395, 397, 399, 401",
    lat: 40.8136,
    lon: -96.7026,
    population: 292000,
    blurb:
      "The state capital sits just south of I-80. The interstate skirts the city's north edge, serving commuters, Husker traffic and the I-180 spur into downtown.",
    knownFor: ["State Capitol", "University of Nebraska–Lincoln", "Haymarket"],
    nearby: ["Waverly", "Seward", "Omaha"],
    featured: true,
  },
  {
    slug: "omaha",
    name: "Omaha",
    county: "Douglas County",
    mileMarker: "439–454",
    exit: "Exit 439, 445, 449, 452, 454",
    lat: 41.2565,
    lon: -95.9345,
    population: 486000,
    blurb:
      "Nebraska's largest metro and the eastern end of the corridor. I-80 runs through Omaha's south and west sides before crossing the Missouri River into Council Bluffs.",
    knownFor: ["Missouri River crossing", "Old Market", "CHI Health Center"],
    nearby: ["Gretna", "Ashland", "Council Bluffs, IA"],
    featured: true,
  },
];

export const featuredPlaces = places.filter((p) => p.featured);

export function getPlace(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug);
}

export function placeName(slug: string): string {
  return getPlace(slug)?.name ?? "Nebraska";
}
