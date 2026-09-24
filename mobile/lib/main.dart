import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'l10n/generated/app_localizations.dart';
import 'page/session_gate.dart';
import 'API/api_client.dart';
import 'service/auth_provider.dart';
import 'service/analytics_provider.dart';
import 'service/health_provider.dart';
import 'service/locale_provider.dart';
import 'utils/auth_storage.dart';

/// The entry point of the application.
Future<void> main() async {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (powers analytics). Wrapped in try/catch so the app
  // still runs before you add the platform config files:
  //   - Android: android/app/google-services.json
  //   - iOS:     ios/Runner/GoogleService-Info.plist
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }

  runApp(const MyApp());
}

/// MyApp is the root widget of the application.
/// It configures the theme and the initial page.
class MyApp extends StatelessWidget {
  /// Constructor for MyApp
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Step 1: Provide shared services at the app root.
    return MultiProvider(
      providers: [
        Provider<AuthStorage>(
          create: (context) => AuthStorage(),
        ),
        Provider<APIClient>(
          create: (context) => APIClient(
            authStorage: context.read<AuthStorage>(),
          ),
        ),
        ChangeNotifierProvider<AuthProvider>(
          create: (context) => AuthProvider(
            context.read<APIClient>(),
            authStorage: context.read<AuthStorage>(),
          ),
        ),
        ChangeNotifierProvider<LocaleProvider>(
          create: (context) => LocaleProvider(),
        ),
        ChangeNotifierProvider<AnalyticsProvider>(
          create: (context) => AnalyticsProvider(),
        ),
        ChangeNotifierProvider<HealthProvider>(
          create: (context) => HealthProvider(context.read<APIClient>()),
        ),
      ],
      child: Consumer<LocaleProvider>(
        builder: (context, localeProvider, child) {
          // Step 2: Rebuild MaterialApp when locale changes.
          return MaterialApp(
            title: 'VCTS Mobile',
            debugShowCheckedModeBanner: false,
            locale: localeProvider.locale,
            localizationsDelegates: [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: LocaleProvider.supportedLocales,
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: const Color(0xFF5F67D2), // Purple/Blue from logo
                secondary: const Color(0xFF5CCBDD), // Teal/Cyan from logo
                brightness: Brightness.light,
              ),
              useMaterial3: true,
              // Global Input Decoration Theme for Material 3 look
              inputDecorationTheme: InputDecorationTheme(
                filled: true,
                fillColor: Colors.transparent,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.grey),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF5F67D2), width: 2),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
              // Global Button Themes
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              filledButtonTheme: FilledButtonThemeData(
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              textButtonTheme: TextButtonThemeData(
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              // Card Theme
              cardTheme: CardThemeData(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.grey.shade300),
                ),
                color: Colors.white,
              ),
              // App Bar Theme
              appBarTheme: const AppBarTheme(
                centerTitle: true,
                scrolledUnderElevation: 0,
              ),
            ),
            // Step 3: Restore session from stored JWT when valid, else show login.
            home: const SessionGate(),
          );
        },
      ),
    );
  }
}
