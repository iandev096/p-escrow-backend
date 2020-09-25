/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, Inject } from '@nestjs/common';
import { CLOUDINARY, Cloudinary } from './cloudinary.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
    constructor(
        @Inject(CLOUDINARY)
        private cloudinary: Cloudinary,
        private configService: ConfigService
    ) { }

    initialize() {
        const config  = {
            cloud_name: this.configService.get<string>('cloudinary.cloudName'),
            api_key: this.configService.get<string>('cloudinary.apiKey'),
            api_secret: this.configService.get<string>('cloudinary.apiSecret'),
        }
        this.cloudinary.v2.config(config);
    }
}
