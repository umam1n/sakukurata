import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatRupiah } from '../utils/formatters';

const PRIVACY_STORAGE_KEY = 'sakukurata_privacy_v1';

const DEFAULT_PRIVACY = {
  hideAll: false,
  hiddenScopes: {
    income: false,
    spending: false,
    remainingBudget: false,
    savings: false,
    wallets: false,
    transactions: false
  },
  hiddenKpiCards: {
    income: false,
    spending: false,
    savings: false,
    remaining: false,
    walletsBanner: false
  }
};

function loadPrivacyState() {
  try {
    const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return DEFAULT_PRIVACY;
    const parsed = JSON.parse(raw);
    return {
      hideAll: Boolean(parsed.hideAll),
      hiddenScopes: { ...DEFAULT_PRIVACY.hiddenScopes, ...(parsed.hiddenScopes || {}) },
      hiddenKpiCards: { ...DEFAULT_PRIVACY.hiddenKpiCards, ...(parsed.hiddenKpiCards || {}) }
    };
  } catch {
    return DEFAULT_PRIVACY;
  }
}

const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [privacy, setPrivacy] = useState(loadPrivacyState);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(privacy));
    } catch {
      // ignore storage errors
    }
  }, [privacy]);

  const setHideAll = (val) => {
    setPrivacy((prev) => ({ ...prev, hideAll: Boolean(val) }));
  };

  const toggleHideAll = () => {
    setPrivacy((prev) => ({ ...prev, hideAll: !prev.hideAll }));
  };

  const toggleScope = (scope) => {
    setPrivacy((prev) => ({
      ...prev,
      hiddenScopes: {
        ...prev.hiddenScopes,
        [scope]: !prev.hiddenScopes[scope]
      }
    }));
  };

  const toggleKpiCard = (cardKey) => {
    setPrivacy((prev) => ({
      ...prev,
      hiddenKpiCards: {
        ...prev.hiddenKpiCards,
        [cardKey]: !prev.hiddenKpiCards[cardKey]
      }
    }));
  };

  const resetPrivacy = () => setPrivacy(DEFAULT_PRIVACY);

  const isScopeHidden = (scope = 'general') => {
    return Boolean(privacy.hideAll || privacy.hiddenScopes[scope]);
  };

  const displayMoney = (amount, scope = 'general') => {
    if (isScopeHidden(scope)) {
      return 'Rp ••••••';
    }
    return formatRupiah(amount);
  };

  return (
    <PrivacyContext.Provider
      value={{
        hideAll: privacy.hideAll,
        hiddenScopes: privacy.hiddenScopes,
        hiddenKpiCards: privacy.hiddenKpiCards,
        setHideAll,
        toggleHideAll,
        toggleScope,
        toggleKpiCard,
        resetPrivacy,
        isScopeHidden,
        displayMoney
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
