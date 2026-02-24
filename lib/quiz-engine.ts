import { VISUAL_CONSTANTS } from './constants';

const { FONT_SIZE, PILL_HEIGHT, PILL_RADIUS } = VISUAL_CONSTANTS;

export class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 16;
        this.vy = (Math.random() - 0.5) * 16;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 6 + 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.4;
        this.life -= 0.02;
        this.size *= 0.95;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export type PillType = 'drag' | 'mc';

export class Pill {
    text: string;
    x: number;
    y: number;
    tx: number;
    ty: number;
    vx: number;
    vy: number;
    homeX: number;
    homeY: number;
    w: number;
    h: number;
    color: string;
    type: PillType;

    isDragging: boolean = false;
    inSlot: boolean = false;
    isSelected: boolean = false;
    scale: number = 1;

    constructor(text: string, x: number, y: number, width: number, color: string, type: PillType) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.tx = x;
        this.ty = y;
        this.vx = 0;
        this.vy = 0;
        this.homeX = x;
        this.homeY = y;
        this.w = width;
        this.h = PILL_HEIGHT;
        this.color = color;
        this.type = type;
    }

    update() {
        if (this.isDragging) return;

        const stiffness = 0.18;
        const damping = 0.65;
        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const activeStiffness = (dist < 50 && this.type === 'drag') ? 0.45 : stiffness;

        this.vx += dx * activeStiffness;
        this.vy += dy * activeStiffness;
        this.vx *= damping;
        this.vy *= damping;
        this.x += this.vx;
        this.y += this.vy;

        let targetScale = 1.0;
        if (this.isDragging) targetScale = 1.1;
        if (this.isSelected) targetScale = 1.05;

        this.scale += (targetScale - this.scale) * 0.25;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        ctx.shadowColor = "rgba(0,0,0,0.06)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        // ctx.roundRect(-this.w / 2, -this.h / 2, this.w, this.h, PILL_RADIUS);
        // Using manual rounded rect for broader compatibility if needed, but modern browsers support roundRect
        (ctx as any).roundRect(-this.w / 2, -this.h / 2, this.w, this.h, PILL_RADIUS);

        if (this.type === 'mc' && this.isSelected) {
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = "#ffffff";
        }
        ctx.fill();

        ctx.shadowColor = "transparent";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = (this.type === 'mc' && this.isSelected) ? "#ffffff" : this.color;
        ctx.font = `800 ${FONT_SIZE}px 'Nunito', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // ctx.letterSpacing = "-0.5px"; // Not standard canvas property in all browsers
        ctx.fillText(this.text, 0, 2);

        ctx.restore();
    }
}

export function drawRoundedStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string, alpha: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = radius * 0.35;
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    const spikes = 5;
    const innerRadius = radius * 0.45;
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;
    
    const drawRadius = radius * 0.8; 

    ctx.moveTo(0, -drawRadius);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(Math.cos(rot) * drawRadius, Math.sin(rot) * drawRadius);
        rot += step;
        ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
        rot += step;
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}
