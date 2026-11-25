export interface XRayDeskItem {
  id: number;
  key: string;
  name: string;
  description: string;
  construction: string;
  interaction: string;
  source: string;
}

const DESK_SCENE = 'src/components/BedroomDesk3D.tsx';

export const XRAY_DESK_ITEMS: XRayDeskItem[] = [
  {
    id: 1,
    key: 'printer',
    name: 'Thermal Printer & Bills',
    description: 'A compact receipt printer, sample docket stack, status light and animated paper feed.',
    construction: 'Procedural printer geometry with a canvas-printed receipt texture.',
    interaction: 'Open the printer to feed a sample receipt from the desk docket.',
    source: DESK_SCENE,
  },
  {
    id: 2,
    key: 'zoro',
    name: 'Zoro Bobblehead',
    description: 'A little spring-mounted swordsman keeps watch from beside the tablet.',
    construction: 'Procedural Three.js body, face, spiked hair and a small coil spring.',
    interaction: 'Tap him to set the head wobbling; the spring settles it naturally.',
    source: DESK_SCENE,
  },
  {
    id: 3,
    key: 'tablet',
    name: 'iPad OS & Desk Hub',
    description: 'An illustrated landscape iPad featuring On My Desk stats, Demo Metals Docket workflow, Z Card QR & Zynx Player.',
    construction: 'Machined bezel, landscape canvas texture, translucent dock and angled stand.',
    interaction: 'Open the iPad to check live desk telemetry, print dockets, inspect Z Card QR, or spin tracks in Zynx Player.',
    source: 'src/components/BedroomDesk3D.tsx · src/components/TabletDocketModal.tsx',
  },
  {
    id: 4,
    key: 'laptop',
    name: 'MacBook Projects',
    description: 'A laptop with rounded aluminium housing, individual keyboard keys and a live project screen.',
    construction: 'Rounded Three.js body, instanced keycaps and a canvas display texture.',
    interaction: 'Open the project window from the laptop or the quick action bar.',
    source: DESK_SCENE,
  },
  {
    id: 5,
    key: 'notes',
    name: 'Desk Notes',
    description: 'Four colour-coded sticky notes mounted above the work surface.',
    construction: 'Thin paper-like meshes with soft shadow layers and tape strips.',
    interaction: 'Tap a note to open its writing panel.',
    source: DESK_SCENE,
  },
  {
    id: 6,
    key: 'card',
    name: 'Business Card',
    description: 'A personal contact card resting in a small wooden holder.',
    construction: 'Printed canvas faces on a thin card mesh with a separate holder.',
    interaction: 'Lift and flip the card to reveal contact actions.',
    source: DESK_SCENE,
  },
  {
    id: 7,
    key: 'diary',
    name: 'Death Note',
    description: 'A closed matte-black Death Note hardcover notebook that opens a responsive two-page guestbook with writing and drawing tools.',
    construction: 'Procedural closed black leather cover, cream page block, Death Note cover texture, and diagonal silver pen.',
    interaction: 'Lift or drag page corners with the mouse, or use arrows to browse and sign your own page.',
    source: 'src/components/BedroomDesk3D.tsx · src/components/DiaryModal.tsx',
  },
  {
    id: 8,
    key: 'photo',
    name: 'Desk Frame',
    description: 'A small dark frame used as a quiet desk prop.',
    construction: 'Simple Three.js frame geometry and a flat inner panel.',
    interaction: 'Tap to inspect the frame.',
    source: DESK_SCENE,
  },
  {
    id: 9,
    key: 'mug',
    name: 'Coffee Mug',
    description: 'A ceramic cup with a curved handle, coffee surface and rising steam.',
    construction: 'Lathed cup profile, torus handle and lightweight particle steam.',
    interaction: 'Tap the mug for a small desk sound.',
    source: DESK_SCENE,
  },
  {
    id: 10,
    key: 'lamp',
    name: 'Desk Lamp',
    description: 'A softly glowing mushroom-shaped lamp at the back of the desk.',
    construction: 'Rounded shade, metal stem, base and a warm Three.js point light.',
    interaction: 'Tap the lamp to switch its light on or off.',
    source: DESK_SCENE,
  },
  {
    id: 11,
    key: 'phone',
    name: 'Phone',
    description: 'A smartphone on a tilted brushed-aluminum stand displaying a live interactive mobile website and AI assistant.',
    construction: 'Layered titanium body, MagSafe dock, Dynamic Island and live website canvas texture.',
    interaction: 'Open the phone to browse live deployed websites, ask the AI twin, or stream 7YNX audio.',
    source: 'src/components/BedroomDesk3D.tsx · src/components/PhoneExperience.tsx',
  },
  {
    id: 12,
    key: 'plant',
    name: 'Potted Plant',
    description: 'A terracotta pot with a cluster of individually animated leaves.',
    construction: 'Procedural pot, soil disc and extruded leaf meshes.',
    interaction: 'Tap to water it; leaves bounce, slowly dry over time and grow with each watering.',
    source: DESK_SCENE,
  },
  {
    id: 13,
    key: 'speaker',
    name: 'Blue Desk Speaker',
    description: 'A rounded tabletop speaker sits at the front left of the desk.',
    construction: 'Layered blue sphere, inset control pad and a small status light.',
    interaction: 'Tap to open the desk radio and its multicolour visualizer.',
    source: DESK_SCENE,
  },
  {
    id: 14,
    key: 'turntable',
    name: 'Record Player',
    description: 'A walnut and matte-aluminum turntable with spinning vinyl, articulated tonearm, and live desk track widget.',
    construction: 'Rounded walnut plinth, grooved vinyl disc, center album label, articulated tonearm and cue LED.',
    interaction: 'Tap to spin a record or cue the Zynx Player mixtape; the tonearm moves onto the disc during playback.',
    source: 'src/components/desk/ReferenceDeskProps.ts',
  },
];
