import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { FirebaseService, FirebaseStatus } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get('status')
  getStatus(): FirebaseStatus {
    return this.firebaseService.getStatus();
  }

  @Post('upload')
  async uploadCredentials(@Body() body: any): Promise<FirebaseStatus> {
    // Support either { serviceAccount: { ... } } or direct JSON object
    const serviceAccount = body.serviceAccount || body;
    return this.firebaseService.setCredentials(serviceAccount);
  }

  @Delete('disconnect')
  async disconnect(): Promise<FirebaseStatus> {
    return this.firebaseService.disconnect();
  }

  @Post('reload')
  async reload(): Promise<FirebaseStatus> {
    return this.firebaseService.initializeFirebase();
  }
}
