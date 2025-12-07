/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { Flex } from "@components/Flex";
import { Clickable, Text } from "@webpack/common";

import { ICON_BASE64 } from "../data/iconData";
import { toggleableKeywords } from "../data/keywordData";
import { labels } from "../data/labelData";
import { settings } from "../index";

const cl = classNameFactory("vc-momoiPlus-");

function renderSwitch(keyword: string, isDisabled: boolean, handleToggle: () => void) {
    const characterClass = isDisabled ? `${cl("Character")} disabled` : cl("Character");

    return (
        <Clickable
            onClick={handleToggle}
        >
            <Flex className={characterClass}>
                <img
                    src={ICON_BASE64[keyword]}
                />
                <Text variant="heading-lg/semibold">
                    {labels[keyword]}
                </Text>
            </Flex>
        </Clickable>
    );
}

export function ExtrasComponent() {
    function handleToggle(keyword: string): void {
        if (!settings.store.triggerToggles[keyword]) {
            settings.store.triggerToggles[keyword] = true;
        }
        else {
            settings.store.triggerToggles[keyword] = false;
        }
    }

    return (
        <div className={cl("extrasComponent")}>
            <Text variant="heading-xl/semibold">Extras</Text>
            <Text variant="text-sm/normal">Toggle Extra triggers</Text>
            <Flex className={cl("CharacterList")}>
                {toggleableKeywords.map(keyword => (
                    <div key={keyword}>
                        {renderSwitch(keyword, settings.store.triggerToggles[keyword], () => handleToggle(keyword))}
                    </div>
                ))}
            </Flex>
        </div>
    );
}