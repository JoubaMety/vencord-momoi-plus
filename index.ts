import { definePluginSettings } from "@api/Settings";
import { sleep } from "@utils/misc";
import definePlugin, { OptionType, PluginAuthor } from "@utils/types";
import { RelationshipStore, SelectedChannelStore, UserStore } from "@webpack/common";
// Import the local audio data
import { MOMOI_BASE64, EXTRA_KEYWORD_BASE64 } from "./audioData";

// Local implementation of makeRange
function makeRange(start: number, end: number, step: number): number[] {
    const arr: number[] = [];
    for (let i = start; i <= end; i = Math.round((i + step) * 1e12) / 1e12) {
        arr.push(i);
    }
    return arr;
}

// Local type definitions
type Message = { id: string; content: string; author?: { id: string; bot?: boolean; }; state?: string; };
type ReactionEmoji = { id?: string; name: string; animated?: boolean; };
interface IMessageCreate { type: "MESSAGE_CREATE"; optimistic: boolean; channelId: string; message: Message; }
interface IReactionAdd { type: "MESSAGE_REACTION_ADD"; optimistic: boolean; channelId: string; userId: string; messageAuthorId: string; emoji: ReactionEmoji; }
interface IVoiceChannelEffectSendEvent { type: string; emoji?: ReactionEmoji; }

const KEYWORD_REGEX: Record<string, RegExp> = {
    momoi: /(?::\w*momoi\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*momoi\w*/gi,
    reisa: /(?::\w*reisa\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*reisa\w*/gi,
    nozomi: /(?::\w*nozomi\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*nozomi\w*/gi,
    hikari: /(?::\w*hikari\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*hikari\w*/gi,
    aoba: /(?::\w*aoba\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*aoba\w*/gi,
    miyu: /(?::\w*miyu\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*miyu\w*/gi,
    koyuki: /(?::\w*koyuki\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*koyuki\w*/gi,
    aris: /(?::\w*aris\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*aris\w*/gi
};

const settings = definePluginSettings({
    volume: { description: "Playback volume", type: OptionType.SLIDER, markers: makeRange(0, 1, 0.1), default: 0.5, stickToMarkers: false },
    voice: { description: "Select Your Momoi", type: OptionType.SELECT, options: [{ label: "Kuyashi", value: "kuyashi", default: true }, { label: "Tasukete", value: "tasukete" }, { label: "Yurusenai", value: "yurusenai" }] },
    triggerWhenUnfocused: { description: "Trigger even when unfocused", type: OptionType.BOOLEAN, default: true },
    ignoreBots: { description: "Ignore bot users", type: OptionType.BOOLEAN, default: true },
    ignoreBlocked: { description: "Ignore blocked users", type: OptionType.BOOLEAN, default: true },
    enableReisa: { description: "Enable Reisa trigger", type: OptionType.BOOLEAN, default: true },
    enableNozomi: { description: "Enable Nozomi trigger", type: OptionType.BOOLEAN, default: true },
    enableHikari: { description: "Enable Hikari trigger", type: OptionType.BOOLEAN, default: true },
    enableAoba: { description: "Enable Aoba trigger", type: OptionType.BOOLEAN, default: true },
    enableMiyu: { description: "Enable Miyu trigger", type: OptionType.BOOLEAN, default: true },
    enableKoyuki: { description: "Enable Koyuki trigger", type: OptionType.BOOLEAN, default: true },
    enableAris: { description: "Enable Aris trigger", type: OptionType.BOOLEAN, default: true }
});

const customAuthors: PluginAuthor[] = [{ name: "Ni", id: 1145148101919n }];

export default definePlugin({
    name: "MomoiPlus",
    authors: customAuthors,
    description: "Life, is Kuyashi.",
    settings,
    flux: {
        async MESSAGE_CREATE({ optimistic, message, channelId }: IMessageCreate) {
            if (optimistic || message.state === "SENDING") return;
            if (settings.store.ignoreBots && message.author?.bot) return;
            if (settings.store.ignoreBlocked && RelationshipStore.isBlocked(message.author?.id)) return;
            if (!message.content || channelId !== SelectedChannelStore.getChannelId()) return;
            for (const key of Object.keys(KEYWORD_REGEX)) {
                if (key !== "momoi" && !settings.store[`enable${key.charAt(0).toUpperCase() + key.slice(1)}`]) continue;
                
                const regex = KEYWORD_REGEX[key];
                const matches = message.content.match(regex);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        playKeyword(key);
                        await sleep(300);
                    }
                }
            }
        },
        MESSAGE_REACTION_ADD({ optimistic, channelId, userId, messageAuthorId, emoji }: IReactionAdd) {
            if (optimistic) return;
            if (settings.store.ignoreBots && UserStore.getUser(userId)?.bot) return;
            if (settings.store.ignoreBlocked && RelationshipStore.isBlocked(messageAuthorId)) return;
            if (channelId !== SelectedChannelStore.getChannelId()) return;
            const name = emoji.name.toLowerCase();
            for (const key of Object.keys(KEYWORD_REGEX)) {
                if (key !== "momoi" && !settings.store[`enable${key.charAt(0).toUpperCase() + key.slice(1)}`]) continue;
                if (name.includes(key)) playKeyword(key);
            }
        },
        VOICE_CHANNEL_EFFECT_SEND({ emoji }: IVoiceChannelEffectSendEvent) {
            if (!emoji?.name) return;
            const name = emoji.name.toLowerCase();
            for (const key of Object.keys(KEYWORD_REGEX)) {
                if (key !== "momoi" && !settings.store[`enable${key.charAt(0).toUpperCase() + key.slice(1)}`]) continue;
                if (name.includes(key)) playKeyword(key);
            }
        }
    }
});

async function playKeyword(key: string) {
    if (!settings.store.triggerWhenUnfocused && !document.hasFocus()) return;

    let base64DataStrings: string[] = [];
    if (key === "momoi") {
        const voices = Array.isArray(settings.store.voice) ? settings.store.voice : [settings.store.voice];
        base64DataStrings = voices.map(v => MOMOI_BASE64[v]).filter(Boolean);
    } else {
        const extra = EXTRA_KEYWORD_BASE64[key];
        if (Array.isArray(extra)) {
            const idx = Math.floor(Math.random() * extra.length);
            if (extra[idx]) base64DataStrings = [extra[idx]];
        } else if (extra) {
            base64DataStrings = [extra as string];
        }
    }
    
    for (const base64String of base64DataStrings) {
        try {
            const dataUrl = `data:audio/ogg;base64,${base64String}`;
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const audio = document.createElement("audio");
            audio.src = blobUrl;
            audio.volume = settings.store.volume;

            // Revoke the object URL once the audio has finished to free up memory
            audio.onended = () => URL.revokeObjectURL(blobUrl);
            audio.onerror = () => URL.revokeObjectURL(blobUrl);

            audio.play();
        } catch (error) {
            console.error(`[MomoiPlus] Error playing Base64 audio for key ${key}:`, error);
        }
    }
}
