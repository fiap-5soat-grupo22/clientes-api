import { Test, TestingModule } from '@nestjs/testing';
import { EmailRepository } from './email.repository';
import { MailerSend, EmailParams } from 'mailersend';

describe('EmailRepository', () => {
  let emailRepository: EmailRepository;
  const mailerSendMock = {
    email: { 
      send: jest.fn(), 
    }
  }

  beforeEach(async () => {


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailRepository,
        { provide: MailerSend, useValue: mailerSendMock }, // Provide the mock
      ],
    }).compile();

    emailRepository = module.get<EmailRepository>(EmailRepository);
  });

  it('should send an email successfully', async () => {
    const email = {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email.</p>',
    };

    const mockResponse = { statusCode: 200 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    mailerSendMock.email.send.mockReturnValue(mockResponse)

    const result = await emailRepository.send(email);

    expect(result).toBe(true);

  });

  it('should handle email sending error', async () => {
    const email = {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email.</p>',
    };

    const mockResponse = { statusCode: 500 };
    mailerSendMock.email.send.mockResolvedValue(mockResponse as any);

    const result = await emailRepository.send(email);

    expect(result).toBe(false);
    expect(mailerSendMock.email.send).toHaveBeenCalledWith(
      expect.any(EmailParams),
    );
  });
});

