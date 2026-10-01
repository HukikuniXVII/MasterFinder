export interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}
export type ContactInput = Omit<Contact, 'id'>;
export interface ContactPage {
    data: Contact[];
    total: number;
    page: number;
    limit: number;
}
