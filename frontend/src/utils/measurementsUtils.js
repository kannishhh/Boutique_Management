export function getPlaceholder(field) {
  const placeholderMap = {
    // Upper Body Core
    Bust: "e.g., 36",
    Chest: "e.g., 38",
    Waist: "e.g., 30",
    Hip: "e.g., 40",
    Shoulder: "e.g., 14",
    Armhole: "e.g., 16",
    Bicep: "e.g., 13",
    Wrist: "e.g., 7",
    Neck: "e.g., 15", // Lengths (Upper Wear)

    "Sleeve Length": "e.g., 17",
    "Shirt Length": "e.g., 28",
    "Tshirt Length": "e.g., 27",
    "Kurta Length": "e.g., 42",
    "Kurti Length": "e.g., 44",
    "Blouse Length": "e.g., 15",
    "Top Length": "e.g., 22",
    "Coat Length": "e.g., 30",
    "Sherwani Length": "e.g., 40",
    "Waistcoat Length": "e.g., 24",
    "Gown Length": "e.g., 55",
    "Dress Length": "e.g., 40",
    "Anarkali Length": "e.g., 50", // Lower Body Core

    Thigh: "e.g., 22",
    Knee: "e.g., 16",
    Bottom: "e.g., 14",
    Ankle: "e.g., 10", // Pants Specific

    Inseam: "e.g., 30",
    Outseam: "e.g., 40",
    Length: "e.g., 38",
    "Pant Length": "e.g., 38",
    "Salwar Length": "e.g., 38",
    "Churidar Length": "e.g., 48",
    "Lehenga Length": "e.g., 42",
    "Palazzo Length": "e.g., 40",
    "Bottom Length": "e.g., 40", // Neck Depth (Women)

    "Front Neck Depth": "e.g., 6",
    "Back Neck Depth": "e.g., 8", // Dupatta

    "Dupatta Length": "e.g., 90",
    "Dupatta Width": "e.g., 40", // Lehenga / Blouse combo

    "Blouse Length": "e.g., 15",
    "Top Length": "e.g., 22", // Default fallback
  };

  return placeholderMap[field] || "Enter measurement";
}
