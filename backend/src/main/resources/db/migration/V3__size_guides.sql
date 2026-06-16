-- Size guide seed data for Sarees, Kurtas, Dresses, Footwear, and Jewellery categories

-- Sarees (Sarees & Ethnic Wear)
INSERT INTO size_guides (category_id, name, guide_type, content)
SELECT id, 'Saree Size Guide', 'SAREE',
'{
  "title": "Saree Size Guide",
  "unit": "inches",
  "description": "Sarees are typically one-size-fits-all. Use this guide for blouse and petticoat measurements.",
  "how_to_measure": [
    {"step": 1, "label": "Bust", "instruction": "Measure around the fullest part of your bust, keeping the tape parallel to the floor."},
    {"step": 2, "label": "Waist", "instruction": "Measure around your natural waistline, the narrowest part of your torso."},
    {"step": 3, "label": "Hip", "instruction": "Measure around the fullest part of your hips, approximately 7 inches below your waist."},
    {"step": 4, "label": "Shoulder", "instruction": "Measure from the edge of one shoulder to the other across the back."},
    {"step": 5, "label": "Saree Length", "instruction": "Standard saree length is 5.5 metres (6 yards). For taller frames (above 5''8\"), choose 6.3 metres."}
  ],
  "tables": [
    {
      "name": "Blouse Size Chart",
      "headers": ["Size", "Bust (in)", "Waist (in)", "Shoulder (in)", "Sleeve Length (in)"],
      "rows": [
        ["XS", "32", "26", "13.5", "5"],
        ["S", "34", "28", "14", "5.5"],
        ["M", "36", "30", "14.5", "6"],
        ["L", "38", "32", "15", "6"],
        ["XL", "40", "34", "15.5", "6.5"],
        ["XXL", "42", "36", "16", "7"],
        ["3XL", "44", "38", "16.5", "7"]
      ]
    },
    {
      "name": "Petticoat Size Chart",
      "headers": ["Size", "Waist (in)", "Hip (in)", "Length (in)"],
      "rows": [
        ["S", "26-28", "34-36", "38"],
        ["M", "28-32", "36-40", "40"],
        ["L", "32-36", "40-44", "40"],
        ["XL", "36-40", "44-48", "42"],
        ["Free Size", "28-40", "36-48", "40"]
      ]
    },
    {
      "name": "Saree Length Guide",
      "headers": ["Height", "Recommended Saree Length", "Pallu Style"],
      "rows": [
        ["4''10\" - 5''2\"", "5.5 metres", "Standard drape"],
        ["5''3\" - 5''7\"", "5.5 metres", "Pleated or seedha pallu"],
        ["5''8\" and above", "6.3 metres", "Extra fabric for full drape"]
      ]
    }
  ],
  "tips": [
    "Most unstitched blouses come with 0.5m extra fabric for alterations.",
    "Pre-stitched blouses: choose your regular top size.",
    "Silk and tissue sarees drape differently — allow 1 inch ease in blouse bust measurement.",
    "For mermaid or lehenga-style drapes, add 0.5m to standard saree length."
  ]
}'::jsonb
FROM categories WHERE slug = 'sarees-ethnic-wear';

-- Kurtas (Sarees & Ethnic Wear)
INSERT INTO size_guides (category_id, name, guide_type, content)
SELECT id, 'Kurta Size Guide', 'KURTA',
'{
  "title": "Kurta & Ethnic Top Size Guide",
  "unit": "inches",
  "description": "Measure yourself and compare with the chart below. Kurtas are designed for a relaxed, comfortable fit.",
  "how_to_measure": [
    {"step": 1, "label": "Bust/Chest", "instruction": "Measure around the fullest part of your bust while wearing a well-fitted bra."},
    {"step": 2, "label": "Waist", "instruction": "Measure around your natural waistline."},
    {"step": 3, "label": "Hip", "instruction": "Measure around the fullest part of your hips."},
    {"step": 4, "label": "Kurta Length", "instruction": "Measure from the highest point of your shoulder down to your desired hemline."},
    {"step": 5, "label": "Sleeve", "instruction": "Measure from shoulder seam to wrist with arm slightly bent."}
  ],
  "tables": [
    {
      "name": "Women''s Kurta Size Chart",
      "headers": ["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Length (in)", "Sleeve (in)"],
      "rows": [
        ["XS", "32", "26", "34", "40", "22"],
        ["S", "34", "28", "36", "41", "22.5"],
        ["M", "36", "30", "38", "42", "23"],
        ["L", "38", "32", "40", "43", "23.5"],
        ["XL", "40", "34", "42", "44", "24"],
        ["XXL", "42", "36", "44", "45", "24"],
        ["3XL", "44", "38", "46", "46", "24.5"]
      ]
    },
    {
      "name": "Fit Type Guide",
      "headers": ["Fit Type", "Description", "Size Recommendation"],
      "rows": [
        ["Regular Fit", "Standard comfortable fit", "Choose your measured size"],
        ["A-Line", "Flares from bust, forgiving on hips", "True to size or size down if between sizes"],
        ["Straight Cut", "Falls straight from shoulders", "Size up if you prefer loose fit"],
        ["Anarkali", "Fitted bodice, flared skirt", "Size based on bust measurement"]
      ]
    }
  ],
  "tips": [
    "If between two sizes, size up for Anarkali and straight-cut kurtas.",
    "Cotton kurtas may shrink 1-2% after first wash — account for this when sizing.",
    "Pair with matching bottom size from the bottomwear chart for coordinated sets.",
    "For festive embroidered kurtas, allow 1-2 inches ease for comfort."
  ]
}'::jsonb
FROM categories WHERE slug = 'sarees-ethnic-wear';

