import * as $ from 'jquery';

import { Emote } from './emote';
import { Util } from './services/util';
import { LocalStorage, ILocalStorage } from './services/localstorage';

export class BTDInterface {
    isEmoteMenuOpen: boolean = false;
    currentTab: number = 0;
    localStorage: ILocalStorage;

    constructor(_localStorage: ILocalStorage) {
        this.localStorage = _localStorage;
    }

    hook() {
            // Give dark usernames a bit of a shadow for contrast
            Util.addCSSRule(".chat-line__message--username", {
                "text-shadow": "0px 0px 2px rgb(0, 0, 0)"
            });

            this.isEmoteMenuOpen = false;
            
            this.emoteMenu();
            this.settingsButton();

            console.log("[BTD] Modified interface");

    }

    settingsButton() {
        let $cogIconContainer = $(".chat-settings > div");
        
        if($cogIconContainer.children().length < 4) {
            // we haven't hooked into the settings "cog" menu yet
            // also this needs to be refactored into React JSX
            let $newDiv = $("<div/>")
            .attr("id", "btd-settings")
            .append($("<div />", {"class": "mg-t-1"})
                .append($("<button/>", {"class": "tw-button"})
                    .append($("<span/>", {"class": "tw-button__text"})
                        .text("BTD Settings")
            )))
            .appendTo($cogIconContainer);
        }
    }

    emoteMenu() {
        Util.addCSS(`
        .emote-picker .pd-b-2 {
            padding-bottom: 0rem !important;
        }

        .emote-picker__emote {
            width: inherit !important;
        }

        .emote-picker hr {
            border: #5d5d5d solid 1px;
            margin: 14px;
        }

        .btd-settings-header {
            font-weight: bold;
        }

        .btd-settings-item {
            width: 100%;
            height: 30px;
            line-height: 30px;
            border-top: 1px ridge #0e0c13;
            padding: 0 1.5rem !important;
        }

        div#btd-settings div.btd-settings-item:nth-of-type(2n) {
            background-color: rgba(255, 255, 255, 0.06);
        }

        .chat-line__message[data-btd-removed='true'] {
            color: rgba(255, 255, 255, 0.27);
        }
        `);

        if($("button[data-a-target='btd-emote-picker-button']").length == 0) {
            $(".chat-input .tw-form__icon-group").append(
                $("<button/>", {
                        "class":"tw-button-icon tw-button-icon--secondary",
                        "data-a-target": "btd-emote-picker-button"
                    })
                    .click(() => { this.toggleEmoteMenu(); })
                    .append(`
                    <span class="tw-button-icon__icon">
                        <figure class="svg-figure">
                            <svg class="svg svg--emoticons svg--inherit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16px" width="16px" x="0px" y="0px">
                                <g id="Layer_2" data-name="Layer 2">
                                    <path d="M2.35,8.15H1.68v3.08a3.41,3.41,0,0,0,.68,0A1.45,1.45,0,0,0,4,9.7,1.46,1.46,0,0,0,2.35,8.15Z"></path>
                                    <path d="M12.25,4.71a3.62,3.62,0,0,0-1,.11v6.36a4,4,0,0,0,.82.06c1.74,0,2.68-1.25,2.68-3.42C14.81,5.92,14,4.71,12.25,4.71Z"></path>
                                    <path d="M2.42,7.36A1.28,1.28,0,0,0,3.78,6,1.2,1.2,0,0,0,2.4,4.69a2.76,2.76,0,0,0-.72.07v2.6Z"></path>
                                    <path d="M13,0H3A3,3,0,0,0,0,3V13a3,3,0,0,0,3,3H13a3,3,0,0,0,3-3V3A3,3,0,0,0,13,0ZM4.31,11.33a2.7,2.7,0,0,1-2.18.75A7.55,7.55,0,0,1,.87,12V4.06a6.19,6.19,0,0,1,1.48-.17,2.21,2.21,0,0,1,1.73.59A1.9,1.9,0,0,1,4.6,5.9,1.91,1.91,0,0,1,3.54,7.67v0a2,2,0,0,1,1.3,2A2.5,2.5,0,0,1,4.31,11.33ZM7.87,12H7V4.83H5.13V3.95H9.79v.89H7.86Zm6.88-1.09A3.38,3.38,0,0,1,12,12.08,10.18,10.18,0,0,1,10.49,12V4.06a9.09,9.09,0,0,1,1.73-.17,3.12,3.12,0,0,1,2.55,1,4.3,4.3,0,0,1,.89,2.9A5,5,0,0,1,14.75,10.92Z"></path>
                                </g>
                            </svg>
                        </figure>
                    </span>`)
            );

            $(".chat-buttons-container").append($("<div/>", {
                    "id": "btd-emotes-container",
                    "class":"emote-picker border",
                    "data-a-target":"btd-emote-picker"
                })
                .css("display", "none")
                .append($("<div/>", {"id": "btd-tab-container", "class": "emote-picker__tab-content pd-1"}))
                .append($("<div/>", {"class": "emote-picker__controls-container relative"})
                    .append($("<div/>", {"id": "btd-emote-tabs", "class": "emote-picker__tabs-container border-t"}))
                )
            );


            this.addPickerTabs();
        }
    }

