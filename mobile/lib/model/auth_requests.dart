/// RegisterRequest contains data for user registration.
class RegisterRequest {
  final String email;
  final String password;
  final String otp;
  final String? name;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.otp,
    this.name,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
      'otp': otp,
      if (name != null) 'name': name,
    };
  }
}

/// SendOtpRequest contains data for sending an OTP.
class SendOtpRequest {
  final String email;
  final String type; // "registration" or "password_reset"

  SendOtpRequest({
    required this.email,
    required this.type,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'type': type,
    };
  }
}

/// LoginRequest contains credentials for user login.
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

/// ForgotPasswordRequest contains email for password reset.
class ForgotPasswordRequest {
  final String email;

  ForgotPasswordRequest({
    required this.email,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
    };
  }
}

/// ResetPasswordRequest contains data for resetting a user's password.
class ResetPasswordRequest {
  final String email;
  final String oldPassword;
  final String newPassword;
  final String otp;

  ResetPasswordRequest({
    required this.email,
    required this.oldPassword,
    required this.newPassword,
    required this.otp,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'oldPassword': oldPassword,
      'newPassword': newPassword,
      'otp': otp,
    };
  }
}
