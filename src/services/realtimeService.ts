import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../apiService';

type RealtimeCallback = (payload: any) => void;

class RealtimeManager {
    private channel: RealtimeChannel | null = null;
    private subscribers: RealtimeCallback[] = [];

    constructor() { }

    public subscribeToIncidents(callback: RealtimeCallback) {
        this.subscribers.push(callback);

        if (!this.channel) {
            console.log('🔗 Connecting to Realtime...');
            this.channel = supabase
                .channel('schema-db-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: 'incidents',
                    },
                    (payload) => {
                        console.log('⚡ Realtime Event:', payload);
                        this.notifySubscribers(payload);
                    }
                )
                .subscribe((status) => {
                    console.log('Realtime Status:', status);
                });
        }
    }

    public unsubscribe(callback: RealtimeCallback) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);

        if (this.subscribers.length === 0 && this.channel) {
            console.log('🔌 Disconnecting Realtime...');
            this.channel.unsubscribe();
            this.channel = null;
        }
    }

    private notifySubscribers(payload: any) {
        this.subscribers.forEach(callback => callback(payload));
    }
}

export const realtimeService = new RealtimeManager();
