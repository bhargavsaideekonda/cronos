import type { ReactNode } from "react";

/** A 2D schematic in a 400 x 380 viewBox, split into six parts. Simplified drawings, not engineering diagrams. */
export interface SchematicPart {
  id: string;
  shape: ReactNode; // filled geometry; detail lines carry className "dt"
  box: [number, number, number, number]; // x, y, w, h: used for the tray silhouette and the hit area
  anchor: [number, number]; // where the leader line touches the part
  label: [number, number]; // where the numbered callout sits
}

const explorer1: SchematicPart[] = [
  {
    id: "antennas",
    box: [50, 150, 300, 80],
    anchor: [140, 190],
    label: [40, 190],
    shape: (
      <>
        <line x1="80" y1="130" x2="320" y2="250" strokeWidth="2.5" />
        <line x1="80" y1="250" x2="320" y2="130" strokeWidth="2.5" />
        <circle className="dt" cx="200" cy="190" r="16" />
      </>
    ),
  },
  {
    id: "nose",
    box: [180, 25, 40, 55],
    anchor: [200, 50],
    label: [360, 45],
    shape: (
      <>
        <polygon points="200,28 220,78 180,78" />
        <path className="dt" d="M190 78 L200 45 L210 78" />
      </>
    ),
  },
  {
    id: "geiger",
    box: [178, 76, 44, 52],
    anchor: [200, 102],
    label: [40, 102],
    shape: (
      <>
        <rect x="180" y="78" width="40" height="48" rx="3" />
        <circle className="dt" cx="200" cy="102" r="9" />
        <path className="dt" d="M185 88 H215 M185 116 H215" />
      </>
    ),
  },
  {
    id: "battery",
    box: [178, 126, 44, 52],
    anchor: [200, 152],
    label: [360, 152],
    shape: (
      <>
        <rect x="180" y="126" width="40" height="48" rx="2" />
        <line className="dt" x1="184" y1="142" x2="216" y2="142" />
        <line className="dt" x1="184" y1="158" x2="216" y2="158" />
      </>
    ),
  },
  {
    id: "electronics",
    box: [178, 174, 44, 58],
    anchor: [200, 203],
    label: [40, 205],
    shape: (
      <>
        <rect x="180" y="174" width="40" height="54" rx="2" />
        <rect className="dt" x="188" y="186" width="24" height="30" />
        <line className="dt" x1="200" y1="186" x2="200" y2="216" />
      </>
    ),
  },
  {
    id: "tail",
    box: [176, 226, 48, 110],
    anchor: [200, 280],
    label: [360, 280],
    shape: (
      <>
        <polygon points="180,228 220,228 214,330 186,330" />
        <line className="dt" x1="180" y1="260" x2="220" y2="260" />
        <line className="dt" x1="183" y1="295" x2="217" y2="295" />
      </>
    ),
  },
];

