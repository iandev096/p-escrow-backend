import { EntitySubscriberInterface, RemoveEvent, Connection } from "typeorm";
import { ProductImage } from "../entities/product-image.entity";
import { Injectable } from "@nestjs/common";
import { ProductsService } from "../products.service";
import { InjectConnection } from "@nestjs/typeorm";

@Injectable()
export class ProductImageSubscriber implements EntitySubscriberInterface<ProductImage> {

    constructor(
        private productsService: ProductsService,
        @InjectConnection() private readonly connection: Connection
    ) {
        connection.subscribers.push(this);
    }

    /**
     * Indicates that this subscriber only listen to ProductImage events.
     */
    listenTo() {
        return ProductImage;
    }

    /**
     * Called before ProductImage insertion.
     */
    // Currently not working because I have set onCascade delete at the DB level.
    async beforeRemove(event: RemoveEvent<ProductImage>) {
        try {
            const productImage = event.entity;

            return await this.productsService.removeImageFromCloudinary(productImage.publicId);
        } catch (err) {
            throw new Error(err?.message ?? err);
        }

    }
}