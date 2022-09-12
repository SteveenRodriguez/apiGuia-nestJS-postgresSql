import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

// Tipo de dato de como lucira el client socket
interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // clientes conectados al socket
  private connectedClietns: ConnectedClients = {};

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error('User Not found');
    if (!user.isActive) throw new Error('User Not Active');

    this.checkUserConnection(user);

    // el id del cliente conectado apuntará al socket client
    this.connectedClietns[client.id] = {
      socket: client,
      user: user,
    };
  }

  removeClient(clientId: string) {
    // Elimina el cliente que se le pasa por parámetro en ID
    delete this.connectedClietns[clientId];
  }

  getConnectedClients(): string[] {
    // cuenta las propiedades que contiene el objeto que se le pasa por parámetro
    return Object.keys(this.connectedClietns);
  }

  getUserFullName(socketId: string) {
    return this.connectedClietns[socketId].user.fullName;
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClietns)) {
      const connectedCliente = this.connectedClietns[clientId];

      if (connectedCliente.user.id === user.id) {
        connectedCliente.socket.disconnect();
        break;
      }
    }
  }
}
