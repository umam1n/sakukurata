package com.financialapp.manager.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financialapp.manager.model.*
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * Unified State & Repository for Sakukurata Android.
 * Uses the exact same Firestore paths (`users/{uid}/...`) as the Vercel Web App.
 * Gracefully falls back to Local Guest Mode if google-services.json is not yet configured.
 */
class SakukurataViewModel : ViewModel() {

    val isFirebaseAvailable: Boolean = try {
        FirebaseApp.getApps(FirebaseApp.getInstance().applicationContext).isNotEmpty()
    } catch (_: Exception) {
        false
    }

    private val auth: FirebaseAuth? = if (isFirebaseAvailable) FirebaseAuth.getInstance() else null
    private val db: FirebaseFirestore? = if (isFirebaseAvailable) FirebaseFirestore.getInstance() else null

    var isAuthenticated by mutableStateOf(false)
        private set
    var isGuestMode by mutableStateOf(false)
        private set
    var isLoading by mutableStateOf(isFirebaseAvailable)
        private set
    var authError by mutableStateOf("")
        private set

    var profile by mutableStateOf<UserProfile?>(null)
        private set
    var buckets by mutableStateOf<List<BudgetBucket>>(emptyList())
        private set
    var wallets by mutableStateOf<List<WalletItem>>(emptyList())
        private set
    var transactions by mutableStateOf<List<TransactionItem>>(emptyList())
        private set
    var quickActions by mutableStateOf<List<QuickActionItem>>(emptyList())
        private set
    var goals by mutableStateOf<List<SavingsGoalItem>>(emptyList())
        private set
    var bills by mutableStateOf<List<RecurringBillItem>>(emptyList())
        private set

    private val listeners = mutableListOf<ListenerRegistration>()

    private val currentUid: String?
        get() = auth?.currentUser?.uid

    val onboardingCompleted: Boolean
        get() = profile?.onboardingCompleted == true

    val totalIncome: Long
        get() = (profile?.baseSalary ?: 0L) + transactions.filter { it.type == "income" }.sumOf { it.amount }

    val totalExpenses: Long
        get() = transactions.filter { it.type == "expense" }.sumOf { it.amount }

    val overallRemainingCash: Long
        get() = totalIncome - totalExpenses

    init {
        if (auth != null) {
            auth.addAuthStateListener { firebaseAuth ->
                val user = firebaseAuth.currentUser
                if (user != null) {
                    isAuthenticated = true
                    isGuestMode = false
                    attachFirestoreListeners(user.uid)
                } else if (!isGuestMode) {
                    clearListeners()
                    isAuthenticated = false
                    resetState()
                    isLoading = false
                }
            }
        } else {
            isLoading = false
        }
    }

    private fun nowIso(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        return sdf.format(Date())
    }

