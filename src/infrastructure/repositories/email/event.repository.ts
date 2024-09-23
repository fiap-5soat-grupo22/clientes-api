import { Injectable } from '@nestjs/common';
import { ClientResponse, MailService } from '@sendgrid/mail';

export interface Email {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailRepository {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
    this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(email: Email): Promise<boolean> {
    const response: [ClientResponse, object] = await this.mailService.send({
      from: process.env.SENDGRID_TO_EMAIL,
      to: email.to,
      cc: 'dcleme17@gmail.com',
      subject: email.subject,
      html: email.html,
    });

    return response[0].statusCode == 201 ? true : false;
  }
}
