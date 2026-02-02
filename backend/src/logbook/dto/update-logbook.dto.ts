import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateLogbookDto {
    @IsString()
    @IsOptional()
    @MaxLength(200)
    titulo?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
    data?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Horário deve estar no formato HH:MM ou HH:MM:SS' })
    horario?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    categoria?: string;

    @IsString()
    @IsOptional()
    descricao?: string;

    @IsString()
    @IsOptional()
    impacto?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    status?: string;
}
