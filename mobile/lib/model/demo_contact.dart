import 'package:flutter/material.dart';

/// One row in the home-tab contact list demo. Replace with API models when
/// a real contacts endpoint exists.
class DemoContact {
  const DemoContact({
    required this.name,
    required this.subtitle,
    required this.initials,
    required this.colorIndex,
  });

  final String name;
  final String subtitle;
  final String initials;
  final int colorIndex;

  Color get avatarColor =>
      avatarColors[colorIndex % avatarColors.length];

  /// Fixed palette aligned with app seed colors for list avatar variety.
  static const List<Color> avatarColors = <Color>[
    Color(0xFF5F67D2),
    Color(0xFF5CCBDD),
    Color(0xFF7C6CF0),
    Color(0xFF3D9A9C),
    Color(0xFF6B7FD7),
    Color(0xFF4A9FD4),
    Color(0xFF8B7FD9),
    Color(0xFF2E9E97),
  ];
}

/// Mock contacts for the Home tab (no network).
const List<DemoContact> kDemoContacts = <DemoContact>[
  DemoContact(
    name: 'Alex Chen',
    subtitle: 'Product · VCTS',
    initials: 'AC',
    colorIndex: 0,
  ),
  DemoContact(
    name: 'Jordan Lee',
    subtitle: 'Mobile engineering',
    initials: 'JL',
    colorIndex: 1,
  ),
  DemoContact(
    name: 'Sam Rivera',
    subtitle: 'Design systems',
    initials: 'SR',
    colorIndex: 2,
  ),
  DemoContact(
    name: 'Priya Patel',
    subtitle: 'Operations lead',
    initials: 'PP',
    colorIndex: 3,
  ),
  DemoContact(
    name: 'Taylor Kim',
    subtitle: 'Customer success',
    initials: 'TK',
    colorIndex: 4,
  ),
  DemoContact(
    name: 'Morgan Wu',
    subtitle: 'Course mentor',
    initials: 'MW',
    colorIndex: 5,
  ),
  DemoContact(
    name: 'Riley Thompson',
    subtitle: 'QA & release',
    initials: 'RT',
    colorIndex: 6,
  ),
  DemoContact(
    name: 'Casey Ng',
    subtitle: 'Backend APIs',
    initials: 'CN',
    colorIndex: 7,
  ),
];
