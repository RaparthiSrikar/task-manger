import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { WeatherModule } from './weather/weather.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        let uri = config.get<string>('database.uri');
        if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
          try {
            mongoMemoryServer = await MongoMemoryServer.create();
            uri = mongoMemoryServer.getUri();
            console.log(`[MongoMemoryServer] Running in-memory MongoDB at: ${uri}`);
          } catch (err) {
            console.warn('[MongoMemoryServer] Could not start in-memory server, using configured URI:', err);
          }
        }
        return { uri };
      },
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    EmailModule,
    UploadModule,
    WeatherModule,
  ],
})
export class AppModule {}

