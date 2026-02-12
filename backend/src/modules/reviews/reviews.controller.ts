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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de avaliações
 * Endpoints: /reviews
 */
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  /**
   * Cria avaliação
   * POST /reviews
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar avaliação' })
  async createReview(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.userId, createReviewDto);
  }

  /**
   * Obtém avaliações recebidas por um usuário
   * GET /reviews/user/:userId
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter avaliações de um usuário' })
  async getReviewsForUser(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getReviewsForUser(userId, page, limit);
  }

  /**
   * Obtém avaliações feitas pelo usuário autenticado
   * GET /reviews/my-reviews
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter avaliações feitas por mim' })
  async getMyReviews(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getReviewsByUser(user.userId, page, limit);
  }

  /**
   * Obtém estatísticas de avaliação de um usuário
   * GET /reviews/stats/:userId
   */
  @Get('stats/:userId')
  @ApiOperation({ summary: 'Obter estatísticas de avaliação' })
  async getReviewStats(@Param('userId') userId: string) {
    return this.reviewsService.getReviewStats(userId);
  }

  /**
   * Obtém avaliação por ID
   * GET /reviews/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  async getReviewById(@Param('id') reviewId: string) {
    return this.reviewsService.getReviewById(reviewId);
  }

  /**
   * Atualiza avaliação
   * PUT /reviews/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar avaliação' })
  async updateReview(
    @CurrentUser() user: any,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(reviewId, user.userId, updateReviewDto);
  }

  /**
   * Deleta avaliação
   * DELETE /reviews/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar avaliação' })
  async deleteReview(
    @CurrentUser() user: any,
    @Param('id') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, user.userId);
  }

  /**
   * Verifica se pode avaliar usuário
   * GET /reviews/can-review/:userId
   */
  @Get('can-review/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se pode avaliar usuário' })
  async canReview(
    @CurrentUser() user: any,
    @Param('userId') reviewedUserId: string,
  ) {
    const canReview = await this.reviewsService.canReview(user.userId, reviewedUserId);
    return { canReview };
  }
}
