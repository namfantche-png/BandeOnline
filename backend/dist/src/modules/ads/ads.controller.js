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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const ads_service_1 = require("./ads.service");
const ad_dto_1 = require("./dto/ad.dto");
const jwt_guard_1 = require("../../guards/jwt.guard");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
let AdsController = class AdsController {
    adsService;
    constructor(adsService) {
        this.adsService = adsService;
    }
    async listAds(page = 1, limit = 20, categoryId, city, minPrice, maxPrice, search, featured) {
        return this.adsService.listAds(page, limit, categoryId, city, minPrice, maxPrice, search, featured);
    }
    async searchAds(query, page = 1, limit = 20) {
        return this.adsService.searchAds(query, page, limit);
    }
    async getAdById(adId) {
        return this.adsService.getAdById(adId);
    }
    async createAd(user, createAdDto, files) {
        const dto = {
            ...createAdDto,
            price: typeof createAdDto.price === 'string' ? parseFloat(createAdDto.price) : createAdDto.price,
        };
        return this.adsService.createAd(user.userId, dto, files?.images || []);
    }
    async getUserAds(user, page = 1, limit = 20) {
        return this.adsService.getUserAds(user.userId, page, limit);
    }
    async updateAd(adId, user, updateAdDto, files) {
        const dto = {
            ...updateAdDto,
            price: typeof updateAdDto.price === 'string' ? parseFloat(updateAdDto.price) : updateAdDto.price,
        };
        return this.adsService.updateAd(adId, user.userId, dto, files?.images);
    }
    async deleteAd(adId, user) {
        return this.adsService.deleteAd(adId, user.userId);
    }
    async highlightAd(adId, user) {
        return this.adsService.highlightAd(adId, user.userId);
    }
    async unhighlightAd(adId, user) {
        return this.adsService.unhighlightAd(adId, user.userId);
    }
};
exports.AdsController = AdsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar anúncios com filtros' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('city')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Number, Number, String, Boolean]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "listAds", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar anúncios' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "searchAds", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter anúncio por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "getAdById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo anúncio' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'images', maxCount: 5 }])),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ad_dto_1.CreateAdDto, Object]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "createAd", null);
__decorate([
    (0, common_1.Get)('user/my-ads'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus anúncios' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "getUserAds", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar anúncio' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'images', maxCount: 5 }])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, ad_dto_1.UpdateAdDto, Object]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "updateAd", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remover anúncio' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "deleteAd", null);
__decorate([
    (0, common_1.Post)(':id/highlight'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Destacar anúncio' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "highlightAd", null);
__decorate([
    (0, common_1.Post)(':id/unhighlight'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remover destaque de anúncio' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdsController.prototype, "unhighlightAd", null);
exports.AdsController = AdsController = __decorate([
    (0, swagger_1.ApiTags)('Ads'),
    (0, common_1.Controller)('ads'),
    __metadata("design:paramtypes", [ads_service_1.AdsService])
], AdsController);
//# sourceMappingURL=ads.controller.js.map