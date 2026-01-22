import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { IncidentsModule } from './incidents/incidents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SupabaseModule,
        IncidentsModule,
        SupabaseModule,
        IncidentsModule,
        IngestionModule,
    ],
    controllers: [AppController],
})
export class AppModule { }
