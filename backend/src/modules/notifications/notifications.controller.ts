import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controller de notificações
 */
@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Obtém notificações do usuário
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * Marca notificação como lida
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(@Param('id') notificationId: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  /**
   * Marca todas as notificações como lidas
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Deleta notificação
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  async deleteNotification(@Param('id') notificationId: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}
