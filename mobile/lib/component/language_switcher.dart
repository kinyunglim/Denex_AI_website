import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../service/locale_provider.dart';

/// LanguageSwitcher provides a dropdown to change the application language.
class LanguageSwitcher extends StatelessWidget {
  /// Constructor for LanguageSwitcher.
  const LanguageSwitcher({super.key, this.isReversed = false});

  /// Whether to show the dropdown in reverse (white text for dark backgrounds).
  final bool isReversed;

  @override
  Widget build(BuildContext context) {
    return Consumer<LocaleProvider>(
      builder: (context, provider, child) {
        // Step 1: Use the LocaleProvider from the consumer.
        return DropdownButtonHideUnderline(
          child: DropdownButton<Locale>(
            value: provider.locale,
            icon: Icon(
              Icons.language,
              color: isReversed ? Colors.white : Theme.of(context).colorScheme.primary,
            ),
            onChanged: (Locale? newLocale) {
              if (newLocale != null) {
                // Step 2: Update locale through the provider.
                provider.setLocale(newLocale);
              }
            },
            items: LocaleProvider.supportedLocales.map((Locale locale) {
              return DropdownMenuItem<Locale>(
                value: locale,
                child: Text(
                  provider.getLanguageName(locale),
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
              );
            }).toList(),
          ),
        );
      },
    );
  }
}

