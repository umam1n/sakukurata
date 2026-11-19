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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Logout
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
import com.financialapp.manager.ui.theme.*

@Composable
fun AllocationScreen(vm: SakukurataViewModel) {
    var draftBuckets by remember(vm.buckets) { mutableStateOf(vm.buckets) }
    var newName by remember { mutableStateOf("") }
    var newPct by remember { mutableStateOf("10") }

    val totalPct = draftBuckets.sumOf { it.percentage }
    val isValid = totalPct == 100
    val diff = 100 - totalPct

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(DarkCard).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Alokasi Fleksibel (100%)", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
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
                            Text("Auto-Pas (${if (diff > 0) "+$diff%" else "$diff%"})", color = AmberAccent, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(Modifier.weight(1f))
                    Button(
                        onClick = { vm.saveBuckets(draftBuckets) },
                        enabled = isValid,
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Simpan", fontWeight = FontWeight.Black, fontSize = 12.sp)
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
                    Box(Modifier.width(5.dp).height(34.dp).clip(RoundedCornerShape(4.dp)).background(parseHexColor(b.color)))
                    Column {
                        Text(b.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(formatRupiah(allocated), color = EmeraldAccent, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp)
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
            Row(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(DarkCard).padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newName,
                    onValueChange = { newName = it },
                    label = { Text("Pos Baru") },
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
                                color = "#8b5cf6",
                                sortOrder = draftBuckets.size
                            )
                            newName = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
                ) { Text("+") }
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
                    Text("Profil & Sinkronisasi", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text(
                        if (vm.isGuestMode) "Lokal" else "Firebase Cloud",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldAccent
                    )
                }
                OutlinedTextField(value = nameInput, onValueChange = { nameInput = it }, label = { Text("Nama") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(
                    value = salaryInput,
                    onValueChange = { salaryInput = formatInputNumber(it) },
                    label = { Text("Gaji Bulanan (Rp)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = paydayInput,
                        onValueChange = { paydayInput = it.filter { c -> c.isDigit() }.take(2) },
                        label = { Text("Tgl Gajian") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.width(110.dp)
                    )
                    Button(
                        onClick = {
                            vm.updateProfile(
                                displayName = nameInput.ifBlank { "Pengguna" },
                                baseSalary = parseInputNumber(salaryInput),
                                paydayDate = paydayInput.toIntOrNull()?.coerceIn(1, 31) ?: 25
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                        modifier = Modifier.weight(1f).height(52.dp)
                    ) { Text("Simpan Profil", fontWeight = FontWeight.Black) }
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
                    Text("Parse Email Bank", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { vm.logout() },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(46.dp)
                ) {
                    Icon(Icons.Default.Logout, contentDescription = null, tint = RoseAccent, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Keluar", color = RoseAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            Text("Riwayat Transaksi (${vm.transactions.size})", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
        }

        items(vm.transactions) { tx ->
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
                    Text(tx.merchant.ifBlank { "Transaksi" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("${tx.bucketName} • ${tx.walletName}", color = TextSecondary, fontSize = 11.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "${if (tx.type == "income") "+" else "-"}${formatRupiah(tx.amount)}",
                        color = if (tx.type == "income") MintAccent else SoftPink,
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
            title = { Text("Import Struk Email Bank", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = rawEmail,
                    onValueChange = { rawEmail = it },
                    label = { Text("Tempel teks email myBCA / Mandiri / GoPay") },
                    minLines = 4,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val parsed = EmailReceiptParser.parse(rawEmail)
                        if (parsed.amount > 0L) {
                            val defaultBucket = vm.buckets.firstOrNull()
                            val defaultWallet = vm.wallets.firstOrNull()
                            vm.addTransaction(
                                TransactionItem(
                                    type = "expense",
                                    amount = parsed.amount,
                                    bucketId = defaultBucket?.id,
                                    bucketName = defaultBucket?.name ?: "Umum",
                                    walletId = defaultWallet?.id,
                                    walletName = defaultWallet?.name ?: "Dompet",
                                    merchant = parsed.merchant.ifBlank { "Transaksi Email" },
                                    notes = "Import Email Bank"
                                )
                            )
                        }
                        showEmailParser = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
                ) { Text("Parse & Simpan", fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { showEmailParser = false }) { Text("Batal", color = TextSecondary) }
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
    var selectedBucket by remember { mutableStateOf(vm.buckets.firstOrNull()) }
    var selectedWallet by remember { mutableStateOf(vm.wallets.firstOrNull()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkCard,
        title = { Text("Tambah Transaksi", color = Color.White, fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    listOf("expense" to "Pengeluaran", "income" to "Pemasukan").forEach { (key, label) ->
                        val active = type == key
                        Button(
                            onClick = { type = key },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (active) (if (key == "expense") RoseAccent else EmeraldAccent) else DarkSurface,
                                contentColor = if (active && key == "income") Color(0xFF052E16) else Color.White
                            ),
                            modifier = Modifier.weight(1f)
                        ) { Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    }
                }
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = formatInputNumber(it) },
                    label = { Text("Nominal (Rp)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = merchant,
                    onValueChange = { merchant = it },
                    label = { Text(if (type == "expense") "Merchant / Keperluan" else "Sumber Pemasukan") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (type == "expense" && vm.buckets.isNotEmpty()) {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(vm.buckets) { b ->
                            FilterChip(
                                selected = selectedBucket?.id == b.id,
                                onClick = { selectedBucket = b },
                                label = { Text(b.name, fontSize = 11.sp) }
                            )
                        }
                    }
                }
                if (vm.wallets.isNotEmpty()) {
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
                                bucketId = if (type == "expense") selectedBucket?.id else null,
                                bucketName = if (type == "expense") (selectedBucket?.name ?: "Umum") else "Pemasukan",
                                walletId = selectedWallet?.id,
                                walletName = selectedWallet?.name ?: "Dompet",
                                merchant = merchant.ifBlank { if (type == "income") "Pemasukan" else "Pengeluaran" }
                            )
                        )
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16))
            ) { Text("Simpan", fontWeight = FontWeight.Black) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Batal", color = TextSecondary) }
        }
    )
}
