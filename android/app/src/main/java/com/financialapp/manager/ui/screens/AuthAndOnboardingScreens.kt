package com.financialapp.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financialapp.manager.data.SakukurataViewModel
import com.financialapp.manager.model.OnboardingTemplates
import com.financialapp.manager.model.WalletItem
import com.financialapp.manager.ui.theme.*

@Composable
fun AuthScreen(vm: SakukurataViewModel) {
    var isRegister by remember { mutableStateOf(false) }
    var displayName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.padding(top = 36.dp)) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(listOf(EmeraldAccent, Color(0xFF06B6D4)))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = Color(0xFF052E16), modifier = Modifier.size(28.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text("Sakukurata", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White)
            Text(
                "Atur alokasi gaji, dompet & pengeluaran harian. Sinkron real-time antara Android & Web.",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(DarkCard)
                .border(1.dp, DarkCardBorder, RoundedCornerShape(28.dp))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (!vm.isFirebaseAvailable) {
                Text(
                    "google-services.json belum dipasang. Kamu bisa langsung mencoba Mode Lokal di bawah.",
                    fontSize = 11.sp,
                    color = AmberAccent
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(DarkSurface)
                    .padding(4.dp)
            ) {
                listOf(false to "Masuk", true to "Daftar Baru").forEach { (reg, label) ->
                    val selected = isRegister == reg
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (selected) EmeraldAccent else Color.Transparent)
                            .clickable { isRegister = reg }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            label,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (selected) Color(0xFF052E16) else TextSecondary
                        )
                    }
                }
            }

            if (isRegister) {
                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("Nama Panggilan") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password (min. 6 karakter)") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )

            if (vm.authError.isNotBlank()) {
                Text(vm.authError, color = RoseAccent, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = {
                    if (isRegister) vm.registerWithEmail(displayName, email, password)
                    else vm.loginWithEmail(email, password)
                },
                enabled = vm.isFirebaseAvailable && email.isNotBlank() && password.length >= 6,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text(if (isRegister) "Buat Akun & Mulai" else "Masuk ke Akun", fontWeight = FontWeight.Black)
            }
        }

        OutlinedButton(
            onClick = { vm.continueAsGuest() },
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Text("Coba Tanpa Akun (Mode Lokal)", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun OnboardingScreen(vm: SakukurataViewModel) {
    var step by remember { mutableIntStateOf(1) }
    var displayName by remember { mutableStateOf(vm.profile?.displayName ?: "") }
    var salaryInput by remember { mutableStateOf("5.000.000") }
    var paydayInput by remember { mutableStateOf("25") }
    var selectedTemplateId by remember { mutableStateOf("balanced") }
    var selectedWallets by remember {
        mutableStateOf(
            listOf(
                WalletItem(name = "Bank BCA", type = "bank", color = "#005caa"),
                WalletItem(name = "Dompet Tunai", type = "cash", color = "#10b981")
            )
        )
    }

    fun finish() {
        val tpl = OnboardingTemplates.budgetTemplates.find { it.id == selectedTemplateId }
            ?: OnboardingTemplates.budgetTemplates.first()
        vm.completeOnboarding(
            displayName = displayName.ifBlank { "Pengguna" },
            baseSalary = parseInputNumber(salaryInput),
            paydayDate = paydayInput.toIntOrNull()?.coerceIn(1, 31) ?: 25,
            initialBuckets = tpl.buckets,
            initialWallets = selectedWallets.ifEmpty { listOf(WalletItem(name = "Dompet Utama", type = "cash")) }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(20.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header & Progress
        Column(modifier = Modifier.padding(top = 12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("LANGKAH $step DARI 3", fontSize = 11.sp, fontWeight = FontWeight.Black, color = EmeraldAccent)
                Text(
                    "Lewati",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier.clickable { finish() }
                )
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                (1..3).forEach { s ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(5.dp)
                            .clip(CircleShape)
                            .background(if (s <= step) EmeraldAccent else DarkCard)
                    )
                }
            }
        }

        // Body
        LazyColumn(
            modifier = Modifier.weight(1f).padding(vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            when (step) {
                1 -> {
                    item {
                        Text("Kenalan dulu yuk!", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("Semua pengaturan ini fleksibel dan bisa diubah kapan saja.", fontSize = 12.sp, color = TextSecondary)
                    }
                    item {
                        OutlinedTextField(
                            value = displayName,
                            onValueChange = { displayName = it },
                            label = { Text("Nama Panggilan") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = salaryInput,
                            onValueChange = { salaryInput = formatInputNumber(it) },
                            label = { Text("Estimasi Gaji / Pemasukan Bulanan (Rp)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = paydayInput,
                            onValueChange = { paydayInput = it.filter { c -> c.isDigit() }.take(2) },
                            label = { Text("Tanggal Gajian (1–31)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
                2 -> {
                    item {
                        Text("Pilih Gaya Alokasi", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("Pilih template awal atau mulai kosong—bisa diubah kapan saja.", fontSize = 12.sp, color = TextSecondary)
                    }
                    items(OnboardingTemplates.budgetTemplates) { tpl ->
                        val active = selectedTemplateId == tpl.id
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(22.dp))
                                .background(if (active) EmeraldAccent.copy(alpha = 0.12f) else DarkCard)
                                .border(1.dp, if (active) EmeraldAccent else DarkCardBorder, RoundedCornerShape(22.dp))
                                .clickable { selectedTemplateId = tpl.id }
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(tpl.name, fontWeight = FontWeight.ExtraBold, color = Color.White, fontSize = 14.sp)
                                if (active) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                                }
                            }
                            Text(tpl.subtitle, fontSize = 11.sp, color = TextSecondary)
                        }
                    }
                }
                3 -> {
                    item {
                        Text("Pilih Dompet & Rekening", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("Tap bank / e-wallet yang kamu pakai sehari-hari.", fontSize = 12.sp, color = TextSecondary)
                    }
                    items(OnboardingTemplates.starterWallets) { w ->
                        val isSelected = selectedWallets.any { it.name == w.name }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(if (isSelected) EmeraldAccent.copy(alpha = 0.14f) else DarkCard)
                                .border(1.dp, if (isSelected) EmeraldAccent else DarkCardBorder, RoundedCornerShape(18.dp))
                                .clickable {
                                    selectedWallets = if (isSelected && selectedWallets.size > 1) {
                                        selectedWallets.filterNot { it.name == w.name }
                                    } else if (!isSelected) {
                                        selectedWallets + w
                                    } else {
                                        selectedWallets
                                    }
                                }
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Box(Modifier.size(10.dp).clip(CircleShape).background(parseHexColor(w.color)))
                                Text(w.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            if (isSelected) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }

        // Footer Buttons
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            if (step > 1) {
                OutlinedButton(
                    onClick = { step -= 1 },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(50.dp)
                ) {
                    Text("Kembali", color = Color.White)
                }
            }
            Button(
                onClick = { if (step < 3) step += 1 else finish() },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent, contentColor = Color(0xFF052E16)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.weight(1f).height(50.dp)
            ) {
                Text(if (step < 3) "Lanjut" else "Mulai Sakukurata", fontWeight = FontWeight.Black)
            }
        }
    }
}
