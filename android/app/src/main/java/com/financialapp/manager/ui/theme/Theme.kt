package com.financialapp.manager.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
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

@Composable
fun SakukurataTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = DarkBackground,
            surface = DarkCard,
            primary = EmeraldAccent,
            onPrimary = Color(0xFF052E16),
            onBackground = Color(0xFFF8FAFC),
            onSurface = Color(0xFFF8FAFC)
        ),
        content = content
    )
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
