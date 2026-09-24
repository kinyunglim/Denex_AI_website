/// Constants for Google Analytics
/// This file contains event names, parameter names, and other GA-related settings.
class AnalyticsConstants {
  // Measurement ID for GA4 (Web)
  // Replace with your actual Measurement ID if needed for web configuration
  static const String measurementId = 'G-XXXXXXXXXX';

  // Custom Event Names
  static const String eventLogin = 'login_success';
  static const String eventLoginFailed = 'login_failed';
  static const String eventRegister = 'register_success';
  static const String eventPageTransition = 'page_transition';

  // Custom Parameter Names
  static const String paramPageName = 'page_name';
  static const String paramErrorMessage = 'error_message';
  static const String paramUserId = 'user_id';
}

