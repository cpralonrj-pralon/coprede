import { Module } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [LogbookController],
    providers: [LogbookService],
    exports: [LogbookService]
})
export class LogbookModule { }
