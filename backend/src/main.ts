import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Increase Payload Limit for Bulk Ingestion
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // Enable Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true, // strip properties not in DTO
    }));

    // Enable CORS for frontend
    app.enableCors();

    await app.listen(3000, '0.0.0.0');
    console.log('Backend running on http://localhost:3000');
}
bootstrap();
