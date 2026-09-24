import 'package:flutter/material.dart';

/// LocaleProvider manages the application's locale state.
class LocaleProvider extends ChangeNotifier {
  /// Current locale for the application.
  Locale _locale = const Locale('zh', 'HK');

  /// Supported locales list.
  static const List<Locale> supportedLocales = [
    Locale('en'),
    Locale('zh'), // Simplified Chinese
    Locale('zh', 'HK'), // Traditional Chinese
  ];

  /// Returns the current locale.
  Locale get locale => _locale;

  /// Changes the current locale.
  /// [locale] must be one of supportedLocales.
  void setLocale(Locale locale) {
    // Step 1: Ensure the locale is supported.
    if (supportedLocales.contains(locale)) {
      // Step 2: Update local state.
      _locale = locale;
      // Step 3: Notify listeners to rebuild dependents.
      notifyListeners();
    }
  }

  /// Helper to get language name from locale.
  /// [locale] is the locale to display.
  String getLanguageName(Locale locale) {
    switch (locale.languageCode) {
      case 'en':
        return 'English';
      case 'zh':
        if (locale.countryCode == 'HK' || locale.countryCode == 'TW') {
          return '繁體中文';
        }
        return '简体中文';
      default:
        return 'English';
    }
  }
}
