import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS first (best practice)
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Increase Payload Limit for Bulk Ingestion
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // Enable Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true, // strip properties not in DTO
    }));

    const port = process.env.PORT || 3000;
    // Listen on all interfaces (IPv4 and IPv6)
    // Removing explicit '0.0.0.0' allows Node to bind to :: which often supports both
    await app.listen(port);
    console.log(`Backend running on port ${port}`);
}
bootstrap();
