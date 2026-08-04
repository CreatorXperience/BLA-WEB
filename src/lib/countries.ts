const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  NIGERIA: "NG",
  "UNITED STATES": "US",
  USA: "US",
  CANADA: "CA",
  GHANA: "GH",
  KENYA: "KE",
  "SOUTH AFRICA": "ZA",
  "UNITED KINGDOM": "GB",
  UK: "GB",
  GERMANY: "DE",
  FRANCE: "FR",
  ITALY: "IT",
  SPAIN: "ES",
  NETHERLANDS: "NL",
  UAE: "AE",
  "UNITED ARAB EMIRATES": "AE",
  INDIA: "IN",
  CHINA: "CN",
  JAPAN: "JP",
  AUSTRALIA: "AU",
  BRAZIL: "BR",
  MEXICO: "MX",
  SINGAPORE: "SG",
  "HONG KONG": "HK",
  "SOUTH KOREA": "KR",
};

export function countryToCode(value: string): string {
  const cleaned = value.trim().toUpperCase();
  if (cleaned.length === 2) return cleaned;
  return COUNTRY_NAME_TO_CODE[cleaned] ?? cleaned;
}
