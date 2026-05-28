// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — FAA FREQUENCY DATABASE (offline bundle)
// Source: FAA NASR 28-day subscription data (public domain)
// Last cycle baked in: update every 28 days from https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/
//
// Structure per airport:
//   { id, name, lat, lon, elev, type, freqs: [{ type, freq, name }] }
//
// Freq types: ATIS | AWOS | ASOS | GND | TWR | APP | DEP | CLNC | CTAF | UNIC | EMRG
// ─────────────────────────────────────────────────────────────────────────────

export const AIRPORT_DB = [
  // ── ARIZONA ─────────────────────────────────────────────────────────────────
  { id:"KPHX", name:"Phoenix Sky Harbor Intl", lat:33.4373, lon:-112.0078, elev:1135, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"132.025", name:"ATIS" },
      { type:"CLNC",  freq:"128.200", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"GND",   freq:"133.000", name:"Ground North" },
      { type:"TWR",   freq:"120.300", name:"Tower" },
      { type:"TWR",   freq:"118.700", name:"Tower South" },
      { type:"APP",   freq:"119.700", name:"Approach" },
      { type:"DEP",   freq:"125.150", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KSDL", name:"Scottsdale Airport", lat:33.6229, lon:-111.9111, elev:1510, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"124.900", name:"ATIS" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"133.100", name:"Tower" },
      { type:"APP",   freq:"119.700", name:"Phoenix Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KDVT", name:"Phoenix Deer Valley Airport", lat:33.6883, lon:-112.0827, elev:1478, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"125.650", name:"ATIS" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"125.450", name:"Tower" },
      { type:"APP",   freq:"119.700", name:"Phoenix Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KCHD", name:"Chandler Municipal Airport", lat:33.2692, lon:-111.8111, elev:1243, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"118.700", name:"ATIS" },
      { type:"GND",   freq:"121.600", name:"Ground" },
      { type:"TWR",   freq:"132.650", name:"Tower" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KIWA", name:"Phoenix Mesa Gateway Airport", lat:33.3078, lon:-111.6548, elev:1382, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"118.050", name:"ATIS" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"119.900", name:"Tower" },
      { type:"APP",   freq:"119.700", name:"Phoenix Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KGEU", name:"Glendale Municipal Airport", lat:33.5269, lon:-112.2950, elev:1071, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"135.250", name:"ATIS" },
      { type:"GND",   freq:"121.600", name:"Ground" },
      { type:"TWR",   freq:"132.850", name:"Tower" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KTUS", name:"Tucson Intl Airport", lat:32.1161, lon:-110.9410, elev:2643, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"134.000", name:"ATIS" },
      { type:"CLNC",  freq:"119.600", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"118.300", name:"Tower" },
      { type:"APP",   freq:"124.300", name:"Approach" },
      { type:"DEP",   freq:"125.350", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KFHU", name:"Sierra Vista Municipal (Libby AAF)", lat:31.5885, lon:-110.3442, elev:4719, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"123.675", name:"ATIS" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"126.200", name:"Tower" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KPRC", name:"Prescott Regional Airport", lat:34.6544, lon:-112.4197, elev:5045, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"119.975", name:"ATIS" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"122.800", name:"Tower" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KFLG", name:"Flagstaff Pulliam Airport", lat:35.1385, lon:-111.6692, elev:7014, type:"TOWERED",
    freqs:[
      { type:"AWOS",  freq:"118.025", name:"AWOS" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"118.025", name:"Tower" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── ARIZONA (towered GA) ─────────────────────────────────────────────────────
  { id:"KFFZ", name:"Falcon Field Airport", lat:33.4608, lon:-111.7281, elev:1394, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"118.600", name:"ATIS" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"125.550", name:"Tower" },
      { type:"APP",   freq:"119.700", name:"Phoenix Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KGYR", name:"Phoenix Goodyear Airport", lat:33.4225, lon:-112.3759, elev:968, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"132.975", name:"ATIS" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"133.400", name:"Tower" },
      { type:"APP",   freq:"124.000", name:"Phoenix Approach West" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── ARIZONA (non-towered GA) ─────────────────────────────────────────────────
  { id:"KCGZ", name:"Casa Grande Municipal Airport", lat:32.9547, lon:-111.7717, elev:1464, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"120.475", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"P08",  name:"Coolidge Municipal Airport", lat:32.9352, lon:-111.4273, elev:1574, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"134.300", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"A39",  name:"Ak-Chin Regional Airport", lat:32.9906, lon:-112.0094, elev:1295, type:"NON-TOWERED",
    freqs:[
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"P53",  name:"Globe Municipal Airport", lat:33.3522, lon:-110.6972, elev:3471, type:"NON-TOWERED",
    freqs:[
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KRYN", name:"Ryan Airfield", lat:32.1422, lon:-111.1750, elev:2417, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"132.075", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"P19",  name:"Stellar Airpark", lat:33.3019, lon:-111.9203, elev:1175, type:"NON-TOWERED",
    freqs:[
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KAVQ", name:"Marana Regional Airport", lat:32.4097, lon:-111.2186, elev:1999, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"134.425", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KBXK", name:"Buckeye Municipal Airport", lat:33.4203, lon:-112.6861, elev:1033, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"134.825", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KSEZ", name:"Sedona Airport", lat:34.8486, lon:-111.7886, elev:4827, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"119.525", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.900", name:"CTAF / Unicom" },
    ]},
  { id:"KPAN", name:"Payson Airport", lat:34.2568, lon:-111.3393, elev:4999, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"119.875", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"E77",  name:"Wickenburg Municipal Airport", lat:33.9688, lon:-112.7978, elev:2377, type:"NON-TOWERED",
    freqs:[
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KIGM", name:"Kingman Airport", lat:35.2595, lon:-113.9388, elev:3449, type:"NON-TOWERED",
    freqs:[
      { type:"ASOS",  freq:"128.425", name:"ASOS" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KSOW", name:"Show Low Regional Airport", lat:34.2654, lon:-110.0054, elev:6415, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"135.075", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  { id:"KPGA", name:"Page Municipal Airport", lat:36.9262, lon:-111.4483, elev:4316, type:"NON-TOWERED",
    freqs:[
      { type:"AWOS",  freq:"135.625", name:"AWOS-3" },
      { type:"CTAF",  freq:"122.800", name:"CTAF / Unicom" },
    ]},
  // ── CALIFORNIA ──────────────────────────────────────────────────────────────
  { id:"KLAX", name:"Los Angeles Intl Airport", lat:33.9425, lon:-118.4081, elev:125, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"133.800", name:"ATIS" },
      { type:"CLNC",  freq:"121.400", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.650", name:"Ground" },
      { type:"TWR",   freq:"133.900", name:"Tower" },
      { type:"APP",   freq:"124.500", name:"Approach" },
      { type:"DEP",   freq:"135.400", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KSFO", name:"San Francisco Intl Airport", lat:37.6213, lon:-122.3790, elev:13, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"135.100", name:"ATIS" },
      { type:"CLNC",  freq:"118.200", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"120.500", name:"Tower" },
      { type:"APP",   freq:"135.650", name:"Approach" },
      { type:"DEP",   freq:"135.100", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KSAN", name:"San Diego Intl Airport", lat:32.7336, lon:-117.1897, elev:17, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"134.800", name:"ATIS" },
      { type:"CLNC",  freq:"118.550", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"132.700", name:"Tower" },
      { type:"APP",   freq:"124.350", name:"Approach" },
      { type:"DEP",   freq:"125.350", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KVNY", name:"Van Nuys Airport", lat:34.2098, lon:-118.4898, elev:799, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"119.925", name:"ATIS" },
      { type:"GND",   freq:"121.400", name:"Ground" },
      { type:"TWR",   freq:"119.300", name:"Tower" },
      { type:"APP",   freq:"124.300", name:"SoCal Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── TEXAS ───────────────────────────────────────────────────────────────────
  { id:"KDFW", name:"Dallas/Fort Worth Intl Airport", lat:32.8998, lon:-97.0403, elev:607, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"134.750", name:"ATIS" },
      { type:"CLNC",  freq:"128.250", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"126.550", name:"Tower" },
      { type:"APP",   freq:"124.150", name:"Approach" },
      { type:"DEP",   freq:"125.150", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KHOU", name:"William P Hobby Airport", lat:29.6454, lon:-95.2789, elev:46, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"125.350", name:"ATIS" },
      { type:"CLNC",  freq:"121.900", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"118.700", name:"Tower" },
      { type:"APP",   freq:"119.100", name:"Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KAUS", name:"Austin-Bergstrom Intl Airport", lat:30.1945, lon:-97.6699, elev:542, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"135.125", name:"ATIS" },
      { type:"CLNC",  freq:"119.500", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"124.400", name:"Tower" },
      { type:"APP",   freq:"124.900", name:"Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── FLORIDA ─────────────────────────────────────────────────────────────────
  { id:"KMIA", name:"Miami Intl Airport", lat:25.7959, lon:-80.2870, elev:8, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"128.450", name:"ATIS" },
      { type:"CLNC",  freq:"132.600", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"118.300", name:"Tower" },
      { type:"APP",   freq:"119.750", name:"Approach" },
      { type:"DEP",   freq:"125.500", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  { id:"KORL", name:"Orlando Executive Airport", lat:28.5455, lon:-81.3329, elev:113, type:"TOWERED",
    freqs:[
      { type:"ATIS",  freq:"119.300", name:"ATIS" },
      { type:"GND",   freq:"121.800", name:"Ground" },
      { type:"TWR",   freq:"118.750", name:"Tower" },
      { type:"APP",   freq:"124.000", name:"Approach" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── GEORGIA ─────────────────────────────────────────────────────────────────
  { id:"KATL", name:"Hartsfield-Jackson Atlanta Intl", lat:33.6407, lon:-84.4277, elev:1026, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"119.500", name:"ATIS" },
      { type:"CLNC",  freq:"121.750", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"119.100", name:"Tower" },
      { type:"APP",   freq:"126.900", name:"Approach" },
      { type:"DEP",   freq:"125.000", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── ILLINOIS ─────────────────────────────────────────────────────────────────
  { id:"KORD", name:"Chicago O'Hare Intl Airport", lat:41.9742, lon:-87.9073, elev:672, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"135.400", name:"ATIS" },
      { type:"CLNC",  freq:"132.725", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.750", name:"Ground" },
      { type:"TWR",   freq:"132.700", name:"Tower" },
      { type:"APP",   freq:"124.000", name:"Approach" },
      { type:"DEP",   freq:"135.500", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── NEVADA ──────────────────────────────────────────────────────────────────
  { id:"KLAS", name:"Harry Reid Intl Airport", lat:36.0840, lon:-115.1537, elev:2181, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"132.000", name:"ATIS" },
      { type:"CLNC",  freq:"125.100", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"119.900", name:"Tower" },
      { type:"APP",   freq:"124.700", name:"Approach" },
      { type:"DEP",   freq:"125.900", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── NEW YORK ─────────────────────────────────────────────────────────────────
  { id:"KJFK", name:"John F Kennedy Intl Airport", lat:40.6398, lon:-73.7789, elev:13, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"128.725", name:"ATIS" },
      { type:"CLNC",  freq:"135.050", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"119.100", name:"Tower" },
      { type:"APP",   freq:"125.700", name:"Approach" },
      { type:"DEP",   freq:"135.900", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── COLORADO ─────────────────────────────────────────────────────────────────
  { id:"KDEN", name:"Denver Intl Airport", lat:39.8561, lon:-104.6737, elev:5431, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"132.050", name:"ATIS" },
      { type:"CLNC",  freq:"118.300", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"118.100", name:"Tower" },
      { type:"APP",   freq:"124.300", name:"Approach" },
      { type:"DEP",   freq:"125.000", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── WASHINGTON ───────────────────────────────────────────────────────────────
  { id:"KSEA", name:"Seattle-Tacoma Intl Airport", lat:47.4502, lon:-122.3088, elev:433, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"134.200", name:"ATIS" },
      { type:"CLNC",  freq:"128.000", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.700", name:"Ground" },
      { type:"TWR",   freq:"132.650", name:"Tower" },
      { type:"APP",   freq:"119.200", name:"Approach" },
      { type:"DEP",   freq:"125.900", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── UTAH ─────────────────────────────────────────────────────────────────────
  { id:"KSLC", name:"Salt Lake City Intl Airport", lat:40.7884, lon:-111.9778, elev:4227, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"132.475", name:"ATIS" },
      { type:"CLNC",  freq:"128.650", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"119.300", name:"Tower" },
      { type:"APP",   freq:"124.100", name:"Approach" },
      { type:"DEP",   freq:"125.000", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
  // ── NEW MEXICO ───────────────────────────────────────────────────────────────
  { id:"KABQ", name:"Albuquerque Intl Sunport", lat:35.0402, lon:-106.6091, elev:5355, type:"LARGE",
    freqs:[
      { type:"ATIS",  freq:"134.225", name:"ATIS" },
      { type:"CLNC",  freq:"121.850", name:"Clearance Delivery" },
      { type:"GND",   freq:"121.900", name:"Ground" },
      { type:"TWR",   freq:"118.100", name:"Tower" },
      { type:"APP",   freq:"124.350", name:"Approach" },
      { type:"DEP",   freq:"124.350", name:"Departure" },
      { type:"EMRG",  freq:"121.500", name:"Guard" },
    ]},
];

// ─── GREAT-CIRCLE DISTANCE (Haversine) ───────────────────────────────────────
// Returns distance in nautical miles between two lat/lon points
export function distanceNm(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── GET NEAREST AIRPORTS ────────────────────────────────────────────────────
// Returns up to `count` airports within `maxNm` nautical miles, sorted by distance
export function getNearestAirports(lat, lon, count = 5, maxNm = 50) {
  return AIRPORT_DB
    .map(ap => ({ ...ap, distNm: distanceNm(lat, lon, ap.lat, ap.lon) }))
    .filter(ap => ap.distNm <= maxNm)
    .sort((a, b) => a.distNm - b.distNm)
    .slice(0, count);
}

// ─── FREQ TYPE METADATA ──────────────────────────────────────────────────────
export const FREQ_META = {
  ATIS:  { color: "#4ae8c8", label: "ATIS",     priority: 1 },
  AWOS:  { color: "#4ae8c8", label: "AWOS",     priority: 1 },
  ASOS:  { color: "#4ae8c8", label: "ASOS",     priority: 1 },
  CLNC:  { color: "#c87ae8", label: "CLNC DEL", priority: 2 },
  GND:   { color: "#3dbe6c", label: "GROUND",   priority: 3 },
  TWR:   { color: "#3a9ad4", label: "TOWER",    priority: 4 },
  APP:   { color: "#e8c84a", label: "APPROACH", priority: 5 },
  DEP:   { color: "#e8c84a", label: "DEPART",   priority: 5 },
  CTAF:  { color: "#3dbe6c", label: "CTAF",     priority: 3 },
  UNIC:  { color: "#3dbe6c", label: "UNICOM",   priority: 3 },
  EMRG:  { color: "#e85a4a", label: "GUARD",    priority: 9 },
};
