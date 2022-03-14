// Copyright 2020-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { UnidentifiedSenderMessageContent } from '@signalapp/signal-client';

import MessageSender from './textsecure/SendMessage';
import SyncRequest from './textsecure/SyncRequest';
import EventTarget from './textsecure/EventTarget';
import SendMessage, { SendOptionsType } from './textsecure/SendMessage';
import { WebAPIType } from './textsecure/WebAPI';
import utils from './textsecure/Helpers';
import { CallingMessage as CallingMessageClass } from 'ringrtc';
import { WhatIsThis } from './window.d';
import { Storage } from './textsecure/Storage';
import {
  StorageServiceCallOptionsType,
  StorageServiceCredentials,
  ProcessedAttachment,
} from './textsecure/Types.d';

// 有点像聊天对象的数据包属性
export type UnprocessedType = {
  attempts: number;
  decrypted?: string;
  envelope?: string;
  id: string;
  timestamp: number;
  serverGuid?: string;
  serverTimestamp?: number;
  source?: string;
  sourceDevice?: number;
  sourceUuid?: string;
  destinationUuid?: string;
  messageAgeSec?: number;
  version: number;
};

export { StorageServiceCallOptionsType, StorageServiceCredentials };

export type TextSecureType = {
  storage: Storage;
  server: WebAPIType;
  messageSender: MessageSender;
  messaging: SendMessage;
  utils: typeof utils;

  EventTarget: typeof EventTarget;
  AccountManager: WhatIsThis;
  MessageSender: typeof MessageSender;
  SyncRequest: typeof SyncRequest;
};
