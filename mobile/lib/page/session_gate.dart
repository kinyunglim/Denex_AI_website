import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:provider/provider.dart';
import '../l10n/generated/app_localizations.dart';
import '../utils/auth_storage.dart';
import 'home_page.dart';
import 'login_page.dart';

/// SessionGate picks the initial screen: Home when a non-expired JWT is stored,
/// otherwise Login. Aligns with server-side JWT `exp` (e.g. 7-day lifetime).
class SessionGate extends StatefulWidget {
  /// Constructor for SessionGate.
  const SessionGate({super.key});

  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  bool _bootstrapStarted = false;
  Widget? _home;

  /// Resolves stored token vs JWT expiry, then sets [_home].
  Future<void> _bootstrap() async {
    final AuthStorage storage = context.read<AuthStorage>();
    final String? token = await storage.getToken();
    if (!mounted) {
      return;
    }
    Widget next;
    if (token != null && token.isNotEmpty) {
      try {
        if (!JwtDecoder.isExpired(token)) {
          final AppLocalizations l10n = AppLocalizations.of(context)!;
          next = HomePage(title: l10n.homePage);
        } else {
          await storage.clearToken();
          if (!mounted) {
            return;
          }
          next = const LoginPage();
        }
      } catch (_) {
        await storage.clearToken();
        if (!mounted) {
          return;
        }
        next = const LoginPage();
      }
    } else {
      next = const LoginPage();
    }
    if (mounted) {
      setState(() {
        _home = next;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_home == null) {
      if (!_bootstrapStarted) {
        _bootstrapStarted = true;
        WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
      }
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    return _home!;
  }
}
