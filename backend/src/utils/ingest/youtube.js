
import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from "@langchain/core/documents";

/**
 * Validates if the string is a valid YouTube URL
 * @param {string} url 
 */
function isValidYoutube(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Fetches transcript and splits it into chunks
 * @param {string} url - YouTube URL
 * @param {object} metadata - Additional metadata to attach (e.g. category_id)
 * @returns {Promise<Document[]>}
 */
export async function processYoutubeVideo(url, metadata = {}) {
    if (!isValidYoutube(url)) {
        throw new Error('Invalid YouTube URL');
    }

    try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
        const fullText = transcriptItems.map(item => item.text).join(' ');

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = await splitter.createDocuments([fullText], [{
            source: url,
            type: 'youtube',
            ...metadata
        }]);

        return docs;
    } catch (error) {
        console.error('Error processing YouTube video:', error);
        throw new Error('Failed to fetch transcript. Video might be missing captions.');
    }
}
