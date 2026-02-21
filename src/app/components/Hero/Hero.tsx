'use client';

import React from 'react';
import styles from './Hero.module.css';
import { FadeIn } from '@/components/FadeIn';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const Hero = () => {
    const ref = useRef(null);
    useInView(ref, { margin: "200px 0px 0px 0px" });

    return (
        <section className={styles.section} ref={ref}>
            <div className={styles.contentContainer}>
                <FadeIn delay={0.2}>
                    <h1 className={styles.title}>
                        DA IDEIA AO SITE. <br />
                        <span className={styles.highlight}>EM UM ÚNICO PROMPT.</span>
                    </h1>
                </FadeIn>
            </div>
        </section>
    );
};
