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
exports.PaymentResponseDto = exports.ConfirmPaymentDto = exports.InitiatePaymentDto = exports.MobileMoneyProvider = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["MOBILE_MONEY"] = "mobile_money";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["BANK"] = "bank";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var MobileMoneyProvider;
(function (MobileMoneyProvider) {
    MobileMoneyProvider["ORANGE_MONEY"] = "orange_money";
    MobileMoneyProvider["MTN_MONEY"] = "mtn_money";
})(MobileMoneyProvider || (exports.MobileMoneyProvider = MobileMoneyProvider = {}));
class InitiatePaymentDto {
    amount;
    currency;
    method;
    provider;
    planId;
    description;
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100, { message: 'Valor mínimo é 100 XOF' }),
    (0, class_validator_1.Max)(99999999, { message: 'Valor máximo é 99.999.999 XOF' }),
    __metadata("design:type", Number)
], InitiatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MobileMoneyProvider),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "description", void 0);
class ConfirmPaymentDto {
    transactionId;
    paymentId;
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentId", void 0);
class PaymentResponseDto {
    id;
    userId;
    amount;
    currency;
    status;
    method;
    provider;
    transactionId;
    description;
    createdAt;
}
exports.PaymentResponseDto = PaymentResponseDto;
//# sourceMappingURL=payment.dto.js.map