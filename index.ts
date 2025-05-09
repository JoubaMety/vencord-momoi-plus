import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components/SettingSliderComponent";
import { sleep } from "@utils/misc";
import definePlugin, { OptionType, PluginAuthor } from "@utils/types";
import { RelationshipStore, SelectedChannelStore, UserStore } from "@webpack/common";
import { Message, ReactionEmoji } from "discord-types/general";

interface IMessageCreate {
    type: "MESSAGE_CREATE";
    optimistic: boolean;
    isPushNotification: boolean;
    channelId: string;
    message: Message;
}
interface IReactionAdd {
    type: "MESSAGE_REACTION_ADD";
    optimistic: boolean;
    channelId: string;
    messageId: string;
    messageAuthorId: string;
    userId: string;
    emoji: ReactionEmoji;
}
interface IVoiceChannelEffectSendEvent {
    type: string;
    emoji?: ReactionEmoji;
    channelId: string;
    userId: string;
    animationType: number;
    animationId: number;
}

// URLs for original "momoi" variants
const MOMOI_URLS: Record<string, string> = {
    kuyashi: "https://media.arona.ai/audio/voc_jp/jp_momoi/momoi_exskill_level_2.ogg",
    tasukete: "https://media.arona.ai/audio/voc_jp/jp_momoi/momoi_battle_damage_2.ogg",
    yurusenai: "https://media.arona.ai/audio/voc_jp/jp_momoi/momoi_battle_damage_3.ogg"
};
// Additional keywords with their audio clips; koyuki has multiple
const EXTRA_KEYWORD_AUDIO: Record<string, string | string[]> = {
    reisa: "https://media.arona.ai/audio/voc_jp/jp_ch0167/ch0167_battle_tacticalaction_1.ogg",
    nozomi: "https://media.arona.ai/audio/voc_jp/jp_ch0243/ch0243_eventlogin_1_1.ogg",
    hikari: "https://media.arona.ai/audio/voc_jp/jp_ch0242/ch0242_battle_move_2.ogg",
    koyuki: [
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_damage_1.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_damage_2.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_damage_2.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_move_1.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_shout_1.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_shout_2.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_shout_3.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_battle_tacticalaction_1.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_commonskill.ogg",
        "https://media.arona.ai/audio/voc_jp/jp_ch0198/ch0198_formation_select.ogg"
    ],
    aris: "https://media.arona.ai/audio/voc_jp/jp_ch0200/ch0200_eventshop_buy_1.ogg"
};
// Fixed playback durations (in seconds) per keyword
const CLIP_DURATIONS: Record<string, number> = {
    kuyashi: 0,
    tasukete: 0,
    yurusenai: 0,
    reisa: 0,
    nozomi: 1.5,
    hikari: 0,
    koyuki: 0,
    aris: 2
};
// Fixed start offsets (in seconds) per keyword
const CLIP_OFFSETS: Record<string, number> = {
    kuyashi: 0,
    tasukete: 0,
    yurusenai: 0,
    reisa: 0,
    nozomi: 1.5,
    hikari: 0,
    koyuki: 0,
    aris: 0
};
// Regex patterns
const KEYWORD_REGEX: Record<string, RegExp> = {
    momoi:    /(?::\w*momoi\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*momoi\w*/gi,
    reisa:   /(?::\w*reisa\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*reisa\w*/gi,
    nozomi:  /(?::\w*nozomi\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*nozomi\w*/gi,
    hikari:  /(?::\w*hikari\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*hikari\w*/gi,
    koyuki:  /(?::\w*koyuki\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*koyuki\w*/gi,
    aris:    /(?::\w*aris\w*:)|https?:\/\/cdn\.discordapp\.com\/emojis\/\d+\.(?:png|webp|gif)\?[^ ]*name=\w*aris\w*/gi
};

// Settings
const settings = definePluginSettings({
    volume:           { description: "Playback volume", type: OptionType.SLIDER, markers: makeRange(0,1,0.1), default:0.5, stickToMarkers:false },
    voice:            { description: "Select Your Momoi", type: OptionType.SELECT, options:[{label:"Kuyashi",value:"kuyashi",default:true},{label:"Tasukete",value:"tasukete"},{label:"Yurusenai",value:"yurusenai"}]},
    triggerWhenUnfocused:{ description:"Trigger even when unfocused",type:OptionType.BOOLEAN,default:true },
    ignoreBots:       { description: "Ignore bot users", type: OptionType.BOOLEAN, default: true },
    ignoreBlocked:    { description: "Ignore blocked users", type: OptionType.BOOLEAN, default: true },
    enableReisa:      { description: "Enable Reisa trigger", type: OptionType.BOOLEAN, default: true },
    enableNozomi:     { description: "Enable Nozomi trigger", type: OptionType.BOOLEAN, default: true },
    enableHikari:     { description: "Enable Hikari trigger", type: OptionType.BOOLEAN, default: true },
    enableKoyuki:     { description: "Enable Koyuki trigger", type: OptionType.BOOLEAN, default: true },
    enableAris:       { description: "Enable Aris trigger", type: OptionType.BOOLEAN, default: true }
});

const customAuthors: PluginAuthor[] = [{ name:"Ni", id:1145148101919n }];

export default definePlugin({
    name:"MomoiPlus",
    authors:customAuthors,
    description:"Life, is Kuyashi.",
    settings,
    flux:{
        async MESSAGE_CREATE({optimistic,type,message,channelId}:IMessageCreate){
            if(optimistic||type!="MESSAGE_CREATE"||message.state==="SENDING")return;
            if(settings.store.ignoreBots&&message.author?.bot)return;
            if(settings.store.ignoreBlocked&&RelationshipStore.isBlocked(message.author?.id))return;
            if(!message.content||channelId!==SelectedChannelStore.getChannelId())return;
            for(const key of Object.keys(KEYWORD_REGEX)){
                if(key!="momoi"&&!settings.store[`enable${key.charAt(0).toUpperCase()+key.slice(1)}`])continue;
                const regex=KEYWORD_REGEX[key]; let count=0,m;
                while((m=regex.exec(message.content)))count++; regex.lastIndex=0;
                for(let i=0;i<count;i++){ playKeyword(key); await sleep(300) }
            }
        },
        MESSAGE_REACTION_ADD({optimistic,type,channelId,userId,messageAuthorId,emoji}:IReactionAdd){
            if(optimistic||type!="MESSAGE_REACTION_ADD")return;
            if(settings.store.ignoreBots&&UserStore.getUser(userId)?.bot)return;
            if(settings.store.ignoreBlocked&&RelationshipStore.isBlocked(messageAuthorId))return;
            if(channelId!==SelectedChannelStore.getChannelId())return;
            const name=emoji.name.toLowerCase();
            for(const key of Object.keys(KEYWORD_REGEX)){
                if(key!="momoi"&&!settings.store[`enable${key.charAt(0).toUpperCase()+key.slice(1)}`])continue;
                if(name.includes(key))playKeyword(key);
            }
        },
        VOICE_CHANNEL_EFFECT_SEND({emoji}:IVoiceChannelEffectSendEvent){
            if(!emoji?.name)return; const name=emoji.name.toLowerCase();
            for(const key of Object.keys(KEYWORD_REGEX)){
                if(key!="momoi"&&!settings.store[`enable${key.charAt(0).toUpperCase()+key.slice(1)}`])continue;
                if(name.includes(key))playKeyword(key);
            }
        }
    }
});

function playKeyword(key:string){
    if(!settings.store.triggerWhenUnfocused&&!document.hasFocus())return;
    let urls:string[]=[];
    if(key==="momoi"){
        const voices=Array.isArray(settings.store.voice)?settings.store.voice:[settings.store.voice];
        urls=voices.map(v=>MOMOI_URLS[v]);
    } else {
        const extra=EXTRA_KEYWORD_AUDIO[key];
        if(Array.isArray(extra)){
            const idx=Math.floor(Math.random()*extra.length);
            urls=[extra[idx]];
        } else if(extra){
            urls=[extra];
        }
    }
    const duration=CLIP_DURATIONS[key]||0;
    const offset=CLIP_OFFSETS[key]||0;
    urls.forEach(src=>{
        const audio=document.createElement("audio");
        audio.src=src; audio.volume=settings.store.volume;
        audio.currentTime=offset; audio.play();
        if(duration>0)setTimeout(()=>audio.pause(),duration*1000);
    });
}
