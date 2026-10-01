var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { ContactsRepository } from './contacts.repository.js';
let ContactsService = class ContactsService {
    contacts;
    constructor(contacts) {
        this.contacts = contacts;
    }
    findPage(page, limit) {
        const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
        const safeLimit = Number.isFinite(limit)
            ? Math.min(100, Math.max(1, Math.floor(limit)))
            : 8;
        return this.contacts.findPage(safePage, safeLimit);
    }
    create(input) {
        return this.contacts.create(this.validate(input));
    }
    update(id, input) {
        this.requireContact(id);
        return this.contacts.update(id, this.validate(input));
    }
    remove(id) {
        this.requireContact(id);
        this.contacts.delete(id);
        return { deleted: true };
    }
    requireContact(id) {
        const contact = this.contacts.findById(id);
        if (!contact)
            throw new NotFoundException('Contact not found.');
        return contact;
    }
    validate(input) {
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
    clean(value) {
        return typeof value === 'string' ? value.trim() : '';
    }
};
ContactsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ContactsRepository])
], ContactsService);
export { ContactsService };
//# sourceMappingURL=contacts.service.js.map