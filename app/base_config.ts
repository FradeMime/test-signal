// Copyright 2018-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { get, set } from 'lodash';
import * as log from '../ts/logging/log';

const ENCODING = 'utf8';

type InternalConfigType = Record<string, unknown>;

export type ConfigType = {
  set: (keyPath: string, value: unknown) => void;
  get: (keyPath: string) => unknown;
  remove: () => void;

  // Test-only
  _getCachedValue: () => InternalConfigType | undefined;
};

export function start(
  name: string,
  targetPath: string,
  options?: { allowMalformedOnStartup?: boolean }
): ConfigType {
  let cachedValue: InternalConfigType | undefined;
  let incomingJson: string | undefined;
  log.info('base_config函数start');
  try {
    incomingJson = readFileSync(targetPath, ENCODING);
    cachedValue = incomingJson ? JSON.parse(incomingJson) : undefined;
    console.log(`${name} config file path:${targetPath}`);
    console.log(`config/get: Successfully read ${name} config file`);

    if (!cachedValue) {
      console.log(
        `config/get: ${name} config value was falsy, cache is now empty object`
      );
      cachedValue = Object.create(null);
    }
  } catch (error) {
    if (!options?.allowMalformedOnStartup && error.code !== 'ENOENT') {
      throw error;
    }

    if (incomingJson) {
      console.log(
        `config/get: ${name} config file was malformed, starting afresh`
      );
    } else {
      console.log(
        `config/get: Did not find ${name} config file (or it was empty), cache is now empty object`
      );
    }
    cachedValue = Object.create(null);
  }

  function ourGet(keyPath: string): unknown {
    return get(cachedValue, keyPath);
  }

  function ourSet(keyPath: string, value: unknown): void {
    if (!cachedValue) {
      throw new Error('ourSet: no cachedValue!');
    }

    set(cachedValue, keyPath, value);
    console.log(`config/set: Saving ${name} config to disk`);
    const outgoingJson = JSON.stringify(cachedValue, null, '  ');
    writeFileSync(targetPath, outgoingJson, ENCODING);
  }

  function remove(): void {
    console.log(`config/remove: Deleting ${name} config from disk`);
    unlinkSync(targetPath);
    cachedValue = Object.create(null);
  }

  return {
    set: ourSet,
    get: ourGet,
    remove,
    _getCachedValue: () => cachedValue,
  };
}
