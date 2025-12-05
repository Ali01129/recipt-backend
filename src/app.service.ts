import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  testing(): string {
    return 'Testing API!';
  }
}
