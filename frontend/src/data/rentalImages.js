const rentalImages = {
  "15 Yard Dumpster": "/images/15-yard-dumpster.jpg",
  "20 Yard Dumpster": "/images/20-yard-dumpster.jpg",
  "20' Lamar Flatbed Trailer": "/images/lamar-flatbed-trailer.jpg",
  "27 Ton Hydraulic Wood Splitter": "/images/hydraulic-wood-splitter.jpg",
  "6' X 6' Scaffolding": "/images/scaffolding.jpg",
  "Graco Airless Paint Sprayer 490": "/images/graco-paint-sprayer.jpg",
  "MuliQuip 3500 Watt Generator": "/images/multiquip-generator.jpg",
  'Stihl 16" Chainsaw': "/images/stihl-16-chainsaw.jpg",
  'Stihl 20" Chainsaw': "/images/stihl-20-chainsaw.jpg",
  "Wen 1250 Watt Generator": "/images/wen-generator.jpg",
};

export function getRentalImage(product) {
  return product.imageUrl?.trim() || rentalImages[product.name] || "/images/equipment-placeholder.svg";
}
