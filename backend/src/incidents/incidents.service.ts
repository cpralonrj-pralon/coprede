import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface IncidentPayload {
    id_mostra: string;
    nm_origem: string;
    nm_tipo?: string;
    nm_status?: string;
    dh_inicio?: string;
    ds_sumario?: string;
    nm_cidade?: string;
    topologia?: string;
    tp_topologia?: string;
    regional?: string;
    grupo?: string;
    cluster?: string;
    subcluster?: string;
    nm_cat_prod2?: string;
    nm_cat_prod3?: string;
    nm_cat_oper2?: string;
    nm_cat_oper3?: string;
    payload?: any;
}

@Injectable()
export class IncidentsService {
    private readonly logger = new Logger(IncidentsService.name);

    constructor(private readonly supabase: SupabaseService) { }

    async processBatch(payloads: IncidentPayload[]) {
        const stats = { processed: 0, inserted: 0, updated: 0, ignored: 0, deleted: 0, errors: 0 };
        const videoIdsByOrigin: Record<string, string[]> = {};

        // 1. Process Upserts & Collect IDs
        for (const data of payloads) {
            // Track IDs by origin for sync
            if (data.nm_origem && data.id_mostra) {
                if (!videoIdsByOrigin[data.nm_origem]) {
                    videoIdsByOrigin[data.nm_origem] = [];
                }
                videoIdsByOrigin[data.nm_origem].push(String(data.id_mostra));
            }

            try {
                const result = await this.upsertIncident(data);
                if (result.action === 'inserted') stats.inserted++;
                else if (result.action === 'updated') stats.updated++;
                else stats.ignored++;
            } catch (e) {
                this.logger.error(`Error processing incident ${data.id_mostra}: ${e.message}`);
                stats.errors++;
            }
            stats.processed++;
        }

        // 2. Cleanup Missing (Full Sync)
        for (const origin of Object.keys(videoIdsByOrigin)) {
            const activeIds = videoIdsByOrigin[origin];
            try {
                const deletedCount = await this.cleanupMissingIncidents(origin, activeIds);
                stats.deleted += deletedCount;
            } catch (cleanupError) {
                this.logger.error(`Error syncing deletions for ${origin}: ${cleanupError.message}`);
            }
        }

        // Log the batch execution
        this.logger.log(`Batch Sync Completed: ${stats.processed} processed, ${stats.inserted} new, ${stats.deleted} deleted.`);
        await this.logIngestion(stats, payloads.length);

        return stats;
    }

    private async cleanupMissingIncidents(origin: string, activeIds: string[]): Promise<number> {
        // Fetch all current IDs for this origin
        const { data: dbItems, error } = await this.supabase.client
            .from('incidents')
            .select('id, id_mostra')
            .eq('nm_origem', origin);

        if (error) throw error;
        if (!dbItems || dbItems.length === 0) return 0;

        // Find items in DB that are NOT in the active batch
        const toDelete = dbItems.filter(item => !activeIds.includes(String(item.id_mostra)));

        if (toDelete.length === 0) return 0;

        const idsToDelete = toDelete.map(i => i.id);

        // Perform Deletion
        const { error: deleteError } = await this.supabase.client
            .from('incidents')
            .delete()
            .in('id', idsToDelete);

        if (deleteError) throw deleteError;

        // Optional: Log deleted items to history
        // We do this fire-and-forget to not slow down response
        toDelete.forEach(item => {
            this.logHistory(item.id, 'STATUS', 'ACTIVE', 'DELETED_SYNC').catch(() => { });
        });

        return idsToDelete.length;
    }

    // Legacy method for single processing - wraps upsert
    async processIncident(data: IncidentPayload) {
        return this.upsertIncident(data);
    }

    private async upsertIncident(data: IncidentPayload) {
        const { id_mostra, nm_origem } = data;

        // 1. Fetch Existing
        const { data: existing, error: findError } = await this.supabase.client
            .from('incidents')
            .select('*')
            .eq('id_mostra', id_mostra)
            .eq('nm_origem', nm_origem)
            .maybeSingle();

        if (findError) throw findError;

        // 2. Insert if new
        if (!existing) {
            const { data: newInc, error: insertError } = await this.supabase.client
                .from('incidents')
                .insert({
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await this.logHistory(newInc.id, 'STATUS', 'N/A', newInc.nm_status || 'NEW');
            return { action: 'inserted', id: newInc.id };
        }

        // 3. Update if existing (smart diff)
        const updates: any = {};
        let hasChanges = false;
        const fieldsToCheck = [
            'nm_status', 'ds_sumario', 'nm_cidade', 'regional',
            'cluster', 'subcluster', 'nm_cat_prod2', 'nm_cat_prod3',
            'nm_cat_oper2', 'nm_cat_oper3', 'topologia', 'tp_topologia'
        ];

        for (const field of fieldsToCheck) {
            if (data[field] !== undefined && data[field] !== existing[field]) {
                updates[field] = data[field];
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            return { action: 'ignored', id: existing.id };
        }

        // Apply updates
        const { error: updateError } = await this.supabase.client
            .from('incidents')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (updateError) throw updateError;

        // 4. History Logging (Key fields only)
        if (updates.nm_status) {
            await this.logHistory(existing.id, 'nm_status', existing.nm_status, updates.nm_status);
        }
        if (updates.ds_sumario) {
            await this.logHistory(existing.id, 'ds_sumario', existing.ds_sumario, updates.ds_sumario);
        }

        return { action: 'updated', id: existing.id };
    }

    private async logHistory(incidentId: string, field: string, oldVal: string, newVal: string) {
        await this.supabase.client.from('incident_history').insert({
            incident_id: incidentId,
            campo_alterado: field,
            valor_anterior: oldVal,
            valor_novo: newVal,
            alterado_em: new Date().toISOString(),
            alterado_por: 'system_backend'
        });
    }

    private async logIngestion(stats: any, batchSize: number) {
        const status = stats.errors === 0 ? 'SUCCESS' : stats.errors < batchSize ? 'PARTIAL' : 'ERROR';

        await this.supabase.client.from('ingestion_logs').insert({
            source: 'n8n_webhook',
            status: status,
            batch_size: batchSize,
            inserted: stats.inserted,
            updated: stats.updated,
            errors: stats.errors,
            executed_at: new Date().toISOString()
        });
    }
}
