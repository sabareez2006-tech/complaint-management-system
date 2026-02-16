import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl =
      'https://complaint-server-3rni.onrender.com/api';

  // Get stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Get stored role
  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('role');
  }

  // Get headers with auth token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ==================== AUTH ====================

  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    String role = 'student',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'full_name': fullName,
        'email': email,
        'password': password,
        'role': role,
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('role', data['user']['role']);
      await prefs.setString('user_name', data['user']['full_name']);
      await prefs.setString('user_email', data['user']['email']);
    }

    return {
      ...data,
      'statusCode': response.statusCode,
    };
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // ==================== COMPLAINTS ====================

  static Future<Map<String, dynamic>> createComplaint({
    required String title,
    required String description,
    required String category,
    required String priority,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/complaints'),
      headers: headers,
      body: jsonEncode({
        'title': title,
        'description': description,
        'category': category,
        'priority': priority,
      }),
    );
    return {
      ...jsonDecode(response.body),
      'statusCode': response.statusCode,
    };
  }

  static Future<List<dynamic>> getMyComplaints() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/complaints/my-complaints'),
      headers: headers,
    );
    final data = jsonDecode(response.body);
    return data['complaints'] ?? [];
  }

  static Future<List<dynamic>> getAllComplaints() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/complaints'),
      headers: headers,
    );
    final data = jsonDecode(response.body);
    return data['complaints'] ?? [];
  }

  static Future<Map<String, dynamic>> updateStatus({
    required int id,
    required String status,
  }) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/complaints/$id/status'),
      headers: headers,
      body: jsonEncode({'status': status}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> addFeedback({
    required int id,
    required String feedback,
  }) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/complaints/$id/feedback'),
      headers: headers,
      body: jsonEncode({'feedback': feedback}),
    );
    return jsonDecode(response.body);
  }

  // ==================== ANALYTICS ====================

  static Future<Map<String, dynamic>> getAnalytics() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/complaints/analytics'),
      headers: headers,
    );
    return jsonDecode(response.body);
  }

  // ==================== USER INFO ====================

  static Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_name');
  }
}
