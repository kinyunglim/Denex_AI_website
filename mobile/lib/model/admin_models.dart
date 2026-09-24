/// AdminLoginRequest contains credentials for admin login.
class AdminLoginRequest {
  final String email;
  final String password;

  AdminLoginRequest({
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

/// AdminLoginResponse represents the response after step 1 of admin login.
class AdminLoginResponse {
  final bool mfaRequired;
  final String email;

  AdminLoginResponse({
    required this.mfaRequired,
    required this.email,
  });

  factory AdminLoginResponse.fromJson(Map<String, dynamic> json) {
    return AdminLoginResponse(
      mfaRequired: json['mfaRequired'] as bool,
      email: json['email'] as String,
    );
  }
}

/// AdminVerifyOtpRequest contains data for verifying admin 2FA OTP.
class AdminVerifyOtpRequest {
  final String email;
  final String code;

  AdminVerifyOtpRequest({
    required this.email,
    required this.code,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'code': code,
    };
  }
}

/// AdminModel represents an admin user.
class AdminModel {
  final String id;
  final String email;
  final String name;
  final List<String> permissions;

  AdminModel({
    required this.id,
    required this.email,
    required this.name,
    required this.permissions,
  });

  factory AdminModel.fromJson(Map<String, dynamic> json) {
    return AdminModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      permissions: List<String>.from(json['permissions'] as List),
    );
  }
}

/// AdminLoginFinalResponse represents the response after successful OTP verification.
class AdminLoginFinalResponse {
  final String message;
  final String token;
  final AdminModel admin;

  AdminLoginFinalResponse({
    required this.message,
    required this.token,
    required this.admin,
  });

  factory AdminLoginFinalResponse.fromJson(Map<String, dynamic> json) {
    return AdminLoginFinalResponse(
      message: json['message'] as String,
      token: json['token'] as String,
      admin: AdminModel.fromJson(json['admin'] as Map<String, dynamic>),
    );
  }
}

