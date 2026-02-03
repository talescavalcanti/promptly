'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import { FadeIn } from '@/components/FadeIn';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import Image from 'next/image';


export const Hero = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "200px 0px 0px 0px" });

    return (
        <section className={styles.section} ref={ref}>
            <ContainerScroll
                titleComponent={
                    <div className={styles.contentContainer}>
                        <FadeIn delay={0.2}>
                            <h1 className={styles.title}>
                                DA IDEIA AO SITE. <br />
                                <span className={styles.highlight}>EM UM ÚNICO PROMPT.</span>
                            </h1>
                        </FadeIn>
                    </div>
                }
            >
                <Image
                    src={`/hero-new.png`}
                    alt="Barbearia Preview"
                    height={720}
                    width={1400}
                    className="mx-auto rounded-2xl object-cover h-full object-center"
                    draggable={false}
                    priority
                />
            </ContainerScroll>
        </section>
    );
};
