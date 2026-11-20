package com.financialapp.manager.model

private val SAVING_BUCKET_REGEX = Regex(
    "(saving|tabungan|invest|darurat|emergency|rdn|deposito|emas|wealth|reksadana)",
    RegexOption.IGNORE_CASE
)

fun inferBucketKind(name: String, explicitKind: String? = null): String {
    if (explicitKind == "saving" || explicitKind == "spending") return explicitKind
    return if (SAVING_BUCKET_REGEX.containsMatchIn(name)) "saving" else "spending"
}

data class UserProfile(
    val displayName: String = "Pengguna",
    val email: String = "",
    val baseSalary: Long = 0L,
    val paydayDate: Int = 25,
    val currency: String = "IDR",
    val onboardingCompleted: Boolean = false
)

data class BudgetBucket(
    val id: String = "",
    val name: String = "",
    val percentage: Int = 0,
    val color: String = "#10b981",
    val icon: String = "Tag",
    val kind: String = "spending", // "spending" | "saving"
    val sortOrder: Int = 0
)

data class WalletItem(
    val id: String = "",
    val name: String = "",
    val type: String = "bank", // bank | ewallet | cash | investment
    val balance: Long = 0L,
    val color: String = "#3b82f6"
)

data class TransactionItem(
    val id: String = "",
    val type: String = "expense", // expense | saving | income
    val amount: Long = 0L,
    val bucketId: String? = null,
    val bucketName: String = "Umum",
    val walletId: String? = null,
    val walletName: String = "Dompet",
    val toWalletId: String? = null,
    val toWalletName: String = "",
    val merchant: String = "",
    val notes: String = "",
    val transactionDate: String = "",
    val createdAt: String = ""
)

data class QuickActionItem(
    val id: String = "",
    val title: String = "",
    val amount: Long = 0L,
    val bucketId: String? = null,
    val bucketName: String = "Umum",
    val walletId: String? = null,
    val color: String = "#10b981",
    val icon: String = "Zap"
)

data class SavingsGoalItem(
    val id: String = "",
    val title: String = "",
    val targetAmount: Long = 0L,
    val currentAmount: Long = 0L,
    val targetDate: String = "",
    val color: String = "#10b981"
)

data class RecurringBillItem(
    val id: String = "",
    val title: String = "",
    val amount: Long = 0L,
    val dueDay: Int = 10,
    val bucketId: String? = null,
    val walletId: String? = null,
    val isPaid: Boolean = false
)

data class BudgetTemplate(
    val id: String,
    val name: String,
    val subtitle: String,
    val buckets: List<BudgetBucket>
)

/**
 * Pure UI onboarding templates — never hardcoded into the database.
 * Users pick a starting template (or blank) and can edit/delete everything anytime.
 */
object OnboardingTemplates {
    val budgetTemplates = listOf(
        BudgetTemplate(
            id = "balanced",
            name = "Seimbang (40-20-20-10-10)",
            subtitle = "Cocok untuk gaji tetap dengan cicilan & dana darurat",
            buckets = listOf(
                BudgetBucket(name = "Kebutuhan Pokok", percentage = 40, color = "#10b981", kind = "spending", sortOrder = 0),
                BudgetBucket(name = "Tabungan & Investasi", percentage = 20, color = "#3b82f6", kind = "saving", sortOrder = 1),
                BudgetBucket(name = "Cicilan & Utang", percentage = 20, color = "#f43f5e", kind = "spending", sortOrder = 2),
                BudgetBucket(name = "Self Reward & Hiburan", percentage = 10, color = "#f59e0b", kind = "spending", sortOrder = 3),
                BudgetBucket(name = "Dana Darurat", percentage = 10, color = "#8b5cf6", kind = "saving", sortOrder = 4)
            )
        ),
        BudgetTemplate(
            id = "classic",
            name = "Klasik (50-30-20)",
            subtitle = "Simpel: 50% kebutuhan, 30% gaya hidup, 20% tabungan",
            buckets = listOf(
                BudgetBucket(name = "Kebutuhan Utama", percentage = 50, color = "#10b981", kind = "spending", sortOrder = 0),
                BudgetBucket(name = "Keinginan & Gaya Hidup", percentage = 30, color = "#f43f5e", kind = "spending", sortOrder = 1),
                BudgetBucket(name = "Tabungan & Investasi", percentage = 20, color = "#3b82f6", kind = "saving", sortOrder = 2)
            )
        ),
        BudgetTemplate(
            id = "debt_free",
            name = "Bebas Cicilan (60-25-15)",
            subtitle = "Fokus kebutuhan harian & percepat tabungan",
            buckets = listOf(
                BudgetBucket(name = "Kebutuhan Pokok", percentage = 60, color = "#10b981", kind = "spending", sortOrder = 0),
                BudgetBucket(name = "Tabungan & Investasi", percentage = 25, color = "#3b82f6", kind = "saving", sortOrder = 1),
                BudgetBucket(name = "Self Reward", percentage = 15, color = "#f59e0b", kind = "spending", sortOrder = 2)
            )
        ),
        BudgetTemplate(
            id = "blank",
            name = "Mulai Kosong (Custom)",
            subtitle = "Buat pos anggaran sendiri sesuai gaya hidupmu",
            buckets = listOf(
                BudgetBucket(name = "Pengeluaran Umum", percentage = 100, color = "#10b981", kind = "spending", sortOrder = 0)
            )
        )
    )

    val starterWallets = listOf(
        WalletItem(name = "Bank BCA", type = "bank", color = "#005caa"),
        WalletItem(name = "Bank Mandiri", type = "bank", color = "#003d79"),
        WalletItem(name = "Bank BRI", type = "bank", color = "#00529c"),
        WalletItem(name = "GoPay", type = "ewallet", color = "#00aa13"),
        WalletItem(name = "OVO", type = "ewallet", color = "#4c2a86"),
        WalletItem(name = "DANA", type = "ewallet", color = "#118eea"),
        WalletItem(name = "Dompet Tunai", type = "cash", color = "#10b981")
    )

    val starterQuickActions = listOf(
        QuickActionItem(title = "Kopi", amount = 18000L, color = "#f43f5e", icon = "Coffee"),
        QuickActionItem(title = "Makan", amount = 35000L, color = "#10b981", icon = "Utensils"),
        QuickActionItem(title = "Transport", amount = 25000L, color = "#3b82f6", icon = "Bus")
    )
}
