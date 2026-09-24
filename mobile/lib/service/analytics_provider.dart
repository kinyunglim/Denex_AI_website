import 'package:flutter/material.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:logger/logger.dart';
import '../utils/analytics_constants.dart';

/// AnalyticsProvider handles Google Analytics events and logic.
class AnalyticsProvider extends ChangeNotifier {
  // Firebase Analytics instance - made lazy to prevent crash if Firebase not ready.
  FirebaseAnalytics? _analyticsInstance;
  FirebaseAnalytics get _analytics {
    _analyticsInstance ??= FirebaseAnalytics.instance;
    return _analyticsInstance!;
  }

  // Logger for debugging.
  final Logger _logger = Logger();

  /// Get the analytics observer for navigation tracking.
  FirebaseAnalyticsObserver get observer => FirebaseAnalyticsObserver(analytics: _analytics);

  /// Log a custom event to Google Analytics.
  /// [name] is the name of the event (use constants from AnalyticsConstants).
  /// [parameters] is an optional map of additional data to send with the event.
  Future<void> logEvent({
    required String name,
    Map<String, Object>? parameters,
  }) async {
    try {
      // Step 1: Log and send the event to Firebase Analytics.
      _logger.d('Logging event: $name with params: $parameters');
      await _analytics.logEvent(
        name: name,
        parameters: parameters,
      );
    } catch (e) {
      _logger.w('Could not log event $name (Firebase might not be configured): $e');
    }
  }

  /// Log page view event.
  /// [pageName] is the name of the screen or page being viewed.
  Future<void> logPageView({required String pageName}) async {
    try {
      // Step 1: Log the screen view to Firebase Analytics.
      _logger.d('Logging page view: $pageName');
      await _analytics.logScreenView(screenName: pageName);

      // Step 2: Log as a custom event for more granular control if needed.
      await logEvent(
        name: AnalyticsConstants.eventPageTransition,
        parameters: {AnalyticsConstants.paramPageName: pageName},
      );
    } catch (e) {
      _logger.w('Could not log page view $pageName (Firebase might not be configured): $e');
    }
  }

  /// Set user identity for analytics.
  /// [userId] is the unique identifier for the user.
  Future<void> setUserId(String? userId) async {
    try {
      // Step 1: Set the user ID for analytics tracking.
      _logger.d('Setting user ID: $userId');
      await _analytics.setUserId(id: userId);
    } catch (e) {
      _logger.w('Could not set user ID (Firebase might not be configured): $e');
    }
  }

  /// Set custom user properties.
  /// [name] is the property name.
  /// [value] is the property value.
  Future<void> setUserProperty({
    required String name,
    required String? value,
  }) async {
    try {
      // Step 1: Set the custom user property in analytics.
      _logger.d('Setting user property: $name = $value');
      await _analytics.setUserProperty(name: name, value: value);
    } catch (e) {
      _logger.w('Could not set user property $name (Firebase might not be configured): $e');
    }
  }
}
