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
exports.AdResponseDto = exports.UpdateAdDto = exports.CreateAdDto = exports.ProductCondition = void 0;
const class_validator_1 = require("class-validator");
var ProductCondition;
(function (ProductCondition) {
    ProductCondition["NEW"] = "new";
    ProductCondition["LIKE_NEW"] = "like_new";
    ProductCondition["USED"] = "used";
    ProductCondition["FOR_REPAIR"] = "for_repair";
})(ProductCondition || (exports.ProductCondition = ProductCondition = {}));
class CreateAdDto {
    title;
    description;
    price;
    categoryId;
    location;
    city;
    country;
    images;
    condition;
    currency;
    contactPhone;
    contactWhatsapp;
    subcategoryId;
}
exports.CreateAdDto = CreateAdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: 'Título deve ter no mínimo 5 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Título deve ter no máximo 100 caracteres' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20, { message: 'Descrição deve ter no mínimo 20 caracteres' }),
    (0, class_validator_1.MaxLength)(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Preço não pode ser negativo' }),
    (0, class_validator_1.Max)(99999999, { message: 'Preço inválido' }),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Localidade inválida' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Cidade inválida' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'País inválido' }),
    __metadata("design:type", String)
], CreateAdDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateAdDto.prototype, "images", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProductCondition),
    __metadata("design:type", String)
], CreateAdDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "contactWhatsapp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "subcategoryId", void 0);
class UpdateAdDto {
    title;
    description;
    price;
    location;
    city;
    country;
    images;
    condition;
    contactPhone;
    contactWhatsapp;
    existingImages;
}
exports.UpdateAdDto = UpdateAdDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: 'Título deve ter no mínimo 5 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Título deve ter no máximo 100 caracteres' }),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20, { message: 'Descrição deve ter no mínimo 20 caracteres' }),
    (0, class_validator_1.MaxLength)(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' }),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Preço não pode ser negativo' }),
    (0, class_validator_1.Max)(99999999, { message: 'Preço inválido' }),
    __metadata("design:type", Number)
], UpdateAdDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Localidade inválida' }),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Cidade inválida' }),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'País inválido' }),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAdDto.prototype, "images", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProductCondition),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdDto.prototype, "contactWhatsapp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAdDto.prototype, "existingImages", void 0);
class AdResponseDto {
    id;
    title;
    description;
    price;
    currency;
    location;
    city;
    country;
    images;
    condition;
    status;
    isHighlighted;
    views;
    createdAt;
    user;
    category;
}
exports.AdResponseDto = AdResponseDto;
//# sourceMappingURL=ad.dto.js.map