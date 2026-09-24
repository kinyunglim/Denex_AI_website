import 'package:flutter/material.dart';
import '../l10n/generated/app_localizations.dart';
import '../model/demo_profile_stats.dart';

/// Example profile layout for the course template: hero header, demo stats,
/// and placeholder settings rows. All content is local mock data; no providers
/// or API calls.
class ProfilePage extends StatelessWidget {
  /// Creates the demo profile screen.
  const ProfilePage({super.key});

  static void _comingSoonSnack(BuildContext context, AppLocalizations l10n) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        content: Text(l10n.profileComingSoon),
      ),
    );
  }

  static String _initials(String displayName) {
    final String trimmed = displayName.trim();
    if (trimmed.isEmpty) {
      return '?';
    }
    final List<String> parts =
        trimmed.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) {
      return '${_firstRuneChar(parts[0])}${_firstRuneChar(parts[1])}'
          .toUpperCase();
    }
    final List<int> runes = trimmed.runes.toList();
    if (runes.length >= 2) {
      return String.fromCharCodes(runes.take(2)).toUpperCase();
    }
    return _firstRuneChar(trimmed).toUpperCase();
  }

  static String _firstRuneChar(String s) {
    if (s.isEmpty) {
      return '';
    }
    final Iterator<int> it = s.runes.iterator;
    if (!it.moveNext()) {
      return '';
    }
    return String.fromCharCode(it.current);
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations l10n = AppLocalizations.of(context)!;
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;

    return ColoredBox(
      color: cs.surface,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _ProfileHero(
              l10n: l10n,
              colorScheme: cs,
              textTheme: theme.textTheme,
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _StatsRow(l10n: l10n),
                const SizedBox(height: 16),
                Card(
                  child: ListTile(
                    leading: Icon(Icons.email_outlined, color: cs.primary),
                    title: Text(l10n.email),
                    subtitle: Text(l10n.profileDemoEmail),
                  ),
                ),
                const SizedBox(height: 24),
                _SectionTitle(l10n.profileAccountSection),
                Card(
                  child: Column(
                    children: [
                      _ProfileMockMenuTile(
                        icon: Icons.person_outline,
                        title: l10n.profileEditProfile,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.lock_outline,
                        title: l10n.profileMenuChangePassword,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.payment_outlined,
                        title: l10n.profileMenuPaymentMethods,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.devices_other_outlined,
                        title: l10n.profileMenuConnectedDevices,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.notifications_outlined,
                        title: l10n.profileNotifications,
                        showDividerBelow: false,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _SectionTitle(l10n.profilePreferencesSection),
                Card(
                  child: Column(
                    children: [
                      _ProfileMockMenuTile(
                        icon: Icons.language_outlined,
                        title: l10n.profileMenuLanguageRegion,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.dark_mode_outlined,
                        title: l10n.profileMenuAppearance,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.accessibility_new_outlined,
                        title: l10n.profileMenuAccessibility,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.shield_outlined,
                        title: l10n.profilePrivacy,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.help_outline,
                        title: l10n.profileHelp,
                        showDividerBelow: false,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _SectionTitle(l10n.profileSupportSection),
                Card(
                  child: Column(
                    children: [
                      _ProfileMockMenuTile(
                        icon: Icons.download_outlined,
                        title: l10n.profileMenuDownloadData,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.gavel_outlined,
                        title: l10n.profileMenuTerms,
                        showDividerBelow: true,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                      _ProfileMockMenuTile(
                        icon: Icons.feedback_outlined,
                        title: l10n.profileMenuSendFeedback,
                        showDividerBelow: false,
                        onTap: () => _comingSoonSnack(context, l10n),
                      ),
                    ],
                  ),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({
    required this.l10n,
    required this.colorScheme,
    required this.textTheme,
  });

  final AppLocalizations l10n;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            colorScheme.primary,
            Color.lerp(
              colorScheme.primary,
              colorScheme.secondary,
              0.45,
            )!,
          ],
        ),
        borderRadius: const BorderRadius.vertical(
          bottom: Radius.circular(28),
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: colorScheme.primary.withValues(alpha: 0.28),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Align(
            alignment: Alignment.center,
            child: Chip(
              visualDensity: VisualDensity.compact,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              backgroundColor: colorScheme.onPrimary.withValues(alpha: 0.16),
              side: BorderSide(
                color: colorScheme.onPrimary.withValues(alpha: 0.35),
              ),
              label: Text(
                l10n.profileDemoStatsLabel,
                style: textTheme.labelSmall?.copyWith(
                  color: colorScheme.onPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 48,
            backgroundColor: colorScheme.onPrimary.withValues(alpha: 0.22),
            foregroundColor: colorScheme.onPrimary,
            child: Text(
              ProfilePage._initials(l10n.profileDemoDisplayName),
              style: textTheme.headlineMedium?.copyWith(
                color: colorScheme.onPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            l10n.profileDemoDisplayName,
            textAlign: TextAlign.center,
            style: textTheme.headlineSmall?.copyWith(
              color: colorScheme.onPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            l10n.profileDemoJobTitle,
            textAlign: TextAlign.center,
            style: textTheme.titleMedium?.copyWith(
              color: colorScheme.onPrimary.withValues(alpha: 0.92),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(
                Icons.location_on_outlined,
                size: 18,
                color: colorScheme.onPrimary.withValues(alpha: 0.9),
              ),
              const SizedBox(width: 6),
              Text(
                l10n.profileDemoLocation,
                style: textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onPrimary.withValues(alpha: 0.92),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            l10n.profileJoined(DemoProfileStats.joinedYear),
            style: textTheme.bodySmall?.copyWith(
              color: colorScheme.onPrimary.withValues(alpha: 0.85),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: <Widget>[
              Chip(
                avatar: Icon(
                  Icons.badge_outlined,
                  size: 18,
                  color: colorScheme.primary,
                ),
                label: Text(
                  '${l10n.profileRoleLabel}: ${l10n.profileDemoRoleValue}',
                ),
                backgroundColor: colorScheme.onPrimary,
                side: BorderSide.none,
                labelStyle: textTheme.labelLarge?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.l10n});

  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(
          child: _StatTile(
            value: '${DemoProfileStats.projectsCount}',
            label: l10n.profileProjectsLabel,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatTile(
            value: '${DemoProfileStats.tasksCount}',
            label: l10n.profileTasksLabel,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatTile(
            value: '${DemoProfileStats.dayStreak}',
            label: l10n.profileStreakLabel,
          ),
        ),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.value,
    required this.label,
  });

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    return Semantics(
      label: '$label $value',
      child: Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: <Widget>[
              Text(
                value,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: cs.primary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: cs.onSurfaceVariant,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: Theme.of(context).colorScheme.primary,
              letterSpacing: 0.2,
            ),
      ),
    );
  }
}

/// One tappable row in the mock profile settings lists (shows Coming soon).
class _ProfileMockMenuTile extends StatelessWidget {
  const _ProfileMockMenuTile({
    required this.icon,
    required this.title,
    required this.showDividerBelow,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final bool showDividerBelow;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ColorScheme cs = Theme.of(context).colorScheme;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        ListTile(
          leading: Icon(icon, color: cs.primary),
          title: Text(title),
          trailing: Icon(
            Icons.chevron_right,
            color: cs.onSurfaceVariant,
          ),
          onTap: onTap,
        ),
        if (showDividerBelow) const Divider(height: 1),
      ],
    );
  }
}
