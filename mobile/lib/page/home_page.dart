import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:provider/provider.dart';
import '../l10n/generated/app_localizations.dart';
import '../component/app_drawer.dart';
import '../component/language_switcher.dart';
import '../service/auth_provider.dart';
import 'contacts_list_page.dart';
import 'demo_chat_page.dart';
import 'login_page.dart';
import 'profile_page.dart';

/// HomePage is the main screen displayed after login.
class HomePage extends StatefulWidget {
  /// Constructor for HomePage
  const HomePage({super.key, required this.title});

  /// The title displayed in the app bar.
  final String title;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  /// Updates the selected tab index for the bottom navigation.
  /// [index] is the newly selected tab index.
  void _onTabSelected(int index) {
    // Step 1: Update the selected index and rebuild the UI.
    setState(() {
      _selectedIndex = index;
    });
  }

  /// Switches tabs from the drawer and closes the drawer overlay.
  void _onDrawerNavTap(int index) {
    Navigator.of(context).pop();
    _onTabSelected(index);
  }

  /// Opens the local-only demo chat screen (drawer button or home FAB).
  void _openDemoChat() {
    final ScaffoldState? scaffold = Scaffold.maybeOf(context);
    if (scaffold?.isDrawerOpen ?? false) {
      Navigator.of(context).pop();
    }
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (BuildContext context) => const DemoChatPage(),
      ),
    );
  }

  /// Logs out the user and returns to the login screen.
  /// Side effect: clears the persisted auth token.
  Future<void> _logout() async {
    // Step 1: Read AuthProvider from provider.
    final AuthProvider authProvider = context.read<AuthProvider>();
    // Step 2: Clear the persisted token from local storage.
    await authProvider.logout();
    // Step 3: Stop if the widget is no longer mounted.
    if (!mounted) {
      return;
    }
    // Step 4: Navigate to login and clear navigation stack.
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginPage()),
      (route) => false,
    );
  }

  /// Builds a placeholder view for tab bodies until real content is added.
  /// [title] is the section title shown to the user.
  Widget _buildPlaceholderTab(String title) {
    // Step 1: Render a simple placeholder until real content is added.
    return Center(
      child: Text(
        title,
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final List<Widget> tabs = [
      const ContactsListPage(),
      _buildPlaceholderTab(l10n.activity),
      const ProfilePage(),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          const LanguageSwitcher(),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      drawer: AppDrawer(
        selectedIndex: _selectedIndex,
        onNavTap: _onDrawerNavTap,
        onDemoTap: _openDemoChat,
        onLogout: () {
          Navigator.of(context).pop();
          _logout();
        },
      ),
      body: tabs[_selectedIndex],
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton.extended(
              onPressed: _openDemoChat,
              icon: const Icon(Icons.chat_bubble_outline),
              label: Text(l10n.drawerDemoButton),
            )
          : null,
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(
              top: BorderSide(color: Colors.grey.shade200),
            ),
          ),
          child: GNav(
            selectedIndex: _selectedIndex,
            onTabChange: _onTabSelected,
            gap: 8,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Theme.of(context).colorScheme.onSurface,
            activeColor: Theme.of(context).colorScheme.primary,
            tabBackgroundColor: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
            tabs: [
              GButton(
                icon: Icons.home_outlined,
                text: l10n.homePage,
              ),
              GButton(
                icon: Icons.notifications_outlined,
                text: l10n.activity,
              ),
              GButton(
                icon: Icons.account_circle_outlined,
                text: l10n.profile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
