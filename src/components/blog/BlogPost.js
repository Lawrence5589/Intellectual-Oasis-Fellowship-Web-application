import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FiClock, FiUser, FiTag, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import SEO from '../seo/SEO';
import LoadingIndicator from '../common/LoadingIndicator';

function BlogPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'blog_posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) return <LoadingIndicator />;
  if (!post) return null;

  const seoData = {
    title: `${post.title} - IOF Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    keywords: `${post.category}, Nigerian education, West African education, ${post.tags?.join(', ')}`,
    image: post.image
  };

  return (
    <>
      <SEO {...seoData} />
      <article className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center text-gray-600 hover:text-[rgb(130,88,18)] mb-8 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blog
          </button>

          {/* Featured Image */}
          <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
            <img
              src={post.image || '/images/default-blog-image.jpg'}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
              <div className="flex items-center">
                <FiClock className="mr-2" />
                {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <FiUser className="mr-2" />
                {post.author}
              </div>
              <div className="flex items-center">
                <FiTag className="mr-2" />
                {post.category}
              </div>
              <button
                onClick={handleShare}
                className="flex items-center hover:text-[rgb(130,88,18)] transition-colors duration-200"
              >
                <FiShare2 className="mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}

export default BlogPost; 