    private fun attachFirestoreListeners(uid: String) {
        clearListeners()
        val firestore = db ?: return
        isLoading = true

        val userRef = firestore.collection("users").document(uid)

        listeners += userRef.addSnapshotListener { snap, _ ->
            profile = if (snap != null && snap.exists()) {
                UserProfile(
                    displayName = snap.getString("displayName") ?: auth?.currentUser?.displayName ?: "Pengguna",
                    email = snap.getString("email") ?: auth?.currentUser?.email ?: "",
                    baseSalary = snap.getLong("baseSalary") ?: 0L,
                    paydayDate = (snap.getLong("paydayDate") ?: 25L).toInt(),
                    currency = snap.getString("currency") ?: "IDR",
                    onboardingCompleted = snap.getBoolean("onboardingCompleted") ?: false
                )
            } else {
                null
            }
            isLoading = false
        }

        listeners += userRef.collection("buckets").addSnapshotListener { snap, _ ->
            buckets = snap?.documents?.map { d ->
                BudgetBucket(
                    id = d.id,
                    name = d.getString("name") ?: "",
                    percentage = (d.getLong("percentage") ?: 0L).toInt(),
                    color = d.getString("color") ?: "#10b981",
                    icon = d.getString("icon") ?: "Tag",
                    sortOrder = (d.getLong("sortOrder") ?: 0L).toInt()
                )
            }?.sortedBy { it.sortOrder } ?: emptyList()
        }

        listeners += userRef.collection("wallets").addSnapshotListener { snap, _ ->
            wallets = snap?.documents?.map { d ->
                WalletItem(
                    id = d.id,
                    name = d.getString("name") ?: "",
                    type = d.getString("type") ?: "bank",
                    balance = d.getLong("balance") ?: 0L,
                    color = d.getString("color") ?: "#3b82f6"
                )
            } ?: emptyList()
        }

        listeners += userRef.collection("transactions")
            .orderBy("transactionDate", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, _ ->
                transactions = snap?.documents?.map { d ->
                    TransactionItem(
                        id = d.id,
                        type = d.getString("type") ?: "expense",
                        amount = d.getLong("amount") ?: 0L,
                        bucketId = d.getString("bucketId"),
                        bucketName = d.getString("bucketName") ?: "Umum",
                        walletId = d.getString("walletId"),
                        walletName = d.getString("walletName") ?: "Dompet",
                        merchant = d.getString("merchant") ?: "",
                        notes = d.getString("notes") ?: "",
                        transactionDate = d.getString("transactionDate") ?: "",
                        createdAt = d.getString("createdAt") ?: ""
                    )
                } ?: emptyList()
            }

        listeners += userRef.collection("quickActions").addSnapshotListener { snap, _ ->
            quickActions = snap?.documents?.map { d ->
                QuickActionItem(
                    id = d.id,
                    title = d.getString("title") ?: "",
                    amount = d.getLong("amount") ?: 0L,
                    bucketId = d.getString("bucketId"),
                    bucketName = d.getString("bucketName") ?: "Umum",
                    walletId = d.getString("walletId"),
                    color = d.getString("color") ?: "#10b981",
                    icon = d.getString("icon") ?: "Zap"
                )
            } ?: emptyList()
        }

        listeners += userRef.collection("goals").addSnapshotListener { snap, _ ->
            goals = snap?.documents?.map { d ->
                SavingsGoalItem(
                    id = d.id,
                    title = d.getString("title") ?: "",
                    targetAmount = d.getLong("targetAmount") ?: 0L,
                    currentAmount = d.getLong("currentAmount") ?: 0L,
                    targetDate = d.getString("targetDate") ?: "",
                    color = d.getString("color") ?: "#10b981"
                )
            } ?: emptyList()
        }

        listeners += userRef.collection("bills").addSnapshotListener { snap, _ ->
            bills = snap?.documents?.map { d ->
                RecurringBillItem(
                    id = d.id,
                    title = d.getString("title") ?: "",
                    amount = d.getLong("amount") ?: 0L,
                    dueDay = (d.getLong("dueDay") ?: 10L).toInt(),
                    bucketId = d.getString("bucketId"),
                    walletId = d.getString("walletId"),
                    isPaid = d.getBoolean("isPaid") ?: false
                )
            } ?: emptyList()
        }
    }

    private fun clearListeners() {
        listeners.forEach { it.remove() }
        listeners.clear()
    }

    private fun resetState() {
        profile = null
        buckets = emptyList()
        wallets = emptyList()
        transactions = emptyList()
        quickActions = emptyList()
        goals = emptyList()
        bills = emptyList()
    }

    // --- AUTH ---

    fun loginWithEmail(email: String, password: String) {
        val firebaseAuth = auth ?: run {
            authError = "Firebase belum dikonfigurasi (google-services.json)."
            return
        }
        authError = ""
        viewModelScope.launch {
            try {
                firebaseAuth.signInWithEmailAndPassword(email.trim(), password).await()
            } catch (e: Exception) {
                authError = e.localizedMessage ?: "Gagal masuk. Periksa email & password."
            }
        }
    }

    fun registerWithEmail(name: String, email: String, password: String) {
        val firebaseAuth = auth ?: run {
            authError = "Firebase belum dikonfigurasi (google-services.json)."
            return
        }
        authError = ""
        viewModelScope.launch {
            try {
                val res = firebaseAuth.createUserWithEmailAndPassword(email.trim(), password).await()
                if (name.isNotBlank()) {
                    res.user?.updateProfile(
                        UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build()
                    )?.await()
                }
            } catch (e: Exception) {
                authError = e.localizedMessage ?: "Gagal mendaftar."
            }
        }
    }

    fun continueAsGuest() {
        authError = ""
        isGuestMode = true
        isAuthenticated = true
        isLoading = false
    }

    fun logout() {
        clearListeners()
        auth?.signOut()
        isGuestMode = false
        isAuthenticated = false
        resetState()
    }

    // --- FLUID ONBOARDING ---

