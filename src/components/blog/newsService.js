const NEWS_API_KEY = 'de35e3a15ed84ff3b8cd45af9db00cf2';
const BASE_URL = 'https://newsapi.org/v2';
const CACHE_KEY = 'newsCache';
const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

const getFromCache = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { timestamp, data } = JSON.parse(cached);
  const now = new Date().getTime();

  // Check if cache is older than 3 days
  if (now - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return data;
};

const saveToCache = (data) => {
  const cacheData = {
    timestamp: new Date().getTime(),
    data: data
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

export const fetchEducationNews = async () => {
  try {
    const cachedNews = getFromCache();
    if (cachedNews) {
      console.log('Fetching news from cache');
      return cachedNews;
    }

    console.log('Fetching fresh news from API');
    const queries = [
      '(education AND (Nigeria OR "West Africa" OR Africa))',
      '(scholarship AND (Nigeria OR Africa OR "West Africa"))',
      '(STEM AND education AND Africa)'
    ];

    const allArticles = [];
    
    for (const query of queries) {
      const response = await fetch(
        `${BASE_URL}/everything?` +
        `q=${encodeURIComponent(query)}&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `pageSize=10&` +
        `apiKey=${NEWS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`News API response error: ${response.status}`);
      }

      const data = await response.json();
      allArticles.push(...data.articles);
    }

    // Remove duplicates based on URL
    const uniqueArticles = Array.from(new Map(allArticles.map(article => 
      [article.url, article]
    )).values());

    const transformedData = uniqueArticles.map(article => ({
      id: article.url,
      title: article.title,
      content: article.description,
      excerpt: article.description,
      image: article.urlToImage || '/images/default-blog-image.jpg',
      author: article.author || 'News Staff',
      publishedAt: new Date(article.publishedAt),
      source: {
        name: article.source.name,
        type: 'api'
      },
      url: article.url,
      category: determineCategory(article.title, article.description),
      tags: generateTags(article.title, article.description)
    }));

    saveToCache(transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching news:', error);
    const cachedNews = getFromCache();
    if (!cachedNews) {
      throw new Error('Failed to fetch news and no cache available');
    }
    return cachedNews;
  }
};

// Helper function to determine category
function determineCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('scholarship')) return 'Scholarships';
  if (text.includes('stem')) return 'STEM';
  if (text.includes('technology')) return 'Education Technology';
  if (text.includes('nigeria')) return 'Nigerian Education';
  if (text.includes('university') || text.includes('college')) return 'Higher Education';
  return 'Education News';
}

// Helper function to generate tags
function generateTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = ['Education'];
  
  if (text.includes('scholarship')) tags.push('Scholarships');
  if (text.includes('stem')) tags.push('STEM');
  if (text.includes('technology')) tags.push('Technology');
  if (text.includes('nigeria')) tags.push('Nigeria');
  if (text.includes('africa')) tags.push('Africa');
  if (text.includes('university')) tags.push('Higher Education');
  
  return tags;
}

// Add search functionality
export const searchNews = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/everything?` +
      `q=${encodeURIComponent(query + ' AND (education OR scholarship)')}&` +
      `language=en&` +
      `sortBy=publishedAt&` +
      `pageSize=20&` +
      `apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Search API response was not ok');
    }

    const data = await response.json();
    
    return data.articles.map(article => ({
      id: article.url,
      title: article.title,
      content: article.description,
      excerpt: article.description,
      image: article.urlToImage || '/images/default-blog-image.jpg',
      author: article.author || 'News Staff',
      publishedAt: new Date(article.publishedAt),
      source: {
        name: article.source.name,
        type: 'api'
      },
      url: article.url,
      category: determineCategory(article.title, article.description),
      tags: generateTags(article.title, article.description)
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
};

// Add Firestore security rules
export const getFirestoreRules = () => {
  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to published blog posts
    match /blog_posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
                    request.auth.token.admin == true;
    }
    
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
  }
}
  `;
};

export const fetchTopEducationNews = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/top-headlines?` +
      `category=general&` +
      `q=education&` +
      `language=en&` +
      `pageSize=5&` +
      `apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('News API response was not ok');
    }

    const data = await response.json();
    
    return data.articles.map(article => ({
      id: article.url,
      title: article.title,
      content: article.description,
      excerpt: article.description,
      image: article.urlToImage || '/images/default-blog-image.jpg',
      author: article.author || 'News Staff',
      publishedAt: new Date(article.publishedAt),
      source: {
        name: article.source.name,
        type: 'api'
      },
      url: article.url,
      category: 'Top Education News',
      tags: ['Education', 'Featured']
    }));
  } catch (error) {
    console.error('Error fetching top news:', error);
    return [];
  }
};

// Helper function to clear cache manually if needed
export const clearNewsCache = () => {
  localStorage.removeItem(CACHE_KEY);
};