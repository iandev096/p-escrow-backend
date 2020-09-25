import { Provider } from '@nestjs/common';
import * as CloudinaryLib from 'cloudinary';

export const CLOUDINARY = 'lib:cloudinary';
export type Cloudinary = typeof CloudinaryLib;

export const cloudinaryProvider: Provider<Cloudinary> = {
    provide: CLOUDINARY,
    useValue: CloudinaryLib
}