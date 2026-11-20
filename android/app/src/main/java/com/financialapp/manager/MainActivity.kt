package com.financialapp.manager

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.financialapp.manager.data.SakukurataViewModel
import com.financialapp.manager.ui.screens.*
import com.financialapp.manager.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val vm: SakukurataViewModel = viewModel()
            SakukurataTheme(
                darkTheme = vm.isDarkMode,
                accentPresetId = vm.accentPresetId
            ) {
                SakukurataApp(vm)
            }
        }
    }
}

@Composable
fun SakukurataApp(vm: SakukurataViewModel) {
    val colors = AppColors.current
    when {
        vm.isLoading -> {
            Box(
                modifier = Modifier.fillMaxSize().background(colors.background),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = colors.accent)
            }
        }
        !vm.isAuthenticated -> AuthScreen(vm)
        !vm.onboardingCompleted -> OnboardingScreen(vm)
        else -> MainDashboard(vm)
    }
}

@Composable
private fun MainDashboard(vm: SakukurataViewModel) {
    val colors = AppColors.current
    var selectedTab by remember { mutableIntStateOf(0) }
    var showAddDialog by remember { mutableStateOf(false) }

    val tabs = listOf(
        Triple(0, "Overview", Icons.Default.PieChart),
        Triple(1, "Wallets", Icons.Default.AccountBalanceWallet),
        Triple(2, "Budget", Icons.Default.Tune),
        Triple(3, "Settings", Icons.Default.Settings)
    )

    Scaffold(
        containerColor = colors.background,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.background)
                    .padding(horizontal = 20.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Sakukurata", fontSize = 18.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                    Text("Hello, ${vm.profile?.displayName ?: "User"}", fontSize = 11.sp, color = colors.textSecondary)
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = { vm.toggleHideBalances() },
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (vm.hideBalances) colors.accent.copy(alpha = 0.2f) else colors.card)
                            .border(1.dp, colors.cardBorder, RoundedCornerShape(10.dp))
                    ) {
                        Icon(
                            imageVector = if (vm.hideBalances) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Hide/Show Balances",
                            tint = if (vm.hideBalances) colors.accent else colors.textSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(colors.accent.copy(alpha = 0.14f))
                            .border(1.dp, colors.accent.copy(alpha = 0.3f), RoundedCornerShape(50))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            if (vm.isGuestMode) "Local" else "Cloud Sync",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.accent
                        )
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = colors.surface,
                tonalElevation = 0.dp
            ) {
                tabs.forEach { (idx, label, icon) ->
                    NavigationBarItem(
                        selected = selectedTab == idx,
                        onClick = { selectedTab = idx },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = colors.accent,
                            selectedTextColor = colors.accent,
                            indicatorColor = colors.accent.copy(alpha = 0.15f),
                            unselectedIconColor = colors.textSecondary,
                            unselectedTextColor = colors.textSecondary
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            when (selectedTab) {
                0 -> OverviewScreen(vm = vm, onOpenAddTransaction = { showAddDialog = true })
                1 -> WalletsAndGoalsScreen(vm = vm)
                2 -> AllocationScreen(vm = vm)
                3 -> SettingsAndHistoryScreen(vm = vm)
            }
        }
    }

    if (showAddDialog) {
        AddTransactionDialog(vm = vm, onDismiss = { showAddDialog = false })
    }
}
