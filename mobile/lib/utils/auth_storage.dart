import 'package:shared_preferences/shared_preferences.dart';

/// AuthStorage handles persisting auth data on device.
class AuthStorage {
  /// Storage key for the auth token.
  static const String _tokenKey = 'auth_token';

  /// Saves the auth token to local storage.
  /// [token] is the raw token string returned by the API.
  /// Side effect: writes to on-device storage.
  Future<void> saveToken({required String token}) async {
    // Step 1: Load shared preferences instance.
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    // Step 2: Persist the token under the storage key.
    await prefs.setString(_tokenKey, token);
  }

  /// Loads the auth token from local storage.
  /// Returns the token if present, otherwise null.
  Future<String?> getToken() async {
    // Step 1: Load shared preferences instance.
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    // Step 2: Read the token value for the storage key.
    return prefs.getString(_tokenKey);
  }

  /// Removes the auth token from local storage.
  /// Side effect: deletes token data from on-device storage.
  Future<void> clearToken() async {
    // Step 1: Load shared preferences instance.
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    // Step 2: Remove the token value for the storage key.
    await prefs.remove(_tokenKey);
  }
}
