export type Theme = {
    [key: string]: string;
};

export const THEMES: Theme = {
    pink: "#FF3366",
    cyan: "#00C2FF",
    purple: "#9D00FF",
    orange: "#FF9500",
    green: "#00E676"
};

export const SIZES = { sm: 90, md: 120, lg: 150, xl: 200, xxl: 240 };

export type LevelType = "drag_drop" | "multiple_choice";

export interface CodeToken {
    t?: string;
    type?: "keyword" | "normal";
    slot?: boolean;
    size?: keyof typeof SIZES;
    ans?: string;
}

export interface Option {
    text: string;
    size: keyof typeof SIZES;
}

export interface Level {
    type: LevelType;
    theme: string;
    prompt: string;
    code: CodeToken[];
    options: (string | Option)[];
    ans?: string;
}

export const levels: Level[] = [
    {
        type: "drag_drop",
        theme: THEMES.pink,
        prompt: "Complete the variable declaration:",
        code: [
            { t: "const", type: "keyword" }, { t: " name = " }, 
            { slot: true, size: "md", ans: "'Alice'" }, { t: ";" }
        ],
        options: ["123", "'Alice'", "true", "null"] 
    },
    {
        type: "multiple_choice",
        theme: THEMES.cyan,
        prompt: "What does this output?",
        code: [
            { t: "console", type: "keyword" }, { t: "." }, { t: "log", type: "keyword" }, 
            { t: "(" }, { t: "'Hello'" }, { t: ")" }, { t: ";" }
        ],
        options: [
            { text: "Error", size: "lg" },
            { text: "Hello", size: "lg" },
            { text: "undefined", size: "lg" }
        ],
        ans: "Hello"
    },
    {
        type: "drag_drop",
        theme: THEMES.purple,
        prompt: "Loop through the array:",
        code: [
            { t: "for", type: "keyword" }, { t: " (let i = 0; " }, { t: "\n" },
            { t: "     i < arr." }, { slot: true, size: "md", ans: "length" }, { t: "; i++) {" }, { t: "\n" },
            { t: "}" }
        ],
        options: ["size", "length", "count"]
    },
    {
        type: "multiple_choice",
        theme: THEMES.orange,
        prompt: "Select the correct boolean:",
        code: [
            { t: "let", type: "keyword" }, { t: " isGameOver = " }, { t: "___", type: "keyword" }, { t: ";" }
        ],
        options: [
            { text: "false", size: "md" },
            { text: "'false'", size: "md" },
            { text: "0", size: "md" },
            { text: "null", size: "md" } 
        ],
        ans: "false"
    },
    {
        type: "drag_drop",
        theme: THEMES.green,
        prompt: "Push an item to the list:",
        code: [
            { t: "items." }, { slot: true, size: "lg", ans: "push" }, 
            { t: "(newItem);" }
        ],
        options: ["insert", "add", "push", "append"]
    }
];

export const VISUAL_CONSTANTS = {
    FONT_SIZE: 24,
    LINE_HEIGHT: 54,
    PILL_HEIGHT: 46,
    PILL_RADIUS: 23,
};
