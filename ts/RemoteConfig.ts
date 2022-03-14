// Copyright 2020-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// 偏僻的配置[remote]刷新/获取

import { get, throttle } from 'lodash';

import type { WebAPIType } from './textsecure/WebAPI';
import * as log from './logging/log';

export type ConfigKeyType =
  | 'desktop.announcementGroup'
  | 'desktop.canResizeLeftPane.beta'
  | 'desktop.canResizeLeftPane.production'
  | 'desktop.clientExpiration'
  | 'desktop.disableGV1'
  | 'desktop.groupCallOutboundRing'
  | 'desktop.groupCalling'
  | 'desktop.gv2'
  | 'desktop.internalUser'
  | 'desktop.mandatoryProfileSharing'
  | 'desktop.mediaQuality.levels'
  | 'desktop.messageRequests'
  | 'desktop.retryReceiptLifespan'
  | 'desktop.retryRespondMaxAge'
  | 'desktop.senderKey.send'
  | 'desktop.senderKey.retry'
  | 'desktop.sendSenderKey3'
  | 'desktop.showUserBadges2'
  | 'desktop.showUserBadges.beta'
  | 'desktop.storage'
  | 'desktop.storageWrite3'
  | 'desktop.usernames'
  | 'global.calling.maxGroupCallRingSize'
  | 'global.groupsv2.groupSizeHardLimit'
  | 'global.groupsv2.maxGroupSize';
type ConfigValueType = {
  name: ConfigKeyType;
  enabled: boolean;
  enabledAt?: number;
  value?: unknown;
};
export type ConfigMapType = {
  [key in ConfigKeyType]?: ConfigValueType;
};
type ConfigListenerType = (value: ConfigValueType) => unknown;
type ConfigListenersMapType = {
  [key: string]: Array<ConfigListenerType>;
};

let config: ConfigMapType = {};
const listeners: ConfigListenersMapType = {};

export async function initRemoteConfig(server: WebAPIType): Promise<void> {
  log.info('remoteconfig 初始化');
  config = window.storage.get('remoteConfig') || {};
  await maybeRefreshRemoteConfig(server);
}

export function onChange(
  key: ConfigKeyType,
  fn: ConfigListenerType
): () => void {
  const keyListeners: Array<ConfigListenerType> = get(listeners, key, []);
  keyListeners.push(fn);
  listeners[key] = keyListeners;

  return () => {
    listeners[key] = listeners[key].filter(l => l !== fn);
  };
}

// 刷新remote配置
export const refreshRemoteConfig = async (
  _server: WebAPIType
): Promise<void> => {
  log.info('刷新remote config');
  const now = Date.now();
  // GET (WS) http://124.232.156.201:28810/v1/config
  const newConfig = await _server.getConfig();
  log.info(`newConfig :${JSON.stringify(newConfig)}`);
  // const newConfig = [{ name: 'test', enabled: true, value: 'test' }];
  // 根据旧配置处理新配置
  // Process new configuration in light of the old configuration
  // The old configuration is not set as the initial value in reduce because
  // flags may have been deleted
  const oldConfig = config;
  config = newConfig.reduce((acc, { name, enabled, value }) => {
    const previouslyEnabled: boolean = get(oldConfig, [name, 'enabled'], false);
    const previousValue: unknown = get(oldConfig, [name, 'value'], undefined);
    // If a flag was previously not enabled and is now enabled,
    // record the time it was enabled
    const enabledAt: number | undefined =
      previouslyEnabled && enabled ? now : get(oldConfig, [name, 'enabledAt']);

    const configValue = {
      name: name as ConfigKeyType,
      enabled,
      enabledAt,
      value,
    };

    const hasChanged =
      previouslyEnabled !== enabled || previousValue !== configValue.value;

    // If enablement changes at all, notify listeners
    const currentListeners = listeners[name] || [];
    if (hasChanged) {
      log.info(`Remote Config: Flag ${name} has changed`);
      currentListeners.forEach(listener => {
        listener(configValue);
      });
    }

    // Return new configuration object
    return {
      ...acc,
      [name]: configValue,
    };
  }, {});

  window.storage.put('remoteConfig', config);
};

export const maybeRefreshRemoteConfig = throttle(
  refreshRemoteConfig,
  // Only fetch remote configuration if the last fetch was more than two hours ago
  2 * 60 * 60 * 1000,
  { trailing: false }
);

export function isEnabled(name: ConfigKeyType): boolean {
  return get(config, [name, 'enabled'], false);
}

export function getValue(name: ConfigKeyType): string | undefined {
  return get(config, [name, 'value'], undefined);
}
