import { ProductCategory } from "../product.enum";
import { getConnection } from "typeorm";
import { Category } from "../entities/category.entity";

const categoryParentHash = {
    [ProductCategory.PHONES_TABLET]: [ProductCategory.ELECTRICAL_APPLIANCES],
    [ProductCategory.TVS]: [ProductCategory.ELECTRICAL_APPLIANCES],
    [ProductCategory.PRINTERS_PHOTOCOPIERS_SCANNERS]: [ProductCategory.ELECTRICAL_APPLIANCES],
    [ProductCategory.LAPTOPS_PCS]: [ProductCategory.ELECTRICAL_APPLIANCES],

    [ProductCategory.WATCHES]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.BELTS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.NECKLACES]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.CHAINS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.EAR_RINGS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.CHAINS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.RINGS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.BRACELETS]: ProductCategory.JEWELRY_ACCESSORIES,
    [ProductCategory.GLASSES]: ProductCategory.JEWELRY_ACCESSORIES,

    [ProductCategory.SHIRTS]: ProductCategory.CLOTHING,
    [ProductCategory.SKIRTS]: ProductCategory.CLOTHING,
    [ProductCategory.TROUSERS]: ProductCategory.CLOTHING,
    [ProductCategory.SHORTS]: ProductCategory.CLOTHING,
    [ProductCategory.LONG_SLEEVES]: ProductCategory.CLOTHING,
    [ProductCategory.SHORT_SLLEVES]: ProductCategory.CLOTHING,
    [ProductCategory.OVERALL]: ProductCategory.CLOTHING,
    [ProductCategory.OFFICE_WEAR]: ProductCategory.CLOTHING,
    [ProductCategory.SUITS]: ProductCategory.CLOTHING,
    [ProductCategory.TIES]: ProductCategory.CLOTHING,

    [ProductCategory.HEELS]: ProductCategory.FOOTWEAR,
    [ProductCategory.SLIPPERS]: ProductCategory.FOOTWEAR,
    [ProductCategory.SHOES]: ProductCategory.FOOTWEAR,
    [ProductCategory.SNEAKERS]: ProductCategory.FOOTWEAR,
    [ProductCategory.SANDALS]: ProductCategory.FOOTWEAR,

    [ProductCategory.UTENSILS]: ProductCategory.HOME_KITCHEN,
}


export async function initCategories() {
    const connection = getConnection();
    console.log('=============================================================');
    console.log('INIT CATEGORIES OPERATION. CONNECTION ESTABLISHED.');

    const exists = await connection.manager.find(Category);
    if (exists.length > 0) {
        console.log('OPERATION ENDED. CATEGORIES HAVE ALREADY BEEN INITIALISED.');
        console.log('=============================================================');
        return;
    }

    const categories: Category[] = [];
    for (const enumKey in ProductCategory) {
        const category = new Category();
        category.name = ProductCategory[enumKey];
        categories.push(category);
    }

    let savedCategories: Category[];
    await connection.transaction(async transactionalEntityManager => {
        console.log('EXECUTING DB TRANSACTION');
        savedCategories = await transactionalEntityManager.save(categories);

        for (const savedCategory of savedCategories) {
            savedCategory.parent = savedCategories.find(cat => {
                return cat.name === categoryParentHash[savedCategory.name];
            });
        }
        savedCategories = await transactionalEntityManager.save(savedCategories);
    });

    console.log('OPERATIONS COMPLETED');
    console.log('=============================================================\n\n\n');
    return savedCategories;
}
