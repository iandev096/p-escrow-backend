import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initCategories } from './products/scripts/init-product-categories'
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use((req, res, next) => {
    process.on('unhandledRejection', function(err) {
      console.log('[unhandledRejection]', err);
    })
    next();
  });

  const configService = app.get(ConfigService);
  const port = process.env.port ?? configService.get('PORT');
  await app.listen(port);
}
bootstrap().then(() => {
  
  initCategories()
      .then()
      .catch(err => console.log(err.message));

});
