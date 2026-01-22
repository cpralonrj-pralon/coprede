import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
    public client: SupabaseClient;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const supabaseUrl = this.configService.get<string>('VITE_SUPABASE_URL');
        // Backend uses SERVICE ROLE KEY for writes
        const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase URL or Service Role Key not found in environment variables');
        }

        this.client = createClient(supabaseUrl, supabaseServiceKey);
        console.log('Supabase Client Initialized with Service Role');
    }
}
