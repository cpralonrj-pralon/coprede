import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, ParseArrayPipe } from '@nestjs/common';
import { IncidentsService, IncidentPayload } from '../incidents/incidents.service';
import { IsString, IsOptional } from 'class-validator';
import { ApiKeyGuard } from '../auth/api-key.guard';

class CreateIncidentDto {
    @IsString()
    id_mostra: string;

    @IsString()
    nm_origem: string;

    @IsString()
    @IsOptional()
    nm_tipo?: string;

    @IsString()
    @IsOptional()
    nm_status?: string;

    @IsString()
    @IsOptional()
    dh_inicio?: string;

    @IsString()
    @IsOptional()
    ds_sumario?: string;

    @IsString()
    @IsOptional()
    nm_cidade?: string;

    @IsString()
    @IsOptional()
    topologia?: string;

    @IsString()
    @IsOptional()
    tp_topologia?: string;

    @IsString()
    @IsOptional()
    regional?: string;

    @IsString()
    @IsOptional()
    grupo?: string;

    @IsString()
    @IsOptional()
    cluster?: string;

    @IsString()
    @IsOptional()
    subcluster?: string;

    @IsOptional()
    payload?: any;

    @IsString()
    @IsOptional()
    nm_cat_prod2?: string;
    @IsString()
    @IsOptional()
    nm_cat_prod3?: string;
    @IsString()
    @IsOptional()
    nm_cat_oper2?: string;
    @IsString()
    @IsOptional()
    nm_cat_oper3?: string;
}

@Controller('ingestion')
@UseGuards(ApiKeyGuard)
export class IngestionController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Post('incident')
    async ingestBatch(
        @Body(new ParseArrayPipe({ items: CreateIncidentDto, optional: false }))
        body: CreateIncidentDto[],
    ) {
        try {
            const result = await this.incidentsService.processBatch(body as IncidentPayload[]);
            return {
                success: true,
                stats: result
            };
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: error.message || 'Error processing batch',
            }, HttpStatus.BAD_REQUEST);
        }
    }

    // Fallback for singular calls if needed
    @Post('incident/single')
    async ingestSingle(@Body() dto: CreateIncidentDto) {
        const result = await this.incidentsService.processBatch([dto as IncidentPayload]);
        return { success: true, stats: result };
    }
}
