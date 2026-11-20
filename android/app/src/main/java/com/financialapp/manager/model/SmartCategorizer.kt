package com.financialapp.manager.model

data class SmartCategorizationResult(
    val suggestedTxType: String, // "expense" | "saving"
    val bucket: BudgetBucket?,
    val wallet: WalletItem?
)

object SmartCategorizer {
    private val savingKeywords = listOf(
        "bibit", "stockbit", "bareksa", "ajaib", "pluang", "tanamduit", "rdn",
        "reksa dana", "reksadana", "saham", "obligasi", "deposito", "emas",
        "antam", "pegadaian", "tabungan", "nabung", "invest", "saving", "emergency"
    )

    private val transportKeywords = listOf(
        "mrt", "transjakarta", "tj ", "lrt", "krl", "commuter", "kai", "whoosh",
        "grab", "grabbike", "grabcar", "gojek", "goride", "gocar", "bluebird",
        "taxi", "maxim", "indrive", "pertamina", "shell", "bp ", "vivo",
        "parkir", "tol ", "e-toll", "flazz", "brizzi", "emoney"
    )

    private val foodKeywords = listOf(
        "gofood", "grabfood", "shopeefood", "kantin", "es teh", "famima",
        "familymart", "indomaret", "alfamart", "alfamidi", "lawson", "circle k",
        "kopi", "starbucks", "fore", "kenangan", "janji jiwa", "mixue", "chatime",
        "resto", "cafe", "warung", "warteg", "bakmi", "nasi", "mie", "sate",
        "makan", "lunch", "dinner", "breakfast", "snack", "bakery", "kfc", "mcd"
    )

    private val billsKeywords = listOf(
        "pln", "token", "listrik", "pdam", "telkom", "indihome", "biznet", "firstmedia",
        "telkomsel", "byu", "by.u", "xl ", "indosat", "tri ", "smartfren",
        "netflix", "spotify", "youtube", "google", "icloud", "bpjs", "cicilan", "tagihan"
    )

    fun autoAssignBucketAndWallet(
        merchant: String,
        buckets: List<BudgetBucket>,
        wallets: List<WalletItem>,
        rawText: String = ""
    ): SmartCategorizationResult {
        val text = "$merchant $rawText".lowercase()
        val isSavingIntent = savingKeywords.any { text.contains(it) }
        val suggestedType = if (isSavingIntent) "saving" else "expense"

        val targetBuckets = buckets.filter {
            inferBucketKind(it.name, it.kind) == if (isSavingIntent) "saving" else "spending"
        }.ifEmpty { buckets }

        val matchedBucket = when {
            isSavingIntent -> {
                targetBuckets.firstOrNull {
                    val n = it.name.lowercase()
                    n.contains("invest") || n.contains("sav") || n.contains("tabung") || n.contains("darurat")
                } ?: targetBuckets.firstOrNull()
            }
            transportKeywords.any { text.contains(it) } -> {
                targetBuckets.firstOrNull {
                    val n = it.name.lowercase()
                    n.contains("transport") || n.contains("commut") || n.contains("travel")
                } ?: findFoodBucket(targetBuckets)
            }
            billsKeywords.any { text.contains(it) } -> {
                targetBuckets.firstOrNull {
                    val n = it.name.lowercase()
                    n.contains("bill") || n.contains("util") || n.contains("need") || n.contains("tagihan") || n.contains("pokok")
                } ?: findFoodBucket(targetBuckets)
            }
            else -> findFoodBucket(targetBuckets)
        }

        val matchedWallet = when {
            text.contains("gopay") || text.contains("gojek") || text.contains("gofood") ->
                wallets.firstOrNull { it.name.lowercase().contains("gopay") }
            text.contains("ovo") || text.contains("grab") ->
                wallets.firstOrNull { it.name.lowercase().contains("ovo") }
            text.contains("dana") ->
                wallets.firstOrNull { it.name.lowercase().contains("dana") }
            text.contains("shopee") ->
                wallets.firstOrNull { it.name.lowercase().contains("shopee") }
            else -> null
        } ?: wallets.firstOrNull()

        return SmartCategorizationResult(
            suggestedTxType = suggestedType,
            bucket = matchedBucket,
            wallet = matchedWallet
        )
    }

    private fun findFoodBucket(spendingBuckets: List<BudgetBucket>): BudgetBucket? {
        return spendingBuckets.firstOrNull {
            val n = it.name.lowercase()
            n.contains("food") || n.contains("eat") || n.contains("makan") || n.contains("dining") || n.contains("need") || n.contains("pokok")
        } ?: spendingBuckets.firstOrNull()
    }
}