const surveyor3: SchematicPart[] = [
  {
    id: "solar",
    box: [104, 26, 104, 62],
    anchor: [150, 58],
    label: [40, 40],
    shape: (
      <>
        <polygon points="110,60 194,30 202,54 118,84" />
        <path className="dt" d="M131 52.500 L139 76.500 M152 45 L160 69 M173 37.500 L181 61.500 M114 72 L198 42" />
      </>
    ),
  },
  {
    id: "antenna",
    box: [198, 26, 104, 62],
    anchor: [256, 58],
    label: [360, 40],
    shape: (
      <>
        <polygon points="206,30 290,60 282,84 198,54" />
        <path className="dt" d="M202 42 L286 72 M227 37.500 L219 61.500 M248 45 L240 69 M269 52.500 L261 76.500" />
        <circle className="dt" cx="244" cy="57" r="5" />
      </>
    ),
  },
  {
    id: "camera",
    box: [112, 132, 46, 78],
    anchor: [134, 170],
    label: [40, 150],
    shape: (
      <g transform="rotate(-14 136 172)">
        <rect x="124" y="150" width="24" height="52" rx="5" />
        <path d="M120 150 L152 150 L146 136 L126 136 Z" />
        <path className="dt" d="M124 168 H148 M124 186 H148" />
        <circle className="dt" cx="136" cy="143" r="4" />
      </g>
    ),
  },
  {
    id: "frame",
    box: [146, 54, 108, 212],
    anchor: [204, 118],
    label: [366, 112],
    shape: (
      <>
        <rect x="196" y="56" width="8" height="146" />
        <polygon points="158,200 242,200 252,262 148,262" />
        <path className="dt" d="M158 200 L252 262 M242 200 L148 262 M200 200 V262 M153 231 H247" />
      </>
    ),
  },
  {
    id: "legs",
    box: [36, 250, 328, 104],
    anchor: [122, 286],
    label: [40, 232],
    shape: (
      <>
        <polygon points="150,254 160,262 76,334 66,326" />
        <polygon points="250,254 240,262 324,334 334,326" />
        <rect x="196" y="262" width="8" height="66" />
        <ellipse cx="66" cy="340" rx="28" ry="9" />
        <ellipse cx="334" cy="340" rx="28" ry="9" />
        <ellipse cx="200" cy="340" rx="24" ry="8" />
        <path className="dt" d="M112 296 L150 262 M288 296 L250 262" />
      </>
    ),
  },
  {
    id: "sampler",
    box: [248, 196, 122, 96],
    anchor: [300, 228],
    label: [366, 172],
    shape: (
      <>
        <polygon points="250,222 274,204 296,236 318,216 340,250 334,256 317,228 295,248 273,216 254,230" />
        <polygon points="330,250 348,246 362,270 352,286 336,280" />
        <path className="dt" d="M274 204 L273 216 M296 236 L295 248 M318 216 L317 228 M340 258 L354 272" />
      </>
    ),
  },
];

const eagle: SchematicPart[] = [
  {
    id: "ascent",
    box: [145, 55, 110, 85],
    anchor: [200, 95],
    label: [40, 85],
    shape: (
      <>
        <polygon points="160,60 240,60 255,135 145,135" />
        <circle className="dt" cx="180" cy="88" r="8" />
        <circle className="dt" cx="220" cy="88" r="8" />
        <rect className="dt" x="192" y="96" width="16" height="38" />
      </>
    ),
  },
  {
    id: "descent",
    box: [135, 135, 130, 80],
    anchor: [200, 175],
    label: [360, 160],
    shape: (
      <>
        <polygon points="160,135 240,135 265,210 135,210" />
        <rect className="dt" x="185" y="150" width="30" height="40" />
        <line className="dt" x1="135" y1="172" x2="265" y2="172" />
      </>
    ),
  },
  {
    id: "legs",
    box: [45, 195, 310, 140],
    anchor: [100, 280],
    label: [40, 280],
    shape: (
      <>
        <line x1="145" y1="210" x2="70" y2="330" strokeWidth="4" />
        <line x1="255" y1="210" x2="330" y2="330" strokeWidth="4" />
        <line x1="180" y1="210" x2="160" y2="330" strokeWidth="3" />
        <line x1="220" y1="210" x2="240" y2="330" strokeWidth="3" />
        <ellipse cx="70" cy="334" rx="22" ry="7" />
        <ellipse cx="330" cy="334" rx="22" ry="7" />
        <ellipse cx="160" cy="334" rx="16" ry="6" />
        <ellipse cx="240" cy="334" rx="16" ry="6" />
      </>
    ),
  },
  {
    id: "ladder",
    box: [142, 210, 26, 125],
    anchor: [155, 270],
    label: [40, 220],
    shape: (
      <>
        <line x1="146" y1="212" x2="146" y2="330" strokeWidth="2.5" />
        <line x1="164" y1="212" x2="164" y2="330" strokeWidth="2.5" />
        {[225, 245, 265, 285, 305, 325].map((y) => (
          <line key={y} className="dt" x1="146" y1={y} x2="164" y2={y} strokeWidth="2" />
        ))}
      </>
    ),
  },
  {
    id: "antenna",
    box: [230, 20, 65, 55],
    anchor: [260, 45],
    label: [360, 45],
    shape: (
      <>
        <path d="M240 50 A 24 24 0 0 1 285 25" strokeWidth="3" fill="none" />
        <line x1="262" y1="37" x2="248" y2="60" strokeWidth="2.5" />
        <circle cx="262" cy="37" r="4" />
      </>
    ),
  },
  {
    id: "plaque",
    box: [145, 245, 30, 24],
    anchor: [160, 255],
    label: [360, 255],
    shape: (
      <>
        <rect x="146" y="246" width="28" height="20" rx="2" />
        <line className="dt" x1="150" y1="252" x2="170" y2="252" />
        <line className="dt" x1="150" y1="258" x2="170" y2="258" />
      </>
    ),
  },
];

