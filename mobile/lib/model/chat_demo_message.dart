/// One row in the local-only demo chat. Not persisted or sent to the server.
class ChatDemoMessage {
  const ChatDemoMessage({
    required this.id,
    required this.senderLabel,
    required this.text,
    required this.isFromCurrentUser,
    required this.sentAt,
  });

  final String id;
  final String senderLabel;
  final String text;
  final bool isFromCurrentUser;
  final DateTime sentAt;
}

/// Seed messages shown when the demo chat opens (mock conversation).
List<ChatDemoMessage> chatDemoSeedMessages() {
  final DateTime now = DateTime.now();
  return <ChatDemoMessage>[
    ChatDemoMessage(
      id: 'seed-1',
      senderLabel: 'Jordan Lee',
      text: 'Welcome to the VCTS demo chat!',
      isFromCurrentUser: false,
      sentAt: now.subtract(const Duration(minutes: 18)),
    ),
    ChatDemoMessage(
      id: 'seed-2',
      senderLabel: 'Jordan Lee',
      text: 'Try sending a message — it stays on this device only.',
      isFromCurrentUser: false,
      sentAt: now.subtract(const Duration(minutes: 17)),
    ),
    ChatDemoMessage(
      id: 'seed-3',
      senderLabel: 'You',
      text: 'Looks good, thanks!',
      isFromCurrentUser: true,
      sentAt: now.subtract(const Duration(minutes: 16)),
    ),
  ];
}
