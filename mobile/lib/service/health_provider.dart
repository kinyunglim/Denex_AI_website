import 'package:flutter/material.dart';
import 'package:vctsmobile/API/api_client.dart';
import 'package:vctsmobile/API/api_endpoints.dart';
import 'package:vctsmobile/model/health_response.dart';

/// HealthProvider handles server health check API calls.
class HealthProvider extends ChangeNotifier {
  final APIClient _apiClient;

  /// Constructor for HealthProvider.
  /// [_apiClient] instance of APIClient.
  HealthProvider(this._apiClient);

  /// Checks the server health status.
  Future<HealthResponse> checkHealth() async {
    // Step 1: Call the health endpoint.
    final response = await _apiClient.get(APIEndpoints.health);
    // Step 2: Parse the response into a typed model.
    return HealthResponse.fromJson(response.data);
  }
}
