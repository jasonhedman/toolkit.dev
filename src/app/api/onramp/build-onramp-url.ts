export enum PaymentMethod {
  Card = "CARD",
  AchBankAccount = "ACH_BANK_ACCOUNT",
  ApplePay = "APPLE_PAY",
  FiatWallet = "FIAT_WALLET",
  CryptoWallet = "CRYPTO_WALLET",
}

export enum Experience {
  Send = "send",
  Buy = "buy",
}

interface BuildOnrampUrlParams {
  sessionToken: string;
  amount?: number;
  method?: PaymentMethod;
  origin?: string;
  experience?: Experience;
  defaultNetwork?: string;
  defaultAsset?: string;
  fiatCurrency?: string;
  partnerUserId?: string;
  redirectUrl?: string;
}

export const buildOnrampUrl = ({
  sessionToken,
  amount,
  method,
  origin,
  experience = Experience.Buy,
  defaultNetwork = "base",
  defaultAsset = "USDC",
  fiatCurrency = "USD",
  partnerUserId,
  redirectUrl,
}: BuildOnrampUrlParams) => {
  const url = new URL("https://pay.coinbase.com/buy/select-asset");

  const params: Record<string, string> = {
    appId: process.env.CDP_APP_ID ?? "",
    sessionToken,
    defaultNetwork,
    defaultAsset,
    defaultExperience: experience,
    fiatCurrency,
  };

  if (amount) {
    params.presetCryptoAmount = amount.toString();
  }

  if (method) {
    params.defaultPaymentMethod = method;
  }

  if (partnerUserId) {
    params.partnerUserId = partnerUserId;
  }

  if (redirectUrl) {
    params.redirectUrl = redirectUrl;
  } else if (origin) {
    const redirect = new URL(origin);
    redirect.searchParams.set("onramp_session_token", sessionToken);
    params.redirectUrl = redirect.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};
