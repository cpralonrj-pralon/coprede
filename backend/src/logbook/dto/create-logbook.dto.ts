import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateLogbookDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    titulo: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
    data: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Horário deve estar no formato HH:MM ou HH:MM:SS' })
    horario: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    categoria: string;

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsString()
    @IsOptional()
    impacto?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    status?: string;
}
