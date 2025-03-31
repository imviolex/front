// src/components/sections/rules/RulesAccordion.tsx
'use client';

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/shadcn/accordion";

const rulesItems = [
    {
        id: "1",
        title: "شرایط رزرو",
        content:
            "رزرو باید حداقل ۲۴ ساعت قبل از زمان استفاده انجام شود. برای روزهای تعطیل و آخر هفته، رزرو باید حداقل ۴۸ ساعت قبل انجام گیرد. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    },
    {
        id: "2",
        title: "شرایط پرداخت",
        content:
            "برای تأیید رزرو، پرداخت حداقل ۵۰٪ مبلغ کل الزامی است. مابقی مبلغ باید قبل از استفاده از خدمات پرداخت گردد. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    },
    {
        id: "3",
        title: "سیاست کنسلی",
        content:
            "کنسل کردن رزرو تا ۷۲ ساعت قبل از زمان استفاده، با بازگشت کامل وجه امکان‌پذیر است. کنسلی بین ۷۲ تا ۲۴ ساعت مانده به زمان رزرو، با کسر ۳۰٪ مبلغ پرداختی همراه خواهد بود. کنسلی کمتر از ۲۴ ساعت، شامل بازگشت وجه نمی‌شود. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است."
    },
    {
        id: "4",
        title: "قوانین استفاده",
        content:
            "استفاده از تمامی امکانات باید مطابق با قوانین و مقررات باشد. هرگونه خسارت به اموال، مشمول جریمه خواهد شد. رعایت احترام به سایر استفاده‌کنندگان الزامی است. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است."
    }
];

export const RulesAccordion: React.FC = () => {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="1"
        >
            {rulesItems.map((item) => (
                <AccordionItem
                    value={item.id}
                    key={item.id}
                    className="border-b border-border last:border-0 py-1"
                >
                    <AccordionTrigger className="py-3 text-[15px] leading-relaxed hover:no-underline font-bold">
                        {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-justify [text-align-last:right] leading-relaxed">
                        {item.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default RulesAccordion;