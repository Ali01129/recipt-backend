import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplate } from './templates/email.template';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('Resend API key is not configured. Please set RESEND_API_KEY in your .env file.');
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(dto: SendEmailDto) {
    try {
      const { application, to, subject, body } = dto;
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to,
        subject,
        text: EmailTemplate.generateText(application, subject, body),
        html: EmailTemplate.generateHtml(application, subject, body),
      });

      if (error) throw new Error(error.message || 'Failed to send email');

      this.logger.log(`Email sent to ${to}. Message ID: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

