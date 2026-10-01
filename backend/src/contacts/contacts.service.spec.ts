import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContactsRepository } from './contacts.repository.js';
import { ContactsService } from './contacts.service.js';

describe('ContactsService', () => {
  const repository = {
    findPage: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const service = new ContactsService(
    repository as unknown as ContactsRepository,
  );

  beforeEach(() => vi.clearAllMocks());

  it('clamps pagination to a safe page size', () => {
    repository.findPage.mockReturnValue({ data: [], total: 0, page: 1, limit: 100 });

    service.findPage(-2, 500);

    expect(repository.findPage).toHaveBeenCalledWith(1, 100);
  });

  it('normalizes contact fields before saving', () => {
    repository.create.mockImplementation((input) => ({ id: 1, ...input }));

    const contact = service.create({
      firstName: '  Ada ',
      lastName: ' Lovelace  ',
      email: ' ADA@example.test ',
      phone: ' 555-0100 ',
    });

    expect(contact).toEqual({
      id: 1,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.test',
      phone: '555-0100',
    });
  });

  it('rejects invalid email addresses', () => {
    expect(() =>
      service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'not-an-email',
        phone: '555-0100',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects updates for missing contacts', () => {
    repository.findById.mockReturnValue(undefined);

    expect(() =>
      service.update(404, {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.test',
        phone: '555-0100',
      }),
    ).toThrow(NotFoundException);
  });
});