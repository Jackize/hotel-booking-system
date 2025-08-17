import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!isUuid(value)) {
      throw new BadRequestException(`Invalid UUID: ${value}`);
    }
    return value;
  }
}
