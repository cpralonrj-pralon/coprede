import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';

@Controller('logbook')
export class LogbookController {
    constructor(private readonly logbookService: LogbookService) { }

    @Get()
    findAll(
        @Query('categoria') categoria?: string,
        @Query('status') status?: string,
        @Query('dataInicio') dataInicio?: string,
        @Query('dataFim') dataFim?: string,
    ) {
        return this.logbookService.findAll({
            categoria,
            status,
            dataInicio,
            dataFim
        });
    }

    @Get('categories')
    getCategories() {
        return this.logbookService.getCategories();
    }

    @Get('analytics')
    getAnalytics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.logbookService.getAnalytics(startDate, endDate);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.logbookService.findOne(id);
    }

    @Post()
    create(@Body() createLogbookDto: CreateLogbookDto, @Request() req: any) {
        // Get userId from authentication, leave undefined if not authenticated
        const userId = req.user?.id;
        return this.logbookService.create(createLogbookDto, userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateLogbookDto: UpdateLogbookDto,
        @Request() req: any
    ) {
        const userId = req.user?.id;
        return this.logbookService.update(id, updateLogbookDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        const userId = req.user?.id;
        return this.logbookService.remove(id, userId);
    }
}
