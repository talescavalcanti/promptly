'use client';

import React, { useRef, useState } from 'react';
import { ExternalLink, Github, Play, Volume2, VolumeX } from 'lucide-react';
import { ExampleData } from '@/types/showcase';
import styles from './ExampleCard.module.css';

interface ExampleCardProps {
    example: ExampleData;
}

// S03: Validate URL scheme (http/https or relative)
const isValidUrl = (url: string): boolean => {
    if (url.startsWith('/')) return true; // Allow relative URLs
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

// Detect if URL is from YouTube and extract video ID
const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};

// EC04: Truncate text with ellipsis
const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

export const ExampleCard: React.FC<ExampleCardProps> = ({ example }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);

    const validAppLink = isValidUrl(example.appLink);
    const validGithubLink = example.githubLink && isValidUrl(example.githubLink);
    const validVideoUrl = isValidUrl(example.videoUrl);
    const youtubeId = getYouTubeVideoId(example.videoUrl);
    const isYouTube = !!youtubeId;

    const handleMouseEnter = () => {
        setIsHovering(true);
        if (videoRef.current && !isYouTube) {
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (videoRef.current && !isYouTube) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    const handleVideoError = () => {
        setVideoError(true);
    };

    return (
        <article
            className={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Section */}
            <div className={styles.videoContainer}>
                {isYouTube ? (
                    // YouTube Embed
                    <iframe
                        className={styles.youtubeEmbed}
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isHovering ? 1 : 0}&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={example.title}
                    />
                ) : !videoError && validVideoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            className={styles.video}
                            src={example.videoUrl}
                            muted={isMuted}
                            loop
                            playsInline
                            onError={handleVideoError}
                        />
                        {!isHovering && (
                            <div className={styles.playOverlay}>
                                <Play size={40} fill="white" />
                            </div>
                        )}
                        {isHovering && (
                            <button
                                className={styles.muteButton}
                                onClick={toggleMute}
                                aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        )}
                    </>
                ) : (
                    <div className={styles.videoPlaceholder}>
                        <span>🎬</span>
                    </div>
                )}

                {/* Tags Overlay */}
                <div className={styles.tagsOverlay}>
                    {example.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className={styles.content}>
                <h3 className={styles.title}>{truncateText(example.title, 80)}</h3>
                <p className={styles.description}>{truncateText(example.description, 120)}</p>

                <div className={styles.footer}>
                    <span className={styles.author}>por {example.author.name}</span>

                    <div className={styles.links}>
                        {validGithubLink && (
                            <a
                                href={example.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.iconLink}
                                aria-label="Ver código no GitHub"
                            >
                                <Github size={18} />
                            </a>
                        )}

                        {validAppLink && (
                            <a
                                href={example.appLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewButton}
                            >
                                Ver App <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ExampleCard;
