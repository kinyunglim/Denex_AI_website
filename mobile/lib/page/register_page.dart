import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/generated/app_localizations.dart';
import '../component/language_switcher.dart';
import '../service/auth_provider.dart';
import '../model/auth_requests.dart';

/// RegisterPage provides the user interface for new user registration.
class RegisterPage extends StatefulWidget {
  /// Constructor for RegisterPage
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  /// Loading state for the registration process.
  bool _isLoading = false;
  
  /// Loading state for sending OTP.
  bool _isSendingOtp = false;

  /// Whether the OTP has been successfully sent.
  bool _isOtpSent = false;

  /// Handles sending the OTP.
  Future<void> _sendOtp() async {
    // Validate only email and password fields first if needed, 
    // but typically we just need the email for OTP.
    if (_emailController.text.isEmpty || !_emailController.text.contains('@')) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.pleaseEnterValidEmail)),
      );
      return;
    }

    setState(() {
      _isSendingOtp = true;
    });

    try {
      // Step 1: Read AuthProvider from provider.
      final AuthProvider authProvider = context.read<AuthProvider>();
      // Step 2: Build the send-OTP request payload.
      final request = SendOtpRequest(
        email: _emailController.text.trim(),
        type: "registration",
      );

      // Step 3: Send the OTP request via the provider.
      final response = await authProvider.sendOtp(request);

      if (mounted) {
        setState(() {
          _isOtpSent = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.message)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSendingOtp = false;
        });
      }
    }
  }

  /// Handles the registration process.
  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        // Step 1: Read AuthProvider from provider.
        final AuthProvider authProvider = context.read<AuthProvider>();
        // Step 2: Build the registration request payload.
        final request = RegisterRequest(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          otp: _otpController.text.trim(),
          name: _nameController.text.trim(),
        );

        // Step 3: Register the user via the provider.
        final response = await authProvider.register(request);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.message)),
          );
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.createAccount),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: LanguageSwitcher(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                l10n.joinUs,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                l10n.registerSubtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey.shade600,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Name field
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: l10n.fullName,
                  prefixIcon: const Icon(Icons.person_outline),
                ),
                enabled: !_isLoading && !_isOtpSent,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return l10n.pleaseEnterName;
                  }
                  if (value.length < 2) {
                    return l10n.nameTooShort;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Email field
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: l10n.email,
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
                enabled: !_isLoading && !_isOtpSent,
                keyboardType: TextInputType.emailAddress,
                // Ensure email input never auto-capitalizes or autocorrects.
                textCapitalization: TextCapitalization.none,
                autocorrect: false,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return l10n.pleaseEnterEmail;
                  }
                  if (!value.contains('@')) {
                    return l10n.pleaseEnterValidEmail;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Password field
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: l10n.password,
                  prefixIcon: const Icon(Icons.lock_outline),
                ),
                enabled: !_isLoading && !_isOtpSent,
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return l10n.pleaseEnterPassword;
                  }
                  if (value.length < 8) {
                    return l10n.passwordTooShortRegister;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Confirm Password field
              TextFormField(
                controller: _confirmPasswordController,
                decoration: InputDecoration(
                  labelText: l10n.confirmPassword,
                  prefixIcon: const Icon(Icons.lock_clock_outlined),
                ),
                enabled: !_isLoading && !_isOtpSent,
                obscureText: true,
                validator: (value) {
                  if (value != _passwordController.text) {
                    return l10n.passwordsDoNotMatch;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),
              
              if (!_isOtpSent)
                // Send OTP button (Step 1)
                FilledButton(
                  onPressed: (_isLoading || _isSendingOtp) ? null : _sendOtp,
                  child: _isSendingOtp
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(l10n.sendOtp),
                ),

              if (_isOtpSent) ...[
                // OTP field (Step 2)
                TextFormField(
                  controller: _otpController,
                  decoration: InputDecoration(
                    labelText: l10n.otp,
                    prefixIcon: const Icon(Icons.vibration_outlined),
                    helperText: "OTP sent to ${_emailController.text}",
                  ),
                  enabled: !_isLoading,
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return l10n.pleaseEnterOtp;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 32),
                // Register button
                FilledButton(
                  onPressed: _isLoading ? null : _register,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(l10n.register),
                ),
                TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _isOtpSent = false),
                  child: const Text("Change Email"),
                ),
              ],

              const SizedBox(height: 24),
              // Back to login
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    l10n.alreadyHaveAccount,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  TextButton(
                    onPressed: (_isLoading || _isSendingOtp) ? null : () => Navigator.of(context).pop(),
                    child: Text(l10n.login),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
