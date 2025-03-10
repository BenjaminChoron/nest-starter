import { InvalidEmailException } from '../../../shared/application/exceptions/invalid-email.exception';
import { Email } from './email.value-object';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@domain.com',
        'user@subdomain.domain.com',
        '123@domain.com',
        'user@domain-with-dash.com',
      ];

      validEmails.forEach((email) => {
        expect(() => new Email(email)).not.toThrow();
        const emailVO = new Email(email);
        expect(emailVO.getValue()).toBe(email.toLowerCase());
      });
    });

    it('should throw InvalidEmailException for invalid emails', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user@domain',
        'user@.com',
        'user@domain..com',
        'user name@domain.com',
        'user@domain.c',
        'user@-domain.com',
        'user@domain-.com',
      ];

      invalidEmails.forEach((email) => {
        expect(() => new Email(email)).toThrow(InvalidEmailException);
      });
    });

    it('should normalize email to lowercase', () => {
      const mixedCaseEmail = 'User.Name@Domain.Com';
      const emailVO = new Email(mixedCaseEmail);
      expect(emailVO.getValue()).toBe(mixedCaseEmail.toLowerCase());
    });
  });

  describe('equals', () => {
    it('should return true for same email with different case', () => {
      const email1 = new Email('user@domain.com');
      const email2 = new Email('USER@DOMAIN.COM');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('user1@domain.com');
      const email2 = new Email('user2@domain.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it('should return true when comparing to itself', () => {
      const email = new Email('user@domain.com');
      expect(email.equals(email)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the email string value', () => {
      const emailString = 'test@example.com';
      const email = new Email(emailString);
      expect(email.toString()).toBe(emailString);
    });
  });
});
