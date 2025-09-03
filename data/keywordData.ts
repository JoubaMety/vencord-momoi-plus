// Helper to build a case-insensitive pattern string, e.g., "aris" -> "[aA][rR][iI][sS]"
function createCaseInsensitivePattern(keyword: string): string {
    return keyword.split('').map(char => {
        const lower = char.toLowerCase();
        const upper = char.toUpperCase();
        return lower === upper ? char : `[${lower}${upper}]`;
    }).join('');
}

// Helper function to generate precise regex patterns that avoid partial word matches.
function createKeywordRegex(keyword: string): RegExp {
    const caseInsensitiveKeyword = createCaseInsensitivePattern(keyword);
    // Boundary checks are now reliable as they operate on the original string casing.
    const boundaryPattern = `(?<![a-zA-Z])${caseInsensitiveKeyword}(?![a-z])`;

    const shortcodePattern = `:[^:]*?${boundaryPattern}[^:]*?:`;
    const urlPattern = `https?:\\/\\/(?:cdn\\.discordapp\\.com\\/emojis|media\\.discordapp\\.net\\/stickers)\\/\\d+\\.(?:png|webp|gif)\\?[^ ]*?name=[^&]*?${boundaryPattern}[^&]*`;
    
    const combinedPattern = `${shortcodePattern}|${urlPattern}`;
    // Use 'g' for global search, but not 'i'. Case-insensitivity is built into the pattern.
    return new RegExp(combinedPattern, "g");
}

// All standard keywords
export const standardKeywords = [ "momoi", "reisa", "nozomi", "hikari", "aoba", "miyu", "koyuki", "aris", "aru", "arona", "atsuko", "mika", "shiroko" ];

// Build the regex map from the list of keywords
export const KEYWORD_REGEX: Record<string, RegExp> = standardKeywords.reduce((acc, keyword) => {
    acc[keyword] = createKeywordRegex(keyword);
    return acc;
}, {} as Record<string, RegExp>);

// Special cases
const moyaiPattern = createCaseInsensitivePattern("moy?ai");
KEYWORD_REGEX.moyai = new RegExp(`🗿|:[^:]*?${moyaiPattern}[^:]*?:|https?:\\/\\/(?:cdn\\.discordapp\\.com\\/emojis|media\\.discordapp\\.net\\/stickers)\\/\\d+\\.(?:png|webp|gif)\\?[^ ]*?name=[^&]*?${moyaiPattern}[^&]*`, "g");

export const KEYWORD_ALIASES: Record<string, string[]> = {
    momoi: ["モモイ"], reisa: ["レイサ"], nozomi: ["ノゾミ"], hikari: ["ヒカリ"], aoba: ["アオバ"], miyu: ["ミユ"], koyuki: ["コユキ"], aris: ["アリス"], aru: ["アル"], arona: ["アロナ"], atsuko: ["アツコ"], mika: ["ミカ"], shiroko: ["シロコ"], moyai: ["モアイ", "moai", "🗿"]
};

export const toggleableKeywords = Object.keys(KEYWORD_REGEX).filter(k => k !== 'momoi');
