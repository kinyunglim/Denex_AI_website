import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/generated/app_localizations.dart';
import '../component/language_switcher.dart';
import '../service/auth_provider.dart';
import '../model/auth_requests.dart';

/// ForgotPasswordPage provides the user interface for password recovery.
class ForgotPasswordPage extends StatefulWidget {
  /// Constructor for ForgotPasswordPage
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _oldPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  /// Loading state for the process.
  bool _isLoading = false;

  /// Whether the OTP has been sent.
  bool _isOtpSent = false;

  /// Handles sending the forgot password OTP.
  Future<void> _sendForgotPasswordOtp() async {
    if (_emailController.text.isEmpty || !_emailController.text.contains('@')) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.pleaseEnterValidEmail)),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Step 1: Read AuthProvider from provider.
      final AuthProvider authProvider = context.read<AuthProvider>();
      // Step 2: Build the forgot-password request payload.
      final request = ForgotPasswordRequest(
        email: _emailController.text.trim(),
      );

      // Step 3: Send the forgot-password request via the provider.
      final response = await authProvider.forgotPassword(request);

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
          _isLoading = false;
        });
      }
    }
  }

  /// Handles the password reset process.
  Future<void> _resetPassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        // Step 1: Read AuthProvider from provider.
        final AuthProvider authProvider = context.read<AuthProvider>();
        // Step 2: Build the reset-password request payload.
        final request = ResetPasswordRequest(
          email: _emailController.text.trim(),
          oldPassword: _oldPasswordController.text,
          newPassword: _newPasswordController.text,
          otp: _otpController.text.trim(),
        );

        // Step 3: Reset the password via the provider.
        final response = await authProvider.resetPassword(request);

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
        title: Text(l10n.resetPassword),
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
              const SizedBox(height: 32),
              Icon(
                _isOtpSent ? Icons.lock_open_outlined : Icons.lock_reset_outlined,
                size: 80,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 24),
              Text(
                l10n.forgotPasswordTitle,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                _isOtpSent 
                  ? "Enter the OTP and your new password details below."
                  : l10n.forgotPasswordSubtitle,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 48),
              // Email field (always visible but disabled after OTP sent)
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: l10n.email,
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
                enabled: !_isLoading && !_isOtpSent,
                keyboardType: TextInputType.emailAddress,
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
              
              if (_isOtpSent) ...[
                const SizedBox(height: 20),
                // OTP field
                TextFormField(
                  controller: _otpController,
                  decoration: InputDecoration(
                    labelText: l10n.otp,
                    prefixIcon: const Icon(Icons.vibration_outlined),
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
                const SizedBox(height: 20),
                // Old Password field
                TextFormField(
                  controller: _oldPasswordController,
                  decoration: InputDecoration(
                    labelText: l10n.oldPassword,
                    prefixIcon: const Icon(Icons.lock_outline),
                  ),
                  enabled: !_isLoading,
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return l10n.pleaseEnterOldPassword;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                // New Password field
                TextFormField(
                  controller: _newPasswordController,
                  decoration: InputDecoration(
                    labelText: l10n.newPassword,
                    prefixIcon: const Icon(Icons.lock_outline),
                  ),
                  enabled: !_isLoading,
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return l10n.pleaseEnterNewPassword;
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
                  enabled: !_isLoading,
                  obscureText: true,
                  validator: (value) {
                    if (value != _newPasswordController.text) {
                      return l10n.passwordsDoNotMatch;
                    }
                    return null;
                  },
                ),
              ],
              
              const SizedBox(height: 32),
              
              // Action button
              FilledButton(
                onPressed: _isLoading 
                  ? null 
                  : (_isOtpSent ? _resetPassword : _sendForgotPasswordOtp),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(_isOtpSent ? l10n.resetPassword : l10n.sendResetLink),
              ),
              
              if (_isOtpSent)
                TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _isOtpSent = false),
                  child: const Text("Change Email"),
                ),
                
              const SizedBox(height: 16),
              // Back to login
              TextButton(
                onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                child: Text(l10n.backToLogin),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _oldPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
