package com.financialapp.manager.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financialapp.manager.model.IndonesianBanks
import com.financialapp.manager.ui.theme.parseHexColor

/**
 * Vector bank & e-wallet emblem matching Web's BankLogo.jsx SVG motifs.
 */
@Composable
fun BankLogo(
    name: String,
    fallbackColorHex: String = "#3B82F6",
    size: Dp = 38.dp,
    modifier: Modifier = Modifier
) {
    val inst = IndonesianBanks.findInstitution(name)
    val bgColor = parseHexColor(inst?.color ?: fallbackColorHex)
    val accentColor = parseHexColor(inst?.accent ?: fallbackColorHex, bgColor.copy(alpha = 0.85f))
    val textColor = parseHexColor(inst?.textColor ?: "#FFFFFF", Color.White)
    val motif = inst?.motif ?: "circle"
    val label = inst?.short ?: name.replace(Regex("^Bank\\s+", RegexOption.IGNORE_CASE), "")
        .trim()
        .take(4)
        .uppercase()
        .ifEmpty { "BANK" }

    val fontSize = when {
        label.length >= 5 -> 8.sp
        label.length == 4 -> 9.sp
        label.length == 3 -> 10.sp
        else -> 11.sp
    }

    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(10.dp)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = this.size.width
            val h = this.size.height

            drawRect(
                brush = Brush.linearGradient(
                    colors = listOf(bgColor, accentColor),
                    start = Offset.Zero,
                    end = Offset(w, h)
                )
            )

            val motifColor = Color.White.copy(alpha = 0.16f)
            when (motif) {
                "wave" -> {
                    val path = Path().apply {
                        moveTo(0f, h * 0.72f)
                        cubicTo(w * 0.25f, h * 0.52f, w * 0.6f, h * 0.88f, w, h * 0.62f)
                        lineTo(w, h)
                        lineTo(0f, h)
                        close()
                    }
                    drawPath(path, color = motifColor)
                }
                "ribbon" -> {
                    val path = Path().apply {
                        moveTo(0f, h * 0.18f)
                        lineTo(w, 0f)
                        lineTo(w, h * 0.28f)
                        lineTo(0f, h * 0.45f)
                        close()
                    }
                    drawPath(path, color = Color.White.copy(alpha = 0.20f))
                }
                "chevron" -> {
                    val path = Path().apply {
                        moveTo(w * 0.60f, 0f)
                        lineTo(w, 0f)
                        lineTo(w, h * 0.45f)
                        lineTo(w * 0.60f, h)
                        lineTo(w * 0.35f, h)
                        close()
                    }
                    drawPath(path, color = motifColor)
                }
                "diamond" -> {
                    val path = Path().apply {
                        moveTo(w * 0.5f, h * 0.06f)
                        lineTo(w * 0.94f, h * 0.5f)
                        lineTo(w * 0.5f, h * 0.94f)
                        lineTo(w * 0.06f, h * 0.5f)
                        close()
                    }
                    drawPath(path, color = Color.White.copy(alpha = 0.12f))
                }
                "hexagon" -> {
                    val path = Path().apply {
                        moveTo(w * 0.5f, h * 0.08f)
                        lineTo(w * 0.88f, h * 0.28f)
                        lineTo(w * 0.88f, h * 0.72f)
                        lineTo(w * 0.5f, h * 0.92f)
                        lineTo(w * 0.12f, h * 0.72f)
                        lineTo(w * 0.12f, h * 0.28f)
                        close()
                    }
                    drawPath(path, color = Color.White.copy(alpha = 0.12f))
                }
                "grid" -> {
                    val boxSize = w * 0.35f
                    val radius = CornerRadius(w * 0.08f, w * 0.08f)
                    drawRoundRect(
                        color = Color.White.copy(alpha = 0.14f),
                        topLeft = Offset(w * 0.1f, h * 0.1f),
                        size = Size(boxSize, boxSize),
                        cornerRadius = radius
                    )
                    drawRoundRect(
                        color = Color.White.copy(alpha = 0.14f),
                        topLeft = Offset(w * 0.55f, h * 0.55f),
                        size = Size(boxSize, boxSize),
                        cornerRadius = radius
                    )
                }
                else -> {
                    drawCircle(
                        color = motifColor,
                        radius = w * 0.30f,
                        center = Offset(w * 0.80f, h * 0.20f)
                    )
                }
            }
        }

        Text(
            text = label,
            color = textColor,
            fontSize = fontSize,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = (-0.3).sp,
            maxLines = 1
        )
    }
}
