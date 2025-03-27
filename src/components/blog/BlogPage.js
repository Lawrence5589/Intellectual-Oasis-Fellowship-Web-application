import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import SEO from '../seo/SEO';
import LoadingIndicator from '../common/LoadingIndicator';
import { FiClock, FiUser, FiTag, FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { cld } from '../../config/cloudinary';
import AdUnit from '../ads/AdUnit';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [expandedExcerpts, setExpandedExcerpts] = useState({});
  const navigate = useNavigate();

  const categories = [
    'All',
    'Education Technology',
    'Educational Resources',
    'Career Development',
    'Nigerian Education',
    'STEM',
    'Higher Education'
  ];

  const postsPerPage = 9;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, 'blog_posts');
        const q = query(
          postsRef,
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setPosts(fetchedPosts);
        setHasMore(fetchedPosts.length > postsPerPage);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = category === 'all' || post.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return b.publishedAt - a.publishedAt;
      case 'oldest':
        return a.publishedAt - b.publishedAt;
      case 'popular':
        return (b.upvotes || 0) - (a.upvotes || 0);
      default:
        return 0;
    }
  });

  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const toggleExcerpt = (postId) => {
    setExpandedExcerpts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (loading) return <LoadingIndicator />;

  return (
    <>
      <SEO 
        title="IOF Blog - Educational Insights & Updates from West Africa"
        description="Stay updated with the latest educational trends, insights, and opportunities in West Africa. Expert articles on Nigerian education, STEM, and career development."
        keywords="Nigerian education, West African education, STEM education, educational technology, career development"
      />
      
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        {/* Desktop Side Ad */}
        <div className="hidden lg:block fixed right-4 top-1/4 w-[300px]">
          <AdUnit />
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 lg:w-[60%]">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Educational Insights & Updates
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mx-auto max-w-2xl">
              Stay informed about the latest developments in West African education
            </p>
          </div>

          {/* Mobile Ad - Top */}
          <div className="lg:hidden mb-8">
            <AdUnit mobile={true} />
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat.toLowerCase());
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm lg:text-base rounded-full transition-all duration-200 ${
                  category === cat.toLowerCase()
                    ? 'bg-[rgb(130,88,18)] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {paginatedPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {/* Mobile ad insertion logic */}
                {index > 0 && index % 4 === 0 && (
                  <div className="lg:hidden col-span-full my-8">
                    <AdUnit mobile={true} />
                  </div>
                )}
                
                <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
                  {post.image && (
                    <div className="aspect-w-16 aspect-h-9">
                      <AdvancedImage
                        cldImg={cld.image(post.image)}
                        plugins={[responsive(), placeholder()]}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <FiClock className="mr-2" />
                      {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
                      <FiUser className="ml-4 mr-2" />
                      {post.author || 'Admin'}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <div className="relative">
                      <p className={`text-gray-600 mb-4 ${!expandedExcerpts[post.id] ? 'line-clamp-3' : ''}`}>
                        {post.excerpt || post.content}
                      </p>
                      {(post.excerpt || post.content).length > 150 && (
                        <button
                          onClick={() => toggleExcerpt(post.id)}
                          className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium flex items-center gap-1"
                        >
                          {expandedExcerpts[post.id] ? (
                            <>
                              Show Less
                              <FiChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Read More
                              <FiChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiTag className="mr-2" />
                        {post.category}
                      </div>
                      <button
                        onClick={() => navigate(`/blog/${post.id}`)}
                        className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium flex items-center gap-1"
                      >
                        Full Article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              </React.Fragment>
            ))}
          </div>

          {/* Pagination */}
          {filteredPosts.length > postsPerPage && (
            <div className="mt-12 flex justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
                Page {currentPage} of {Math.ceil(filteredPosts.length / postsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(filteredPosts.length / postsPerPage)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage >= Math.ceil(filteredPosts.length / postsPerPage)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Mobile Ad - Bottom */}
          <div className="lg:hidden mt-12">
            <AdUnit mobile={true} />
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No posts found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategory('all');
                  setCurrentPage(1);
                }}
                className="mt-4 text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BlogPage; 