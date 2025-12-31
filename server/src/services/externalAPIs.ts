import axios from 'axios'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Wikimedia Commons - Free medical images
 * https://commons.wikimedia.org/w/api.php
 */
export async function searchWikimediaImages(query: string, limit: number = 10) {
  try {
    const response = await axios.get('https://commons.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: `${query} anatomy medical`,
        gsrlimit: limit,
        prop: 'imageinfo|info',
        iiprop: 'url|size|mime|extmetadata',
        iiurlwidth: 800,
      },
    })

    if (!response.data.query?.pages) {
      return []
    }

    const pages = Object.values(response.data.query.pages) as any[]

    return pages
      .filter(page => page.imageinfo && page.imageinfo[0])
      .map(page => ({
        title: page.title.replace('File:', ''),
        url: page.imageinfo[0].url,
        thumbUrl: page.imageinfo[0].thumburl,
        description: page.imageinfo[0].extmetadata?.ImageDescription?.value || '',
        author: page.imageinfo[0].extmetadata?.Artist?.value || '',
        license: page.imageinfo[0].extmetadata?.LicenseShortName?.value || '',
        size: page.imageinfo[0].size,
        width: page.imageinfo[0].width,
        height: page.imageinfo[0].height,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      }))
  } catch (error) {
    console.error('Error fetching Wikimedia images:', error)
    return []
  }
}

/**
 * Wikipedia - Medical articles
 */
export async function searchWikipediaArticles(query: string, language: 'ru' | 'en' = 'en', limit: number = 5) {
  try {
    const baseUrl = language === 'ru'
      ? 'https://ru.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php'

    const response = await axios.get(baseUrl, {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: limit,
        srprop: 'snippet',
      },
    })

    if (!response.data.query?.search) {
      return []
    }

    return response.data.query.search.map((article: any) => ({
      title: article.title,
      snippet: article.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
      pageId: article.pageid,
      url: `${baseUrl.replace('/w/api.php', '')}/wiki/${encodeURIComponent(article.title)}`,
    }))
  } catch (error) {
    console.error('Error fetching Wikipedia articles:', error)
    return []
  }
}

/**
 * Fetch full Wikipedia article content
 */
export async function getWikipediaContent(pageTitle: string, language: 'ru' | 'en' = 'en') {
  try {
    const baseUrl = language === 'ru'
      ? 'https://ru.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php'

    const response = await axios.get(baseUrl, {
      params: {
        action: 'query',
        format: 'json',
        titles: pageTitle,
        prop: 'extracts|images',
        exintro: false,
        explaintext: true,
        imlimit: 10,
      },
    })

    const pages = response.data.query.pages
    const page = Object.values(pages)[0] as any

    if (!page || page.missing) {
      return null
    }

    return {
      title: page.title,
      extract: page.extract,
      images: page.images?.map((img: any) => img.title) || [],
      url: `${baseUrl.replace('/w/api.php', '')}/wiki/${encodeURIComponent(page.title)}`,
    }
  } catch (error) {
    console.error('Error fetching Wikipedia content:', error)
    return null
  }
}

/**
 * PubMed/NLM - Medical literature search
 * Using E-utilities API (free, no key required for low volume)
 */
export async function searchPubMed(query: string, limit: number = 5) {
  try {
    // Search for articles
    const searchResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      params: {
        db: 'pubmed',
        term: query,
        retmax: limit,
        retmode: 'json',
      },
    })

    const ids = searchResponse.data.esearchresult?.idlist || []

    if (ids.length === 0) {
      return []
    }

    // Fetch article details
    const summaryResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'json',
      },
    })

    const articles = Object.values(summaryResponse.data.result || {})
      .filter((item: any) => item.uid)
      .map((article: any) => ({
        pmid: article.uid,
        title: article.title,
        authors: article.authors?.map((a: any) => a.name).join(', ') || '',
        source: article.source,
        pubdate: article.pubdate,
        abstract: article.abstract || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
      }))

    return articles
  } catch (error) {
    console.error('Error fetching PubMed articles:', error)
    return []
  }
}

/**
 * MedlinePlus - Health information (English and Spanish)
 */
