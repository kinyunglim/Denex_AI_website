/// APIEndpoints contains all the endpoint paths used in the application.
/// Following the specification in restful-specification.txt.
class APIEndpoints {
  /// Base URL for the API (Placeholder - update with actual server URL)
  static const String baseUrl = 'http://localhost:3000';

  /// Health Check endpoint
  static const String health = '/api/health';

  /// User Authentication endpoints
  static const String sendOtp = '/api/auth/send-otp';
  static const String register = '/api/auth/register';
  static const String login = '/api/auth/login';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String resetPassword = '/api/auth/reset-password';

  /// Admin Authentication endpoints
  static const String adminLogin = '/api/admin/auth/login';
  static const String adminVerifyOtp = '/api/admin/auth/verify-otp';
}

