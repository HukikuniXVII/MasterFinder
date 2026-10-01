import type { ContactInput } from './contact.model.js';
import { ContactsService } from './contacts.service.js';
export declare class ContactsController {
    private readonly contacts;
    constructor(contacts: ContactsService);
    findPage(page?: string, limit?: string): import("./contact.model.js").ContactPage;
    create(input: ContactInput): import("./contact.model.js").Contact;
    update(id: number, input: ContactInput): import("./contact.model.js").Contact;
    remove(id: number): {
        deleted: true;
    };
}
