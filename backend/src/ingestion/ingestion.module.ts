import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
    imports: [IncidentsModule],
    controllers: [IngestionController],
})
export class IngestionModule { }
