import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Application name',
    example: 'My Application',
  })
  @IsNotEmpty()
  @IsString()
  application: string;

  @ApiProperty({
    description: 'Recipient email address',
    example: 'recipient@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to our service',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email body content',
    example: 'This is the email body content',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}