    private addPickerTabs() {
        this.addTabs();

        let $tabs = $("#btd-emote-tabs");
        
        $tabs
            .empty()
            .append(this.$newEmoteTab("Emotes"))
            .append(this.$newEmoteTab("Settings"));
        
        $tabs.children().each(() => {
            $(this).removeClass("emote-picker__tab--active");
        });

        // first tab is active
        $tabs.attr("data-active-tab", 0);
        $tabs.find("div").eq(0).addClass("emote-picker__tab--active"); 

    }

    private $newEmoteTab(tabTitle: string): JQuery<HTMLElement> {
        let newTabIndex: number = $("#btd-emote-tabs").children().length;
        
        return $("<div/>", {"class": "emote-picker__tab pd-x-1"})
                .attr("data-tab-id", newTabIndex)
                .click(() => this.switchTabs(newTabIndex))
                .append("<span/>")
                    .text(tabTitle);
    }

    switchTabs(tabIndex: number) {
        $("div.emote-picker__tab[data-tab-id="+this.currentTab+"]").removeClass("emote-picker__tab--active");
        $("div.emote-picker__all-tab-content[data-tab-id="+this.currentTab+"]").css("display", "none");

        this.currentTab = tabIndex;

        $("div.emote-picker__tab[data-tab-id="+this.currentTab+"]").addClass("emote-picker__tab--active");
        $("div.emote-picker__all-tab-content[data-tab-id="+this.currentTab+"]").css("display", "inherit");
        
    }

    private $newSettingsItem(title: string, localStorageName: string) {
        let isSet: boolean = (this.localStorage.get(localStorageName) == 'true'); 

        let $elem: JQuery<HTMLElement> = $("<div/>", {"class": "btd-settings-item"})
            .append($("<div/>")
                    .css("float", "left")
                    .text(title)
            )
            .append($("<div/>")
                    .css("float", "right")
                .append($("<button/>", {"class": "tw-button"})
                    .css("float", "right")
                    .addClass(isSet ? "tw-button--success" : "tw-button--alert")
                    .text(isSet ? "YES" : "NO")
                    .click((e) => {
                        let sVal: boolean = (this.localStorage.get(localStorageName) == 'true'); 
                        this.localStorage.set(localStorageName, !sVal);
                        
                        $(e.currentTarget).toggleClass("tw-button--success tw-button--alert");
                        $(e.currentTarget).text(sVal ? "NO" : "YES");
                    })
                )
            )

        return $elem;
    }

    private addTabs() {
        let $tabs = $("#btd-tab-container");

        // tab 0 => emote picker
        $tabs.append($("<div/>", {"class": "emote-picker__content-block emote-picker__all-tab-content relative pd-t-1 pd-b-2"})
            .attr("data-tab-id", 0)
            .append($("<div/>", {"id": "btd-bttv-emotes","class": "tw-tower justify-content-center tw-tower--gutter-none"}))
            .append($("<hr/>"))
            .append($("<div/>", {"id": "btd-ffz-emotes","class": "tw-tower justify-content-center tw-tower--gutter-none"})));

        // tab 1 => settings menu
        $tabs.append($("<div/>", {"class": "emote-picker__content-block emote-picker__all-tab-content relative pd-t-1 pd-b-2"})
            .attr("data-tab-id", 1)
            .append($("<div/>", {"id": "btd-settings","class": "tw-tower justify-content-center tw-tower--gutter-none"})
                .append($("<div/>", {"class": "btd-settings-header"})
                    .text("Better Twitch Desktop v1.0.0"))
                .append(this.$newSettingsItem("Show Deleted Messages", "btd:show-deleted"))
                .append(this.$newSettingsItem("Display BTTV global/channel emotes", "btd:show-bttv"))
                .append(this.$newSettingsItem("Display FFZ global/channel emotes", "btd:show-ffz"))
            )
        );
    }

    toggleEmoteMenu() {
        this.isEmoteMenuOpen = !this.isEmoteMenuOpen;  

        $("#btd-emotes-container").css("display", this.isEmoteMenuOpen ? "block" : "none");        
    }

    private addEmotes(emoteArray: Emote[], isBTTV: boolean) {
        emoteArray.forEach((emote) => {
            let $newEmote = 
                $("<div/>", {"class": "emote-picker__emote"})
                .append($("<div/>", {"class": "tw-tooltip-wrapper inline-flex"})
                    .append($("<button/>", {
                        "class": "flex align-items-center justify-content-center emote-picker__emote-link",
                        "name": emote.matchString,
                        "data-a-target": emote.matchString})
                        .append($("<figure/>", {"class": "emote-picker__emote-figure"})
                            .append($("<img/>", {
                                "src": emote.url, 
                                "alt": emote.matchString
                            }))))
                    .append($("<div/>", {"class": "tw-tooltip tw-tooltip--down tw-tooltip--align-center"})
                        .text(emote.matchString)))
            .appendTo($(isBTTV ? "#btd-bttv-emotes" : "#btd-ffz-emotes"));
        })
    }

    addBTTVEmotes(emoteArray: Emote[]) {
        this.addEmotes(emoteArray, true);
    }

    addFFZEmotes(emoteArray: Emote[]) {
        this.addEmotes(emoteArray, false);
    }
    
    clearEmotes() {
        $("#btd-bttv-emotes").empty();
        $("#btd-ffz-emotes").empty();
    }
} 

export * from './btdinterface';