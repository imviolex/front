// src/components/sections/home/BrideGroomSection.tsx
'use client';

import { ContentCard } from "@/components/ui/custom/content-card";
import {Phone} from "lucide-react";

export function BrideGroomSection() {
    const handleCallClick = () => {
        window.location.href = 'tel:+989039281044';
    };

    const mainContent = (
        <>
            <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                <span className="text-primary font-bold ml-1 inline-block">گریم داماد</span>
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربرده با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها و شرایط سخت تایپ به پایان رسد وزمان مورد نیاز شامل حروفچینی دستاوردهای اصلی و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
            </p>
        </>
    );

    return (
        <div className="pt-4">
            <ContentCard
                footerText="تماس و مشاوره نوبت گریم داماد"
                footerIcon={<Phone size={16} strokeWidth={2.5} className="shrink-0 text-primary/70" />}
                onFooterClick={handleCallClick}
            >
                {mainContent}
            </ContentCard>
        </div>
    );
}