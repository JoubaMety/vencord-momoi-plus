// Helper function for repetitive regex patterns
function createKeywordRegex(keyword: string): RegExp {
    const pattern = `(?::\\w*${keyword}\\w*:)|https?:\\/\\/(?:cdn\\.discordapp\\.com\\/emojis|media\\.discordapp\\.net\\/stickers)\\/\\d+\\.(?:png|webp|gif)\\?[^ ]*name=\\w*${keyword}\\w*`;
    return new RegExp(pattern, "gi");
}

// All standard keywords
export const standardKeywords = [ "momoi", "reisa", "nozomi", "hikari", "aoba", "miyu", "koyuki", "aris", "aru", "arona", "atsuko", "mika", "shiroko" ];

// Build the regex map from the list of keywords
export const KEYWORD_REGEX: Record<string, RegExp> = standardKeywords.reduce((acc, keyword) => {
    acc[keyword] = createKeywordRegex(keyword);
    return acc;
}, {} as Record<string, RegExp>);

// Special cases
KEYWORD_REGEX.moyai = /🗿|(?::\w*moy?ai\w*:)|https?:\/\/(?:cdn\.discordapp\.com\/emojis|media\.discordapp\.net\/stickers)\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*moy?ai\w*/gi;

export const KEYWORD_ALIASES: Record<string, string[]> = {
    momoi: ["モモイ"], reisa: ["レイサ"], nozomi: ["ノゾミ"], hikari: ["ヒカリ"], aoba: ["アオバ"], miyu: ["ミユ"], koyuki: ["コユキ"], aris: ["アリス"], aru: ["アル"], arona: ["アロナ"], atsuko: ["アツコ"], mika: ["ミカ"], shiroko: ["シロコ"], moyai: ["モアイ", "moai", "🗿"]
};

export const toggleableKeywords = Object.keys(KEYWORD_REGEX).filter(k => k !== "momoi");
