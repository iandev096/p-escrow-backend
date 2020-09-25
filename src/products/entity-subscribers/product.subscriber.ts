import { EntitySubscriberInterface, Connection, InsertEvent, UpdateEvent } from "typeorm";
import { Product } from '../entities/product.entity';
import { InjectConnection } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {

    constructor(
        @InjectConnection() private readonly connection: Connection
    ) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return Product;
    }

    afterInsert(event: InsertEvent<Product>) {
        const product = event.entity;
        this.generatePriceTobePaid(product);
    }

    async beforeUpdate(event: UpdateEvent<Product>) {
        const updatedColumns = event.updatedColumns;
        let shouldUpdate = false;
        for (const column of updatedColumns) {
            if (
                column.propertyName === 'actualPrice' ||
                column.propertyName === 'priceDiscount'
            ) {
                shouldUpdate = true;
                break;
            }
        }
        if (shouldUpdate) {
            const product = event.entity;
            this.generatePriceTobePaid(product);
        }
    }

    generatePriceTobePaid(product: Product) {
        product.priceTobePaid = product.price - product.priceDiscount;
        this.connection.manager.save(product);
    }
}