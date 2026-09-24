import 'user_model.dart';

/// LoginResponse represents the response after a successful login.
class LoginResponse {
  final String message;
  final String token;
  final UserModel user;

  LoginResponse({
    required this.message,
    required this.token,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      message: json['message'] as String,
      token: json['token'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

/// MessageResponse is a generic response containing a message.
class MessageResponse {
  final String message;

  MessageResponse({
    required this.message,
  });

  factory MessageResponse.fromJson(Map<String, dynamic> json) {
    return MessageResponse(
      message: json['message'] as String,
    );
  }
}

