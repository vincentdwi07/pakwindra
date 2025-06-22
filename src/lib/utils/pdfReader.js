// lib/utils/pdfReader.js
import { promises as fs } from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'

/**
 * Extract text from PDF with enhanced mathematical symbol support
 * @param {string} filePath - Relative file path from the quiz data
 * @returns {Promise<string>} - Extracted and processed text content
 */
export async function extractPDFText(filePath) {
    try {
        const quizzesPath = process.env.QUIZZES_PATH

        if (!quizzesPath) {
            throw new Error('QUIZZES_PATH environment variable is not set')
        }

        if (!filePath) {
            throw new Error('File path is required')
        }

        // Clean the relative path (remove leading slash if present)
        const cleanRelativePath = filePath.startsWith('/')
            ? filePath.substring(1)
            : filePath

        // Construct absolute path
        const absoluteFilePath = path.join(process.cwd(), quizzesPath, cleanRelativePath)
        console.log('Reading PDF from:', absoluteFilePath)

        // Check if file exists
        try {
            await fs.access(absoluteFilePath)
        } catch (accessError) {
            throw new Error(`PDF file not found: ${absoluteFilePath}`)
        }

        // Read PDF buffer
        const pdfBuffer = await fs.readFile(absoluteFilePath)
        console.log('PDF buffer size:', pdfBuffer.length, 'bytes')

        // Enhanced options for better mathematical symbol extraction
        const options = {
            // Preserve formatting and spacing for mathematical content
            normalizeWhitespace: false,
            // Custom render function to better handle symbols and spacing
            render: function(data) {
                let text = ''

                // Process each text item in the PDF page
                if (data.items) {
                    data.items.forEach((item, index) => {
                        if (item.str) {
                            // Add the text content
                            text += item.str

                            // Add appropriate spacing based on position
                            const nextItem = data.items[index + 1]
                            if (nextItem) {
                                const horizontalGap = nextItem.x - (item.x + item.width)
                                const verticalGap = Math.abs(nextItem.y - item.y)

                                // Add space for horizontal gaps
                                if (horizontalGap > 5) {
                                    text += ' '
                                }

                                // Add line break for vertical gaps (new lines)
                                if (verticalGap > 5) {
                                    text += '\n'
                                }
                            }
                        }
                    })
                }

                return text
            }
        }

        // Parse PDF with enhanced options
        const data = await pdfParse(pdfBuffer, options)
        let extractedText = data.text

        // Post-process to fix mathematical symbols
        extractedText = fixMathematicalSymbols(extractedText)

        console.log('PDF extraction completed:')
        console.log('- Original text length:', data.text.length)
        console.log('- Processed text length:', extractedText.length)
        console.log('- Number of pages:', data.numpages)
        console.log('- Text preview:', extractedText.substring(0, 200) + '...')

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text content extracted from PDF')
        }

        return extractedText

    } catch (error) {
        console.error('PDF extraction error:', error)

        // Provide more specific error messages
        if (error.code === 'ENOENT') {
            throw new Error(`PDF file not found: ${error.message}`)
        } else if (error.code === 'EACCES') {
            throw new Error(`Permission denied accessing PDF file: ${error.message}`)
        } else if (error.message.includes('Invalid PDF')) {
            throw new Error(`Invalid or corrupted PDF file: ${error.message}`)
        } else {
            throw new Error(`Failed to extract PDF content: ${error.message}`)
        }
    }
}

/**
 * Fix common mathematical symbol conversion issues
 * @param {string} text - Raw extracted text
 * @returns {string} - Text with fixed mathematical symbols
 */
