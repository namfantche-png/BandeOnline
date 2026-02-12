import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AdsModule } from './modules/ads/ads.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Middleware
import {
  SecurityMiddleware,
  SanitizeMiddleware,
  RequestLoggerMiddleware,
} from './middleware/security.middleware';

// Filters
import { HttpExceptionFilter } from './filters/http-exception.filter';

// Guards
import { ThrottleGuard } from './guards/throttle.guard';

/**
 * Módulo principal da aplicação
 * Importa todos os módulos e configura a aplicação
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    AdsModule,
    CategoriesModule,
    MessagesModule,
    ReviewsModule,
    PaymentsModule,
    ReportsModule,
    AdminModule,
    UploadsModule,
    InvoicesModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Filtro global de exceções
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Guard global de rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, SanitizeMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