    fun completeOnboarding(
        displayName: String,
        baseSalary: Long,
        paydayDate: Int,
        initialBuckets: List<BudgetBucket>,
        initialWallets: List<WalletItem>
    ) {
        val uid = currentUid
        val firestore = db
        val newProfile = UserProfile(
            displayName = displayName.ifBlank { "Pengguna" },
            email = auth?.currentUser?.email ?: "",
            baseSalary = baseSalary,
            paydayDate = paydayDate,
            currency = "IDR",
            onboardingCompleted = true
        )

        if (!isGuestMode && uid != null && firestore != null) {
            viewModelScope.launch {
                val batch = firestore.batch()
                val userRef = firestore.collection("users").document(uid)
                val now = nowIso()

                batch.set(
                    userRef,
                    mapOf(
                        "displayName" to newProfile.displayName,
                        "email" to newProfile.email,
                        "baseSalary" to newProfile.baseSalary,
                        "paydayDate" to newProfile.paydayDate,
                        "currency" to newProfile.currency,
                        "onboardingCompleted" to true,
                        "createdAt" to now,
                        "updatedAt" to now
                    ),
                    SetOptions.merge()
                )

                var firstBucketId: String? = null
                var firstBucketName = "Umum"
                initialBuckets.forEachIndexed { idx, b ->
                    val ref = userRef.collection("buckets").document()
                    if (idx == 0) {
                        firstBucketId = ref.id
                        firstBucketName = b.name
                    }
                    batch.set(
                        ref,
                        mapOf(
                            "name" to b.name,
                            "percentage" to b.percentage,
                            "color" to b.color,
                            "icon" to b.icon,
                            "sortOrder" to idx
                        )
                    )
                }

                var firstWalletId: String? = null
                initialWallets.forEachIndexed { idx, w ->
                    val ref = userRef.collection("wallets").document()
                    if (idx == 0) firstWalletId = ref.id
                    batch.set(
                        ref,
                        mapOf(
                            "name" to w.name,
                            "type" to w.type,
                            "balance" to w.balance,
                            "color" to w.color
                        )
                    )
                }

                OnboardingTemplates.starterQuickActions.forEach { qa ->
                    val ref = userRef.collection("quickActions").document()
                    batch.set(
                        ref,
                        mapOf(
                            "title" to qa.title,
                            "amount" to qa.amount,
                            "bucketId" to firstBucketId,
                            "bucketName" to firstBucketName,
                            "walletId" to firstWalletId,
                            "color" to qa.color,
                            "icon" to qa.icon
                        )
                    )
                }

                batch.commit().await()
            }
            return
        }

        // Local Guest Mode
        val mappedBuckets = initialBuckets.mapIndexed { idx, b ->
            b.copy(id = UUID.randomUUID().toString(), sortOrder = idx)
        }
        val mappedWallets = initialWallets.map { w ->
            w.copy(id = UUID.randomUUID().toString())
        }
        val mappedQuick = OnboardingTemplates.starterQuickActions.map { qa ->
            qa.copy(
                id = UUID.randomUUID().toString(),
                bucketId = mappedBuckets.firstOrNull()?.id,
                bucketName = mappedBuckets.firstOrNull()?.name ?: "Umum",
                walletId = mappedWallets.firstOrNull()?.id
            )
        }
        profile = newProfile
        buckets = mappedBuckets
        wallets = mappedWallets
        quickActions = mappedQuick
    }

    // --- CRUD OPERATIONS ---