export async function searchMedlinePlus(query: string) {
  try {
    const response = await axios.get('https://connect.medlineplus.gov/service', {
      params: {
        mainSearchCriteria: {
          v: {
            dn: query,
          },
        },
        informationRecipient: {
          languageCode: {
            c: 'en',
          },
        },
        knowledgeResponseType: 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching MedlinePlus data:', error)
    return null
  }
}

/**
 * Process and translate medical content using Claude
 */
export async function translateMedicalContent(
  content: string,
  fromLanguage: 'en' | 'ru',
  toLanguage: 'ru' | 'ro'
) {
  try {
    const prompt = `You are a professional medical translator.

Translate the following medical/anatomical content from ${fromLanguage} to ${toLanguage}.

Requirements:
- Maintain medical accuracy
- Use proper medical terminology
- Keep the same structure and formatting
- Preserve any markdown formatting

Content to translate:
${content}

Return ONLY the translated text, no additional commentary.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const translatedContent = response.content[0]
    if (translatedContent.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return translatedContent.text
  } catch (error) {
    console.error('Error translating content:', error)
    throw error
  }
}

/**
 * Extract and structure medical content using Claude
 */
export async function structureMedicalContent(rawContent: string, contentType: 'topic' | 'protocol') {
  try {
    const prompt = contentType === 'topic'
      ? `You are a medical education expert. Extract and structure the following anatomy/medical content into a well-organized educational format.

Raw content:
${rawContent}

Return JSON with this structure:
{
  "title": "Clear topic title",
  "description": "2-3 paragraph overview",
  "keyPoints": ["point 1", "point 2", ...] (5-7 points),
  "sections": [
    {
      "heading": "Section title",
      "content": "Section content in markdown"
    }
  ],
  "clinicalRelevance": "Practical applications for massage therapy",
  "references": "Source information"
}

Return ONLY valid JSON.`
      : `You are a massage therapy expert. Convert the following content into a structured massage protocol.

Raw content:
${rawContent}

Return JSON with this structure:
{
  "title": "Protocol name",
  "description": "Protocol overview",
  "indications": ["indication 1", ...],
  "contraindications": ["contraindication 1", ...],
  "steps": [
    {
      "title": "Step title",
      "description": "Step instructions",
      "duration": 5,
      "techniques": ["technique 1", ...]
    }
  ],
  "tips": ["tip 1", "tip 2", ...]
}

Return ONLY valid JSON.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return JSON.parse(content.text)
  } catch (error) {
    console.error('Error structuring content:', error)
    throw error
  }
}

/**
 * Download and save image from URL
 */
export async function downloadImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    return Buffer.from(response.data)
  } catch (error) {
    console.error('Error downloading image:', error)
    throw error
  }
}

/**
 * Get anatomy term translations
 */
export async function getAnatomyTranslations(term: string) {
  try {
    // Search in both languages
    const [ruResults, enResults] = await Promise.all([
      searchWikipediaArticles(term, 'ru', 1),
      searchWikipediaArticles(term, 'en', 1),
    ])

    return {
      ru: ruResults[0]?.title || term,
      en: enResults[0]?.title || term,
    }
  } catch (error) {
    console.error('Error getting translations:', error)
    return { ru: term, en: term }
  }
}

/**
 * Comprehensive content import from Wikipedia
 */
export async function importFromWikipedia(
  term: string,
  options: {
    includeImages?: boolean
    translateToRomanian?: boolean
  } = {}
) {
  const { includeImages = true, translateToRomanian = true } = options

  try {
    // Get content in both Russian and English
    const [ruContent, enContent] = await Promise.all([
      getWikipediaContent(term, 'ru'),
      getWikipediaContent(term, 'en'),
    ])

    const baseContent = ruContent || enContent
    if (!baseContent) {
      throw new Error('Content not found in any language')
    }

    // Structure the content
    const structuredContent = await structureMedicalContent(baseContent.extract, 'topic')

    // Translate to Romanian if needed
    let roContent = null
    if (translateToRomanian && baseContent.extract) {
      const roDescription = await translateMedicalContent(
        structuredContent.description,
        'ru',
        'ro'
      )
      roContent = {
        ...structuredContent,
        description: roDescription,
      }
    }

    // Get images if requested
    let images: Awaited<ReturnType<typeof searchWikimediaImages>> = []
    if (includeImages) {
      images = await searchWikimediaImages(term, 5)
    }

    return {
      title: {
        ru: ruContent?.title || structuredContent.title,
        en: enContent?.title || structuredContent.title,
      },
      content: {
        ru: structuredContent,
        ro: roContent,
      },
      images,
      sources: {
        ru: ruContent?.url,
        en: enContent?.url,
      },
    }
  } catch (error) {
    console.error('Error importing from Wikipedia:', error)
    throw error
  }
}
