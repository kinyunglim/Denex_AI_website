/// HealthResponse represents the response from the health check endpoint.
class HealthResponse {
  final String status;
  final String timestamp;
  final num uptime;

  /// Constructor for HealthResponse
  HealthResponse({
    required this.status,
    required this.timestamp,
    required this.uptime,
  });

  /// Factory constructor to create a HealthResponse from a JSON map.
  factory HealthResponse.fromJson(Map<String, dynamic> json) {
    return HealthResponse(
      status: json['status'] as String,
      timestamp: json['timestamp'] as String,
      uptime: json['uptime'] as num,
    );
  }

  /// Converts the HealthResponse to a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'timestamp': timestamp,
      'uptime': uptime,
    };
  }
}

