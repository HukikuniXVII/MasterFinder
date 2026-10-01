import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Contact, ContactInput, ContactPage } from './contact.model.js';

@Injectable()
export class ContactsRepository implements OnModuleDestroy {
  private readonly database: DatabaseSync;

  constructor() {
    const databasePath = resolve(
      process.env.DATABASE_PATH ?? 'data/contacts.sqlite',
    );
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

  onModuleDestroy(): void {
    this.database.close();
  }

  findPage(page: number, limit: number): ContactPage {
    const total = this.count();
    const data = this.database
      .prepare(
        'SELECT id, firstName, lastName, email, phone FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?',
      )
      .all(limit, (page - 1) * limit) as unknown as Contact[];

    return { data, total, page, limit };
  }

  findById(id: number): Contact | undefined {
    return this.database
      .prepare(
        'SELECT id, firstName, lastName, email, phone FROM contacts WHERE id = ?',
      )
      .get(id) as Contact | undefined;
  }

  create(input: ContactInput): Contact {
    const result = this.database
      .prepare(
        'INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
      )
      .run(input.firstName, input.lastName, input.email, input.phone);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(id: number, input: ContactInput): Contact {
    this.database
      .prepare(
        'UPDATE contacts SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?',
      )
      .run(input.firstName, input.lastName, input.email, input.phone, id);

    return this.findById(id)!;
  }

  delete(id: number): void {
    this.database.prepare('DELETE FROM contacts WHERE id = ?').run(id);
  }

  private count(): number {
    const result = this.database
      .prepare('SELECT COUNT(*) AS total FROM contacts')
      .get() as { total: number };
    return result.total;
  }

  private seedIfEmpty(): void {
    if (this.count() > 0) return;

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
    const insert = this.database.prepare(
      'INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
    );

    for (let index = 0; index < 36; index += 1) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const suffix = String(index + 1).padStart(2, '0');
      insert.run(
        firstName,
        lastName,
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@example.test`,
        `+1 (555) ${String(200 + Math.floor(Math.random() * 700))}-${String(1000 + index).slice(-4)}`,
      );
    }
  }
}