var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
let ContactsRepository = class ContactsRepository {
    database;
    constructor() {
        const databasePath = resolve(process.env.DATABASE_PATH ?? 'data/contacts.sqlite');
        mkdirSync(dirname(databasePath), { recursive: true });
        this.database = new DatabaseSync(databasePath);
        this.database.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
      )
    `);
        this.seedIfEmpty();
    }
    onModuleDestroy() {
        this.database.close();
    }
    findPage(page, limit) {
        const total = this.count();
        const data = this.database
            .prepare('SELECT id, firstName, lastName, email, phone FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?')
            .all(limit, (page - 1) * limit);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.database
            .prepare('SELECT id, firstName, lastName, email, phone FROM contacts WHERE id = ?')
            .get(id);
    }
    create(input) {
        const result = this.database
            .prepare('INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)')
            .run(input.firstName, input.lastName, input.email, input.phone);
        return this.findById(Number(result.lastInsertRowid));
    }
    update(id, input) {
        this.database
            .prepare('UPDATE contacts SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?')
            .run(input.firstName, input.lastName, input.email, input.phone, id);
        return this.findById(id);
    }
    delete(id) {
        this.database.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    }
    count() {
        const result = this.database
            .prepare('SELECT COUNT(*) AS total FROM contacts')
            .get();
        return result.total;
    }
    seedIfEmpty() {
        if (this.count() > 0)
            return;
        const firstNames = [
            'Avery', 'Jordan', 'Morgan', 'Riley', 'Casey', 'Taylor', 'Quinn',
            'Jamie', 'Rowan', 'Sage', 'Cameron', 'Drew', 'Emerson', 'Finley',
            'Harper', 'Kai', 'Logan', 'Parker', 'Reese', 'Skyler',
        ];
        const lastNames = [
            'Bennett', 'Chen', 'Foster', 'Garcia', 'Hayes', 'Ibrahim', 'Kim',
            'Lewis', 'Martin', 'Nguyen', 'Ortiz', 'Patel', 'Rivera', 'Shah',
            'Thompson', 'Walker', 'Young', 'Zhang', 'Brooks', 'Ellis',
        ];
        const insert = this.database.prepare('INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)');
        for (let index = 0; index < 36; index += 1) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const suffix = String(index + 1).padStart(2, '0');
            insert.run(firstName, lastName, `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@example.test`, `+1 (555) ${String(200 + Math.floor(Math.random() * 700))}-${String(1000 + index).slice(-4)}`);
        }
    }
};
ContactsRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], ContactsRepository);
export { ContactsRepository };
//# sourceMappingURL=contacts.repository.js.map