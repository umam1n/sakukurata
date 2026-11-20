package com.financialapp.manager.model

data class IndonesianInstitution(
    val id: String,
    val name: String,
    val short: String,
    val type: String, // "bank" | "ewallet" | "cash"
    val color: String,
    val accent: String,
    val textColor: String = "#FFFFFF",
    val motif: String = "circle", // wave, ribbon, chevron, diamond, hexagon, grid, circle
    val keywords: List<String> = emptyList()
)

object IndonesianBanks {
    val institutions: List<IndonesianInstitution> = listOf(
        // Major National & Private Banks
        IndonesianInstitution("bca", "Bank BCA", "BCA", "bank", "#005CAA", "#0084D4", "#FFFFFF", "wave", listOf("bca", "mybca", "klikbca", "sakuku")),
        IndonesianInstitution("mandiri", "Bank Mandiri", "MDR", "bank", "#003D79", "#FFB700", "#FFFFFF", "ribbon", listOf("mandiri", "livin")),
        IndonesianInstitution("bri", "Bank BRI", "BRI", "bank", "#00529C", "#F37021", "#FFFFFF", "grid", listOf("bri", "brimo")),
        IndonesianInstitution("bni", "Bank BNI", "BNI", "bank", "#F15A23", "#006677", "#FFFFFF", "chevron", listOf("bni", "wondr")),
        IndonesianInstitution("btn", "Bank BTN", "BTN", "bank", "#004A98", "#FDB913", "#FFFFFF", "hexagon", listOf("btn", "bale")),
        IndonesianInstitution("cimb", "CIMB Niaga", "CIMB", "bank", "#790008", "#DC143C", "#FFFFFF", "chevron", listOf("cimb", "octo")),
        IndonesianInstitution("danamon", "Bank Danamon", "BDMN", "bank", "#F58220", "#FFB81C", "#111827", "diamond", listOf("danamon", "d-bank")),
        IndonesianInstitution("permata", "PermataBank", "BNLI", "bank", "#008A45", "#78BE20", "#FFFFFF", "diamond", listOf("permata")),
        IndonesianInstitution("bsi", "Bank Syariah Indonesia (BSI)", "BSI", "bank", "#00A39D", "#F7941D", "#FFFFFF", "wave", listOf("bsi", "syariah indonesia", "byond")),
        IndonesianInstitution("panin", "Panin Bank", "PNBN", "bank", "#004B87", "#ED1C24", "#FFFFFF", "ribbon", listOf("panin")),
        IndonesianInstitution("ocbc", "Bank OCBC", "OCBC", "bank", "#ED1C24", "#990000", "#FFFFFF", "hexagon", listOf("ocbc", "nisp", "nyala")),
        IndonesianInstitution("maybank", "Maybank Indonesia", "MBB", "bank", "#FFC600", "#111827", "#111827", "diamond", listOf("maybank", "m2u")),
        IndonesianInstitution("mega", "Bank Mega", "MEGA", "bank", "#F47920", "#003B71", "#FFFFFF", "ribbon", listOf("mega", "m-smile")),
        IndonesianInstitution("sinarmas", "Bank Sinarmas", "BSIM", "bank", "#D71920", "#8B0000", "#FFFFFF", "circle", listOf("sinarmas")),
        IndonesianInstitution("uob", "Bank UOB Indonesia", "UOB", "bank", "#0033A0", "#E31837", "#FFFFFF", "grid", listOf("uob", "tmrw")),
        IndonesianInstitution("hsbc", "HSBC Indonesia", "HSBC", "bank", "#DB0011", "#8B000D", "#FFFFFF", "hexagon", listOf("hsbc")),
        IndonesianInstitution("dbs", "Bank DBS Indonesia", "DBS", "bank", "#E31837", "#111827", "#FFFFFF", "diamond", listOf("dbs", "digibank")),
        IndonesianInstitution("bjb", "Bank BJB", "BJB", "bank", "#0072BC", "#00AEEF", "#FFFFFF", "wave", listOf("bjb", "digi bjb")),
        IndonesianInstitution("dki", "Bank DKI", "DKI", "bank", "#DA291C", "#F26522", "#FFFFFF", "ribbon", listOf("dki", "jakone")),
        IndonesianInstitution("jateng", "Bank Jateng", "JTG", "bank", "#005596", "#F7941D", "#FFFFFF", "grid", listOf("jateng", "bima")),
        IndonesianInstitution("jatim", "Bank Jatim", "JTM", "bank", "#ED1C24", "#0054A6", "#FFFFFF", "chevron", listOf("jatim", "jconnect")),

        // Digital Banks
        IndonesianInstitution("jago", "Bank Jago", "JAGO", "bank", "#F59E0B", "#7C3AED", "#FFFFFF", "circle", listOf("jago", "kantong jago")),
        IndonesianInstitution("seabank", "SeaBank Indonesia", "SEA", "bank", "#FF6600", "#FF8533", "#FFFFFF", "wave", listOf("seabank", "sea bank")),
        IndonesianInstitution("blu", "blu by BCA Digital", "BLU", "bank", "#00AEEF", "#0066CC", "#FFFFFF", "circle", listOf("blu", "bca digital")),
        IndonesianInstitution("jenius", "Jenius (BTPN)", "JNS", "bank", "#00A4E4", "#0077B6", "#FFFFFF", "wave", listOf("jenius", "btpn", "smbc")),
        IndonesianInstitution("neobank", "Bank Neo Commerce", "BNC", "bank", "#FFD100", "#FF8C00", "#111827", "circle", listOf("neo", "neobank")),
        IndonesianInstitution("allo", "Allo Bank", "ALLO", "bank", "#5F259F", "#9D4EDD", "#FFFFFF", "diamond", listOf("allo")),
        IndonesianInstitution("superbank", "Superbank", "SUPR", "bank", "#00C853", "#00E676", "#111827", "hexagon", listOf("superbank")),
        IndonesianInstitution("krom", "Krom Bank", "KROM", "bank", "#4F46E5", "#06B6D4", "#FFFFFF", "grid", listOf("krom")),
        IndonesianInstitution("linebank", "LINE Bank", "LINE", "bank", "#06C755", "#00B900", "#FFFFFF", "circle", listOf("line bank", "hana")),
        IndonesianInstitution("saqu", "Bank Saqu", "SAQU", "bank", "#FF4E50", "#FC913A", "#FFFFFF", "ribbon", listOf("saqu")),
        IndonesianInstitution("muamalat", "Bank Muamalat", "BMI", "bank", "#5C2D91", "#00A99D", "#FFFFFF", "diamond", listOf("muamalat")),
        IndonesianInstitution("bcasyariah", "BCA Syariah", "BCAS", "bank", "#005CAA", "#00A859", "#FFFFFF", "wave", listOf("bca syariah")),
        IndonesianInstitution("aladin", "Bank Aladin Syariah", "ALDN", "bank", "#00B14F", "#00875A", "#FFFFFF", "circle", listOf("aladin")),

        // E-Wallets
        IndonesianInstitution("gopay", "GoPay", "GPY", "ewallet", "#00AA13", "#00AED6", "#FFFFFF", "circle", listOf("gopay", "go-pay", "gojek")),
        IndonesianInstitution("ovo", "OVO", "OVO", "ewallet", "#4C3494", "#7C3AED", "#FFFFFF", "circle", listOf("ovo")),
        IndonesianInstitution("dana", "DANA", "DANA", "ewallet", "#118EEA", "#0066CC", "#FFFFFF", "wave", listOf("dana")),
        IndonesianInstitution("shopeepay", "ShopeePay", "SPAY", "ewallet", "#EE4D2D", "#FF7337", "#FFFFFF", "ribbon", listOf("shopeepay", "shopee")),
        IndonesianInstitution("linkaja", "LinkAja", "LINK", "ewallet", "#E82529", "#B91C1C", "#FFFFFF", "chevron", listOf("linkaja")),
        IndonesianInstitution("astrapay", "AstraPay", "APAY", "ewallet", "#005596", "#00AEEF", "#FFFFFF", "hexagon", listOf("astrapay")),
        IndonesianInstitution("flip", "Flip", "FLIP", "ewallet", "#FD6542", "#FF8F6B", "#FFFFFF", "diamond", listOf("flip")),

        // Cash & Investments
        IndonesianInstitution("bibit", "Bibit", "BIBIT", "bank", "#00AB6B", "#10B981", "#FFFFFF", "wave", listOf("bibit")),
        IndonesianInstitution("stockbit", "Stockbit / RDN", "STKB", "bank", "#00AA5B", "#047857", "#FFFFFF", "grid", listOf("stockbit", "rdn")),
        IndonesianInstitution("cash", "Cash / Physical Wallet", "CASH", "cash", "#10B981", "#059669", "#FFFFFF", "grid", listOf("cash", "tunai", "dompet", "physical"))
    )

    fun findInstitution(name: String): IndonesianInstitution? {
        val lower = name.trim().lowercase()
        if (lower.isEmpty()) return null
        return institutions.firstOrNull { inst ->
            inst.id == lower ||
                inst.name.lowercase() == lower ||
                inst.keywords.any { kw -> lower.contains(kw) } ||
                lower.contains(inst.short.lowercase())
        }
    }
}