const lrv: SchematicPart[] = [
  {
    id: "chassis",
    box: [65, 180, 270, 45],
    anchor: [200, 202],
    label: [40, 160],
    shape: (
      <>
        <rect x="75" y="195" width="250" height="15" rx="3" />
        <line className="dt" x1="130" y1="195" x2="130" y2="210" />
        <line className="dt" x1="270" y1="195" x2="270" y2="210" />
      </>
    ),
  },
  {
    id: "wheels",
    box: [45, 205, 310, 105],
    anchor: [95, 255],
    label: [40, 270],
    shape: (
      <>
        <circle cx="95" cy="255" r="40" strokeWidth="3" />
        <circle cx="95" cy="255" r="14" className="dt" />
        <circle cx="305" cy="255" r="40" strokeWidth="3" />
        <circle cx="305" cy="255" r="14" className="dt" />
      </>
    ),
  },
  {
    id: "seats",
    box: [145, 115, 85, 80],
    anchor: [185, 155],
    label: [360, 130],
    shape: (
      <>
        <polygon points="150,195 165,130 190,130 180,195" />
        <polygon points="190,195 205,130 230,130 220,195" />
        <line className="dt" x1="155" y1="160" x2="225" y2="160" />
      </>
    ),
  },
  {
    id: "batteries",
    box: [265, 155, 55, 45],
    anchor: [290, 175],
    label: [360, 180],
    shape: (
      <>
        <rect x="270" y="160" width="48" height="35" rx="3" />
        <circle className="dt" cx="282" cy="177" r="4" />
        <circle className="dt" cx="304" cy="177" r="4" />
      </>
    ),
  },
  {
    id: "antenna",
    box: [255, 60, 80, 90],
    anchor: [295, 100],
    label: [360, 80],
    shape: (
      <>
        <path d="M265 110 Q 295 70 330 110" strokeWidth="3" fill="none" />
        <line x1="295" y1="90" x2="295" y2="160" strokeWidth="2.5" />
      </>
    ),
  },
  {
    id: "control",
    box: [195, 150, 30, 48],
    anchor: [210, 175],
    label: [40, 210],
    shape: (
      <>
        <line x1="210" y1="160" x2="210" y2="195" strokeWidth="3" />
        <line x1="200" y1="160" x2="220" y2="160" strokeWidth="4" />
      </>
    ),
  },
];

const viking1: SchematicPart[] = [
  {
    id: "body",
    box: [135, 130, 130, 85],
    anchor: [200, 170],
    label: [40, 140],
    shape: (
      <>
        <polygon points="150,135 250,135 265,210 135,210" />
        <circle className="dt" cx="200" cy="172" r="18" />
      </>
    ),
  },
  {
    id: "legs",
    box: [45, 195, 310, 135],
    anchor: [95, 270],
    label: [40, 270],
    shape: (
      <>
        <line x1="145" y1="210" x2="65" y2="320" strokeWidth="3.5" />
        <line x1="255" y1="210" x2="335" y2="320" strokeWidth="3.5" />
        <line x1="200" y1="210" x2="200" y2="320" strokeWidth="3.5" />
        <ellipse cx="65" cy="324" rx="20" ry="7" />
        <ellipse cx="335" cy="324" rx="20" ry="7" />
        <ellipse cx="200" cy="324" rx="18" ry="6" />
      </>
    ),
  },
  {
    id: "sampler",
    box: [255, 185, 115, 90],
    anchor: [310, 230],
    label: [360, 240],
    shape: (
      <>
        <line x1="250" y1="195" x2="330" y2="250" strokeWidth="3" />
        <polygon points="325,245 355,255 345,275 320,260" />
      </>
    ),
  },
  {
    id: "dish",
    box: [100, 50, 75, 85],
    anchor: [135, 90],
    label: [40, 70],
    shape: (
      <>
        <path d="M105 105 A 35 35 0 0 1 165 65" strokeWidth="3" fill="none" />
        <line x1="135" y1="85" x2="160" y2="135" strokeWidth="2.5" />
      </>
    ),
  },
  {
    id: "rtg",
    box: [225, 110, 65, 65],
    anchor: [255, 145],
    label: [360, 130],
    shape: (
      <>
        <rect x="230" y="118" width="55" height="45" rx="4" />
        <line className="dt" x1="230" y1="132" x2="285" y2="132" />
        <line className="dt" x1="230" y1="148" x2="285" y2="148" />
      </>
    ),
  },
  {
    id: "mast",
    box: [175, 45, 45, 85],
    anchor: [200, 85],
    label: [360, 70],
    shape: (
      <>
        <rect x="195" y="55" width="8" height="80" />
        <circle cx="199" cy="55" r="9" />
      </>
    ),
  },
];

