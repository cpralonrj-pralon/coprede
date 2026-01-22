import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return 'Backend is ON! 🚀';
    }

    @Get('health')
    getHealth(): string {
        return 'OK';
    }
}
