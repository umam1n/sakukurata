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
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FlashOn
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
import com.financialapp.manager.model.TransactionItem
import com.financialapp.manager.model.inferBucketKind
import com.financialapp.manager.ui.theme.*

@Composable
fun OverviewScreen(
    vm: SakukurataViewModel,
    onOpenAddTransaction: () -> Unit
) {
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Main Donut Card (True Spending Only)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(30.dp))
                .background(DarkCard)
                .border(1.dp, DarkCardBorder, RoundedCornerShape(30.dp))
                .padding(18.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Spending Overview", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("Expenses only (excludes savings & investments)", fontSize = 11.sp, color = TextSecondary)
                }
                IconButton(
                    onClick = onOpenAddTransaction,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(EmeraldAccent)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", tint = Color(0xFF052E16))
                }
            }

            // Donut Chart with Ambient Glow
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(195.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(175.dp)) {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(EmeraldAccent.copy(alpha = 0.16f), Color.Transparent)
                        ),
                        radius = size.minDimension * 0.6f
                    )
                    drawArc(
                        color = Color(0xFF21262D),
                        startAngle = 0f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 24f, cap = StrokeCap.Round)
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
                                style = Stroke(width = 24f, cap = StrokeCap.Round)
                            )
                            startAngle += sweep
                        }
                    }
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("TOTAL SPENDING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                    Text(vm.displayMoney(totalSpent), fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Spacer(Modifier.height(2.dp))
                    Text("of ${vm.displayMoney(spendableBudget)}", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = EmeraldAccent)
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
                        Text(bucket.name, fontSize = 10.sp, color = TextSecondary, maxLines = 1)
                        Text("$pct%", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
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
                        .background(DarkSurface)
                        .border(1.dp, DarkCardBorder, RoundedCornerShape(16.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Saved & Invested", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SoftBlue)
                        Text("$savingsProgress% of target", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                    }
                    LinearProgressIndicator(
                        progress = { (savingsProgress.coerceIn(0, 100)) / 100f },
                        color = SoftBlue,
                        trackColor = DarkCard,
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("${vm.displayMoney(totalSaved)} saved", fontSize = 10.sp, color = TextSecondary)
                        Text("Target: ${vm.displayMoney(savingsTarget)}", fontSize = 10.sp, color = TextSecondary)
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // 1-Click Quick Expense Row
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vm.quickActions) { qa ->
                Column(
                    modifier = Modifier
                        .width(116.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .background(DarkCard)
                        .border(1.dp, DarkCardBorder, RoundedCornerShape(18.dp))
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
                        Text(qa.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                    }
                    Text("+ ${vm.displayMoney(qa.amount)}", color = EmeraldAccent, fontWeight = FontWeight.Black, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun WalletsAndGoalsScreen(vm: SakukurataViewModel) {
    var showAddWallet by remember { mutableStateOf(false) }
    var walletName by remember { mutableStateOf("") }
    var walletBalance by remember { mutableStateOf("") }

    var showAddGoal by remember { mutableStateOf(false) }
    var goalTitle by remember { mutableStateOf("") }
    var goalTarget by remember { mutableStateOf("") }

    val totalBalance = vm.wallets.sumOf { it.balance }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Total Balance Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(26.dp))
                    .background(Brush.linearGradient(listOf(MintAccent, EmeraldAccent)))
                    .padding(20.dp)
            ) {
                Text("TOTAL BALANCE ACROSS WALLETS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF052E16))
                Text(vm.displayMoney(totalBalance), fontSize = 26.sp, fontWeight = FontWeight.Black, color = Color(0xFF052E16))
                Text("${vm.wallets.size} active wallets", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF064E3B))
            }
        }

        // Wallets Section Header
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Wallets & Accounts", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                TextButton(onClick = { showAddWallet = !showAddWallet }) {
                    Text(if (showAddWallet) "Close" else "+ Wallet", color = EmeraldAccent, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (showAddWallet) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(DarkCard).padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(value = walletName, onValueChange = { walletName = it }, label = { Text("Wallet Name") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(
                        value = walletBalance,
                        onValueChange = { walletBalance = formatInputNumber(it) },
                        label = { Text("Starting Balance (Rp)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = {
                            if (walletName.isNotBlank()) {
                                vm.addWallet(walletName, "bank", parseInputNumber(walletBalance))
                                walletName = ""
                                walletBalance = ""
                                showAddWallet = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
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
                    .background(DarkCard)
                    .border(1.dp, DarkCardBorder, RoundedCornerShape(20.dp))
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(
                        modifier = Modifier.size(40.dp).clip(RoundedCornerShape(14.dp)).background(parseHexColor(w.color)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AccountBalance, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                    Column {
                        Text(w.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(w.type.uppercase(), color = TextSecondary, fontSize = 10.sp)
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(vm.displayMoney(w.balance), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                    IconButton(onClick = { vm.deleteWallet(w.id) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextSecondary, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        // Savings Goals Section
        item {
            Row(modifier = Modifier.fillMaxWidth().padding(top = 6.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Savings Goals", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                TextButton(onClick = { showAddGoal = !showAddGoal }) {
                    Text(if (showAddGoal) "Close" else "+ Goal", color = EmeraldAccent, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (showAddGoal) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(DarkCard).padding(14.dp),
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
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
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
                    .background(DarkCard)
                    .border(1.dp, DarkCardBorder, RoundedCornerShape(20.dp))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(g.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("$pct%", color = EmeraldAccent, fontWeight = FontWeight.Black, fontSize = 12.sp)
                }
                LinearProgressIndicator(
                    progress = { pct / 100f },
                    color = EmeraldAccent,
                    trackColor = DarkSurface,
                    modifier = Modifier.fillMaxWidth().height(7.dp).clip(CircleShape)
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("${vm.displayMoney(g.currentAmount)} / ${vm.displayMoney(g.targetAmount)}", color = TextSecondary, fontSize = 11.sp)
                    TextButton(onClick = { vm.topUpGoal(g, 100_000L) }) {
                        Text("+100k", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
