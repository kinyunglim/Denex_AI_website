import 'package:flutter/material.dart';
import '../component/demo_chat_panel.dart';
import '../l10n/generated/app_localizations.dart';

/// Full-screen demo chat opened from the drawer or the home demo button.
class DemoChatPage extends StatelessWidget {
  /// Creates the demo chat screen.
  const DemoChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.drawerDemoChat),
      ),
      body: const DemoChatPanel(),
    );
  }
}
