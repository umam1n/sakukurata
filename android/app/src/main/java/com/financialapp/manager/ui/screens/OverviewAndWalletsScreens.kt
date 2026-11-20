package com.financialapp.manager.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financialapp.manager.data.SakukurataViewModel
import com.financialapp.manager.model.IndonesianBanks
import com.financialapp.manager.model.TransactionItem
import com.financialapp.manager.model.WalletItem
import com.financialapp.manager.model.inferBucketKind
import com.financialapp.manager.ui.components.BankLogo
import com.financialapp.manager.ui.theme.*

@Composable
fun OverviewScreen(
    vm: SakukurataViewModel,
    onOpenAddTransaction: () -> Unit
) {
    val colors = AppColors.current
    val spendingBuckets = remember(vm.buckets) {
        vm.buckets.filter { inferBucketKind(it.name, it.kind) == "spending" }
    }
    val savingBuckets = remember(vm.buckets) {
        vm.buckets.filter { inferBucketKind(it.name, it.kind) == "saving" }
    }

    val expensesByBucket = remember(vm.transactions, spendingBuckets) {
        spendingBuckets.map { b ->
            val spent = vm.transactions
                .filter { vm.isSpendingTransaction(it) && it.bucketId == b.id }
                .sumOf { it.amount }
            b to spent
        }
    }

    val totalSpent = vm.totalSpending
    val spendableBudget = vm.spendableBudget
    val totalSaved = vm.totalSaved
    val savingsTarget = vm.savingsTarget
    val savingsProgress = if (savingsTarget > 0) ((totalSaved * 100) / savingsTarget).toInt().coerceAtLeast(0) else 0

    val kpiCards = listOf(
        Triple("income", "Monthly Income", vm.displayMoney(vm.totalIncome, "income") to colors.accent),
        Triple("spending", "Total Spending", vm.displayMoney(totalSpent, "spending") to RoseAccent),
        Triple("savings", "Saved & Invested", vm.displayMoney(totalSaved, "savings") to SoftBlue),
        Triple("remaining", "Remaining Budget", vm.displayMoney(vm.remainingSpendable, "remainingBudget") to AmberAccent)
    ).filterNot { (key, _, _) -> vm.isCardHidden(key) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 4-Tile KPI Strip (matching Web Overview)
        if (kpiCards.isNotEmpty()) {
            val rows = kpiCards.chunked(2)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                rows.forEach { rowItems ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        rowItems.forEach { (_, title, valueColor) ->
                            val (value, tint) = valueColor
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(colors.card)
                                    .border(1.dp, colors.cardBorder, RoundedCornerShape(16.dp))
                                    .padding(horizontal = 12.dp, vertical = 10.dp)
                            ) {
                                Text(title, fontSize = 10.sp, color = colors.textSecondary, fontWeight = FontWeight.SemiBold)
                                Spacer(Modifier.height(2.dp))
                                Text(value, fontSize = 13.sp, fontWeight = FontWeight.Black, color = tint, maxLines = 1)
                            }
                        }
                        if (rowItems.size == 1) {
                            Spacer(Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        // Main Donut Card (True Spending Only)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(28.dp))
                .background(colors.card)
                .border(1.dp, colors.cardBorder, RoundedCornerShape(28.dp))
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Spending Overview", fontSize = 17.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                    Text("Expenses only (excludes savings & investments)", fontSize = 11.sp, color = colors.textSecondary)
                }
                IconButton(
                    onClick = onOpenAddTransaction,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(13.dp))
                        .background(colors.accent)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", tint = colors.onAccent)
                }
            }

            // Donut Chart with Ambient Glow
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(175.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(160.dp)) {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(colors.accent.copy(alpha = 0.16f), Color.Transparent)
                        ),
                        radius = size.minDimension * 0.6f
                    )
                    drawArc(
                        color = if (colors.isDark) Color(0xFF21262D) else Color(0xFFE2E8F0),
                        startAngle = 0f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 22f, cap = StrokeCap.Round)
                    )

                    var startAngle = -90f
                    val useSpending = totalSpent > 0
                    val spendPctDenom = spendingBuckets.sumOf { it.percentage }.coerceAtLeast(1).toFloat()
                    val denom = if (useSpending) totalSpent.toFloat() else spendPctDenom
                    expensesByBucket.forEach { (bucket, spent) ->
                        val value = if (useSpending) spent.toFloat() else bucket.percentage.toFloat()
                        if (value > 0f) {
                            val sweep = (value / denom) * 360f
                            drawArc(
                                color = parseHexColor(bucket.color),
                                startAngle = startAngle,
                                sweepAngle = sweep,
                                useCenter = false,
                                style = Stroke(width = 22f, cap = StrokeCap.Round)
                            )
                            startAngle += sweep
                        }
                    }
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("TOTAL SPENDING", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = colors.textSecondary)
                    Text(vm.displayMoney(totalSpent, "spending"), fontSize = 17.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                    Spacer(Modifier.height(2.dp))
                    Text("of ${vm.displayMoney(spendableBudget, "remainingBudget")}", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = colors.accent)
                }
            }

            // Legend Top 3 Spending Buckets
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val spendPctSum = spendingBuckets.sumOf { it.percentage }.coerceAtLeast(1)
                expensesByBucket.take(3).forEach { (bucket, spent) ->
                    val pct = if (totalSpent > 0) ((spent * 100) / totalSpent).toInt() else ((bucket.percentage * 100) / spendPctSum)
                    Column(modifier = Modifier.weight(1f)) {
                        Text(bucket.name, fontSize = 10.sp, color = colors.textSecondary, maxLines = 1)
                        Text("$pct%", fontSize = 14.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(CircleShape)
                                .background(parseHexColor(bucket.color))
                        )
                    }
                }
            }

            // Dedicated Saved & Invested Progress Strip
            if (savingBuckets.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.cardBorder, RoundedCornerShape(16.dp))
                        .padding(11.dp),
                    verticalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Saved & Invested", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SoftBlue)
                        Text("$savingsProgress% of target", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = colors.textPrimary)
                    }
                    LinearProgressIndicator(
                        progress = { (savingsProgress.coerceIn(0, 100)) / 100f },
                        color = SoftBlue,
                        trackColor = colors.card,
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("${vm.displayMoney(totalSaved, "savings")} saved", fontSize = 10.sp, color = colors.textSecondary)
                        Text("Target: ${vm.displayMoney(savingsTarget, "savings")}", fontSize = 10.sp, color = colors.textSecondary)
                    }
                }
            }
        }

        // 1-Click Quick Expense Row
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vm.quickActions) { qa ->
                Column(
                    modifier = Modifier
                        .width(116.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .background(colors.card)
                        .border(1.dp, colors.cardBorder, RoundedCornerShape(18.dp))
                        .clickable {
                            val b = spendingBuckets.find { it.id == qa.bucketId }
                                ?: spendingBuckets.firstOrNull()
                                ?: vm.buckets.firstOrNull()
                            val w = vm.wallets.find { it.id == qa.walletId } ?: vm.wallets.firstOrNull()
                            vm.addTransaction(
                                TransactionItem(
                                    type = "expense",
                                    amount = qa.amount,
                                    bucketId = b?.id,
                                    bucketName = b?.name ?: qa.bucketName,
                                    walletId = w?.id,
                                    walletName = w?.name ?: "Wallet",
                                    merchant = qa.title,
                                    notes = "1-Click Quick Entry"
                                )
                            )
                        }
                        .padding(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.FlashOn, contentDescription = null, tint = parseHexColor(qa.color), modifier = Modifier.size(14.dp))
                        Text(qa.title, color = colors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                    }
                    Text("+ ${vm.displayMoney(qa.amount, "spending")}", color = colors.accent, fontWeight = FontWeight.Black, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun WalletsAndGoalsScreen(vm: SakukurataViewModel) {
    val colors = AppColors.current
    var showAddWallet by remember { mutableStateOf(false) }
    var bankSearch by remember { mutableStateOf("") }
    var walletName by remember { mutableStateOf("") }
    var walletType by remember { mutableStateOf("bank") }
    var walletColor by remember { mutableStateOf("#005CAA") }
    var walletBalance by remember { mutableStateOf("") }

    var editingWallet by remember { mutableStateOf<WalletItem?>(null) }
    var editName by remember { mutableStateOf("") }
    var editBalance by remember { mutableStateOf("") }

    var showAddGoal by remember { mutableStateOf(false) }
    var goalTitle by remember { mutableStateOf("") }
    var goalTarget by remember { mutableStateOf("") }

    val totalBalance = vm.wallets.sumOf { it.balance }
    val filteredInstitutions = remember(bankSearch) {
        val q = bankSearch.trim().lowercase()
        if (q.isEmpty()) IndonesianBanks.institutions
        else IndonesianBanks.institutions.filter {
            it.name.lowercase().contains(q) || it.short.lowercase().contains(q) || it.keywords.any { k -> k.contains(q) }
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Total Balance Header
        if (!vm.isCardHidden("walletsBanner")) {
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Brush.linearGradient(listOf(MintAccent, colors.accent)))
                        .padding(20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("TOTAL BALANCE ACROSS WALLETS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF052E16))
                        Text(vm.displayMoney(totalBalance, "wallets"), fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color(0xFF052E16))
                        Text("${vm.wallets.size} active wallets", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF064E3B))
                    }
                    IconButton(onClick = { vm.togglePrivacyScope("wallets") }) {
                        Icon(
                            imageVector = if (vm.isScopeHidden("wallets")) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Mask Wallets",
                            tint = Color(0xFF052E16)
                        )
                    }
                }
            }
        }

        // Wallets Section Header
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Wallets & Accounts", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = colors.textPrimary)
                TextButton(onClick = { showAddWallet = !showAddWallet }) {
                    Text(if (showAddWallet) "Close" else "+ Wallet", color = colors.accent, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (showAddWallet) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(colors.card)
                        .border(1.dp, colors.cardBorder, RoundedCornerShape(20.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = bankSearch,
                        onValueChange = { bankSearch = it },
                        label = { Text("Search Indonesian Bank / E-Wallet") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(filteredInstitutions.take(15)) { inst ->
                            val selected = walletName.equals(inst.name, ignoreCase = true)
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(if (selected) colors.accent.copy(alpha = 0.16f) else colors.surface)
                                    .border(1.dp, if (selected) colors.accent else colors.cardBorder, RoundedCornerShape(14.dp))
                                    .clickable {
                                        walletName = inst.name
                                        walletType = inst.type
                                        walletColor = inst.color
                                    }
                                    .padding(horizontal = 10.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                BankLogo(name = inst.name, fallbackColorHex = inst.color, size = 26.dp)
                                Text(inst.short, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                            }
                        }
                    }
                    OutlinedTextField(
                        value = walletName,
                        onValueChange = { walletName = it },
                        label = { Text("Wallet Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = walletBalance,
                        onValueChange = { walletBalance = formatInputNumber(it) },
                        label = { Text("Starting Balance (Rp)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = {
                            if (walletName.isNotBlank()) {
                                val inst = IndonesianBanks.findInstitution(walletName)
                                vm.addWallet(
                                    name = walletName,
                                    type = inst?.type ?: walletType,
                                    balance = parseInputNumber(walletBalance),
                                    color = inst?.color ?: walletColor
                                )
                                walletName = ""
                                walletBalance = ""
                                bankSearch = ""
                                showAddWallet = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.onAccent),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Save Wallet", fontWeight = FontWeight.Black) }
                }
            }
        }

        items(vm.wallets) { w ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.card)
                    .border(1.dp, colors.cardBorder, RoundedCornerShape(20.dp))
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    BankLogo(name = w.name, fallbackColorHex = w.color, size = 40.dp)
                    Column {
                        Text(w.name, color = colors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1)
                        Text(w.type.uppercase(), color = colors.textSecondary, fontSize = 10.sp)
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(vm.displayMoney(w.balance, "wallets"), color = colors.textPrimary, fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                    IconButton(onClick = {
                        editingWallet = w
                        editName = w.name
                        editBalance = formatInputNumber(w.balance.toString())
                    }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Wallet", tint = colors.textSecondary, modifier = Modifier.size(17.dp))
                    }
                    IconButton(onClick = { vm.deleteWallet(w.id) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = colors.textSecondary, modifier = Modifier.size(17.dp))
                    }
                }
            }
        }

        // Savings Goals Section
        item {
            Row(modifier = Modifier.fillMaxWidth().padding(top = 6.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Savings Goals", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = colors.textPrimary)
                TextButton(onClick = { showAddGoal = !showAddGoal }) {
                    Text(if (showAddGoal) "Close" else "+ Goal", color = colors.accent, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (showAddGoal) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(colors.card)
                        .border(1.dp, colors.cardBorder, RoundedCornerShape(20.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(value = goalTitle, onValueChange = { goalTitle = it }, label = { Text("Goal Name") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(
                        value = goalTarget,
                        onValueChange = { goalTarget = formatInputNumber(it) },
                        label = { Text("Target Amount (Rp)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = {
                            if (goalTitle.isNotBlank() && parseInputNumber(goalTarget) > 0) {
                                vm.addGoal(goalTitle, parseInputNumber(goalTarget), 0L)
                                goalTitle = ""
                                goalTarget = ""
                                showAddGoal = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.onAccent),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Save Goal", fontWeight = FontWeight.Black) }
                }
            }
        }

        items(vm.goals) { g ->
            val pct = if (g.targetAmount > 0) ((g.currentAmount * 100) / g.targetAmount).toInt().coerceIn(0, 100) else 0
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.card)
                    .border(1.dp, colors.cardBorder, RoundedCornerShape(20.dp))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(g.title, color = colors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("$pct%", color = colors.accent, fontWeight = FontWeight.Black, fontSize = 12.sp)
                }
                LinearProgressIndicator(
                    progress = { pct / 100f },
                    color = colors.accent,
                    trackColor = colors.surface,
                    modifier = Modifier.fillMaxWidth().height(7.dp).clip(CircleShape)
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("${vm.displayMoney(g.currentAmount, "savings")} / ${vm.displayMoney(g.targetAmount, "savings")}", color = colors.textSecondary, fontSize = 11.sp)
                    TextButton(onClick = { vm.topUpGoal(g, 100_000L) }) {
                        Text("+100k", color = colors.accent, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }

    editingWallet?.let { w ->
        AlertDialog(
            onDismissRequest = { editingWallet = null },
            containerColor = colors.card,
            title = { Text("Edit Wallet", color = colors.textPrimary, fontWeight = FontWeight.Black) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Wallet Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editBalance,
                        onValueChange = { editBalance = formatInputNumber(it) },
                        label = { Text("Current Balance (Rp)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val inst = IndonesianBanks.findInstitution(editName)
                        vm.updateWallet(
                            walletId = w.id,
                            name = editName.ifBlank { w.name },
                            type = inst?.type ?: w.type,
                            balance = parseInputNumber(editBalance),
                            color = inst?.color ?: w.color
                        )
                        editingWallet = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.onAccent)
                ) { Text("Save", fontWeight = FontWeight.Black) }
            },
            dismissButton = {
                TextButton(onClick = { editingWallet = null }) {
                    Text("Cancel", color = colors.textSecondary)
                }
            }
        )
    }
}
