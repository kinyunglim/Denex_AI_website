import 'package:flutter/material.dart';
import '../l10n/generated/app_localizations.dart';

/// Left navigation drawer for [HomePage]: personal info, quick actions, tabs, logout.
class AppDrawer extends StatelessWidget {
  /// Creates the app drawer.
  const AppDrawer({
    super.key,
    required this.selectedIndex,
    required this.onNavTap,
    required this.onDemoTap,
    required this.onLogout,
  });

  /// Currently selected bottom-nav tab index.
  final int selectedIndex;

  /// Called when the user picks Home, Activity, or Profile from the drawer.
  final ValueChanged<int> onNavTap;

  /// Opens the local-only demo chat screen.
  final VoidCallback onDemoTap;

  /// Signs the user out and returns to login.
  final VoidCallback onLogout;

  static String _initials(String displayName) {
    final String trimmed = displayName.trim();
    if (trimmed.isEmpty) {
      return '?';
    }
    final List<String> parts =
        trimmed.split(RegExp(r'\s+')).where((String p) => p.isNotEmpty).toList();
    if (parts.length >= 2) {
      return '${parts[0].characters.first}${parts[1].characters.first}'
          .toUpperCase();
    }
    return trimmed.characters.first.toUpperCase();
  }

  void _showComingSoon(BuildContext context, AppLocalizations l10n) {
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        content: Text(l10n.profileComingSoon),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;

    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            _DrawerPersonalHeader(
              l10n: l10n,
              theme: theme,
              colorScheme: cs,
              initials: _initials(l10n.profileDemoDisplayName),
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                    child: Text(
                      l10n.drawerQuickActionsSection,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: cs.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        FilledButton.icon(
                          onPressed: onDemoTap,
                          icon: const Icon(Icons.chat_bubble_outline),
                          label: Text(l10n.drawerDemoButton),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => onNavTap(2),
                          icon: const Icon(Icons.person_outline),
                          label: Text(l10n.profileEditProfile),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => onNavTap(1),
                          icon: const Icon(Icons.notifications_outlined),
                          label: Text(l10n.viewActivity),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => _showComingSoon(context, l10n),
                          icon: const Icon(Icons.help_outline),
                          label: Text(l10n.profileHelp),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                    child: Text(
                      l10n.drawerNavigationSection,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: cs.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  _DrawerNavTile(
                    icon: Icons.home_outlined,
                    label: l10n.homePage,
                    selected: selectedIndex == 0,
                    onTap: () => onNavTap(0),
                  ),
                  _DrawerNavTile(
                    icon: Icons.notifications_outlined,
                    label: l10n.activity,
                    selected: selectedIndex == 1,
                    onTap: () => onNavTap(1),
                  ),
                  _DrawerNavTile(
                    icon: Icons.account_circle_outlined,
                    label: l10n.profile,
                    selected: selectedIndex == 2,
                    onTap: () => onNavTap(2),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.logout, color: cs.error),
              title: Text(
                l10n.drawerLogout,
                style: TextStyle(color: cs.error),
              ),
              onTap: onLogout,
            ),
          ],
        ),
      ),
    );
  }
}

/// Drawer header showing demo user name, email, and role below the avatar.
class _DrawerPersonalHeader extends StatelessWidget {
  const _DrawerPersonalHeader({
    required this.l10n,
    required this.theme,
    required this.colorScheme,
    required this.initials,
  });

  final AppLocalizations l10n;
  final ThemeData theme;
  final ColorScheme colorScheme;
  final String initials;

  @override
  Widget build(BuildContext context) {
    return DrawerHeader(
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            colorScheme.primary,
            Color.lerp(colorScheme.primary, colorScheme.secondary, 0.45)!,
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              CircleAvatar(
                radius: 28,
                backgroundColor: colorScheme.onPrimary.withValues(alpha: 0.22),
                foregroundColor: colorScheme.onPrimary,
                child: Text(
                  initials,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      l10n.profileDemoDisplayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      l10n.profileDemoJobTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onPrimary.withValues(alpha: 0.92),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Icon(
                Icons.email_outlined,
                size: 16,
                color: colorScheme.onPrimary.withValues(alpha: 0.9),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  l10n.profileDemoEmail,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onPrimary.withValues(alpha: 0.92),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Chip(
            visualDensity: VisualDensity.compact,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            backgroundColor: colorScheme.onPrimary.withValues(alpha: 0.16),
            side: BorderSide(
              color: colorScheme.onPrimary.withValues(alpha: 0.35),
            ),
            label: Text(
              '${l10n.profileRoleLabel}: ${l10n.profileDemoRoleValue}',
              style: theme.textTheme.labelSmall?.copyWith(
                color: colorScheme.onPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DrawerNavTile extends StatelessWidget {
  const _DrawerNavTile({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ColorScheme cs = Theme.of(context).colorScheme;
    return ListTile(
      leading: Icon(
        icon,
        color: selected ? cs.primary : cs.onSurfaceVariant,
      ),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          color: selected ? cs.primary : cs.onSurface,
        ),
      ),
      selected: selected,
      selectedTileColor: cs.primaryContainer.withValues(alpha: 0.35),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onTap: onTap,
    );
  }
}
