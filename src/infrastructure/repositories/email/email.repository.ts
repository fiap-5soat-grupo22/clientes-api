import { Inject, Injectable } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { APIResponse } from 'mailersend/lib/services/request.service';

export interface Email {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailRepository {
  @Inject()
  private readonly mailerSend: MailerSend;

  async send(email: Email): Promise<boolean> {
    const sentFrom = new Sender(
      process.env.EMAIL_PROVIDER_ADDRESS_FROM,
      'Grupo 22 SOAT',
    );

    const recipients = [new Recipient(email.to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(email.subject)
      .setHtml(email.html);

    const response: APIResponse =
      await this.mailerSend.email.send(emailParams);

    console.info('sent email response BODY', JSON.stringify(response));

    return response.statusCode == 200 ? true : false;
  }
}
