package com.financialapp.manager.ui.screens

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financialapp.manager.data.SakukurataViewModel
import com.financialapp.manager.model.OnboardingTemplates
import com.financialapp.manager.model.WalletItem
import com.financialapp.manager.ui.components.BankLogo
import com.financialapp.manager.ui.theme.*
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

@Composable
fun AuthScreen(vm: SakukurataViewModel) {
    val colors = AppColors.current
    val context = LocalContext.current
    var isRegister by remember { mutableStateOf(false) }
    var displayName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val googleLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (!idToken.isNullOrBlank()) {
                    vm.loginWithGoogleIdToken(idToken)
                } else {
                    vm.setAuthErrorMessage("Google Sign-In did not return an ID token. Ensure Web Client ID & SHA-1 are configured in Firebase Console.")
                }
            } catch (e: ApiException) {
                vm.setAuthErrorMessage("Google Sign-In failed (code ${e.statusCode}). Check SHA-1 fingerprint in Firebase Console.")
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.padding(top = 30.dp)) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(listOf(colors.accent, Color(0xFF06B6D4)))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = colors.onAccent, modifier = Modifier.size(28.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text("Sakukurata", fontSize = 28.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
            Text(
                "Manage salary allocation, wallets & daily expenses. Synced in real time between Android & Web.",
                fontSize = 13.sp,
                color = colors.textSecondary,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(colors.card)
                .border(1.dp, colors.cardBorder, RoundedCornerShape(28.dp))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(11.dp)
        ) {
            if (!vm.isFirebaseAvailable) {
                Text(
                    "google-services.json is not attached in this build. You can still try Local Mode below.",
                    fontSize = 11.sp,
                    color = AmberAccent
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surface)
                    .padding(4.dp)
            ) {
                listOf(false to "Sign In", true to "Register").forEach { (reg, label) ->
                    val selected = isRegister == reg
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (selected) colors.accent else Color.Transparent)
                            .clickable { isRegister = reg }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            label,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (selected) colors.onAccent else colors.textSecondary
                        )
                    }
                }
            }

            if (isRegister) {
                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("Nickname") },
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
                label = { Text("Password (min. 6 characters)") },
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
                colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.onAccent),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().height(46.dp)
            ) {
                Text(if (isRegister) "Create Account & Start" else "Sign In", fontWeight = FontWeight.Black)
            }

            OutlinedButton(
                onClick = {
                    if (!vm.isFirebaseAvailable) {
                        vm.setAuthErrorMessage("Firebase is not configured in this APK (google-services.json missing).")
                        return@OutlinedButton
                    }
                    val resId = context.resources.getIdentifier("default_web_client_id", "string", context.packageName)
                    if (resId == 0) {
                        vm.setAuthErrorMessage("Google Sign-In requires Web OAuth Client ID (enable Google Sign-In & add Android SHA-1 in Firebase Console, then update google-services.json).")
                        return@OutlinedButton
                    }
                    val webClientId = context.getString(resId)
                    val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestIdToken(webClientId)
                        .requestEmail()
                        .build()
                    val client = GoogleSignIn.getClient(context, gso)
                    client.signOut().addOnCompleteListener {
                        googleLauncher.launch(client.signInIntent)
                    }
                },
                enabled = vm.isFirebaseAvailable,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().height(46.dp)
            ) {
                Text("Continue with Google", color = colors.textPrimary, fontWeight = FontWeight.Bold)
            }
        }

        OutlinedButton(
            onClick = { vm.continueAsGuest() },
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth().height(46.dp)
        ) {
            Text("Try Without Account (Local Mode)", color = colors.textPrimary, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun OnboardingScreen(vm: SakukurataViewModel) {
    val colors = AppColors.current
    var step by remember { mutableIntStateOf(1) }
    var displayName by remember { mutableStateOf(vm.profile?.displayName ?: "") }
    var salaryInput by remember { mutableStateOf("5.000.000") }
    var paydayInput by remember { mutableStateOf("25") }
    var selectedTemplateId by remember { mutableStateOf("balanced") }
    var selectedWallets by remember {
        mutableStateOf(
            listOf(
                WalletItem(name = "Bank BCA", type = "bank", color = "#005caa"),
                WalletItem(name = "Cash / Physical Wallet", type = "cash", color = "#10b981")
            )
        )
    }

    fun finish() {
        val tpl = OnboardingTemplates.budgetTemplates.find { it.id == selectedTemplateId }
            ?: OnboardingTemplates.budgetTemplates.first()
        vm.completeOnboarding(
            displayName = displayName.ifBlank { "User" },
            baseSalary = parseInputNumber(salaryInput),
            paydayDate = paydayInput.toIntOrNull()?.coerceIn(1, 31) ?: 25,
            initialBuckets = tpl.buckets,
            initialWallets = selectedWallets.ifEmpty { listOf(WalletItem(name = "Main Wallet", type = "cash")) }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(20.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header & Progress
        Column(modifier = Modifier.padding(top = 12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("STEP $step OF 3", fontSize = 11.sp, fontWeight = FontWeight.Black, color = colors.accent)
                Text(
                    "Skip",
                    fontSize = 12.sp,
                    color = colors.textSecondary,
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
                            .background(if (s <= step) colors.accent else colors.card)
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
                        Text("Let's get started!", fontSize = 24.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                        Text("All settings are flexible and can be changed anytime.", fontSize = 12.sp, color = colors.textSecondary)
                    }
                    item {
                        OutlinedTextField(
                            value = displayName,
                            onValueChange = { displayName = it },
                            label = { Text("Nickname") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = salaryInput,
                            onValueChange = { salaryInput = formatInputNumber(it) },
                            label = { Text("Estimated Monthly Income (Rp)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = paydayInput,
                            onValueChange = { paydayInput = it.filter { c -> c.isDigit() }.take(2) },
                            label = { Text("Payday Date (1–31)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
                2 -> {
                    item {
                        Text("Choose Allocation Style", fontSize = 24.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                        Text("Pick a starting template or start blank—editable anytime.", fontSize = 12.sp, color = colors.textSecondary)
                    }
                    items(OnboardingTemplates.budgetTemplates) { tpl ->
                        val active = selectedTemplateId == tpl.id
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(22.dp))
                                .background(if (active) colors.accent.copy(alpha = 0.12f) else colors.card)
                                .border(1.dp, if (active) colors.accent else colors.cardBorder, RoundedCornerShape(22.dp))
                                .clickable { selectedTemplateId = tpl.id }
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(tpl.name, fontWeight = FontWeight.ExtraBold, color = colors.textPrimary, fontSize = 14.sp)
                                if (active) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = colors.accent, modifier = Modifier.size(18.dp))
                                }
                            }
                            Text(tpl.subtitle, fontSize = 11.sp, color = colors.textSecondary)
                        }
                    }
                }
                3 -> {
                    item {
                        Text("Select Wallets & Accounts", fontSize = 24.sp, fontWeight = FontWeight.Black, color = colors.textPrimary)
                        Text("Tap the banks & e-wallets you use daily.", fontSize = 12.sp, color = colors.textSecondary)
                    }
                    items(OnboardingTemplates.starterWallets) { w ->
                        val isSelected = selectedWallets.any { it.name == w.name }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(if (isSelected) colors.accent.copy(alpha = 0.14f) else colors.card)
                                .border(1.dp, if (isSelected) colors.accent else colors.cardBorder, RoundedCornerShape(18.dp))
                                .clickable {
                                    selectedWallets = if (isSelected && selectedWallets.size > 1) {
                                        selectedWallets.filterNot { it.name == w.name }
                                    } else if (!isSelected) {
                                        selectedWallets + w
                                    } else {
                                        selectedWallets
                                    }
                                }
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                BankLogo(name = w.name, fallbackColorHex = w.color, size = 34.dp)
                                Text(w.name, color = colors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            if (isSelected) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = colors.accent, modifier = Modifier.size(18.dp))
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
                    Text("Back", color = colors.textPrimary)
                }
            }
            Button(
                onClick = { if (step < 3) step += 1 else finish() },
                colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.onAccent),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.weight(1f).height(50.dp)
            ) {
                Text(if (step < 3) "Next" else "Launch Sakukurata", fontWeight = FontWeight.Black)
            }
        }
    }
}
