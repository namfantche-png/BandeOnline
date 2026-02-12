"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStatsDto = exports.ChangeUserPlanDto = exports.AdminLogDto = exports.FinancialReportDto = exports.AdminPlanDto = exports.AdminCategoryDto = exports.ModerateAdDto = exports.BlockUserDto = exports.FilterUsersDto = exports.AdModerationStatus = exports.UserStatus = void 0;
const class_validator_1 = require("class-validator");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["BLOCKED"] = "blocked";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var AdModerationStatus;
(function (AdModerationStatus) {
    AdModerationStatus["PENDING"] = "pending";
    AdModerationStatus["APPROVED"] = "approved";
    AdModerationStatus["REJECTED"] = "rejected";
    AdModerationStatus["FLAGGED"] = "flagged";
})(AdModerationStatus || (exports.AdModerationStatus = AdModerationStatus = {}));
class FilterUsersDto {
    search;
    status;
    planId;
    page;
    limit;
}
exports.FilterUsersDto = FilterUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterUsersDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(UserStatus),
    __metadata("design:type", String)
], FilterUsersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterUsersDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FilterUsersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FilterUsersDto.prototype, "limit", void 0);
class BlockUserDto {
    userId;
    reason;
    durationDays;
}
exports.BlockUserDto = BlockUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BlockUserDto.prototype, "durationDays", void 0);
class ModerateAdDto {
    adId;
    status;
    reason;
}
exports.ModerateAdDto = ModerateAdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ModerateAdDto.prototype, "adId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AdModerationStatus),
    __metadata("design:type", String)
], ModerateAdDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ModerateAdDto.prototype, "reason", void 0);
class AdminCategoryDto {
    name;
    description;
    icon;
    parentId;
    isActive;
    order;
}
exports.AdminCategoryDto = AdminCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCategoryDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCategoryDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminCategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminCategoryDto.prototype, "order", void 0);
class AdminPlanDto {
    name;
    price;
    currency;
    maxAds;
    maxHighlights;
    maxImages;
    hasStore;
    isActive;
    description;
}
exports.AdminPlanDto = AdminPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminPlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminPlanDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminPlanDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminPlanDto.prototype, "maxAds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminPlanDto.prototype, "maxHighlights", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminPlanDto.prototype, "maxImages", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminPlanDto.prototype, "hasStore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminPlanDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminPlanDto.prototype, "description", void 0);
class FinancialReportDto {
    startDate;
    endDate;
    groupBy;
}
exports.FinancialReportDto = FinancialReportDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], FinancialReportDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], FinancialReportDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinancialReportDto.prototype, "groupBy", void 0);
class AdminLogDto {
    action;
    targetType;
    targetId;
    details;
    adminId;
}
exports.AdminLogDto = AdminLogDto;
class ChangeUserPlanDto {
    userId;
    planId;
    reason;
}
exports.ChangeUserPlanDto = ChangeUserPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeUserPlanDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeUserPlanDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeUserPlanDto.prototype, "reason", void 0);
class DashboardStatsDto {
    totalUsers;
    activeUsers;
    totalAds;
    activeAds;
    totalRevenue;
    monthlyRevenue;
    pendingReports;
    pendingAds;
}
exports.DashboardStatsDto = DashboardStatsDto;
//# sourceMappingURL=admin.dto.js.map