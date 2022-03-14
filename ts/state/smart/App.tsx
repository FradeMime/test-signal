// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import { connect } from 'react-redux';

import { App } from '../../components/App';
import { SmartCallManager } from './CallManager';
import { SmartCustomizingPreferredReactionsModal } from './CustomizingPreferredReactionsModal';
import { SmartGlobalModalContainer } from './GlobalModalContainer';
import { SmartSafetyNumberViewer } from './SafetyNumberViewer';
import type { StateType } from '../reducer';
import { getPreferredBadgeSelector } from '../selectors/badges';
import { getIntl, getTheme } from '../selectors/user';
import {
  getConversationsStoppingMessageSendBecauseOfVerification,
  getNumberOfMessagesPendingBecauseOfVerification,
} from '../selectors/conversations';
import { getIsCustomizingPreferredReactions } from '../selectors/preferredReactions';
import { mapDispatchToProps } from '../actions';
import type { SafetyNumberProps } from '../../components/SafetyNumberChangeDialog';

const mapStateToProps = (state: StateType) => {
  return {
    ...state.app,
    conversationsStoppingMessageSendBecauseOfVerification:
      getConversationsStoppingMessageSendBecauseOfVerification(state),
    getPreferredBadge: getPreferredBadgeSelector(state),
    i18n: getIntl(state),
    isCustomizingPreferredReactions: getIsCustomizingPreferredReactions(state),
    numberOfMessagesPendingBecauseOfVerification:
      getNumberOfMessagesPendingBecauseOfVerification(state),
    renderCallManager: () => <SmartCallManager />,
    renderCustomizingPreferredReactionsModal: () => (
      <SmartCustomizingPreferredReactionsModal />
    ),
    renderGlobalModalContainer: () => <SmartGlobalModalContainer />,
    renderSafetyNumber: (props: SafetyNumberProps) => (
      <SmartSafetyNumberViewer {...props} />
    ),
    requestVerification: (
      type: 'sms' | 'voice',
      number: string,
      token: string
    ): Promise<void> => {
      const accountManager = window.getAccountManager();
      // eslint-disable-next-line no-console
      console.log(`util app.ts type:${type}`);
      if (type === 'sms') {
        return accountManager.requestSMSVerification(number, token);
      }

      return accountManager.requestVoiceVerification(number, token);
    },
    registerSingleDevice: (number: string, code: string): Promise<void> => {
      return window.getAccountManager().registerSingleDevice(number, code);
    },
    theme: getTheme(state),
  };
};

const smart = connect(mapStateToProps, mapDispatchToProps);

export const SmartApp = smart(App);
