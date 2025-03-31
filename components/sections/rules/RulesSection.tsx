// src/components/sections/rules/RulesSection.tsx
'use client';

import React from 'react';
import { ContentCard } from '@/components/ui/custom/content-card';
import { Info } from 'lucide-react';
import { RulesAccordion } from './RulesAccordion';

export const RulesSection = () => {
    return (
        <div className="w-full max-w-3xl mx-auto pt-20">
            <ContentCard>
                <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px] mb-6">
                    <span className="text-primary font-bold ml-1 inline-block">قوانین رزرو</span>
                    لطفاً پیش از رزرو، قوانین و مقررات زیر را به دقت مطالعه فرمایید. استفاده از خدمات به معنای پذیرش این قوانین می‌باشد.
                </p>

                <div className="flex items-center gap-2 mt-4 mb-6 bg-muted/50 p-4 rounded-xl">
                    <Info size={18} strokeWidth={2.5} className="shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        قوانین ممکن است بسته به شرایط خاص یا مناسبت‌های ویژه تغییر کنند.
                    </p>
                </div>

                <RulesAccordion />
            </ContentCard>
        </div>
    );
};

export default RulesSection;