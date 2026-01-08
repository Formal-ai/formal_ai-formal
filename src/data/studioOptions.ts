export type GenderMode = "Gentlemen" | "Ladies";

export const PORTRAIT_OPTIONS = {
  Gentlemen: {
    outfitType: [
      "Single-Breasted Suit", "Double-Breasted Suit", "Slim-Fit Suit", "Classic Fit Suit",
      "Tuxedo", "Blazer + Shirt", "Blazer + Turtleneck", "Smart-Casual (shirt only)", 
      "Business-Casual (shirt + sweater)", "Executive Vest Suit", "Open-Collar Professional"
    ],
    outfitColor: [
      "Navy", "Charcoal", "Black", "Light Grey", "Medium Grey", "Beige", "Stone",
      "Brown", "Burgundy", "Midnight Blue", "Steel Blue", "Olive", "Deep Green", "Graphite", "Taupe"
    ],
    shirtStyle: [
      "Spread Collar", "Classic Collar", "Button-Down Collar", "Mandarin Collar",
      "Oxford Shirt", "No-Tie Look", "Turtleneck Under Blazer", "Formal Wing Collar"
    ],
    tieBowTie: [
      "Navy Silk Tie", "Burgundy Tie", "Patterned Corporate Tie", "Striped Tie", "Knitted Tie",
      "Classic Black Tie", "Gold Accent Tie", "Bow Tie (Black)", "Bow Tie (Velvet)", "No Tie"
    ],
    grooming: [
      "Clean Shave", "Light Stubble", "Medium Beard", "Full Beard",
      "Corporate Trim", "Sharp Fade", "Taper Fade", "Natural Grooming"
    ],
    poseSelection: [
      "Standing, facing forward", "Standing hands-in-pockets", "Leaning against wall", "Arms crossed",
      "Sitting in chair looking at camera", "Three-quarter body shot", "Candid walking shot", 
      "Leaning on desk", "Adjusting cufflink", "Headshot slight smile", "Confident CEO pose", 
      "Looking away thoughtfully", "Executive portrait (classic stance)"
    ]
  },
  Ladies: {
    outfitType: [
      "Blazer", "Full Suit (Blazer + Tailored Pants)", "Blazer + Dress", "Business Dress",
      "Pencil-Skirt Suit", "Blouse + Blazer", "Silk Blouse", "Peplum Top",
      "Executive Knitwear", "Elegant Corporate Dress", "Turtleneck + Blazer"
    ],
    outfitColor: [
      "Navy", "Black", "White", "Burgundy", "Soft Pastels", "Champagne", "Charcoal",
      "Sand", "Cream", "Sage", "Blush", "Deep Green", "Mahogany", "Cobalt Blue"
    ],
    hairIntegration: [
      "Neat Bun", "High Ponytail", "Low Ponytail", "Straight Professional", "Soft Corporate Waves",
      "Curls (natural or styled)", "Shoulder-Length Bob", "Long Straight", "Afro-Textured Styles",
      "Protective Styles (braids, twists)", "Volume Boost"
    ],
    jewelryLevel: [
      "None", "Minimal", "Pearl Studs", "Small Gold Hoops", "Silver Chain",
      "Subtle Corporate Necklace", "Light Professional Earrings", "Corporate Jewelry Set"
    ],
    poseSelection: [
      "Hands crossed professionally", "Soft smile headshot", "Seated CEO pose", "Leaning slightly forward",
      "Corporate stance, hands at sides", "Confident chin-up", "Editorial-style corporate portrait",
      "Three-quarter standing pose", "Thoughtful look away", "Seated at desk", "Walking candid"
    ]
  }
};

export const HAIR_OPTIONS = {
  Gentlemen: {
    hairType: [
      "Fade (Low)", "Fade (Mid)", "Fade (High)", "Classic Taper", "Buzzcut",
      "Crew Cut", "Side Part", "Caesar Cut", "Wavy Professional", "Slight Curl Texture"
    ],
    beardGrooming: [
      "Clean Shave", "Light Stubble", "Medium Beard", "Full Beard",
      "Corporate Trim", "Van Dyke", "Chin Strap", "Goatee"
    ],
    hairFinish: [
      "Matte", "Natural", "Light Shine", "High Definition Edges"
    ]
  },
  Ladies: {
    hairType: [
      "Straight", "Curly", "Wavy", "Coil", "Afro", "Relaxed", "Braids", "Twists", "Locs"
    ],
    hairstyle: [
      "High Bun", "Low Bun", "High Ponytail", "Side Part", "Center Part",
      "Professional Bob", "Shoulder-Length Straight", "Corporate Curls", "Styled Waves", "Updo"
    ],
    hairFinish: [
      "Smooth Polish", "Natural Texture", "Gloss Finish", "Matte Volume"
    ]
  }
};

export const ACCESSORIES_OPTIONS = {
  Gentlemen: {
    watches: [
      "Stainless Steel", "Black Leather", "Brown Leather",
      "Gold Minimal", "Blue Dial Executive", "Chronograph", "None"
    ],
    glasses: [
      "Thin Metal", "Black Frame", "Clear Frame", "Semi-Rimless", "Designer Professional", "None"
    ],
    tiesBowties: [
      "Solid Navy", "Burgundy", "Black Luxury Satin", "Pinstripe",
      "Geometric Pattern", "Knitted Tie", "Bow Tie (Black)", "Bow Tie (Burgundy)", "None"
    ],
    pinsCufflinks: [
      "Minimal Silver Pin", "Gold Accent Pin", "Corporate Emblem Pin",
      "Round Silver Cufflinks", "Engraved Cufflinks", "None"
    ]
  },
  Ladies: {
    earrings: [
      "Pearl Studs", "Diamond Studs", "Mini Hoops", "Gold Drops", "Silver Minimalist", "None"
    ],
    necklaces: [
      "Thin Gold Chain", "Thin Silver Chain", "Pearl Pendant", "Geometric Minimal Necklace", "None"
    ],
    glasses: [
      "Cat-Eye Professional", "Thin Wire Frame", "Oval Executive", "Designer Black Frame", "None"
    ],
    brooches: [
      "Gold Corporate Brooch", "Silver Minimalist Brooch", "Pearl Accent Brooch", "None"
    ]
  }
};

export const BACKGROUND_OPTIONS = {
  corporateBackgrounds: [
    "Modern Office", "CEO Boardroom", "Glass-Wall Conference Room",
    "Corporate Library", "FinTech Studio", "Minimal White Studio"
  ],
  editorialStyles: [
    "Soft Grey Gradient", "Deep Charcoal Studio", "Warm Editorial Lighting",
    "Cool Editorial Lighting", "Cream Background"
  ],
  outdoorEnvironmental: [
    "Blurred Cityscape", "Rooftop Corporate", "Garden Terrace", "Architectural Lines"
  ]
};
