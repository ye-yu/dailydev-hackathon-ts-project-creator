export function logOnce(...messages: unknown[]) {
  const loggedMessages = new Set<string>();
  const messageKey = messages.map((msg) => JSON.stringify(msg)).join("|");
  if (loggedMessages.has(messageKey)) {
    return;
  }
  loggedMessages.add(messageKey);
  console.log(...messages);
}
