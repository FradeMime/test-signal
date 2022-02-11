// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// 统一规范DeviceName
export function normalizeDeviceName(rawDeviceName: string): string {
  // We want to do additional normalization here. See DESKTOP-2845.
  return rawDeviceName.trim().replace(/\0/g, '');
}