-- Dresses (Western Clothing)
INSERT INTO size_guides (category_id, name, guide_type, content)
SELECT id, 'Dress Size Guide', 'DRESS',
'{
  "title": "Western Dress Size Guide",
  "unit": "inches",
  "description": "Indian sizes mapped to international equivalents. Measure in inches for best accuracy.",
  "how_to_measure": [
    {"step": 1, "label": "Bust", "instruction": "Stand straight, measure around the fullest part of your bust. Keep tape snug but not tight."},
    {"step": 2, "label": "Waist", "instruction": "Measure around your natural waist, typically the narrowest point above the belly button."},
    {"step": 3, "label": "Hip", "instruction": "Measure around the fullest part of your hips and buttocks."},
    {"step": 4, "label": "Dress Length", "instruction": "From shoulder top to desired hem — mini (34\"), midi (42\"), maxi (54\")."}
  ],
  "tables": [
    {
      "name": "Indian to International Size Chart",
      "headers": ["Indian Size", "Bust (in)", "Waist (in)", "Hip (in)", "UK", "US"],
      "rows": [
        ["XS / 32", "32", "24", "34", "6", "2"],
        ["S / 34", "34", "26", "36", "8", "4"],
        ["M / 36", "36", "28", "38", "10", "6"],
        ["L / 38", "38", "30", "40", "12", "8"],
        ["XL / 40", "40", "32", "42", "14", "10"],
        ["XXL / 42", "42", "34", "44", "16", "12"],
        ["3XL / 44", "44", "36", "46", "18", "14"]
      ]
    },
    {
      "name": "Dress Style Fit Guide",
      "headers": ["Style", "Fit", "Sizing Tip"],
      "rows": [
        ["Bodycon", "Tight, body-hugging", "Size up if between sizes"],
        ["A-Line", "Fitted top, flared skirt", "True to size"],
        ["Shift", "Loose, straight cut", "True to size or size down"],
        ["Wrap", "Adjustable tie waist", "Flexible — choose based on bust"],
        ["Maxi", "Floor length, flowy", "Check length chart for height"]
      ]
    },
    {
      "name": "Dress Length by Height",
      "headers": ["Height", "Mini (in)", "Midi (in)", "Maxi (in)"],
      "rows": [
        ["5''0\" - 5''3\"", "32-34", "40-42", "50-52"],
        ["5''4\" - 5''7\"", "34-36", "42-44", "52-54"],
        ["5''8\" and above", "36-38", "44-46", "54-56"]
      ]
    }
  ],
  "tips": [
    "Stretch fabrics (lycra, jersey) fit more forgivingly — true to size works.",
    "Woven fabrics (cotton, linen) with no stretch — size up if between sizes.",
    "Check product description for model height and size worn for reference.",
    "Bodycon dresses: prioritise bust measurement when choosing size."
  ]
}'::jsonb
FROM categories WHERE slug = 'western-clothing';

-- Footwear
INSERT INTO size_guides (category_id, name, guide_type, content)
SELECT id, 'Footwear Size Guide', 'FOOTWEAR',
'{
  "title": "Footwear Size Guide",
  "unit": "cm",
  "description": "Measure your foot length and match to Indian (UK) sizing. Measure both feet and use the larger measurement.",
  "how_to_measure": [
    {"step": 1, "label": "Foot Length", "instruction": "Place foot on paper, mark heel and longest toe. Measure distance in centimetres."},
    {"step": 2, "label": "Foot Width", "instruction": "Measure across the widest part of your foot. Wide feet may need half size up."},
    {"step": 3, "label": "Best Time", "instruction": "Measure feet in the evening when they are at their largest."},
    {"step": 4, "label": "Socks", "instruction": "Wear the type of socks you plan to use with the footwear when measuring."}
  ],
  "tables": [
    {
      "name": "Women''s Footwear Size Chart",
      "headers": ["Indian/UK", "US", "EU", "Foot Length (cm)", "Foot Length (in)"],
      "rows": [
        ["3", "5.5", "36", "22.0", "8.7"],
        ["4", "6", "37", "22.5", "8.9"],
        ["5", "7", "38", "23.5", "9.3"],
        ["6", "8", "39", "24.0", "9.4"],
        ["7", "9", "40", "25.0", "9.8"],
        ["8", "10", "41", "25.5", "10.0"],
        ["9", "11", "42", "26.5", "10.4"],
        ["10", "12", "43", "27.0", "10.6"]
      ]
    },
    {
      "name": "Footwear Type Sizing Notes",
      "headers": ["Type", "Fit Note", "Recommendation"],
      "rows": [
        ["Heels / Pumps", "Snug at heel, toes at front", "True to size; wide feet go half size up"],
        ["Flats / Ballerinas", "Comfortable with slight toe room", "True to size"],
        ["Kolhapuri / Ethnic", "Leather stretches over time", "Start snug — will mould to foot"],
        ["Sports / Sneakers", "Room for socks and toe movement", "True to size; athletic socks add 0.5cm"],
        ["Sandals / Slides", "Adjustable straps preferred", "True to size; check strap adjustability"]
      ]
    },
    {
      "name": "Heel Height Guide",
      "headers": ["Category", "Heel Height (in)", "Best For"],
      "rows": [
        ["Kitten Heel", "1-2", "Daily wear, office"],
        ["Mid Heel", "2-3", "Parties, semi-formal"],
        ["High Heel", "3-4", "Evening events, weddings"],
        ["Stiletto", "4+", "Special occasions only"]
      ]
    }
  ],
  "tips": [
    "Between sizes? Always round up for closed-toe shoes.",
    "Kolhapuri and leather sandals stretch — buy your exact size.",
    "Platform heels feel lower than actual height — check platform offset.",
    "Monsoon footwear: choose half size up if wearing with thick socks."
  ]
}'::jsonb
FROM categories WHERE slug = 'footwear';

