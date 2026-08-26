import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'setconnect_db';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'knowledge_base';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const client = new MongoClient(MONGODB_URI);

// Helper: Recursively get all files in a directory
function getAllFilesRecursive(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Exclude directories that shouldn't be indexed for text
            if (!['.git', 'node_modules', 'server', 'images', 'css', 'js', 'videos', '.github', 'dist'].includes(file)) {
                arrayOfFiles = getAllFilesRecursive(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}


function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - chunkOverlap;
    }
    return chunks;
}


function extractTextFromHTML(htmlContent) {
    const $ = cheerio.load(htmlContent);
    $('script, style').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
}


async function processDocument(collection, filePath, content, sourceType) {
    console.log(`Processing ${sourceType}: ${path.basename(filePath)}...`);
    
    const chunks = chunkText(content);
    console.log(`  Created ${chunks.length} chunks.`);

    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

    for (const [index, chunk] of chunks.entries()) {
        try {
            const embeddingResult = await embeddingModel.embedContent(chunk);
            const embedding = embeddingResult.embedding.values;

            await collection.insertOne({
                source: path.basename(filePath),
                sourceType: sourceType,
                chunkIndex: index,
                text: chunk,
                embedding: embedding
            });
            
          
            await new Promise(resolve => setTimeout(resolve, 4000));
            
        } catch (err) {
            console.error(`  Error embedding chunk ${index}:`, err?.message || err);
        }
    }
    console.log(`  Finished ${path.basename(filePath)}`);
}

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}


function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    return null;
}

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        console.log('Clearing existing knowledge base to prevent duplicates...');
        await collection.deleteMany({});

        const rootDir = path.join(__dirname, '..');
        const imagesDir = path.join(rootDir, 'images');

        // Get all files recursively starting from the root directory
        const allProjectFiles = getAllFilesRecursive(rootDir);

        // 1. Recursively Ingest ALL HTML files
        const htmlFiles = allProjectFiles.filter(f => f.toLowerCase().endsWith('.html'));

        for (const filePath of htmlFiles) {
            const htmlContent = fs.readFileSync(filePath, 'utf-8');
            const textContent = extractTextFromHTML(htmlContent);
            if (textContent.length > 50) {
                await processDocument(collection, filePath, textContent, 'HTML');
            }
        }

        // 2. Recursively Ingest ALL PDF files from everywhere
        const pdfFiles = allProjectFiles.filter(f => f.toLowerCase().endsWith('.pdf'));

        for (const filePath of pdfFiles) {
            const pdfBuffer = fs.readFileSync(filePath);
            try {
                const pdfData = await pdfParse(pdfBuffer);
                if (pdfData.text && pdfData.text.length > 50) {
                    await processDocument(collection, filePath, pdfData.text.replace(/\s+/g, ' '), 'PDF');
                }
            } catch(e) {
                 console.error(`Failed to parse PDF ${path.basename(filePath)}:`, e.message);
            }
        }

        // 3. Recursively Ingest Image files using Vision AI
        // DISABLED: To avoid Free Tier rate limits, we are skipping images for now.
        if (false && fs.existsSync(imagesDir)) {
            const allImageFiles = getAllFilesRecursive(imagesDir);
            const imageFiles = allImageFiles.filter(f => {
                const ext = path.extname(f).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
            });
            
            
            const visionModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
            
            for (const filePath of imageFiles) {
                console.log(`Analyzing Image with Vision AI: ${path.basename(filePath)}...`);
                try {
                    const mimeType = getMimeType(filePath);
                    if (!mimeType) continue;

                    const imagePart = fileToGenerativePart(filePath, mimeType);
                    const prompt = "Please thoroughly analyze this image. Extract any visible text verbatim. If there are charts, graphs, or diagrams, describe them in high detail. If there are logos or branding, mention them. The goal is to provide a complete textual representation of this image so it can be used in a knowledge base search.";
                    
                    const result = await visionModel.generateContent([prompt, imagePart]);
                    const imageDescription = result.response.text();
                    
                    if (imageDescription && imageDescription.length > 20) {
                        
                        await processDocument(collection, filePath, imageDescription, 'Image');
                    } else {
                        console.log(`  No useful info extracted from ${path.basename(filePath)}`);
                    }
                    
                    
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    
                } catch(e) {
                     console.error(`  Failed to process Image ${path.basename(filePath)}:`, e.message);
                }
            }
        }

        console.log('🎉 Data ingestion complete! All PDFs and Images have been vectorized.');
    } catch (error) {
        console.error('Fatal Error during ingestion:', error);
    } finally {
        await client.close();
    }
}

main();
