import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de anúncios
 * Endpoints: /ads
 */
@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private adsService: AdsService) {}

  /**
   * Lista anúncios com filtros
   * GET /ads
   */
  @Get()
  @ApiOperation({ summary: 'Listar anúncios com filtros' })
  async listAds(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('featured') featured?: boolean,
  ) {
    return this.adsService.listAds(page, limit, categoryId, city, minPrice, maxPrice, search, featured);
  }

  /**
   * Busca anúncios por termo
   * GET /ads/search
   */
  @Get('search')
  @ApiOperation({ summary: 'Buscar anúncios' })
  async searchAds(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adsService.searchAds(query, page, limit);
  }

  /**
   * Obtém anúncio por ID
   * GET /ads/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter anúncio por ID' })
  async getAdById(@Param('id') adId: string) {
    return this.adsService.getAdById(adId);
  }

  /**
   * Cria novo anúncio
   * POST /ads
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo anúncio' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async createAd(
    @CurrentUser() user: any,
    @Body() createAdDto: CreateAdDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    // Converter price para número se for string
    const dto = {
      ...createAdDto,
      price: typeof createAdDto.price === 'string' ? parseFloat(createAdDto.price) : createAdDto.price,
    };
    return this.adsService.createAd(user.userId, dto, files?.images || []);
  }

  /**
   * Lista anúncios do usuário autenticado
   * GET /ads/user/my-ads
   */
  @Get('user/my-ads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar meus anúncios' })
  async getUserAds(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adsService.getUserAds(user.userId, page, limit);
  }

  /**
   * Atualiza anúncio com suporte a upload de imagens
   * PUT /ads/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar anúncio' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async updateAd(
    @Param('id') adId: string,
    @CurrentUser() user: any,
    @Body() updateAdDto: UpdateAdDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    // Converter price para número se for string
    const dto = {
      ...updateAdDto,
      price: typeof updateAdDto.price === 'string' ? parseFloat(updateAdDto.price) : updateAdDto.price,
    };
    return this.adsService.updateAd(adId, user.userId, dto, files?.images);
  }

  /**
   * Remove anúncio
   * DELETE /ads/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover anúncio' })
  async deleteAd(
    @Param('id') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.adsService.deleteAd(adId, user.userId);
  }

  /**
   * Destaca anúncio
   * POST /ads/:id/highlight
   */
  @Post(':id/highlight')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Destacar anúncio' })
  async highlightAd(
    @Param('id') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.adsService.highlightAd(adId, user.userId);
  }

  /**
   * Remove destaque de anúncio
   * POST /ads/:id/unhighlight
   */
  @Post(':id/unhighlight')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover destaque de anúncio' })
  async unhighlightAd(
    @Param('id') adId: string,
    @CurrentUser() user: any,
  ) {
    return this.adsService.unhighlightAd(adId, user.userId);
  }
}
