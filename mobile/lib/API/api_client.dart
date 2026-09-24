import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import 'api_endpoints.dart';
import '../utils/auth_storage.dart';

/// APIClient is a wrapper around Dio to handle HTTP requests.
/// It includes base configuration, logging, and error handling.
class APIClient {
  /// JSON keys whose values must not appear in debug logs.
  static const Set<String> _sensitiveKeys = {
    'password',
    'oldpassword',
    'newpassword',
    'confirmpassword',
    'otp',
    'token',
    'accesstoken',
    'refreshtoken',
    'secret',
    'apikey',
  };
  late final Dio _dio;
  final AuthStorage _authStorage;
  final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 80,
      colors: true,
      printEmojis: true,
      dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
    ),
  );

  /// Constructor to initialize APIClient with base settings.
  /// [authStorage] provides persisted auth token access.
  APIClient({AuthStorage? authStorage})
      : _authStorage = authStorage ?? AuthStorage() {
    // Step 1: Configure Dio with base settings and timeouts.
    _dio = Dio(
      BaseOptions(
        baseUrl: APIEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Step 2: Add logging and auth interceptors.
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Step 2a: Attach persisted auth token when available.
        final String? token = await _authStorage.getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        // Step 2b: Log the outgoing request.
        _logger.i('REQUEST[${options.method}] => PATH: ${options.path}');
        _logger.d('Data: ${_redactForLog(options.data)}');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        // Step 2c: Log the response payload.
        _logger.i('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
        _logger.d('Body: ${_redactForLog(response.data)}');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        // Step 2d: Log error details for debugging.
        _logger.e('ERROR[${e.response?.statusCode}] => PATH: ${e.requestOptions.path}');
        _logger.e('Message: ${e.message}');
        return handler.next(e);
      },
    ));
  }

  /// Returns a copy of [data] safe for debug logs (passwords, OTPs, tokens redacted).
  dynamic _redactForLog(dynamic data) {
    if (data is Map) {
      return {
        for (final MapEntry<dynamic, dynamic> entry in data.entries)
          entry.key: _sensitiveKeys.contains(entry.key.toString().toLowerCase())
              ? '***'
              : _redactForLog(entry.value),
      };
    }
    if (data is List) {
      return data.map(_redactForLog).toList();
    }
    return data;
  }

  /// Performs a GET request.
  /// [path] endpoint path.
  /// [queryParameters] optional map of query parameters.
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Performs a POST request.
  /// [path] endpoint path.
  /// [data] request body data.
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }
}

