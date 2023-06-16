import { Module } from '@nestjs/common';
import { MessagesWebSocketsService } from './messages-web-sockets.service';
import { MessagesWebSocketsGateway } from './messages-web-sockets.gateway';

import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessagesWebSocketsGateway, MessagesWebSocketsService],
  imports: [AuthModule]
})
export class MessagesWebSocketsModule {}