-- Jewellery (Fine Jewellery)
INSERT INTO size_guides (category_id, name, guide_type, content)
SELECT id, 'Jewellery Size Guide', 'JEWELLERY',
'{
  "title": "Jewellery Size Guide",
  "unit": "inches/mm",
  "description": "Sizing guide for bangles, rings, necklaces, and earrings. Measure carefully for a comfortable fit.",
  "how_to_measure": [
    {"step": 1, "label": "Bangle", "instruction": "Close fingers together, measure widest part of hand (knuckles). Use a strip of paper around the hand."},
    {"step": 2, "label": "Ring", "instruction": "Measure inner diameter of a ring that fits well, or circumference of finger at widest point."},
    {"step": 3, "label": "Necklace", "instruction": "Measure existing necklace length or use a string around neck at desired drop point."},
    {"step": 4, "label": "Bracelet", "instruction": "Measure wrist circumference snugly, add 0.5-1 inch for comfortable fit."}
  ],
  "tables": [
    {
      "name": "Bangle Size Chart (Indian)",
      "headers": ["Size", "Inner Diameter (in)", "Inner Diameter (mm)", "Circumference (in)"],
      "rows": [
        ["2-2", "2.0", "50.8", "6.3"],
        ["2-4", "2.125", "54.0", "6.7"],
        ["2-6", "2.25", "57.2", "7.1"],
        ["2-8", "2.375", "60.3", "7.5"],
        ["2-10", "2.5", "63.5", "7.9"],
        ["2-12", "2.625", "66.7", "8.3"]
      ]
    },
    {
      "name": "Ring Size Chart",
      "headers": ["Indian Size", "US Size", "UK Size", "Inner Diameter (mm)", "Circumference (mm)"],
      "rows": [
        ["6", "3", "F", "14.1", "44.2"],
        ["8", "4.5", "I", "15.0", "47.1"],
        ["10", "5.5", "K", "15.7", "49.3"],
        ["12", "6.5", "M", "16.5", "51.9"],
        ["14", "7.5", "O", "17.3", "54.4"],
        ["16", "8.5", "Q", "18.1", "56.9"],
        ["18", "9.5", "S", "19.0", "59.7"],
        ["20", "10.5", "U", "19.8", "62.2"]
      ]
    },
    {
      "name": "Necklace Length Guide",
      "headers": ["Style", "Length (in)", "Falls At", "Occasion"],
      "rows": [
        ["Choker", "14-16", "Base of neck", "Casual, fusion wear"],
        ["Princess", "17-19", "Collarbone", "Daily wear, office"],
        ["Matinee", "20-24", "Top of bust", "Parties, formal"],
        ["Opera", "28-34", "Below bust", "Evening, weddings"],
        ["Rani Haar", "30-36", "Mid-torso", "Bridal, festive"]
      ]
    },
    {
      "name": "Bracelet / Kada Size",
      "headers": ["Wrist Size (in)", "Bracelet Size (in)", "Recommended Fit"],
      "rows": [
        ["5.5-6", "6.5-7", "Snug"],
        ["6-6.5", "7-7.5", "Comfortable"],
        ["6.5-7", "7.5-8", "Loose / stackable"],
        ["7-7.5", "8-8.5", "Oversized kada style"]
      ]
    }
  ],
  "tips": [
    "Bangles: if hand measurement is between sizes, choose the larger size.",
    "Adjustable rings and open kada bracelets fit most sizes — check product listing.",
    "Gold bangles do not stretch — measure accurately before ordering.",
    "For layered necklaces, combine choker (16\") with princess (18\") lengths.",
    "Oxidised and fashion jewellery may have fixed sizes — refer to product dimensions."
  ]
}'::jsonb
FROM categories WHERE slug = 'fine-jewellery';
