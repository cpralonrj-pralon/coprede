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
        const stats = { processed: 0, inserted: 0, updated: 0, ignored: 0, errors: 0 };

        // Process sequentially to avoid race conditions on same ID within batch
        for (const data of payloads) {
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

        return stats;
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
}
