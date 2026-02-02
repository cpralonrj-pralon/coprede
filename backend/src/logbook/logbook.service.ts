import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { LogbookEntry } from './entities/logbook.entity';

@Injectable()
export class LogbookService {
    private readonly logger = new Logger(LogbookService.name);

    constructor(private readonly supabase: SupabaseService) { }

    async findAll(filters?: {
        categoria?: string;
        status?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<LogbookEntry[]> {
        let query = this.supabase.client
            .from('diario_bordo')
            .select('*')
            .order('data', { ascending: false })
            .order('horario', { ascending: false });

        if (filters?.categoria) {
            query = query.eq('categoria', filters.categoria);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.dataInicio) {
            query = query.gte('data', filters.dataInicio);
        }

        if (filters?.dataFim) {
            query = query.lte('data', filters.dataFim);
        }

        const { data, error } = await query;

        if (error) {
            this.logger.error(`Error fetching logbook entries: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async findOne(id: string): Promise<LogbookEntry> {
        const { data, error } = await this.supabase.client
            .from('diario_bordo')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            this.logger.error(`Error fetching logbook entry ${id}: ${error.message}`);
            throw new NotFoundException(`Logbook entry with ID ${id} not found`);
        }

        return data;
    }

    async create(createLogbookDto: CreateLogbookDto, userId?: string): Promise<LogbookEntry> {
        const insertData: any = {
            ...createLogbookDto,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: createLogbookDto.status || 'Aberto'
        };

        // Only add created_by if userId is provided
        if (userId) {
            insertData.created_by = userId;
        }

        const { data, error } = await this.supabase.client
            .from('diario_bordo')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating logbook entry: ${error.message}`);
            throw error;
        }

        this.logger.log(`Logbook entry created: ${data.id} - ${data.titulo}`);
        return data;
    }

    async update(id: string, updateLogbookDto: UpdateLogbookDto, userId?: string): Promise<LogbookEntry> {
        // First check if the entry exists
        const existing = await this.findOne(id);

        // Only check ownership if userId is provided
        if (userId && existing.created_by && existing.created_by !== userId) {
            throw new Error('Unauthorized: You can only update your own entries');
        }

        const { data, error } = await this.supabase.client
            .from('diario_bordo')
            .update({
                ...updateLogbookDto,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error updating logbook entry ${id}: ${error.message}`);
            throw error;
        }

        this.logger.log(`Logbook entry updated: ${id}`);
        return data;
    }

    async remove(id: string, userId?: string): Promise<void> {
        // First check if the entry exists
        const existing = await this.findOne(id);

        // Only check ownership if userId is provided
        if (userId && existing.created_by && existing.created_by !== userId) {
            throw new Error('Unauthorized: You can only delete your own entries');
        }

        const { error } = await this.supabase.client
            .from('diario_bordo')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error(`Error deleting logbook entry ${id}: ${error.message}`);
            throw error;
        }

        this.logger.log(`Logbook entry deleted: ${id}`);
    }

    async getCategories(): Promise<string[]> {
        const { data, error } = await this.supabase.client
            .from('diario_bordo')
            .select('categoria')
            .order('categoria');

        if (error) {
            this.logger.error(`Error fetching categories: ${error.message}`);
            throw error;
        }

        // Get unique categories
        const categories = [...new Set(data.map(item => item.categoria))];
        return categories;
    }

    async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
        const now = new Date();
        const defaultEndDate = now.toISOString().split('T')[0];
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];

        let query = this.supabase.client
            .from('diario_bordo')
            .select('*')
            .gte('data', startDate || defaultStartDate)
            .lte('data', endDate || defaultEndDate);

        const { data, error } = await query;

        if (error) {
            this.logger.error(`Error fetching analytics: ${error.message}`);
            throw error;
        }

        // Aggregate by day
        const byDay: Record<string, number> = {};
        // Aggregate by month
        const byMonth: Record<string, number> = {};
        // Aggregate by category
        const byCategory: Record<string, number> = {};
        // Aggregate by status
        const byStatus: Record<string, number> = {};

        data.forEach(entry => {
            // By day
            const day = entry.data;
            byDay[day] = (byDay[day] || 0) + 1;

            // By month (YYYY-MM)
            const month = entry.data.substring(0, 7);
            byMonth[month] = (byMonth[month] || 0) + 1;

            // By category
            byCategory[entry.categoria] = (byCategory[entry.categoria] || 0) + 1;

            // By status
            byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
        });

        return {
            total: data.length,
            byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
            byMonth: Object.entries(byMonth).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
            byCategory: Object.entries(byCategory).map(([categoria, count]) => ({ categoria, count })).sort((a, b) => b.count - a.count),
            byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count }))
        };
    }
}
