// Sample tests for the VCTS template. These are pure-Dart tests (no Firebase,
// network, or platform plugins) so they run reliably in CI. Use them as a
// pattern: test models (fromJson/toJson) and provider logic in isolation.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vctsmobile/model/user_model.dart';
import 'package:vctsmobile/service/locale_provider.dart';

void main() {
  group('UserModel', () {
    test('round-trips through JSON', () {
      const json = {
        'id': '1',
        'email': 'a@example.com',
        'name': 'Alice',
        'role': 'user',
      };

      final user = UserModel.fromJson(json);

      expect(user.email, 'a@example.com');
      expect(user.name, 'Alice');
      expect(user.toJson(), json);
    });
  });

  group('LocaleProvider', () {
    test('defaults to Traditional Chinese (zh-HK)', () {
      expect(LocaleProvider().locale, const Locale('zh', 'HK'));
    });

    test('setLocale accepts a supported locale', () {
      final provider = LocaleProvider();
      provider.setLocale(const Locale('en'));
      expect(provider.locale, const Locale('en'));
    });

    test('setLocale ignores an unsupported locale', () {
      final provider = LocaleProvider();
      provider.setLocale(const Locale('fr'));
      expect(provider.locale, const Locale('zh', 'HK'));
    });
  });
}
