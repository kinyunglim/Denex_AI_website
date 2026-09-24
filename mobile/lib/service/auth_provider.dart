import 'package:flutter/material.dart';
import 'package:vctsmobile/API/api_client.dart';
import 'package:vctsmobile/API/api_endpoints.dart';
import 'package:vctsmobile/model/admin_models.dart';
import 'package:vctsmobile/model/auth_requests.dart';
import 'package:vctsmobile/model/auth_responses.dart';
import 'package:vctsmobile/utils/auth_storage.dart';

/// AuthProvider handles authentication logic and token persistence.
class AuthProvider extends ChangeNotifier {
  final APIClient _apiClient;
  final AuthStorage _authStorage;

  /// Constructor for AuthProvider.
  /// [_apiClient] instance of APIClient.
  /// [_authStorage] handles token persistence.
  AuthProvider(this._apiClient, {AuthStorage? authStorage})
      : _authStorage = authStorage ?? AuthStorage();

  /// Sends an OTP to the user's email.
  /// [request] email and type ("registration" or "password_reset").
  Future<MessageResponse> sendOtp(SendOtpRequest request) async {
    // Step 1: Call the send OTP endpoint.
    final response = await _apiClient.post(
      APIEndpoints.sendOtp,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return MessageResponse.fromJson(response.data);
  }

  /// Registers a new user.
  /// [request] registration data including OTP.
  Future<MessageResponse> register(RegisterRequest request) async {
    // Step 1: Call the registration endpoint.
    final response = await _apiClient.post(
      APIEndpoints.register,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return MessageResponse.fromJson(response.data);
  }

  /// Authenticates a user.
  /// [request] login credentials.
  Future<LoginResponse> login(LoginRequest request) async {
    // Step 1: Call login endpoint with credentials.
    final response = await _apiClient.post(
      APIEndpoints.login,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    final LoginResponse loginResponse = LoginResponse.fromJson(response.data);
    // Step 3: Persist auth token so it survives app restarts until logout.
    if (loginResponse.token.isNotEmpty) {
      await _authStorage.saveToken(token: loginResponse.token);
    }
    // Step 4: Return the parsed response to the caller.
    return loginResponse;
  }

  /// Sends a password reset OTP.
  /// [request] email for password reset.
  Future<MessageResponse> forgotPassword(ForgotPasswordRequest request) async {
    // Step 1: Call forgot password endpoint.
    final response = await _apiClient.post(
      APIEndpoints.forgotPassword,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return MessageResponse.fromJson(response.data);
  }

  /// Resets the user's password.
  /// [request] email, oldPassword, newPassword, and OTP.
  Future<MessageResponse> resetPassword(ResetPasswordRequest request) async {
    // Step 1: Call reset password endpoint.
    final response = await _apiClient.post(
      APIEndpoints.resetPassword,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return MessageResponse.fromJson(response.data);
  }

  /// Initiates admin login (Step 1).
  /// [request] admin login credentials.
  Future<AdminLoginResponse> adminLogin(AdminLoginRequest request) async {
    // Step 1: Call admin login endpoint.
    final response = await _apiClient.post(
      APIEndpoints.adminLogin,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return AdminLoginResponse.fromJson(response.data);
  }

  /// Verifies admin OTP (Step 2).
  /// [request] admin email and OTP code.
  Future<AdminLoginFinalResponse> adminVerifyOtp(AdminVerifyOtpRequest request) async {
    // Step 1: Call admin verify OTP endpoint.
    final response = await _apiClient.post(
      APIEndpoints.adminVerifyOtp,
      data: request.toJson(),
    );
    // Step 2: Parse the response into a typed model.
    return AdminLoginFinalResponse.fromJson(response.data);
  }

  /// Logs out the current user by clearing local auth data.
  /// Side effect: removes the persisted auth token.
  Future<void> logout() async {
    // Step 1: Clear the locally stored token.
    await _authStorage.clearToken();
  }
}
