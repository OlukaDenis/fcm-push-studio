import { Controller, Get, Post } from '@nestjs/common';
import { FirebaseService, FirebaseStatus } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get('status')
  getStatus(): FirebaseStatus {
    return this.firebaseService.getStatus();
  }

  @Post('reload')
  reload(): FirebaseStatus {
    return this.firebaseService.initializeFirebase();
  }
}
