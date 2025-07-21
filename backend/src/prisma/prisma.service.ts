import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    console.log('[PrismaService] Connecting to DB with URL:', process.env.DATABASE_URL); // Log URL for debug
    try {
      await this.$connect();
      console.log('[PrismaService] DB connected successfully');
    } catch (err) {
      console.error('[PrismaService] DB connection error:', err);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    // Use type assertion for known event name safely
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}