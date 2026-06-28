// tables.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Table } from "./tables.entity";

@WebSocketGateway({ cors: { origin: "*" } })
export class TablesGateway {
  @WebSocketServer()
  server: Server;

  emitTablesUpdate(data: Table[]) {
    this.server.emit("tables:update", data);
  }
  @SubscribeMessage("joinCompanyRoom")
  async handleJoinRoom(
    @MessageBody() companyId: string,
    @ConnectedSocket() client: Socket
  ) {
    await client.join(`company-${companyId}`);
  }
}
