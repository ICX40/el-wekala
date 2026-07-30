export interface SubCategory {
  title: string;
  items: string[];
}

export interface MegaCategory {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export const megaMenuData: MegaCategory[] = [
  {
    id: "1",
    name: "الإلكترونيات",
    subCategories: [
      { title: "الموبايلات والإكسسوارات", items: ["iPhones", "Premium Androids", "Budget Smartphones", "Tablets", "Headsets & Speakers", "Wearables", "Power Banks", "Chargers"] },
      { title: "اللابتوب والإكسسوارات", items: ["MacBooks", "Gaming Laptops", "Monitors", "Printers", "Storage Devices", "Input Devices"] },
      { title: "مستلزمات الجيمنج", items: ["Gaming Consoles", "Gaming Accessories", "Video Games", "Gaming Monitors", "Digital Cards"] },
      { title: "التلفزيونات وأجهزة الترفيه", items: ["LED", "QLED", "OLED", "4K", "8K", "Projectors", "Soundbars", "Streaming Devices"] },
      { title: "الكاميرات", items: ["Action Cameras", "DSLR Cameras", "Surveillance Cameras", "Instant Cameras", "Camera Accessories"] }
    ]
  },
  {
    id: "2",
    name: "أزياء نسائية",
    subCategories: [
      { title: "الملابس", items: ["Tops", "Dresses", "Pants", "Head Scarves", "Jeans", "Bodysuits"] },
      { title: "الملابس الرياضية", items: ["Tops", "Leggings", "Shorts", "Sport Bras", "Sport Shoes", "Sneakers"] },
      { title: "الأحذية", items: ["Sports Shoes", "Sneakers", "Sandals", "Heels", "Flats", "Boots", "Flip Flops"] },
      { title: "الحقائب والإكسسوارات", items: ["Totes", "Shoulder Bags", "Cross-body Bags", "Wallets", "Jewelry", "Eyewear", "Watches"] }
    ]
  },
  {
    id: "3",
    name: "أزياء رجالية",
    subCategories: [
      { title: "الملابس", items: ["Shirts", "Polos", "Pants", "Jeans", "Sportswear"] },
      { title: "الملابس الرياضية", items: ["Tops", "Jackets", "Bottoms", "Sport Shoes", "Sneakers", "Track Pants"] },
      { title: "الأحذية", items: ["Sports Shoes", "Sneakers", "Football Shoes", "Boots", "Flip Flops", "Slides"] },
      { title: "الحقائب والإكسسوارات", items: ["Backpacks", "Wallets", "Luggage", "Jewelry", "Belts", "Watches", "Eyewear"] }
    ]
  },
  {
    id: "4",
    name: "أزياء الأطفال",
    subCategories: [
      { title: "ملابس البنات", items: ["Tops", "Pants", "Clothing Sets", "Dresses", "Sportswear", "Jackets & Outerwear"] },
      { title: "ملابس الأولاد", items: ["Tops", "Pants", "Clothing Sets", "Sweaters", "Sportswear", "Jackets & Outerwear"] },
      { title: "أزياء الأطفال (عام)", items: ["Footwear", "Sports Shoes", "Sneakers", "Accessories", "Backpacks"] }
    ]
  },
  {
    id: "5",
    name: "الجمال والعطور",
    subCategories: [
      { title: "المكياج", items: ["Mascaras", "Foundations", "Blushers and Bronzers", "Eyeshadow", "Lip Glosses", "Makeup Brushes", "Makeup Removers", "Concealer"] },
      { title: "العناية بالبشرة", items: ["Moisturizers", "Suncare", "Bath & Body", "Cleansers", "Toners", "Treatments & Serums", "Eye Serums & Creams"] },
      { title: "العناية بالشعر", items: ["Shampoos", "Conditioners", "Hair Masks", "Hair Oils & Serums", "Hair Color", "Professional Range", "Hair Accessories"] },
      { title: "أدوات تصفيف الشعر", items: ["Hair Dryers", "Hair Straighteners", "Hair Curling Irons", "Hair Rollers", "Hair Brushes"] },
      { title: "العناية للرجال", items: ["Razors & Blades", "Shaving Creams", "Shampoos & Shower", "Face Wash & After-shave", "Beard Care"] }
    ]
  },
  {
    id: "6",
    name: "المنزل والأجهزة",
    subCategories: [
      { title: "المطبخ وغرفة الطعام", items: ["Cookware", "Storage & Organisation", "Dinnerware & Serveware", "Kitchen Accessories", "Flatware & Cutlery", "Bakeware", "Drinkware", "Water Coolers & Filters"] },
      { title: "الأثاث", items: ["Coffee Tables & Side", "Gaming Chairs", "Bean Bags", "Home Office Furniture", "Mattresses", "Entryway Furniture", "Sofas & Couches"] },
      { title: "الأدوات وتحسين المنزل", items: ["Power Tools", "Hand Tools", "Cleaning Supplies", "Bathroom & Kitchen", "Home Organisation", "Laundry Care", "Safety & Security", "Electrical & Lighting"] },
      { title: "ديكور المنزل", items: ["Lighting", "Mats & Carpets", "Vases", "Mirrors", "Window Treatments", "Clocks", "Decor Accents"] },
      { title: "الحمام والمفارش", items: ["Towels", "Pillows", "Blankets & Throws", "Sheets & Pillowcases", "Duvet Covers", "Bath Robes", "Bathroom Storage", "Mattress Protectors"] }
    ]
  },
  {
    id: "7",
    name: "المواليد",
    subCategories: [
      { title: "أساسيات المواليد", items: ["Diaper Necessities", "Skin & Bath Care", "Nursing & Feeding", "Car Seats & Strollers", "Baby Clothing", "Safety Equipment", "Local Brands"] },
      { title: "أساسيات الإطعام", items: ["Breast Pumps", "Feeding Bottles", "Pacifiers & Teethers", "Highchairs & Boosters", "Toddler Feeding", "Baby Food"] },
      { title: "العناية بالطفل", items: ["Diapers", "Wipes", "Diaper Bags", "Hair & Body Care", "Grooming & Health", "Potty Training"] },
      { title: "غرف نوم الأطفال", items: ["Bouncers & Rockers", "Baby Furniture", "Baby Bedding", "Changing Mats"] },
      { title: "معدات السفر", items: ["Strollers", "Car Seats", "Travel Systems", "Carrier and Slings", "Diaper Bags & Organizers"] }
    ]
  },
  {
    id: "8",
    name: "ألعاب وتسالي",
    subCategories: [
      { title: "ألعاب الأطفال", items: ["Toys for Girls", "Toys for Boys", "Party Supplies", "Dressing Up Costumes", "Novelty Toys", "Figure & Statues", "Baby & Toddler Toys"] },
      { title: "اللعب في الخارج", items: ["Pools & Water Play", "Blasters & Foam Play", "Trampoline & Inflatables", "Play Tents & Tunnels", "Kids' Scooters", "Remote Control Toys"] },
      { title: "الألعاب الداخلية", items: ["Puzzles", "Card & Board Games", "Educational Toys", "Pretend Play", "Arts & Crafts", "Dolls & Accessories", "Building Toys", "Stuffed & Plush Toys"] }
    ]
  },
  {
    id: "9",
    name: "سوبر ماركت",
    subCategories: [
      { title: "العناية المنزلية والتنظيف", items: ["Household Cleaners", "Laundry Care", "Air Fresheners", "Paper, Elastic & Wraps"] },
      { title: "المشروبات", items: ["Tea", "Coffee", "Soft Drinks", "Energy Drinks", "Juices", "Water", "Drink Mixes"] },
      { title: "المعلبات والصلصات", items: ["Oils, Ghee & Salad Dressings", "Canned & Jarred Food", "Condiments & Sauces", "Pasta & Noodles", "Pickles & Olives"] },
      { title: "الأعشاب والتوابل", items: ["Salt & Salt Substitutes", "Herbs & Seasoning", "Powdered Spices", "Whole Spices", "Blended Masalas", "Cooking Pastes"] },
      { title: "الطبخ والمخبوزات", items: ["Flours", "Sugar & Sweeteners", "Baking Mixing Yeasts", "Condensed & Powdered Milk", "Dessert Mixes", "Pudding & Gelatin"] }
    ]
  },
  {
    id: "10",
    name: "السيارات",
    subCategories: [
      { title: "الزيوت والسوائل", items: ["Engine Oils", "Transmission Oils", "Multipurpose Grease", "Fuel System Cleaner", "Brake Fluids", "Octane Booster", "Coolants"] },
      { title: "الإكسسوارات الداخلية", items: ["Consoles & Organizers", "Car Chargers", "Seat Covers", "Air Fresheners", "Steering Wheels", "Floor Mats & Cargo", "Repair Tools", "Tyres"] },
      { title: "الإكسسوارات الخارجية", items: ["Decals & Bumper Stickers", "Lights & Lighting", "Towing & Winching", "Full Car Covers", "Safety"] },
      { title: "العناية بالسيارة", items: ["Tools & Equipment", "Exterior Care", "Interior Care", "Finishing", "Jump Starter Batteries", "Tyre Inflators"] },
      { title: "إلكترونيات السيارات", items: ["Car Video", "Car Audio", "Dash Cameras", "Vehicle GPS"] }
    ]
  },
  {
    id: "11",
    name: "الصحة والتغذية",
    subCategories: [
      { title: "الفيتامينات والمكملات", items: ["Hair, Skin & Nails", "Multivitamins", "Sports Supplements"] },
      { title: "الصحة الجنسية", items: ["Family Planning", "Lubricants"] },
      { title: "أجهزة المراقبة الصحية", items: ["Body Scale Monitors", "Thermometers", "Blood Glucose Monitors", "Heart Rate Monitors"] },
      { title: "التدليك والاسترخاء", items: ["Massage Guns", "Massage Oils", "Massage Rollers", "Hot Water Bags", "Massage Pillows"] }
    ]
  },
  {
    id: "12",
    name: "الرياضة والخارج",
    subCategories: [
      { title: "التمرين واللياقة", items: ["Accessories", "Running & Training", "Fitness & Strength", "Exercise Machines", "Cardio Machines", "Yoga", "Combat Sports", "Water Sports"] },
      { title: "الرياضات الجماعية", items: ["Football", "Basketball", "Baseball", "Volleyball", "Handball", "Boxing"] },
      { title: "رياضات المضرب", items: ["Tennis", "Table Tennis", "Squash", "Padel"] },
      { title: "ركوب الدراجات", items: ["Accessories", "Protective Gear", "Bikes"] },
      { title: "ألواح التزلج والسكوتر", items: ["Scooters", "Inline & Roller Skating", "Skateboarding", "Protective Gear"] }
    ]
  },
  {
    id: "13",
    name: "قرطاسية ومكتب",
    subCategories: [
      { title: "الورق", items: ["Notebooks", "Card Stock", "Sticky Notes", "Copy & Multipurpose", "Calendars, Planners"] },
      { title: "التعليم والحرف", items: ["Arts & Crafts Supplies", "Adhesives", "Social Studies Materials"] },
      { title: "إكسسوارات المكتب", items: ["Pencil Cases", "Pencil Holders", "Card Files", "Desk Supplies"] },
      { title: "أدوات الكتابة والتصحيح", items: ["Pens & Refills", "Pencils", "Markers & Highlighters", "Erasers & Correction", "Pencil Sharpeners"] },
      { title: "إلكترونيات المكتب", items: ["Printer Accessories", "Printers", "Calculators", "Telephones", "Cash Registers"] }
    ]
  }
];