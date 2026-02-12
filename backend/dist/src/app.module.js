"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./config/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const plans_module_1 = require("./modules/plans/plans.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const ads_module_1 = require("./modules/ads/ads.module");
const categories_module_1 = require("./modules/categories/categories.module");
const messages_module_1 = require("./modules/messages/messages.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reports_module_1 = require("./modules/reports/reports.module");
const admin_module_1 = require("./modules/admin/admin.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const security_middleware_1 = require("./middleware/security.middleware");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const throttle_guard_1 = require("./guards/throttle.guard");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(security_middleware_1.SecurityMiddleware, security_middleware_1.SanitizeMiddleware, security_middleware_1.RequestLoggerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            plans_module_1.PlansModule,
            subscriptions_module_1.SubscriptionsModule,
            ads_module_1.AdsModule,
            categories_module_1.CategoriesModule,
            messages_module_1.MessagesModule,
            reviews_module_1.ReviewsModule,
            payments_module_1.PaymentsModule,
            reports_module_1.ReportsModule,
            admin_module_1.AdminModule,
            uploads_module_1.UploadsModule,
            invoices_module_1.InvoicesModule,
            tasks_module_1.TasksModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttle_guard_1.ThrottleGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map