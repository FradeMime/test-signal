// Copyright 2017-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { join } from 'path';
import { app } from 'electron';
import type { IConfig } from 'config';
import * as log from '../ts/logging/log';

import {
  Environment,
  getEnvironment,
  setEnvironment,
  parseEnvironment,
} from '../ts/environment';

// In production mode, NODE_ENV cannot be customized by the user
if (app.isPackaged) {
  log.info('app.isPackaged');
  console.log('app.isPackaged');
  setEnvironment(Environment.Production);
} else {
  log.info(`app.isPackaged setEnv pro.env.node_env=${process.env.NODE_ENV}`);
  console.log(`开发者模式: NODE_ENV:${process.env.NODE_ENV}`);
  setEnvironment(parseEnvironment(process.env.NODE_ENV || 'development'));
}
// 设置环境变量以配置node-config，在需要使用它之前
// Set environment vars to configure node-config before requiring it
process.env.NODE_ENV = getEnvironment();
process.env.NODE_CONFIG_DIR = join(__dirname, '..', 'config');
console.log(`process.env.node_config_dir:${process.env.NODE_CONFIG_DIR}`);
if (getEnvironment() === Environment.Production) {
  console.log('getEnvironment.Productions');
  // harden production config against the local env
  // 针对本地环境强化生产配置
  process.env.NODE_CONFIG = '';
  process.env.NODE_CONFIG_STRICT_MODE = 'true';
  process.env.HOSTNAME = '';
  process.env.NODE_APP_INSTANCE = '';
  process.env.ALLOW_CONFIG_MUTATIONS = '';
  process.env.SUPPRESS_NO_CONFIG_WARNING = '';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '';
  process.env.SIGNAL_ENABLE_HTTP = '';
}
console.log('getEnvironment环境:', getEnvironment());
console.log('config.ts 配置文件 SIGNAL_ENABLE_HTTP');
process.env.SIGNAL_ENABLE_HTTP = '7Y87698787';
console.log(
  `process.env.signal_enable_http: ${process.env.SIGNAL_ENABLE_HTTP}`
);
// We load config after we've made our modifications to NODE_ENV
// eslint-disable-next-line import/order, import/first
import config from 'config';

// Log resulting env vars in use by config
[
  'NODE_ENV',
  'NODE_CONFIG_DIR',
  'NODE_CONFIG',
  'ALLOW_CONFIG_MUTATIONS',
  'HOSTNAME',
  'NODE_APP_INSTANCE',
  'SUPPRESS_NO_CONFIG_WARNING',
  'SIGNAL_ENABLE_HTTP',
].forEach(s => {
  console.log(`${s} ${config.util.getEnv(s)}`);
});

export default config;
export type { IConfig as ConfigType };
