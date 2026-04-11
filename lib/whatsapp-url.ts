export function whatsappUrl(phoneDigits: string, text: string) {
  const clean = phoneDigits.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}?text=${encoded}`;
}