function fixMathematicalSymbols(text) {
    let fixed = text

    // Common mathematical symbol replacements
    const symbolReplacements = {
        // Superscripts (powers)
        '²': '^2',
        '³': '^3',
        '⁴': '^4',
        '⁵': '^5',
        '⁶': '^6',
        '⁷': '^7',
        '⁸': '^8',
        '⁹': '^9',
        '¹': '^1',
        '⁰': '^0',

        // Subscripts
        '₁': '_1',
        '₂': '_2',
        '₃': '_3',
        '₄': '_4',
        '₅': '_5',
        '₆': '_6',
        '₇': '_7',
        '₈': '_8',
        '₉': '_9',
        '₀': '_0',

        // Mathematical operators
        '×': '*',
        '÷': '/',
        '±': '+/-',
        '∓': '-/+',
        '≤': '<=',
        '≥': '>=',
        '≠': '!=',
        '≈': '≈',
        '∞': 'infinity',
        '∆': 'delta',

        // Greek letters commonly used in math
        'α': 'alpha',
        'β': 'beta',
        'γ': 'gamma',
        'δ': 'delta',
        'ε': 'epsilon',
        'θ': 'theta',
        'λ': 'lambda',
        'μ': 'mu',
        'π': 'pi',
        'σ': 'sigma',
        'τ': 'tau',
        'φ': 'phi',
        'χ': 'chi',
        'ψ': 'psi',
        'ω': 'omega',
        'Α': 'Alpha',
        'Β': 'Beta',
        'Γ': 'Gamma',
        'Δ': 'Delta',
        'Ε': 'Epsilon',
        'Θ': 'Theta',
        'Λ': 'Lambda',
        'Μ': 'Mu',
        'Π': 'Pi',
        'Σ': 'Sigma',
        'Τ': 'Tau',
        'Φ': 'Phi',
        'Χ': 'Chi',
        'Ψ': 'Psi',
        'Ω': 'Omega',

        // Common fractions
        '½': '1/2',
        '⅓': '1/3',
        '⅔': '2/3',
        '¼': '1/4',
        '¾': '3/4',
        '⅕': '1/5',
        '⅖': '2/5',
        '⅗': '3/5',
        '⅘': '4/5',
        '⅙': '1/6',
        '⅚': '5/6',
        '⅛': '1/8',
        '⅜': '3/8',
        '⅝': '5/8',
        '⅞': '7/8',

        // Other mathematical symbols
        '√': 'sqrt',
        '∑': 'sum',
        '∏': 'product',
        '∫': 'integral',
        '∂': 'partial',
        '∇': 'nabla',
        '°': 'degrees',
        '∠': 'angle',
        '⊥': 'perpendicular',
        '∥': 'parallel',
        '∈': 'in',
        '∉': 'not in',
        '⊂': 'subset',
        '⊃': 'superset',
        '∪': 'union',
        '∩': 'intersection',
        '∅': 'empty set'
    }

    // Apply symbol replacements
    for (const [original, replacement] of Object.entries(symbolReplacements)) {
        fixed = fixed.replace(new RegExp(original, 'g'), replacement)
    }

    // Fix formatting and spacing issues
    fixed = fixed
        // Fix spaces around mathematical operators
        .replace(/(\d)\s*\^\s*(\d)/g, '$1^$2')
        .replace(/(\d)\s*_\s*(\d)/g, '$1_$2')
        .replace(/(\w)\s*\^\s*(\w)/g, '$1^$2')
        .replace(/(\w)\s*_\s*(\w)/g, '$1_$2')

        // Fix equation formatting
        .replace(/=\s+/g, ' = ')
        .replace(/\s+=\s*/g, ' = ')
        .replace(/\+\s+/g, ' + ')
        .replace(/\s+\+\s*/g, ' + ')
        .replace(/-\s+/g, ' - ')
        .replace(/\s+-\s*/g, ' - ')
        .replace(/\*\s+/g, ' * ')
        .replace(/\s+\*\s*/g, ' * ')
        .replace(/\/\s+/g, ' / ')
        .replace(/\s+\/\s*/g, ' / ')

        // Clean up multiple spaces and line breaks
        .replace(/\s{2,}/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')

        // Fix line breaks in equations (keep operators with their operands)
        .replace(/\n\s*([+\-*/=<>])/g, ' $1')
        .replace(/([+\-*/=<>])\s*\n/g, '$1 ')

    return fixed.trim()
}

/**
 * Get PDF metadata and information
 * @param {string} filePath - Relative file path from the quiz data
 * @returns {Promise<Object>} - PDF metadata object
 */
export async function getPDFInfo(filePath) {
    try {
        const quizzesPath = process.env.QUIZZES_PATH
        const cleanRelativePath = filePath.startsWith('/')
            ? filePath.substring(1)
            : filePath
        const absoluteFilePath = path.join(process.cwd(), quizzesPath, cleanRelativePath)

        const pdfBuffer = await fs.readFile(absoluteFilePath)
        const data = await pdfParse(pdfBuffer)

        return {
            pages: data.numpages,
            info: data.info,
            metadata: data.metadata,
            textLength: data.text.length
        }
    } catch (error) {
        console.error('Error getting PDF info:', error)
        throw error
    }
}