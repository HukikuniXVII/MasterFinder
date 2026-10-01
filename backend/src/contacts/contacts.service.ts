import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Contact,
  ContactInput,
  ContactPage,
} from './contact.model.js';
import { ContactsRepository } from './contacts.repository.js';

@Injectable()
export class ContactsService {
  constructor(private readonly contacts: ContactsRepository) {}

  findPage(page: number, limit: number): ContactPage {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 8;
    return this.contacts.findPage(safePage, safeLimit);
  }

  create(input: ContactInput): Contact {
    return this.contacts.create(this.validate(input));
  }

  update(id: number, input: ContactInput): Contact {
    this.requireContact(id);
    return this.contacts.update(id, this.validate(input));
  }

  remove(id: number): { deleted: true } {
    this.requireContact(id);
    this.contacts.delete(id);
    return { deleted: true };
  }

  private requireContact(id: number): Contact {
    const contact = this.contacts.findById(id);
    if (!contact) throw new NotFoundException('Contact not found.');
    return contact;
  }

  private validate(input: ContactInput): ContactInput {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Contact details are required.');
    }

    const firstName = this.clean(input.firstName);
    const lastName = this.clean(input.lastName);
    const email = this.clean(input.email).toLowerCase();
    const phone = this.clean(input.phone);

    if (!firstName || !lastName || !email || !phone) {
      throw new BadRequestException('All contact fields are required.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Enter a valid email address.');
    }
    if (phone.length > 32) {
      throw new BadRequestException('Phone number must be 32 characters or fewer.');
    }

    return { firstName, lastName, email, phone };
  }

  private clean(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}