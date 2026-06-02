import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Speaker = {
  src: string;
  name: string;
};

// Speaker images are stored in `public/speakers11/` and are served at `/speakers11/*`.
// Per client requirement, we loop through 4.png → 20.png and then wrap back to 4.png.
const PUBLIC_SPEAKER_RANGE = { start: 4, end: 20 };

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function nameFromFilename(path: string) {
  const file = path.split('/').pop() || '';
  const base = file.replace(/\.[^.]+$/, '');

  const cleaned = base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Conference Speaker';

  // If it's mostly digits / codes, fall back.
  if (/^[\d\s]+$/.test(cleaned)) return 'Conference Speaker';

  return toTitleCase(cleaned);
}

export const SpeakersCarousel: React.FC = () => {
  const bundledSpeakers = useMemo<Speaker[]>(() => {
    const modules = import.meta.glob('../assets/speakers11/*.{png,jpg,jpeg,webp}', {
      eager: true,
      import: 'default',
    }) as Record<string, string>;

    return Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map(([path, src]) => ({
        src,
        name: nameFromFilename(path),
      }));
  }, []);

  const publicSpeakers = useMemo<Speaker[]>(() => {
    const items: Speaker[] = [];
    for (let i = PUBLIC_SPEAKER_RANGE.start; i <= PUBLIC_SPEAKER_RANGE.end; i += 1) {
      const src = `/speakers11/${i}.png`;
      items.push({ src, name: nameFromFilename(src) });
    }
    return items;
  }, []);

  const speakers = bundledSpeakers.length ? bundledSpeakers : publicSpeakers;

  // Swiper navigation elements can mount after initial render; re-render once.
  const [navReady, setNavReady] = useState(false);
  useEffect(() => {
    setNavReady(true);
  }, []);

  return (
    <motion.section
      id="our-speakers"
      className="py-24 bg-white"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="sub-heading">Our Speakers</span>
          <h2 className="section-heading">
            Meet the <span className="text-jogeda-green">Voices</span> Shaping Investment
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-zinc-600 leading-relaxed">
            A curated lineup of leaders, innovators and practitioners bringing real-world insight into growth, infrastructure,
            partnerships and opportunity across the region.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            className="speakers-prev hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-jogeda-green hover:text-jogeda-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jogeda-green focus-visible:ring-offset-2"
            aria-label="Previous speakers"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="speakers-next hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-jogeda-green hover:text-jogeda-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jogeda-green focus-visible:ring-offset-2"
            aria-label="Next speakers"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="md:px-16">
            <Swiper
              modules={[Autoplay, Navigation, Pagination, A11y]}
              loop
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              speed={650}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 28 },
              }}
              navigation={
                navReady
                  ? {
                      prevEl: '.speakers-prev',
                      nextEl: '.speakers-next',
                    }
                  : false
              }
              pagination={{ clickable: true, dynamicBullets: true }}
              className="pb-12"
            >
              {speakers.map((speaker) => {
                const src = speaker.src;
                const name = speaker.name || '';

                return (
                  <SwiperSlide key={src}>
                    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden h-full">
                      <div className="relative w-full aspect-[4/5] bg-zinc-50">
                        <img
                          src={src}
                          alt={name || 'Conference speaker'}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
            <button
              type="button"
              className="speakers-prev inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-jogeda-green hover:text-jogeda-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jogeda-green focus-visible:ring-offset-2"
              aria-label="Previous speakers"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="speakers-next inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-jogeda-green hover:text-jogeda-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jogeda-green focus-visible:ring-offset-2"
              aria-label="Next speakers"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

