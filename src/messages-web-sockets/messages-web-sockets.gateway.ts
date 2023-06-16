import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { MessagesWebSocketsService } from './messages-web-sockets.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway(80, { cors: true })
export class MessagesWebSocketsGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() webSocketServer: Server

  constructor(
    private readonly messagesWebSocketsService: MessagesWebSocketsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWebSocketsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect();
      return;
    }

    this.webSocketServer.emit('clients-updated', this.messagesWebSocketsService.getConnectedclients())
  }

  handleDisconnect(client: Socket) {
    this.messagesWebSocketsService.removeClient(client.id)
    this.webSocketServer.emit('clients-updated', this.messagesWebSocketsService.getConnectedclients())
  }

  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {

    //! Emit only the client
    /* client.emit('message-from-server', {
      fullName: 'Me',
      message: payload.message || 'no-message'
    }) */

    //! Emit everbody less that start client
    /* client.broadcast.emit('message-from-server', {
      fullName: 'Me',
      message: payload.message || 'no-message'
    }) */

    this.webSocketServer.emit('message-from-server', {
      fullName: this.messagesWebSocketsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    })

  }

}
