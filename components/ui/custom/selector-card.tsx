// src/components/ui/custom/selector-card.tsx
import { motion } from 'framer-motion';

interface SelectorCardProps {
    id: string;
    selected: boolean;
    onSelect: (id: string) => void;
    icon?: React.ReactNode;
    title: string;
    subtitle?: React.ReactNode;
    className?: string;
}

export function SelectorCard({
                                 id,
                                 selected,
                                 onSelect,
                                 icon,
                                 title,
                                 subtitle,
                                 className = ""
                             }: SelectorCardProps) {
    return (
        <motion.div
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => onSelect(id)}
            className={`
                cursor-pointer rounded-xl p-4 transition-colors duration-200
                ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}
                ${className}
            `}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <div className={`
                        p-2 rounded-xl
                        ${selected ? 'bg-primary-foreground/10' : 'bg-background'}
                    `}>
                        {icon}
                    </div>
                )}
                <div>
                    <p className={`text-sm ${
                        selected ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                        {title}
                    </p>
                    {subtitle && (
                        <div className={`text-xs mt-2 ${
                            selected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                        }`}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}