const opportunity: SchematicPart[] = [
  {
    id: "deck",
    box: [90, 120, 220, 50],
    anchor: [200, 145],
    label: [40, 120],
    shape: (
      <>
        <polygon points="120,135 280,135 305,165 95,165" />
        <line className="dt" x1="150" y1="135" x2="140" y2="165" />
        <line className="dt" x1="250" y1="135" x2="260" y2="165" />
      </>
    ),
  },
  {
    id: "body",
    box: [125, 160, 150, 65],
    anchor: [200, 190],
    label: [40, 180],
    shape: (
      <>
        <rect x="135" y="165" width="130" height="55" rx="4" />
        <circle className="dt" cx="200" cy="192" r="14" />
      </>
    ),
  },
  {
    id: "wheels",
    box: [55, 205, 290, 95],
    anchor: [95, 260],
    label: [40, 260],
    shape: (
      <>
        <circle cx="85" cy="260" r="22" strokeWidth="3" />
        <circle cx="200" cy="260" r="22" strokeWidth="3" />
        <circle cx="315" cy="260" r="22" strokeWidth="3" />
        <line x1="85" y1="260" x2="155" y2="210" strokeWidth="3" />
        <line x1="315" y1="260" x2="245" y2="210" strokeWidth="3" />
      </>
    ),
  },
  {
    id: "mast",
    box: [135, 35, 45, 105],
    anchor: [155, 85],
    label: [40, 50],
    shape: (
      <>
        <line x1="155" y1="45" x2="155" y2="135" strokeWidth="3.5" />
        <rect x="140" y="38" width="30" height="15" rx="3" />
        <circle cx="147" cy="45" r="3" className="dt" />
        <circle cx="163" cy="45" r="3" className="dt" />
      </>
    ),
  },
  {
    id: "arm",
    box: [245, 185, 100, 80],
    anchor: [290, 220],
    label: [360, 230],
    shape: (
      <>
        <line x1="255" y1="190" x2="310" y2="230" strokeWidth="3" />
        <circle cx="320" cy="240" r="12" />
      </>
    ),
  },
  {
    id: "antenna",
    box: [220, 60, 65, 75],
    anchor: [250, 95],
    label: [360, 80],
    shape: (
      <>
        <path d="M225 95 A 30 30 0 0 1 275 75" strokeWidth="3" fill="none" />
        <line x1="250" y1="85" x2="250" y2="135" strokeWidth="2" />
      </>
    ),
  },
];

