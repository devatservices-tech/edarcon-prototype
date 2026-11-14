export type EquipmentCategory = "cranes" | "excavators" | "generators" | "loaders" | "vehicles";

export interface EquipmentFeature {
  label: string;
}

export interface EquipmentSpec {
  label: string;
  value: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  spec: string;
  description: string;
  badge?: string;
  features: EquipmentFeature[];
  specs: EquipmentSpec[];
  image?: string;
}

export const EQUIPMENT: EquipmentItem[] = [
  {
    id: "c1",
    name: "Mobile Crane 25T",
    category: "cranes",
    spec: "25 tonne capacity, all-terrain",
    description:
      "A road-legal all-terrain crane for lifting and positioning work across plant sites and confined yards. Comes with a certified rigger-operator, rigging gear and a current load chart for the job.",
    badge: "Cranes & Lifting",
    features: [
      { label: "Certified operator and banksman supplied" },
      { label: "Full rigging set: slings, shackles, spreader bar" },
      { label: "Current third-party load test certificate" },
      { label: "Suited to confined and uneven plant terrain" },
    ],
    specs: [
      { label: "Max capacity", value: "25 tonnes" },
      { label: "Boom length", value: "10–33.5 m" },
      { label: "Drive", value: "All-terrain, road-legal" },
      { label: "Operator", value: "Certified rigger-operator included" },
    ],
  },
  {
    id: "c2",
    name: "Mobile Crane 100T",
    category: "cranes",
    spec: "100 tonne capacity, lattice boom",
    description:
      "High-capacity mobile crane with lattice boom for heavy lifts on industrial and infrastructure sites. Supplied with certified operator and full load documentation.",
    badge: "Cranes & Lifting",
    features: [
      { label: "Certified operator supplied" },
      { label: "100 tonne lifting capacity" },
      { label: "Lattice boom configuration" },
      { label: "Current load test certificate" },
    ],
    specs: [
      { label: "Max capacity", value: "100 tonnes" },
      { label: "Boom type", value: "Lattice" },
      { label: "Drive", value: "All-terrain" },
    ],
  },
  {
    id: "c3",
    name: "Mobile Crane 250T",
    category: "cranes",
    spec: "250 tonne capacity, telescopic",
    description:
      "Ultra-heavy lift mobile crane with telescopic boom for major plant erection and infrastructure projects. Includes certified crew and rigging gear.",
    badge: "Cranes & Lifting",
    features: [
      { label: "Certified operator supplied" },
      { label: "250 tonne lifting capacity" },
      { label: "Telescopic boom" },
      { label: "Full rigging set included" },
    ],
    specs: [
      { label: "Max capacity", value: "250 tonnes" },
      { label: "Boom type", value: "Telescopic" },
      { label: "Drive", value: "Multi-axle mobile" },
    ],
  },
  {
    id: "c4",
    name: "Pick & Carry Crane 15T",
    category: "cranes",
    spec: "15 tonne, rough terrain",
    description:
      "Compact pick-and-carry crane designed for rough terrain and confined work areas. Ideal for material handling and installation support within plant sites.",
    badge: "Cranes & Lifting",
    features: [
      { label: "Certified operator supplied" },
      { label: "15 tonne capacity" },
      { label: "Rough terrain rated" },
      { label: "Pick and carry functionality" },
    ],
    specs: [
      { label: "Max capacity", value: "15 tonnes" },
      { label: "Terrain", value: "Rough terrain" },
      { label: "Drive", value: "4WD" },
    ],
  },
  {
    id: "e1",
    name: "Excavator 20T",
    category: "excavators",
    spec: "20 tonne, hydraulic, long reach",
    description:
      "20 tonne hydraulic excavator with long-reach arm for excavation, trenching and demolition work. Fully serviced with certified operator available.",
    badge: "Earthmoving",
    features: [
      { label: "20 tonne operating weight" },
      { label: "Long reach arm" },
      { label: "Hydraulic attachments ready" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Operating weight", value: "20 tonnes" },
      { label: "Arm type", value: "Long reach" },
      { label: "Drive", value: "Tracked" },
    ],
  },
  {
    id: "e2",
    name: "Excavator 30T",
    category: "excavators",
    spec: "30 tonne, standard bucket",
    description:
      "30 tonne excavator equipped with standard bucket for bulk excavation and site preparation. Productive and reliable for civil and infrastructure work.",
    badge: "Earthmoving",
    features: [
      { label: "30 tonne operating weight" },
      { label: "Standard bucket included" },
      { label: "High production output" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Operating weight", value: "30 tonnes" },
      { label: "Bucket", value: "Standard" },
      { label: "Drive", value: "Tracked" },
    ],
  },
  {
    id: "e3",
    name: "Backhoe Loader",
    category: "excavators",
    spec: "4WD, extendable dipper",
    description:
      "Versatile backhoe loader with front loader and rear backhoe, 4WD and extendable dipper. Suitable for trenching, loading and general site work.",
    badge: "Earthmoving",
    features: [
      { label: "4WD backhoe loader" },
      { label: "Extendable dipper" },
      { label: "Front loader and backhoe" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Drive", value: "4WD" },
      { label: "Dipper", value: "Extendable" },
      { label: "Functions", value: "Loader + backhoe" },
    ],
  },
  {
    id: "e4",
    name: "Mini Excavator 3T",
    category: "excavators",
    spec: "3 tonne, zero tail swing",
    description:
      "3 tonne mini excavator with zero tail swing for confined spaces and urban sites. Ideal for tight-access excavation and utility work.",
    badge: "Earthmoving",
    features: [
      { label: "3 tonne operating weight" },
      { label: "Zero tail swing" },
      { label: "Compact, tight-access rated" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Operating weight", value: "3 tonnes" },
      { label: "Tail swing", value: "Zero" },
      { label: "Drive", value: "Tracked" },
    ],
  },
  {
    id: "g1",
    name: "Generator 100 kVA",
    category: "generators",
    spec: "100 kVA, diesel, soundproofed",
    description:
      "100 kVA diesel generator in a soundproofed canopy for site power and standby applications. Fuel-efficient and ready for immediate deployment.",
    badge: "Power & Utilities",
    features: [
      { label: "100 kVA prime power" },
      { label: "Diesel engine" },
      { label: "Soundproofed canopy" },
      { label: "Auto-start capable" },
    ],
    specs: [
      { label: "Power rating", value: "100 kVA" },
      { label: "Fuel", value: "Diesel" },
      { label: "Canopy", value: "Soundproofed" },
    ],
  },
  {
    id: "g2",
    name: "Generator 250 kVA",
    category: "generators",
    spec: "250 kVA, diesel, auto-start",
    description:
      "250 kVA diesel generator with auto-start for backup power on large sites. Built for continuous or standby operation with full certification.",
    badge: "Power & Utilities",
    features: [
      { label: "250 kVA prime power" },
      { label: "Diesel engine" },
      { label: "Auto-start function" },
      { label: "Certified and tested" },
    ],
    specs: [
      { label: "Power rating", value: "250 kVA" },
      { label: "Fuel", value: "Diesel" },
      { label: "Start", value: "Auto-start" },
    ],
  },
  {
    id: "g3",
    name: "Generator 500 kVA",
    category: "generators",
    spec: "500 kVA, prime power",
    description:
      "500 kVA diesel generator rated for prime power on industrial sites and large-scale projects. Heavy-duty construction with full load testing.",
    badge: "Power & Utilities",
    features: [
      { label: "500 kVA prime power" },
      { label: "Diesel engine" },
      { label: "Prime power rated" },
      { label: "Load test certificate" },
    ],
    specs: [
      { label: "Power rating", value: "500 kVA" },
      { label: "Fuel", value: "Diesel" },
      { label: "Rating", value: "Prime power" },
    ],
  },
  {
    id: "g4",
    name: "Generator 1000 kVA",
    category: "generators",
    spec: "1000 kVA, standby / prime",
    description:
      "1000 kVA diesel generator for standby or prime power on major projects. High-output power supply with certified operator and full documentation.",
    badge: "Power & Utilities",
    features: [
      { label: "1000 kVA power rating" },
      { label: "Diesel engine" },
      { label: "Standby / prime rated" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Power rating", value: "1000 kVA" },
      { label: "Fuel", value: "Diesel" },
      { label: "Rating", value: "Standby / prime" },
    ],
  },
  {
    id: "l1",
    name: "Wheel Loader 3m³",
    category: "loaders",
    spec: "3 m³ bucket, 4WD",
    description:
      "3 m³ wheel loader with 4WD for loading, stockpiling and material handling on site. Productive and manoeuvrable for civil and plant work.",
    badge: "Loaders",
    features: [
      { label: "3 m³ bucket" },
      { label: "4WD drive" },
      { label: "Material handling" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Bucket capacity", value: "3 m³" },
      { label: "Drive", value: "4WD" },
      { label: "Type", value: "Wheel loader" },
    ],
  },
  {
    id: "l2",
    name: "Skid Steer Loader",
    category: "loaders",
    spec: "Compact, attachments available",
    description:
      "Compact skid steer loader with a range of attachments for landscaping, demolition and material handling in tight areas.",
    badge: "Loaders",
    features: [
      { label: "Compact frame" },
      { label: "Multiple attachments" },
      { label: "Tight-access rated" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Type", value: "Skid steer" },
      { label: "Attachments", value: "Available" },
      { label: "Drive", value: "4WD" },
    ],
  },
  {
    id: "l3",
    name: "Telehandler 3T / 17m",
    category: "loaders",
    spec: "3 tonne, 17 m reach",
    description:
      "3 tonne telehandler with 17 m reach for placing materials at height and across sites. Versatile boom with attachment compatibility.",
    badge: "Loaders",
    features: [
      { label: "3 tonne lift capacity" },
      { label: "17 m reach" },
      { label: "Telescopic boom" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Lift capacity", value: "3 tonnes" },
      { label: "Reach", value: "17 m" },
      { label: "Boom", value: "Telescopic" },
    ],
  },
  {
    id: "l4",
    name: "Forklift 5T",
    category: "loaders",
    spec: "5 tonne, diesel, rough terrain",
    description:
      "5 tonne diesel forklift rated for rough terrain, suitable for yard and construction material handling. Heavy-duty tyres and high ground clearance.",
    badge: "Loaders",
    features: [
      { label: "5 tonne capacity" },
      { label: "Diesel engine" },
      { label: "Rough terrain tyres" },
      { label: "Certified operator available" },
    ],
    specs: [
      { label: "Capacity", value: "5 tonnes" },
      { label: "Fuel", value: "Diesel" },
      { label: "Terrain", value: "Rough terrain" },
    ],
  },
  {
    id: "v1",
    name: "Crew Bus 30-Seat",
    category: "vehicles",
    spec: "30-seat, A/C, safety belts",
    description:
      "30-seat crew bus with air conditioning and safety belts for workforce transport to and from site. Comfortable and safety-compliant.",
    badge: "Transport & Vehicles",
    features: [
      { label: "30 passenger seats" },
      { label: "Air conditioning" },
      { label: "Safety belts" },
      { label: "Driver included" },
    ],
    specs: [
      { label: "Capacity", value: "30 seats" },
      { label: "Cooling", value: "A/C" },
      { label: "Type", value: "Crew bus" },
    ],
  },
  {
    id: "v2",
    name: "Light Vehicle 4×4",
    category: "vehicles",
    spec: "Toyota Land Cruiser / equivalent",
    description:
      "4×4 light vehicle (Toyota Land Cruiser or equivalent) for site supervision, crew transport and off-road access on project sites.",
    badge: "Transport & Vehicles",
    features: [
      { label: "4×4 drive" },
      { label: "Off-road capable" },
      { label: "Site supervision ready" },
      { label: "Driver included" },
    ],
    specs: [
      { label: "Drive", value: "4×4" },
      { label: "Model", value: "Land Cruiser / equivalent" },
      { label: "Type", value: "Light vehicle" },
    ],
  },
  {
    id: "v3",
    name: "Flatbed Truck 20T",
    category: "vehicles",
    spec: "20 tonne payload, crane-offload",
    description:
      "20 tonne flatbed truck for transporting plant, equipment and materials. Crane-offload capable for self-sufficient delivery to site.",
    badge: "Transport & Vehicles",
    features: [
      { label: "20 tonne payload" },
      { label: "Flatbed deck" },
      { label: "Crane-offload capable" },
      { label: "Driver included" },
    ],
    specs: [
      { label: "Payload", value: "20 tonnes" },
      { label: "Deck", value: "Flatbed" },
      { label: "Type", value: "Truck" },
    ],
  },
  {
    id: "v4",
    name: "Water Bowser 10,000L",
    category: "vehicles",
    spec: "10,000 litre, dust suppression",
    description:
      "10,000 litre water bowser for dust suppression and site watering. Essential for maintaining safe, compliant working conditions on dry sites.",
    badge: "Transport & Vehicles",
    features: [
      { label: "10,000 litre capacity" },
      { label: "Dust suppression" },
      { label: "Site watering" },
      { label: "Driver included" },
    ],
    specs: [
      { label: "Capacity", value: "10,000 L" },
      { label: "Use", value: "Dust suppression" },
      { label: "Type", value: "Water bowser" },
    ],
  },
];

export function getEquipmentById(id: string): EquipmentItem | undefined {
  return EQUIPMENT.find((item) => item.id === id);
}
