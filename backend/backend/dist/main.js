import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    });
    await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
//# sourceMappingURL=main.js.map