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
    localGuide: {
      intro:
        'Kimball is the last Nebraska exit before Wyoming and the first westbound stop for drivers entering the state. The town sits above the South Platte valley, so wind and winter weather can arrive earlier and stay longer than they do farther east.',
      highlights: [
        {
          title: 'The western edge',
          body:
            'I-80 exits 20, 22 and 29 serve Kimball. Westbound drivers are 20–29 miles from the Wyoming line; eastbound drivers reach Sidney in about 30 miles.',
        },
        {
          title: 'Weather first',
          body:
            'This is high-plains country. Wind, blowing snow and sudden visibility drops are why a clear forecast in Omaha can still mean a closure here.',
        },
        {
          title: 'Before you commit',
          body:
            'Fuel and food are available in Kimball, but do not assume every business is open late. Check 511 and the forecast before the final stretch.',
        },
      ],
    },
    featured: false,
  },
  {
    slug: "sidney",
    name: "Sidney",
    county: "Cheyenne County",
    mileMarker: "55–59",
    exit: "Exit 55, 59",
    lat: 41.1428,
    lon: -102.9777,
    population: 6400,
    blurb:
      "Home of the Cheyenne County seat and Cabela's original store, Sidney is the biggest service cluster on the western approach to Kimball and the Wyoming border.",
    knownFor: ["Cabela's", "Cheyenne County seat", "Last big stop westbound"],
    nearby: ["Kimball", "Lodgepole", "Ogallala"],
    localGuide: {
      intro:
        'Sidney is the last full-service stop for westbound drivers before the climb to Kimball and Wyoming. It is also the Cheyenne County seat and the practical base for news across Nebraska’s western edge.',
      highlights: [
        {
          title: 'Last full-service stop',
          body:
            'Exits 55, 59 and 65 serve Sidney. The fuel, food and lodging cluster here is the last dense one before the Wyoming line.',
        },
        {
          title: 'County seat',
          body:
            'The courthouse, hospital and local newspaper are here, making Sidney the place to look for official western-corridor records and local coverage.',
        },
        {
          title: 'Cabela’s roots',
          body:
            'Cabela’s was founded in Sidney, and the company’s former headquarters shaped the town. The outdoor-retail history is still part of the local identity.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Ogallala is Lake McConaughy’s hometown and the I-80/I-76 junction country. Summer recreation traffic and Colorado-bound freight share the same exits, which makes the town busier than its population suggests.',
      highlights: [
        {
          title: 'Lake country',
          body:
            'Exit 126 is the gateway to Lake McConaughy and the recreation economy around it. Expect boat traffic and out-of-state plates in season.',
        },
        {
          title: 'The I-76 junction',
          body:
            'West of Ogallala, I-80 meets I-76 toward Denver. That junction funnels Colorado traffic through Keith County and can change the pace of the drive quickly.',
        },
        {
          title: 'Front Street',
          body:
            'The town leans into its cattle-drive history; the Front Street area is the recognizable downtown stop.',
        },
      ],
    },
    featured: true,
  },
  {
    slug: "north-platte",
    name: "North Platte",
    county: "Lincoln County",
    mileMarker: "177–190",
    exit: "Exit 177, 179, 190",
    lat: 41.1239,
    lon: -100.7654,
    population: 23000,
    blurb:
      "The big stop in west-central Nebraska: Union Pacific's Bailey Yard, the Golden Spike Tower, and the last dense cluster of services for 100 miles in either direction.",
    knownFor: ["Bailey Yard", "Golden Spike Tower", "Buffalo Bill history"],
    nearby: ["Sutherland", "Hershey", "Paxton"],
    localGuide: {
      intro:
        'North Platte is the big stop in west-central Nebraska: Union Pacific’s Bailey Yard, the Golden Spike Tower, and the last dense cluster of services for roughly 100 miles in either direction.',
      highlights: [
        {
          title: 'Bailey Yard',
          body:
            'Union Pacific’s Bailey Yard is the largest classification yard in the world. The Golden Spike Tower overlooks the operation and is the town’s signature stop.',
        },
        {
          title: 'The service gap',
          body:
            'Do not pass a full tank here if you are heading west late. Services thin out quickly toward Ogallala and Sidney.',
        },
        {
          title: 'Five exits',
          body:
            'Exits 177, 179 and 190 serve the city. The truck stops and motels cluster near I-80; downtown is a short drive north.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Lexington sits in the Platte River valley, surrounded by irrigated corn and cattle country. It anchors the stretch between Kearney and North Platte and is a common fuel-and-food stop on that run.',
      highlights: [
        {
          title: 'Platte and ag',
          body:
            'Exits 237 and 248 serve Lexington. The valley here is farm country; expect grain trucks and equipment on local roads during planting and harvest.',
        },
        {
          title: 'Between the hubs',
          body:
            'Lexington is the midpoint service stop between Kearney and North Platte. Choices are decent here but thin out quickly to the west.',
        },
        {
          title: 'The river road',
          body:
            'US-30 parallels I-80 through the Platte corridor, following the historic route that predates the interstate.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Kearney sits near mile 272, roughly halfway across Nebraska. It is the state’s central regional hub for health care, retail and the university, and the most likely overnight stop between Lincoln and North Platte.',
      highlights: [
        {
          title: 'The midpoint',
          body:
            'Exits 272, 275 and 279 serve Kearney. The city is a natural break for drivers crossing the state in one day.',
        },
        {
          title: 'Regional hub',
          body:
            'The University of Nebraska at Kearney, a regional hospital and the retail strip make this the biggest service center between Lincoln and North Platte.',
        },
        {
          title: 'The Archway',
          body:
            'The Great Platte River Road Archway spans I-80 east of town. It is a museum, not a rest stop, so plan a real stop if you want to visit.',
        },
      ],
    },
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
      "Not on the interstate, but close enough to matter: Hastings sits about 16 miles south of I-80 via US-281 and is a major ag, manufacturing and media market for the corridor.",
    knownFor: ["Adams County seat", "Kool-Aid birthplace", "Ag manufacturing"],
    nearby: ["Grand Island", "Kearney", "Aurora"],
    localGuide: {
      intro:
        'Hastings is not on the interstate, but it is close enough to matter: about 16 miles south of I-80 via US-281 from Exit 312. It is a regional center for the ag belt south of the Platte.',
      highlights: [
        {
          title: 'Off the interstate',
          body:
            'Reach Hastings via US-281 south from Exit 312. It is a real detour, not a quick off-ramp, so budget the extra time.',
        },
        {
          title: 'Adams County seat',
          body:
            'The courthouse, hospital and local media are here, making Hastings the place to look for official records and coverage south of the corridor.',
        },
        {
          title: 'Kool-Aid birthplace',
          body:
            'Hastings is the birthplace of Kool-Aid; the museum is a local landmark and a recognizable piece of Nebraska trivia.',
        },
      ],
    },
    featured: false,
  },
  {
    slug: "grand-island",
    name: "Grand Island",
    county: "Hall County",
    mileMarker: "305–318",
    exit: "Exit 305, 312, 314, 318",
    lat: 40.9247,
    lon: -98.342,
    population: 53000,
    blurb:
      "The corridor's midpoint metro: a railroad and manufacturing town with the state fairgrounds, a busy hospital system and four I-80 interchanges.",
    knownFor: ["Nebraska State Fair", "Hall County seat", "Rail and manufacturing"],
    nearby: ["Aurora", "Wood River", "Hastings"],
    localGuide: {
      intro:
        'Grand Island is the corridor’s midpoint metro: a railroad and manufacturing town with the state fairgrounds, a busy hospital system and four I-80 interchanges.',
      highlights: [
        {
          title: 'Four exits',
          body:
            'Exits 306, 309, 312 and 314 serve Grand Island, the largest city between Lincoln and Kearney.',
        },
        {
          title: 'State Fair',
          body:
            'The Nebraska State Fairgrounds and Fonner Park are on the city’s north side, close to I-80. Event days change the traffic pattern.',
        },
        {
          title: 'Rail and manufacturing',
          body:
            'Hall County’s rail and manufacturing base makes this a freight and work-truck town, not just a fuel stop.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'York is a county seat and ag-services town at the US-81 junction, and a common fuel-and-food stop between Lincoln and Grand Island.',
      highlights: [
        {
          title: 'US-81 junction',
          body:
            'Exits 348 and 353 serve York. US-81 is a major north-south route, so the interchange carries more than local traffic.',
        },
        {
          title: 'A quick break',
          body:
            'The interstate strip is a common stop between Lincoln and Grand Island; the courthouse square is a short drive north.',
        },
        {
          title: 'Ag services',
          body:
            'York County is farm country. Expect grain trucks and equipment during planting and harvest, especially on the US-81 approaches.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Seward is Concordia University’s hometown, with a classic courthouse square and some of the busiest ag land in the state. The county’s I-80 stretch also includes Milford and Beaver Crossing.',
      highlights: [
        {
          title: 'Concordia and the square',
          body:
            'Exits 373, 379, 382 and 388 serve Seward County. The university and the courthouse square give the town a distinct center away from the interstate.',
        },
        {
          title: 'Fourth of July',
          body:
            'Seward’s Independence Day celebration is a regional draw. Expect heavier local traffic around the holiday.',
        },
        {
          title: 'Milford and Beaver Crossing',
          body:
            'Services are spread across the county’s exits, so plan fuel before you leave the interstate. Do not assume every small exit has a full-service stop.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Lincoln is the state capital, but I-80 only skirts its north edge. The interstate serves commuters, Husker traffic and the I-180 spur into downtown rather than running through the city.',
      highlights: [
        {
          title: 'Capital, off the interstate',
          body:
            'Exits 395, 397, 399 and 401 connect to Lincoln; I-180 is the spur into downtown. The Capitol and UNL are south of the interstate.',
        },
        {
          title: 'Husker traffic',
          body:
            'Game days and university events push traffic onto I-180, downtown and the north Lincoln interchanges. Check the schedule before crossing town.',
        },
        {
          title: 'Waverly and east',
          body:
            'East of Lincoln, the corridor opens toward Omaha. Waverly is the last small stop before the metro.',
        },
      ],
    },
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
    localGuide: {
      intro:
        'Omaha is Nebraska’s largest metro and the eastern end of the corridor. I-80 runs through the city’s south and west sides before crossing the Missouri River into Council Bluffs, Iowa.',
      highlights: [
        {
          title: 'The eastern bookend',
          body:
            'I-80 crosses the Missouri River at mile 454. The river crossing is the corridor’s eastern edge and the gateway to Iowa.',
        },
        {
          title: 'The splits',
          body:
            'I-480 carries downtown traffic, I-680 loops north and the I-80/I-29 junction handles Iowa-bound freight. Know which split you need before rush hour.',
        },
        {
          title: 'Metro traffic',
          body:
            'Expect congestion, event traffic and construction on the metro interstates. Check 511 before crossing the river.',
        },
      ],
    },
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
