import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ContactInput } from './contact.model.js';
import { ContactsService } from './contacts.service.js';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  findPage(
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ) {
    return this.contacts.findPage(Number(page), Number(limit));
  }

  @Post()
  create(@Body() input: ContactInput) {
    return this.contacts.create(input);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: ContactInput,
  ) {
    return this.contacts.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contacts.remove(id);
  }
}