import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from './templates/email.template';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const gmailUser = this.configService.get<string>('GMAIL_USER');
      const gmailPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

      if (!gmailUser || !gmailPassword) {
        throw new Error(
          'Gmail credentials are not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.',
        );
      }

      // Use port 465 with SSL - more reliable in cloud environments
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        pool: false,
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      } as nodemailer.TransportOptions);
    }

    return this.transporter;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      this.logger.log('Email transporter is ready to send messages');
      return true;
    } catch (error) {
      this.logger.error('Email transporter verification failed:', error);
      return false;
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { application, to, subject, body } = sendEmailDto;

      const transporter = this.getTransporter();
      const gmailUser = this.configService.get<string>('GMAIL_USER');

      const htmlContent = EmailTemplate.generateHtml(application, subject, body);
      const textContent = EmailTemplate.generateText(application, subject, body);

      const mailOptions = {
        from: gmailUser,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${sendEmailDto.to}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

