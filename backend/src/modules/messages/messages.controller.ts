import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de mensagens
 * Endpoints: /messages
 */
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  /**
   * Envia mensagem
   * POST /messages
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensagem' })
  async sendMessage(
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.userId, sendMessageDto);
  }

  /**
   * Obtém conversa com outro usuário
   * GET /messages/conversation/:userId
   */
  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter conversa com usuário' })
  async getConversation(
    @CurrentUser() user: any,
    @Param('userId') otherUserId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.messagesService.getConversation(user.userId, otherUserId, page, limit);
  }

  /**
   * Obtém lista de conversas
   * GET /messages/conversations
   */
  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter lista de conversas' })
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.userId);
  }

  /**
   * Obtém mensagens não lidas
   * GET /messages/unread
   */
  @Get('unread')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter mensagens não lidas' })
  async getUnreadMessages(@CurrentUser() user: any) {
    return this.messagesService.getUnreadMessages(user.userId);
  }

  /**
   * Marca mensagem como lida
   * POST /messages/:id/read
   */
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar mensagem como lida' })
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
  ) {
    return this.messagesService.markAsRead(messageId, user.userId);
  }

  /**
   * Marca todas as mensagens de um usuário como lidas
   * POST /messages/read-all/:userId
   */
  @Post('read-all/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as mensagens como lidas' })
  async markAllAsRead(
    @CurrentUser() user: any,
    @Param('userId') senderId: string,
  ) {
    return this.messagesService.markAllAsRead(user.userId, senderId);
  }

  /**
   * Deleta mensagem
   * DELETE /messages/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar mensagem' })
  async deleteMessage(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
  ) {
    return this.messagesService.deleteMessage(messageId, user.userId);
  }

  /**
   * Bloqueia usuário
   * POST /messages/block/:userId
   */
  @Post('block/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bloquear usuário' })
  async blockUser(
    @CurrentUser() user: any,
    @Param('userId') blockedUserId: string,
  ) {
    return this.messagesService.blockUser(user.userId, blockedUserId);
  }

  /**
   * Desbloqueia usuário
   * POST /messages/unblock/:userId
   */
  @Post('unblock/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desbloquear usuário' })
  async unblockUser(
    @CurrentUser() user: any,
    @Param('userId') unblockedUserId: string,
  ) {
    return this.messagesService.unblockUser(user.userId, unblockedUserId);
  }
}