const ingenuity: SchematicPart[] = [
  {
    id: "rotors",
    box: [50, 45, 300, 55],
    anchor: [200, 72],
    label: [40, 50],
    shape: (
      <>
        <ellipse cx="200" cy="62" rx="140" ry="8" strokeWidth="2" />
        <ellipse cx="200" cy="78" rx="140" ry="8" strokeWidth="2" />
        <line x1="200" y1="40" x2="200" y2="115" strokeWidth="4" />
      </>
    ),
  },
  {
    id: "solar",
    box: [150, 18, 100, 32],
    anchor: [200, 34],
    label: [360, 30],
    shape: (
      <>
        <rect x="155" y="22" width="90" height="20" rx="2" />
        <line className="dt" x1="185" y1="22" x2="185" y2="42" />
        <line className="dt" x1="215" y1="22" x2="215" y2="42" />
      </>
    ),
  },
  {
    id: "fuselage",
    box: [160, 110, 80, 75],
    anchor: [200, 145],
    label: [40, 140],
    shape: (
      <>
        <rect x="165" y="115" width="70" height="65" rx="5" />
        <circle className="dt" cx="200" cy="148" r="16" />
      </>
    ),
  },
  {
    id: "legs",
    box: [60, 160, 280, 145],
    anchor: [100, 245],
    label: [40, 250],
    shape: (
      <>
        <line x1="165" y1="175" x2="80" y2="295" strokeWidth="3" />
        <line x1="235" y1="175" x2="320" y2="295" strokeWidth="3" />
        <circle cx="80" cy="298" r="5" />
        <circle cx="320" cy="298" r="5" />
      </>
    ),
  },
  {
    id: "camera",
    box: [180, 175, 40, 35],
    anchor: [200, 192],
    label: [360, 200],
    shape: (
      <>
        <circle cx="200" cy="192" r="10" />
        <circle cx="200" cy="192" r="4" className="dt" />
      </>
    ),
  },
  {
    id: "antenna",
    box: [210, 75, 25, 45],
    anchor: [222, 95],
    label: [360, 90],
    shape: (
      <>
        <line x1="222" y1="75" x2="222" y2="115" strokeWidth="2.5" />
      </>
    ),
  },
];

const near: SchematicPart[] = [
  {
    id: "body",
    box: [140, 110, 120, 120],
    anchor: [200, 170],
    label: [40, 150],
    shape: (
      <>
        <rect x="145" y="115" width="110" height="110" rx="4" />
        <circle className="dt" cx="200" cy="170" r="22" />
      </>
    ),
  },
  {
    id: "solar",
    box: [20, 125, 360, 70],
    anchor: [70, 160],
    label: [40, 100],
    shape: (
      <>
        <rect x="25" y="130" width="115" height="58" rx="2" />
        <rect x="260" y="130" width="115" height="58" rx="2" />
        <line className="dt" x1="60" y1="130" x2="60" y2="188" />
        <line className="dt" x1="300" y1="130" x2="300" y2="188" />
      </>
    ),
  },
  {
    id: "dish",
    box: [130, 20, 140, 95],
    anchor: [200, 65],
    label: [360, 50],
    shape: (
      <>
        <path d="M140 85 A 60 60 0 0 1 260 85" strokeWidth="3.5" fill="none" />
        <line x1="200" y1="40" x2="200" y2="115" strokeWidth="2.5" />
        <circle cx="200" cy="40" r="5" />
      </>
    ),
  },
  {
    id: "boom",
    box: [35, 215, 140, 70],
    anchor: [75, 250],
    label: [40, 260],
    shape: (
      <>
        <line x1="145" y1="215" x2="50" y2="280" strokeWidth="3" />
        <circle cx="48" cy="282" r="8" />
      </>
    ),
  },
  {
    id: "bay",
    box: [150, 215, 100, 55],
    anchor: [200, 240],
    label: [360, 240],
    shape: (
      <>
        <rect x="155" y="220" width="90" height="45" rx="3" />
        <rect className="dt" x="165" y="230" width="25" height="25" />
        <rect className="dt" x="205" y="230" width="25" height="25" />
      </>
    ),
  },
  {
    id: "thrusters",
    box: [240, 190, 70, 60],
    anchor: [275, 220],
    label: [360, 180],
    shape: (
      <>
        <polygon points="255,200 290,215 255,230" />
        <circle className="dt" cx="265" cy="215" r="4" />
      </>
    ),
  },
];

