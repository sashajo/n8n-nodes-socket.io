import {
  INodeType,
  INodeTypeDescription,
  ITriggerFunctions,
  ITriggerResponse,
  
} from 'n8n-workflow';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export class SocketIoNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Socket.Io Node',
    name: 'socketIoNode',
    icon: 'file:logo.svg',
    group: ['trigger'],
    version: 1,
    description: 'Listens to events from a Socket.IO server',
    defaults: {
      name: 'Socket.Io Node',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
			{
				name: 'socketAuthApi',
				required: false,
			},
		],
    properties: [
      {
        displayName: 'Server URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'https://yourserver.com',
        required: true,
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '/socket.io',
        required: true,
      },
      {
        displayName: 'Event Name',
        name: 'eventName',
        type: 'string',
        default: 'message',
        required: true,
      },
      {
        displayName: 'Channel',
        name: 'channel',
        type: 'string',
        default: '',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const url = this.getNodeParameter('url', '') as string;
    const token = (await this.getCredentials('socketAuthApi'))?.token as string;
    const path = this.getNodeParameter('path', '') as string;
    const eventName = this.getNodeParameter('eventName', '') as string;
    const channel = this.getNodeParameter('channel', '') as string;
    socket = io(url, {
      path,
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      this.logger.info('[Socket.IO] Connected to server');
      socket?.emit('joinChannel', channel);
    });

    socket.on(eventName, (data: any) => {
      this.logger.debug(`[Socket.IO] Received event '${eventName}'`, data);
      this.emit([this.helpers.returnJsonArray([data])]);
    });

    socket.on('connect_error', (err) => {
      this.logger.error('[Socket.IO] Connection error:', err);
    });
   
    return {
      closeFunction: async () => {
        if (socket) {
          socket.disconnect();
          this.logger.info('[Socket.IO] Disconnected');
        }
      },
    };
  }
}