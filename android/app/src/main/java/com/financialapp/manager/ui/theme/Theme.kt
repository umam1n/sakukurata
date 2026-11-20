package com.financialapp.manager.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs

val DarkBackground = Color(0xFF090C10)
val DarkSurface = Color(0xFF0D1117)
val DarkCard = Color(0xFF16191F)
val DarkCardBorder = Color(0x14FFFFFF)
val EmeraldAccent = Color(0xFF10B981)
val MintAccent = Color(0xFF8EE4AF)
val RoseAccent = Color(0xFFF43F5E)
val SoftPink = Color(0xFFFFAAA5)
val AmberAccent = Color(0xFFF59E0B)
val SoftBlue = Color(0xFF3B82F6)
val LavenderPurple = Color(0xFF8B5CF6)
val TextSecondary = Color(0xFF94A3B8)

data class AccentPreset(
    val id: String,
    val label: String,
    val color: Color,
    val onAccent: Color
)

val ACCENT_PRESETS = listOf(
    AccentPreset("emerald", "Emerald", Color(0xFF10B981), Color(0xFF052E16)),
    AccentPreset("lavender", "Lavender", Color(0xFF8B5CF6), Color(0xFFFFFFFF)),
    AccentPreset("cyan", "Cyan", Color(0xFF06B6D4), Color(0xFF082F49)),
    AccentPreset("rose", "Rose", Color(0xFFF43F5E), Color(0xFFFFFFFF)),
    AccentPreset("amber", "Amber", Color(0xFFF59E0B), Color(0xFF451A03)),
    AccentPreset("indigo", "Indigo", Color(0xFF6366F1), Color(0xFFFFFFFF)),
    AccentPreset("peach", "Peach", Color(0xFFFB7185), Color(0xFF4C0519)),
    AccentPreset("mint", "Mint", Color(0xFF34D399), Color(0xFF064E3B))
)

data class SakukurataPalette(
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val card: Color,
    val cardBorder: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val accent: Color,
    val onAccent: Color
)

val LocalSakukurataColors = staticCompositionLocalOf {
    SakukurataPalette(
        isDark = true,
        background = DarkBackground,
        surface = DarkSurface,
        card = DarkCard,
        cardBorder = DarkCardBorder,
        textPrimary = Color(0xFFF8FAFC),
        textSecondary = TextSecondary,
        accent = EmeraldAccent,
        onAccent = Color(0xFF052E16)
    )
}

object AppColors {
    val current: SakukurataPalette
        @Composable get() = LocalSakukurataColors.current
}

@Composable
fun SakukurataTheme(
    darkTheme: Boolean = true,
    accentPresetId: String = "emerald",
    content: @Composable () -> Unit
) {
    val preset = ACCENT_PRESETS.find { it.id == accentPresetId } ?: ACCENT_PRESETS.first()
    val palette = if (darkTheme) {
        SakukurataPalette(
            isDark = true,
            background = DarkBackground,
            surface = DarkSurface,
            card = DarkCard,
            cardBorder = DarkCardBorder,
            textPrimary = Color(0xFFF8FAFC),
            textSecondary = TextSecondary,
            accent = preset.color,
            onAccent = preset.onAccent
        )
    } else {
        SakukurataPalette(
            isDark = false,
            background = Color(0xFFF1F5F9),
            surface = Color(0xFFE2E8F0),
            card = Color(0xFFFFFFFF),
            cardBorder = Color(0x1A0F172A),
            textPrimary = Color(0xFF0F172A),
            textSecondary = Color(0xFF64748B),
            accent = preset.color,
            onAccent = preset.onAccent
        )
    }

    val colorScheme = if (darkTheme) {
        darkColorScheme(
            background = palette.background,
            surface = palette.card,
            primary = palette.accent,
            onPrimary = palette.onAccent,
            onBackground = palette.textPrimary,
            onSurface = palette.textPrimary
        )
    } else {
        lightColorScheme(
            background = palette.background,
            surface = palette.card,
            primary = palette.accent,
            onPrimary = palette.onAccent,
            onBackground = palette.textPrimary,
            onSurface = palette.textPrimary
        )
    }

    CompositionLocalProvider(LocalSakukurataColors provides palette) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}

fun parseHexColor(hex: String, fallback: Color = EmeraldAccent): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (_: Exception) {
        fallback
    }
}

fun formatRupiah(amount: Long): String {
    val isNegative = amount < 0
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    val formatted = formatter.format(abs(amount)).replace(",00", "")
    return if (isNegative) "-$formatted" else formatted
}

fun formatInputNumber(input: String): String {
    val digitsOnly = input.filter { it.isDigit() }
    if (digitsOnly.isEmpty()) return ""
    val number = digitsOnly.toLongOrNull() ?: return ""
    return NumberFormat.getNumberInstance(Locale("id", "ID")).format(number)
}

fun parseInputNumber(input: String): Long {
    val digitsOnly = input.filter { it.isDigit() }
    return digitsOnly.toLongOrNull() ?: 0L
}
