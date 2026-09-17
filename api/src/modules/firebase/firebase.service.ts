import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export interface FirebaseStatus {
  connected: boolean;
  projectId: string | null;
  clientEmail: string | null;
  serviceAccountPath: string | null;
  error?: string | null;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App | null = null;
  private isConnected = false;
  private projectId: string | null = null;
  private clientEmail: string | null = null;
  private resolvedPath: string | null = null;
  private lastError: string | null = null;

  async onModuleInit() {
    await this.initializeFirebase();
  }

  public async initializeFirebase(): Promise<FirebaseStatus> {
    try {
      const candidatePaths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        path.resolve(process.cwd(), 'service-account.json'),
        path.resolve(process.cwd(), 'api', 'service-account.json'),
        path.resolve(process.cwd(), '..', 'service-account.json'),
      ].filter(Boolean) as string[];

      let foundPath: string | null = null;
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      if (!foundPath) {
        this.isConnected = false;
        this.lastError = 'No service account configured. Upload your service_account.json via the UI.';
        this.logger.warn(`Firebase: ${this.lastError}`);
        return this.getStatus();
      }

      this.resolvedPath = foundPath;
      const fileContent = fs.readFileSync(foundPath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);

      return await this.configureWithServiceAccount(serviceAccount, foundPath, false);
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || 'Failed to initialize Firebase Admin';
      this.logger.error(`Firebase initialization failed: ${this.lastError}`, err.stack);
      return this.getStatus();
    }
  }

  public async setCredentials(serviceAccount: any): Promise<FirebaseStatus> {
    if (!serviceAccount || typeof serviceAccount !== 'object') {
      throw new BadRequestException('Invalid payload. Expected a JSON object.');
    }

    const savePath = path.resolve(process.cwd(), 'service-account.json');
    return this.configureWithServiceAccount(serviceAccount, savePath, true);
  }

  private async configureWithServiceAccount(
    serviceAccount: any,
    savePath: string,
    writeToFile: boolean,
  ): Promise<FirebaseStatus> {
    if (
      !serviceAccount.project_id ||
      !serviceAccount.private_key ||
      !serviceAccount.client_email
    ) {
      this.isConnected = false;
      this.lastError =
        'Invalid Service Account JSON: Missing project_id, private_key, or client_email.';
      throw new BadRequestException(this.lastError);
    }

    try {
      // Clean up previous app instances
      if (this.firebaseApp) {
        await this.firebaseApp.delete();
        this.firebaseApp = null;
      }
      if (admin.apps.length > 0) {
        await Promise.all(admin.apps.map((app) => app?.delete()));
      }

      // Initialize new Firebase Admin instance
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

      // Persist to local disk so it remains active across restarts
      if (writeToFile) {
        fs.writeFileSync(savePath, JSON.stringify(serviceAccount, null, 2), 'utf8');
        this.resolvedPath = savePath;
      } else {
        this.resolvedPath = savePath;
      }

      this.isConnected = true;
      this.projectId = serviceAccount.project_id;
      this.clientEmail = serviceAccount.client_email;
      this.lastError = null;

      this.logger.log(
        `Firebase Admin successfully connected dynamically for project: ${this.projectId}`,
      );
      return this.getStatus();
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || 'Failed to initialize Firebase credentials';
      this.logger.error(`Error configuring Firebase: ${this.lastError}`);
      throw new BadRequestException(this.lastError);
    }
  }

  public async disconnect(): Promise<FirebaseStatus> {
    try {
      if (this.firebaseApp) {
        await this.firebaseApp.delete();
        this.firebaseApp = null;
      }
      if (admin.apps.length > 0) {
        await Promise.all(admin.apps.map((app) => app?.delete()));
      }

      // If service-account.json exists, remove it
      if (this.resolvedPath && fs.existsSync(this.resolvedPath)) {
        try {
          fs.unlinkSync(this.resolvedPath);
        } catch (e) {}
      }

      this.isConnected = false;
      this.projectId = null;
      this.clientEmail = null;
      this.resolvedPath = null;
      this.lastError = 'Service account disconnected.';

      this.logger.log('Firebase Admin disconnected.');
      return this.getStatus();
    } catch (err: any) {
      this.logger.error(`Error disconnecting Firebase: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to disconnect');
    }
  }

  public getStatus(): FirebaseStatus {
    return {
      connected: this.isConnected,
      projectId: this.projectId,
      clientEmail: this.clientEmail,
      serviceAccountPath: this.resolvedPath,
      error: this.lastError,
    };
  }

  public getMessaging(): admin.messaging.Messaging {
    if (!this.isConnected || !this.firebaseApp) {
      throw new BadRequestException(
        'Firebase Admin is not connected. Upload a valid service_account.json in the UI.',
      );
    }
    return admin.messaging(this.firebaseApp);
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}
