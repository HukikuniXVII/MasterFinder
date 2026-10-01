import { Contact, ContactInput, ContactPage } from './contact.model.js';
import { ContactsRepository } from './contacts.repository.js';
export declare class ContactsService {
    private readonly contacts;
    constructor(contacts: ContactsRepository);
    findPage(page: number, limit: number): ContactPage;
    create(input: ContactInput): Contact;
    update(id: number, input: ContactInput): Contact;
    remove(id: number): {
        deleted: true;
    };
    private requireContact;
    private validate;
    private clean;
}
