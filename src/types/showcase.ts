// Types for Showcase module

export interface ExampleData {
    id: string;
    title: string;
    description: string;
    videoUrl: string;  // Changed from imageUrl to videoUrl
    thumbnailUrl?: string; // Optional thumbnail for video
    appLink: string;
    githubLink?: string;
    tags: string[];
    author: {
        id: string;
        name: string;
    };
    createdAt: Date;
}

export type ShowcaseState = 'LOADING' | 'SUCCESS' | 'ERROR' | 'EMPTY';
