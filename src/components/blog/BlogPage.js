import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { fetchEducationNews, fetchTopEducationNews, searchNews } from './newsService';
import SEO from '../seo/SEO';
import LoadingIndicator from '../common/LoadingIndicator';
import { FiClock, FiUser, FiTag, FiExternalLink, FiSearch } from 'react-icons/fi';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'All',
    'Education News',
    'Top Education News',
    'Education Technology',
    'Nigerian Education',
    'STEM',
    'Higher Education',
    'Educational Resources',
    'Career Development'
  ];

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to fetch admin posts
        let adminPosts = [];
        try {
          const postsRef = collection(db, 'blog_posts');
          const q = query(
            postsRef,
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(10)
          );
          const snapshot = await getDocs(q);
          adminPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            source: { type: 'admin', name: 'IOF Blog' }
          }));
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          // Continue with API posts even if Firestore fails
        }

        // Fetch news from API
        let newsArticles = [];
        let topNews = [];
        try {
          [newsArticles, topNews] = await Promise.all([
            fetchEducationNews(),
            fetchTopEducationNews()
          ]);
        } catch (apiError) {
          console.error('API error:', apiError);
          // Continue with admin posts even if API fails
        }

        // Combine all available posts
        const allPosts = [...adminPosts, ...newsArticles, ...topNews].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );

        if (allPosts.length === 0) {
          setError('No content available at the moment. Please try again later.');
        } else {
          setPosts(allPosts);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  const filteredPosts = category === 'all' 
    ? posts 
    : posts.filter(post => post.category === category);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearching(true);
    try {
      const searchResults = await searchNews(searchQuery);
      setPosts(prevPosts => {
        const adminPosts = prevPosts.filter(post => post.source.type === 'admin');
        return [...adminPosts, ...searchResults];
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <>
      <SEO 
        title="IOF Blog - Educational Insights & Updates from West Africa"
        description="Stay updated with the latest educational trends, insights, and opportunities in West Africa. Expert articles on Nigerian education, STEM, and career development."
        keywords="Nigerian education, West African education, STEM education, educational technology, career development, scholarships"
      />
      
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Educational Insights & Updates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about the latest developments in West African education
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded-lg hover:bg-[rgb(110,68,0)] transition-colors duration-200 flex items-center gap-2"
              >
                <FiSearch />
                Search
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat.toLowerCase())}
                className={`px-4 py-2 rounded-full ${
                  category === cat.toLowerCase()
                    ? 'bg-[rgb(130,88,18)] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-blog-image.jpg';
                    }}
                  />
                  {post.source.type === 'api' && (
                    <span className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full">
                      {post.source.name}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FiClock className="mr-2" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                    <FiUser className="ml-4 mr-2" />
                    {post.author}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiTag className="mr-2" />
                      {post.category}
                    </div>
                    {post.source.type === 'api' ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium"
                      >
                        Read More
                        <FiExternalLink className="ml-1" />
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(`/blog/${post.id}`)}
                        className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium"
                      >
                        Read More →
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center text-gray-600 py-12">
              No posts found in this category.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BlogPage; 