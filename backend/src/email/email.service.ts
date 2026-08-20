import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private config: ConfigService) {
    this.fromAddress = this.config.get<string>('email.from')!;
    const host = this.config.get<string>('email.host');
    const user = this.config.get<string>('email.user');
    const pass = this.config.get<string>('email.pass');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('email.port'),
        secure: this.config.get<number>('email.port') === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP credentials not set — emails will be logged instead of delivered. ' +
          'Set SMTP_HOST / SMTP_USER / SMTP_PASS to send real emails.',
      );
    }
  }

  async sendTaskCreatedEmail(to: string, name: string, taskTitle: string): Promise<void> {
    await this.send(
      to,
      `Task created: ${taskTitle}`,
      `<p>Hi ${escapeHtml(name)},</p><p>Your task <strong>${escapeHtml(taskTitle)}</strong> has been created successfully.</p>`,
    );
  }

  async sendTaskCompletedEmail(to: string, name: string, taskTitle: string): Promise<void> {
    await this.send(
      to,
      `Task completed: ${taskTitle}`,
      `<p>Hi ${escapeHtml(name)},</p><p>Nice work — your task <strong>${escapeHtml(taskTitle)}</strong> has been marked as done.</p>`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[email skipped, no SMTP config] to=${to} subject="${subject}"`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
      this.logger.log(`Email sent to ${to}: "${subject}"`);
    } catch (err) {
      // Email failures should never break the task create/update flow.
      this.logger.error(
        `Failed to send email to ${to}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
