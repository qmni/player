import Bun from 'bun'; // eslint-disable-line @typescript-eslint/naming-convention
import process from 'node:process';
import { app } from './app.mts';
import { env } from './config/env.mts';
import { connectDB, disconnectDB } from './config/prisma-client.mts';
import { serverConfig } from './config/server.mts';
import { container } from './container.mts';
import { banner } from './logger/banner.mts';