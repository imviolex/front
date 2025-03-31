// src/components/sections/home/IntroSection.tsx
'use client';

import {CalendarIcon, Clock, MapPin, Phone} from "lucide-react";
import { useRouter } from "next/navigation";
import { ContentCard } from "@/components/ui/custom/content-card";

export function IntroSection() {
    const router = useRouter();

    const headerContent = (
        <>
            <Clock size={16} strokeWidth={2.5} className="shrink-0 ml-2 text-muted-foreground " />
            <span className="text-xs text-muted-foreground">ساعات کاری ۹ صبح الی ۹ شب</span>
        </>
    );

    const mainContent = (
        <>
            <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                <span className="text-primary font-bold ml-1 inline-block">پیرایش مهدی</span>
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-justify [text-align-last:right] [word-spacing:-1px]">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
            </p>
            <div className="border-t mt-6 pt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-foreground">
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm sm:text-sm lg:text-base">خرم آباد، مطهری، نبش خیابان استاد معین</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                    <Phone size={16} className="shrink-0" />
                    <span className="text-sm sm:text-sm lg:text-base" dir="ltr">۰۹۱۲ ۱۲۳ ۴۵۶۷ - ۰۲۱ ۸۸۴۵ ۶۷۸۹</span>
                </div>
            </div>
        </>
    );

    return (
        <div className="pt-20">
            <ContentCard
                headerContent={headerContent}
                footerText="رزرو نوبت از طریق سایت"
                footerIcon={<CalendarIcon size={16} strokeWidth={2.5} className="shrink-0 text-primary/70" />}
                onFooterClick={() => router.push('/reservation')}
            >
                {mainContent}
            </ContentCard>
        </div>
    );
}