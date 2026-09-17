import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

  onModuleInit() {
    this.initializeFirebase();
  }

  public initializeFirebase(): FirebaseStatus {
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
        this.lastError = 'service-account.json not found in api/ or project root. Please place your service account file.';
        this.logger.warn(`Firebase warning: ${this.lastError}`);
        return this.getStatus();
      }

      this.resolvedPath = foundPath;
      const fileContent = fs.readFileSync(foundPath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);

      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        this.isConnected = false;
        this.lastError = 'Invalid service-account.json: missing project_id, private_key, or client_email.';
        this.logger.error(this.lastError);
        return this.getStatus();
      }

      // Check if default app already exists
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.app();
      } else {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
      }

      this.isConnected = true;
      this.projectId = serviceAccount.project_id;
      this.clientEmail = serviceAccount.client_email;
      this.lastError = null;

      this.logger.log(`Firebase Admin initialized successfully for project: ${this.projectId}`);
      return this.getStatus();
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || 'Failed to initialize Firebase Admin';
      this.logger.error(`Firebase initialization failed: ${this.lastError}`, err.stack);
      return this.getStatus();
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
      throw new Error(
        'Firebase Admin is not connected. Ensure service-account.json is placed in the api/ directory with valid credentials.',
      );
    }
    return admin.messaging(this.firebaseApp);
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}