const dawn: SchematicPart[] = [
  {
    id: "arrays",
    box: [15, 130, 370, 70],
    anchor: [65, 165],
    label: [40, 120],
    shape: (
      <>
        <rect x="20" y="140" width="135" height="50" rx="2" />
        <rect x="245" y="140" width="135" height="50" rx="2" />
        <line className="dt" x1="65" y1="140" x2="65" y2="190" />
        <line className="dt" x1="110" y1="140" x2="110" y2="190" />
        <line className="dt" x1="290" y1="140" x2="290" y2="190" />
        <line className="dt" x1="335" y1="140" x2="335" y2="190" />
      </>
    ),
  },
  {
    id: "body",
    box: [150, 115, 100, 105],
    anchor: [200, 165],
    label: [40, 180],
    shape: (
      <>
        <rect x="155" y="120" width="90" height="95" rx="4" />
        <circle className="dt" cx="200" cy="165" r="20" />
      </>
    ),
  },
  {
    id: "ion",
    box: [165, 210, 70, 60],
    anchor: [200, 240],
    label: [40, 260],
    shape: (
      <>
        <polygon points="175,215 225,215 215,260 185,260" />
        <circle cx="200" cy="265" r="8" fill="#7fa3b0" />
      </>
    ),
  },
  {
    id: "antenna",
    box: [135, 30, 130, 90],
    anchor: [200, 75],
    label: [360, 50],
    shape: (
      <>
        <path d="M145 80 A 55 55 0 0 1 255 80" strokeWidth="3" fill="none" />
        <line x1="200" y1="45" x2="200" y2="120" strokeWidth="2.5" />
      </>
    ),
  },
  {
    id: "camera",
    box: [220, 110, 45, 45],
    anchor: [242, 132],
    label: [360, 120],
    shape: (
      <>
        <circle cx="242" cy="132" r="12" />
        <circle cx="242" cy="132" r="5" className="dt" />
      </>
    ),
  },
  {
    id: "sensors",
    box: [135, 110, 45, 45],
    anchor: [155, 132],
    label: [360, 170],
    shape: (
      <>
        <rect x="140" y="122" width="22" height="22" rx="2" />
        <circle cx="151" cy="133" r="4" className="dt" />
      </>
    ),
  },
];

const pioneer10: SchematicPart[] = [
  {
    id: "dish",
    box: [90, 30, 220, 165],
    anchor: [200, 110],
    label: [40, 70],
    shape: (
      <>
        <ellipse cx="200" cy="110" rx="100" ry="60" strokeWidth="3.5" fill="none" />
        <ellipse cx="200" cy="110" rx="30" ry="18" className="dt" fill="none" />
        <line x1="200" y1="50" x2="200" y2="110" strokeWidth="3" />
        <circle cx="200" cy="50" r="7" />
      </>
    ),
  },
  {
    id: "hub",
    box: [150, 165, 100, 80],
    anchor: [200, 205],
    label: [40, 200],
    shape: (
      <>
        <polygon points="170,170 230,170 245,235 155,235" />
        <circle className="dt" cx="200" cy="202" r="16" />
      </>
    ),
  },
  {
    id: "rtg",
    box: [225, 180, 140, 75],
    anchor: [290, 215],
    label: [360, 190],
    shape: (
      <>
        <line x1="240" y1="200" x2="330" y2="230" strokeWidth="3" />
        <rect x="325" y="215" width="35" height="30" rx="3" />
        <rect x="325" y="185" width="35" height="25" rx="3" />
      </>
    ),
  },
  {
    id: "boom",
    box: [35, 190, 135, 80],
    anchor: [75, 235],
    label: [40, 270],
    shape: (
      <>
        <line x1="160" y1="210" x2="50" y2="260" strokeWidth="3" />
        <circle cx="48" cy="262" r="8" />
      </>
    ),
  },
  {
    id: "photopol",
    box: [175, 235, 50, 50],
    anchor: [200, 260],
    label: [360, 270],
    shape: (
      <>
        <rect x="182" y="238" width="36" height="42" rx="3" />
        <circle cx="200" cy="258" r="8" className="dt" />
      </>
    ),
  },
  {
    id: "plaque",
    box: [145, 200, 38, 30],
    anchor: [162, 215],
    label: [360, 140],
    shape: (
      <>
        <rect x="148" y="202" width="32" height="24" rx="2" />
        <line className="dt" x1="152" y1="214" x2="176" y2="214" />
      </>
    ),
  },
];

export const SCHEMATICS: Record<string, SchematicPart[]> = {
  explorer1,
  surveyor3,
  eagle,
  lrv,
  viking1,
  opportunity,
  ingenuity,
  near,
  dawn,
  pioneer10,
};

/** The finished craft, used as the hero on the briefing scene. */
export function Craft({ mission, className }: { mission: string; className?: string }) {
  const parts = SCHEMATICS[mission];
  if (!parts) return null;
  return (
    <svg viewBox="30 20 340 340" className={"sheet plain " + (className ?? "")} aria-hidden="true">
      {parts.map((p) => (
        <g key={p.id} className="sh">
          {p.shape}
        </g>
      ))}
    </svg>
  );
}
