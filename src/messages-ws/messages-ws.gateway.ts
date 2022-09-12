import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Socket listo para recibir conexiones
 * http://localhost:3000/socket.io/socket.io.js
 *
 *
 */

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // console.log('Cliente Conectado', client);

    const token = client.handshake.headers.authentication as string;
    // console.log({token});
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({ payload });


    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente Desconectado', client.id);
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  // Configuración evento message-front-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente, no a todos
    // Configuración evento message-from-server
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   messages: payload.message || 'No Message';
    // })

    //! Emite a todos menos al cliente inical
    // Configuración evento message-from-server
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   messages: payload.message || 'No Message',
    // });

    //! Emite a todos los clientes
    // Configuración evento message-from-server se debe enviar el mismo objeto que se recibe
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No Message',
    });
  }
}
