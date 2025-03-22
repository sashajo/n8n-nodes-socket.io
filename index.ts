import { INodeTypeBaseDescription } from 'n8n-workflow';
import { SocketIoTrigger } from './nodes/SocketIoTrigger/SocketIoTrigger.node';

export const nodeTypes = [
	{
		description: new SocketIoTrigger().description,
		sourceModulePath: 'nodes/SocketIoTrigger/SocketIoTrigger.node',
		type: new SocketIoTrigger(),
	},
];

export const credentialTypes = [
	{
		name: 'socketAuthApi',
		type: require('./credentials/SocketAuthApi.credentials').SocketAuthApi,
	},
]; 