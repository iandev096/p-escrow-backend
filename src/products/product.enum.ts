export enum ProductCategory {
    // Top level Categories
    ELECTRICAL_APPLIANCES = 'Electrical_Appliances',
    CLOTHING = 'Clothing',
    JEWELRY_ACCESSORIES = 'Jewelry_and_Accessories',
    FOOTWEAR = 'Footwear',
    TOOLS_EQUIPMENTS = 'Tools_and_Equipments',
    HOME_KITCHEN = 'Home_and_KItchen',
    BOOKS = 'Books',

    // Stand alone Categories
    MEN = 'Men',
    WOMEN = 'Women',
    UNISEX = 'Unisex',
    KIDS = 'Kids',

    // ELECTRICAL_APPLIANCES child categories
    PHONES_TABLET = 'Phones_and_Tablets',
    TVS = 'TVs',
    PRINTERS_PHOTOCOPIERS_SCANNERS = 'Printers,_Photocopiers_and_Scanners',
    LAPTOPS_PCS = 'Laptops_and_PCs',

    // JEWELRY_ACCESSORIES child categories
    WATCHES = 'Watches',
    BELTS = 'Belts',
    NECKLACES = 'Necklaces',
    CHAINS = 'Chains',
    EAR_RINGS = 'Ear_rings',
    RINGS = 'Rings',
    BRACELETS = 'Bracelets',
    GLASSES = 'Glasses',

    // CLOTHING child categories
    SHIRTS = 'Shirts',
    SKIRTS = 'Skirts',
    TROUSERS = 'Trousers',
    SHORTS = 'Shorts',
    LONG_SLEEVES = 'Long_Sleeves',
    SHORT_SLLEVES = 'Short_Sleeves',
    OVERALL = 'Overall',
    OFFICE_WEAR = 'Office_Wear',
    SUITS = 'Suits',
    TIES = 'Ties',

    // FOOTWEAR child categories
    HEELS = 'Heels',
    SLIPPERS = 'Slippers',
    SHOES = 'Shoes',
    SNEAKERS = 'Sneakers',
    SANDALS = 'Sandals',

    // HOME_KITCHEN
    UTENSILS = 'Utensils'
}

export enum ProductStatus {
    // the default status of a product
    AVAILABLE = 'Available',

    // a product becomes NOT_AVAILABLE after a period of inactivity 
    // or as a result of some condition in the user's subscription.
    // or as a result of the product being ordered
    NOT_AVAILABLE = 'Not_Available',
    
    // a product becomes SOLD when it is sold
    SOLD = 'Sold',

    // a product becomes REMOVED when it is removed by its owner
    REMOVED = 'Removed'
}