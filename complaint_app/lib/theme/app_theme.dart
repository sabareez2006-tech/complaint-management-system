import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const Color primaryPurple = Color(0xFF667EEA);
  static const Color secondaryPurple = Color(0xFF764BA2);
  static const Color darkBg = Color(0xFF0F0C29);
  static const Color darkBg2 = Color(0xFF1A1640);
  static const Color cardBg = Color(0x1AFFFFFF);
  static const Color cardBorder = Color(0x33FFFFFF);
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xB3FFFFFF);
  static const Color danger = Color(0xFFFF4B4B);
  static const Color success = Color(0xFF00B09B);
  static const Color warning = Color(0xFFFDE047);
  static const Color successGreen = Color(0xFF38EF7D);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryPurple, secondaryPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [Color(0xFF0F0C29), Color(0xFF302B63), Color(0xFF24243E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient dangerGradient = LinearGradient(
    colors: [Color(0xFFFF416C), Color(0xFFFF4B2B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Theme Data
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.transparent,
      fontFamily: 'Roboto',
      colorScheme: const ColorScheme.dark(
        primary: primaryPurple,
        secondary: secondaryPurple,
        surface: darkBg2,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: textWhite,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0x0DFFFFFF),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFA5B4FC), width: 1.5),
        ),
        hintStyle: const TextStyle(color: Color(0x66FFFFFF)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          elevation: 4,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  // Helper widgets
  static BoxDecoration get glassCard => BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      );

  static Widget gradientButton({
    required String label,
    required VoidCallback onPressed,
    LinearGradient gradient = primaryGradient,
    bool isLoading = false,
    double? width,
  }) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(50),
        boxShadow: [
          BoxShadow(
            color: gradient.colors.first.withValues(alpha: 0.4),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(50),
          onTap: isLoading ? null : onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
            child: Center(
              child: isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  static Widget priorityBadge(String priority) {
    Color bgColor;
    Color textColor;

    switch (priority.toLowerCase()) {
      case 'high':
        bgColor = const Color(0x33FF4B4B);
        textColor = danger;
        break;
      case 'medium':
        bgColor = const Color(0x33FDE047);
        textColor = warning;
        break;
      default:
        bgColor = const Color(0x3334D399);
        textColor = success;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: textColor.withValues(alpha: 0.3)),
      ),
      child: Text(
        priority.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static const Color inProgressBlue = Color(0xFF60A5FA);

  static Widget statusBadge(String status) {
    Color bgColor;
    Color textColor;
    String label;

    switch (status.toLowerCase()) {
      case 'resolved':
        bgColor = const Color(0x3334D399);
        textColor = success;
        label = 'RESOLVED';
        break;
      case 'in_progress':
        bgColor = const Color(0x3360A5FA);
        textColor = inProgressBlue;
        label = 'IN PROGRESS';
        break;
      default:
        bgColor = const Color(0x33FDE047);
        textColor = warning;
        label = 'PENDING';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: textColor.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
