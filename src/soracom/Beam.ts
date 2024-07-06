import CryptoJS from "crypto-js";
export function calculateSoracomSignature(
  requestHeaders: Headers,
  preSharedKey: string
): string {
  const imsi = requestHeaders.get("x-soracom-imsi");
  const timestamp = requestHeaders.get("x-soracom-timestamp");
  const stringToSign =
    "x-soracom-imsi=" + imsi + "x-soracom-timestamp=" + timestamp;
  return CryptoJS.SHA256(preSharedKey + stringToSign).toString(
    CryptoJS.enc.Hex
  );
}
