/// UserModel represents a user in the system.
class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;

  /// Constructor for UserModel
  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  /// Factory constructor to create a UserModel from a JSON map.
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
    );
  }

  /// Converts the UserModel to a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
    };
  }
}

