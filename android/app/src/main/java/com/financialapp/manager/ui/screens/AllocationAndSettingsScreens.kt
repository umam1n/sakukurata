package com.financialapp.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financialapp.manager.EmailReceiptParser
import com.financialapp.manager.data.SakukurataViewModel
import com.financialapp.manager.model.BudgetBucket
import com.financialapp.manager.model.OnboardingTemplates
import com.financialapp.manager.model.TransactionItem
import com.financialapp.manager.model.WalletItem
import com.financialapp.manager.model.inferBucketKind
import com.financialapp.manager.ui.theme.*

@Composable
fun AllocationScreen(vm: SakukurataViewModel) {
    var draftBuckets by remember(vm.buckets) { mutableStateOf(vm.buckets) }
    var newName by remember { mutableStateOf("") }
    var newPct by remember { mutableStateOf("10") }
    var newKind by remember { mutableStateOf("spending") }

    val totalPct = draftBuckets.sumOf { it.percentage }
    val isValid = totalPct == 100
    val diff = 100 - totalPct

    val spendingPct = draftBuckets.filter { inferBucketKind(it.name, it.kind) == "spending" }.sumOf { it.percentage }
    val savingPct = draftBuckets.filter { inferBucketKind(it.name, it.kind) == "saving" }.sumOf { it.percentage }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(DarkCard).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Flexible 100% Budget Split", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                Text(
                    "Spending: $spendingPct% • Saving / Invest: $savingPct%",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = SoftBlue
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Total: $totalPct% / 100%",
                        color = if (isValid) EmeraldAccent else RoseAccent,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 12.sp
                    )
                    if (!isValid && draftBuckets.isNotEmpty()) {
                        TextButton(onClick = {
                            val list = draftBuckets.toMutableList()
                            val last = list.last()
                            list[list.lastIndex] = last.copy(percentage = (last.percentage + diff).coerceAtLeast(0))
                            draftBuckets = list
                        }) {
                            Text("Auto-Fit (${if (diff > 0) "+$diff%" else "$diff%"})", color = AmberAccent, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(Modifier.weight(1f))
                    Button(
                        onClick = { vm.saveBuckets(draftBuckets) },
                        enabled = isValid,
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Save", fontWeight = FontWeight.Black, fontSize = 12.sp)
                    }
                }

                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(OnboardingTemplates.budgetTemplates) { tpl ->
                        AssistChip(
                            onClick = {
                                val fresh = tpl.buckets.mapIndexed { idx, b -> b.copy(id = "tmp_$idx", sortOrder = idx) }
                                draftBuckets = fresh
                                vm.saveBuckets(fresh)
                            },
                            label = { Text(tpl.name, fontSize = 11.sp) }
                        )
                    }
                }
            }
        }

        items(draftBuckets) { b ->
            val kind = inferBucketKind(b.name, b.kind)
            val allocated = (vm.totalIncome * b.percentage) / 100L
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
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                    Box(Modifier.width(5.dp).height(38.dp).clip(RoundedCornerShape(4.dp)).background(parseHexColor(b.color)))
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(b.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(vm.displayMoney(allocated), color = EmeraldAccent, fontWeight = FontWeight.ExtraBold, fontSize = 11.sp)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (kind == "saving") SoftBlue.copy(alpha = 0.2f) else DarkSurface)
                                    .clickable {
                                        val toggled = if (kind == "saving") "spending" else "saving"
                                        draftBuckets = draftBuckets.map { if (it.id == b.id) it.copy(kind = toggled) else it }
                                    }
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    if (kind == "saving") "Saving" else "Spending",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (kind == "saving") SoftBlue else TextSecondary
                                )
                            }
                        }
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = {
                        draftBuckets = draftBuckets.map { if (it.id == b.id) it.copy(percentage = (it.percentage - 5).coerceAtLeast(0)) else it }
                    }) { Text("-5", color = TextSecondary) }
                    Text("${b.percentage}%", color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp)
                    TextButton(onClick = {
                        draftBuckets = draftBuckets.map { if (it.id == b.id) it.copy(percentage = (it.percentage + 5).coerceAtMost(100)) else it }
                    }) { Text("+5", color = EmeraldAccent) }
                    if (draftBuckets.size > 1) {
                        IconButton(onClick = { draftBuckets = draftBuckets.filterNot { it.id == b.id } }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }

        // Add Custom Bucket
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(DarkCard).padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = newName,
                        onValueChange = { newName = it },
                        label = { Text("New Bucket") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = newPct,
                        onValueChange = { newPct = it.filter { c -> c.isDigit() }.take(3) },
                        label = { Text("%") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.width(68.dp)
                    )
                    Button(
                        onClick = {
                            if (newName.isNotBlank()) {
                                draftBuckets = draftBuckets + BudgetBucket(
                                    id = "tmp_${System.currentTimeMillis()}",
                                    name = newName.trim(),
                                    percentage = newPct.toIntOrNull() ?: 10,
                                    color = if (newKind == "saving") "#60a5fa" else "#8b5cf6",
                                    kind = newKind,
                                    sortOrder = draftBuckets.size
                                )
                                newName = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
                    ) { Text("+") }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("spending" to "Spending", "saving" to "Saving / Invest").forEach { (k, lbl) ->
                        FilterChip(
                            selected = newKind == k,
                            onClick = { newKind = k },
                            label = { Text(lbl, fontSize = 11.sp) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsAndHistoryScreen(vm: SakukurataViewModel) {
    var nameInput by remember(vm.profile) { mutableStateOf(vm.profile?.displayName ?: "") }
    var salaryInput by remember(vm.profile) { mutableStateOf(formatInputNumber((vm.profile?.baseSalary ?: 0L).toString())) }
    var paydayInput by remember(vm.profile) { mutableStateOf((vm.profile?.paydayDate ?: 25).toString()) }
    var showEmailParser by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(DarkCard).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Profile & Cloud Sync", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text(
                        if (vm.isGuestMode) "Local" else "Firebase Cloud",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldAccent
                    )
                }
                OutlinedTextField(value = nameInput, onValueChange = { nameInput = it }, label = { Text("Display Name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(
                    value = salaryInput,
                    onValueChange = { salaryInput = formatInputNumber(it) },
                    label = { Text("Monthly Income (Rp)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = paydayInput,
                        onValueChange = { paydayInput = it.filter { c -> c.isDigit() }.take(2) },
                        label = { Text("Payday") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.width(110.dp)
                    )
                    Button(
                        onClick = {
                            vm.updateProfile(
                                displayName = nameInput.ifBlank { "User" },
                                baseSalary = parseInputNumber(salaryInput),
                                paydayDate = paydayInput.toIntOrNull()?.coerceIn(1, 31) ?: 25
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                        modifier = Modifier.weight(1f).height(52.dp)
                    ) { Text("Save Profile", fontWeight = FontWeight.Black) }
                }
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { showEmailParser = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SoftBlue, contentColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Parse Bank Email", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { vm.logout() },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(46.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = RoseAccent, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Sign Out", color = RoseAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            Text("Transaction History (${vm.transactions.size})", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
        }

        items(vm.transactions) { tx ->
            val isIncome = tx.type == "income"
            val isSaving = !isIncome && vm.isSavingTransaction(tx)
            val walletFlow = if (tx.toWalletName.isNotBlank()) "${tx.walletName} → ${tx.toWalletName}" else tx.walletName

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(DarkCard)
                    .border(1.dp, DarkCardBorder, RoundedCornerShape(18.dp))
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(tx.merchant.ifBlank { "Transaction" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("${tx.bucketName} • $walletFlow", color = TextSecondary, fontSize = 11.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val prefix = if (isIncome) "+" else if (isSaving) "↗ " else "-"
                    val amtColor = if (isIncome) MintAccent else if (isSaving) SoftBlue else SoftPink
                    Text(
                        "$prefix${vm.displayMoney(tx.amount)}",
                        color = amtColor,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp
                    )
                    IconButton(onClick = { vm.deleteTransaction(tx) }) {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(17.dp))
                    }
                }
            }
        }
    }

    if (showEmailParser) {
        var rawEmail by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showEmailParser = false },
            containerColor = DarkCard,
            title = { Text("Import Bank Email Receipt", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = rawEmail,
                    onValueChange = { rawEmail = it },
                    label = { Text("Paste email text (myBCA / Mandiri / GoPay)") },
                    minLines = 4,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val parsed = EmailReceiptParser.parse(rawEmail)
                        if (parsed.amount > 0L) {
                            val defaultBucket = vm.buckets.firstOrNull { inferBucketKind(it.name, it.kind) == "spending" }
                                ?: vm.buckets.firstOrNull()
                            val defaultWallet = vm.wallets.firstOrNull()
                            vm.addTransaction(
                                TransactionItem(
                                    type = "expense",
                                    amount = parsed.amount,
                                    bucketId = defaultBucket?.id,
                                    bucketName = defaultBucket?.name ?: "General",
                                    walletId = defaultWallet?.id,
                                    walletName = defaultWallet?.name ?: "Wallet",
                                    merchant = parsed.merchant.ifBlank { "Email Transaction" },
                                    notes = "Bank Email Import"
                                )
                            )
                        }
                        showEmailParser = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
                ) { Text("Parse & Save", fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { showEmailParser = false }) { Text("Cancel", color = TextSecondary) }
            }
        )
    }
}

@Composable
fun AddTransactionDialog(
    vm: SakukurataViewModel,
    onDismiss: () -> Unit
) {
    var type by remember { mutableStateOf("expense") }
    var amountText by remember { mutableStateOf("") }
    var merchant by remember { mutableStateOf("") }

    val availableBuckets = remember(vm.buckets, type) {
        if (type == "income") emptyList()
        else {
            val targetKind = if (type == "saving") "saving" else "spending"
            val filtered = vm.buckets.filter { inferBucketKind(it.name, it.kind) == targetKind }
            filtered.ifEmpty { vm.buckets }
        }
    }

    var selectedBucket by remember(availableBuckets) { mutableStateOf(availableBuckets.firstOrNull()) }
    var selectedWallet by remember { mutableStateOf(vm.wallets.firstOrNull()) }
    var selectedToWallet by remember { mutableStateOf<WalletItem?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkCard,
        title = { Text("Add Entry", color = Color.White, fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                // 3-way Type Switcher: Expense | Save/Invest | Income
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    listOf(
                        "expense" to "Expense",
                        "saving" to "Save/Invest",
                        "income" to "Income"
                    ).forEach { (key, label) ->
                        val active = type == key
                        val bgColor = when {
                            active && key == "expense" -> RoseAccent
                            active && key == "saving" -> SoftBlue
                            active && key == "income" -> EmeraldAccent
                            else -> DarkSurface
                        }
                        val fgColor = if (active && key != "expense") Color(0xFF052E16) else Color.White
                        Button(
                            onClick = {
                                type = key
                                if (key != "saving") selectedToWallet = null
                            },
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = bgColor, contentColor = fgColor),
                            modifier = Modifier.weight(1f)
                        ) { Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, maxLines = 1) }
                    }
                }
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = formatInputNumber(it) },
                    label = { Text("Amount (Rp)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = merchant,
                    onValueChange = { merchant = it },
                    label = {
                        Text(
                            when (type) {
                                "income" -> "Income Source"
                                "saving" -> "Platform / Goal (e.g. Bibit, RDN)"
                                else -> "Merchant / Description"
                            }
                        )
                    },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (type != "income" && availableBuckets.isNotEmpty()) {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(availableBuckets) { b ->
                            FilterChip(
                                selected = selectedBucket?.id == b.id,
                                onClick = { selectedBucket = b },
                                label = { Text(b.name, fontSize = 11.sp) }
                            )
                        }
                    }
                }
                if (vm.wallets.isNotEmpty()) {
                    Text(
                        if (type == "saving") "From Wallet" else "Wallet",
                        fontSize = 10.sp,
                        color = TextSecondary
                    )
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(vm.wallets) { w ->
                            FilterChip(
                                selected = selectedWallet?.id == w.id,
                                onClick = { selectedWallet = w },
                                label = { Text(w.name, fontSize = 11.sp) }
                            )
                        }
                    }
                }
                if (type == "saving" && vm.wallets.size > 1) {
                    Text("To Investment/Savings Wallet (Optional)", fontSize = 10.sp, color = TextSecondary)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        item {
                            FilterChip(
                                selected = selectedToWallet == null,
                                onClick = { selectedToWallet = null },
                                label = { Text("External App", fontSize = 11.sp) }
                            )
                        }
                        items(vm.wallets.filter { it.id != selectedWallet?.id }) { w ->
                            FilterChip(
                                selected = selectedToWallet?.id == w.id,
                                onClick = { selectedToWallet = w },
                                label = { Text(w.name, fontSize = 11.sp) }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amt = parseInputNumber(amountText)
                    if (amt > 0L) {
                        vm.addTransaction(
                            TransactionItem(
                                type = type,
                                amount = amt,
                                bucketId = if (type != "income") selectedBucket?.id else null,
                                bucketName = if (type != "income") (selectedBucket?.name ?: "General") else "Income",
                                walletId = selectedWallet?.id,
                                walletName = selectedWallet?.name ?: "Wallet",
                                toWalletId = if (type == "saving") selectedToWallet?.id else null,
                                toWalletName = if (type == "saving") (selectedToWallet?.name ?: "") else "",
                                merchant = merchant.ifBlank {
                                    when (type) {
                                        "income" -> "Income"
                                        "saving" -> "Savings / Investment"
                                        else -> "Expense"
                                    }
                                }
                            )
                        )
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
            ) { Text("Save", fontWeight = FontWeight.Black) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextSecondary) }
        }
    )
}
