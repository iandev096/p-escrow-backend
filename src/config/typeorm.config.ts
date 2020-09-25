import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const devTypeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'ecommerce',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
    synchronize: true
}

const prodTypeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    subscribers: [__dirname + '/../**/*.subscriber.{js,ts}'],
    synchronize: true
}

export const typeOrmConfig = process.env.DATABASE_URL ?
    prodTypeOrmConfig : devTypeOrmConfig;