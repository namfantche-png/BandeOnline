import { Controller, Get, Put, Body, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de usuários
 * Endpoints: /users/profile, /users/:id
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Obtém perfil do usuário autenticado
   * GET /users/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  /**
   * Atualiza perfil do usuário autenticado
   * PUT /users/profile
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  /**
   * Obtém perfil público de um usuário
   * GET /users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter perfil público de um usuário' })
  async getPublicProfile(@Param('id') userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  /**
   * Lista anúncios de um usuário
   * GET /users/:id/ads
   */
  @Get(':id/ads')
  @ApiOperation({ summary: 'Listar anúncios de um usuário' })
  async getUserAds(
    @Param('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.getUserAds(userId, page, limit);
  }
}
