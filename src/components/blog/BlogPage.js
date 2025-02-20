import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import SEO from '../seo/SEO';
import LoadingIndicator from '../common/LoadingIndicator';
import { FiClock, FiUser, FiTag } from 'react-icons/fi';
import AdUnit from '../ads/AdUnit';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
        setHasMore(false); // Since we're loading all posts at once
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Removed currentPage from dependencies since we're loading all at once

  const filteredPosts = posts.filter(post => {
    const matchesCategory = category === 'all' || post.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <p className="text-lg lg:text-xl text-gray-600 mx-auto">
              Stay informed about the latest developments in West African education
            </p>
          </div>

          {/* Mobile Ad - Top */}
          <div className="lg:hidden mb-8">
            <AdUnit mobile={true} />
          </div>

          {/* Search Input */}
          <div className="w-full mx-auto mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat.toLowerCase())}
                className={`px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base rounded-full ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {/* Mobile ad insertion logic */}
                {index > 0 && index % 4 === 0 && (
                  <div className="lg:hidden col-span-full my-8">
                    <AdUnit mobile={true} />
                  </div>
                )}
                
                <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FiClock className="mr-2" />
                      {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
                      <FiUser className="ml-4 mr-2" />
                      {post.author || 'Admin'}
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
                      <button
                        onClick={() => navigate(`/blog/${post.id}`)}
                        className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] font-medium"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </article>
              </React.Fragment>
            ))}
          </div>

          {/* Add this before the final mobile ad */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[rgb(130,88,18)] text-white hover:bg-[rgb(110,68,0)]'
              } transition-colors duration-200`}
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 bg-white rounded-lg">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasMore}
              className={`px-4 py-2 rounded-lg ${
                !hasMore
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[rgb(130,88,18)] text-white hover:bg-[rgb(110,68,0)]'
              } transition-colors duration-200`}
            >
              Next
            </button>
          </div>

          {/* Mobile Ad - Bottom */}
          <div className="lg:hidden mt-12">
            <AdUnit mobile={true} />
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center text-gray-600 py-12">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BlogPage; 