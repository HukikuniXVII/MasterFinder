import { OnModuleDestroy } from '@nestjs/common';
import { Contact, ContactInput, ContactPage } from './contact.model.js';
export declare class ContactsRepository implements OnModuleDestroy {
    private readonly database;
    constructor();
    onModuleDestroy(): void;
    findPage(page: number, limit: number): ContactPage;
    findById(id: number): Contact | undefined;
    create(input: ContactInput): Contact;
    update(id: number, input: ContactInput): Contact;
    delete(id: number): void;
    private count;
    private seedIfEmpty;
}