    fun updateProfile(displayName: String, baseSalary: Long, paydayDate: Int) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).set(
                mapOf(
                    "displayName" to displayName,
                    "baseSalary" to baseSalary,
                    "paydayDate" to paydayDate,
                    "updatedAt" to nowIso()
                ),
                SetOptions.merge()
            )
            return
        }
        profile = (profile ?: UserProfile(onboardingCompleted = true)).copy(
            displayName = displayName,
            baseSalary = baseSalary,
            paydayDate = paydayDate
        )
    }

    fun saveBuckets(newBuckets: List<BudgetBucket>) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            val batch = firestore.batch()
            val col = firestore.collection("users").document(uid).collection("buckets")
            val nextIds = newBuckets.mapNotNull { if (it.id.isNotBlank() && !it.id.startsWith("tmp_")) it.id else null }.toSet()

            buckets.forEach { old ->
                if (old.id !in nextIds) batch.delete(col.document(old.id))
            }

            newBuckets.forEachIndexed { idx, b ->
                val ref = if (b.id.isNotBlank() && !b.id.startsWith("tmp_")) col.document(b.id) else col.document()
                batch.set(
                    ref,
                    mapOf(
                        "name" to b.name,
                        "percentage" to b.percentage,
                        "color" to b.color,
                        "icon" to b.icon,
                        "sortOrder" to idx
                    )
                )
            }
            batch.commit()
            return
        }
        buckets = newBuckets.mapIndexed { idx, b ->
            b.copy(
                id = if (b.id.isBlank() || b.id.startsWith("tmp_")) UUID.randomUUID().toString() else b.id,
                sortOrder = idx
            )
        }
    }

    fun addTransaction(tx: TransactionItem) {
        val now = nowIso()
        val finalTx = tx.copy(
            transactionDate = tx.transactionDate.ifBlank { now },
            createdAt = now
        )
        val uid = currentUid
        val firestore = db

        val targetWallet = wallets.find { it.id == finalTx.walletId }
        val updatedBalance = targetWallet?.let {
            val diff = if (finalTx.type == "income") finalTx.amount else -finalTx.amount
            (it.balance + diff).coerceAtLeast(0L)
        }

        if (!isGuestMode && uid != null && firestore != null) {
            val userRef = firestore.collection("users").document(uid)
            userRef.collection("transactions").add(
                mapOf(
                    "type" to finalTx.type,
                    "amount" to finalTx.amount,
                    "bucketId" to finalTx.bucketId,
                    "bucketName" to finalTx.bucketName,
                    "walletId" to finalTx.walletId,
                    "walletName" to finalTx.walletName,
                    "merchant" to finalTx.merchant,
                    "notes" to finalTx.notes,
                    "transactionDate" to finalTx.transactionDate,
                    "createdAt" to finalTx.createdAt
                )
            )
            if (targetWallet != null && updatedBalance != null) {
                userRef.collection("wallets").document(targetWallet.id).update("balance", updatedBalance)
            }
            return
        }

        transactions = listOf(finalTx.copy(id = UUID.randomUUID().toString())) + transactions
        if (targetWallet != null && updatedBalance != null) {
            wallets = wallets.map { if (it.id == targetWallet.id) it.copy(balance = updatedBalance) else it }
        }
    }

    fun deleteTransaction(tx: TransactionItem) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("transactions").document(tx.id).delete()
            return
        }
        transactions = transactions.filterNot { it.id == tx.id }
    }

    fun addWallet(name: String, type: String, balance: Long, color: String = "#3b82f6") {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("wallets").add(
                mapOf("name" to name.trim(), "type" to type, "balance" to balance, "color" to color)
            )
            return
        }
        wallets = wallets + WalletItem(
            id = UUID.randomUUID().toString(),
            name = name.trim(),
            type = type,
            balance = balance,
            color = color
        )
    }

    fun deleteWallet(walletId: String) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("wallets").document(walletId).delete()
            return
        }
        wallets = wallets.filterNot { it.id == walletId }
    }

    fun addQuickAction(title: String, amount: Long) {
        val uid = currentUid
        val firestore = db
        val bucket = buckets.firstOrNull()
        val wallet = wallets.firstOrNull()
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("quickActions").add(
                mapOf(
                    "title" to title.trim(),
                    "amount" to amount,
                    "bucketId" to bucket?.id,
                    "bucketName" to (bucket?.name ?: "Umum"),
                    "walletId" to wallet?.id,
                    "color" to "#10b981",
                    "icon" to "Zap"
                )
            )
            return
        }
        quickActions = quickActions + QuickActionItem(
            id = UUID.randomUUID().toString(),
            title = title.trim(),
            amount = amount,
            bucketId = bucket?.id,
            bucketName = bucket?.name ?: "Umum",
            walletId = wallet?.id
        )
    }

    fun addGoal(title: String, targetAmount: Long, currentAmount: Long) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("goals").add(
                mapOf(
                    "title" to title.trim(),
                    "targetAmount" to targetAmount,
                    "currentAmount" to currentAmount,
                    "targetDate" to "",
                    "color" to "#10b981"
                )
            )
            return
        }
        goals = goals + SavingsGoalItem(
            id = UUID.randomUUID().toString(),
            title = title.trim(),
            targetAmount = targetAmount,
            currentAmount = currentAmount
        )
    }

    fun topUpGoal(goal: SavingsGoalItem, addAmount: Long) {
        val next = goal.currentAmount + addAmount
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("goals").document(goal.id)
                .update("currentAmount", next)
            return
        }
        goals = goals.map { if (it.id == goal.id) it.copy(currentAmount = next) else it }
    }

    fun toggleBillPaid(bill: RecurringBillItem) {
        val uid = currentUid
        val firestore = db
        if (!isGuestMode && uid != null && firestore != null) {
            firestore.collection("users").document(uid).collection("bills").document(bill.id)
                .update("isPaid", !bill.isPaid)
            return
        }
        bills = bills.map { if (it.id == bill.id) it.copy(isPaid = !it.isPaid) else it }
    }

    override fun onCleared() {
        super.onCleared()
        clearListeners()
    }
}
