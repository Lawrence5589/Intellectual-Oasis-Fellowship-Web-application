import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, query, orderBy, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { FiClock, FiUser, FiTag, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import SEO from '../seo/SEO';
import LoadingIndicator from '../common/LoadingIndicator';
import AdUnit from '../ads/AdUnit';

function BlogPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


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

  useEffect(() => {
    const fetchCommentsAndVotes = async () => {
      try {
        // Fetch comments
        const commentsSnapshot = await getDocs(
          query(
            collection(db, 'blog_posts', postId, 'comments'),
            orderBy('createdAt', 'desc')
          )
        );
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);

        // Fetch votes
        const votesDoc = await getDoc(doc(db, 'blog_posts', postId));
        if (votesDoc.exists()) {
          setVotes({
            upvotes: votesDoc.data().upvotes || 0,
            downvotes: votesDoc.data().downvotes || 0
          });
        }
      } catch (error) {
        console.error('Error fetching comments and votes:', error);
      }
    };

    if (postId) {
      fetchCommentsAndVotes();
    }
  }, [postId]);

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentRef = await addDoc(collection(db, 'blog_posts', postId, 'comments'), {
        content: newComment,
        author: auth.currentUser.displayName || 'Anonymous',
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        likes: 0
      });

      setComments(prev => [{
        id: commentRef.id,
        content: newComment,
        author: auth.currentUser.displayName || 'Anonymous',
        authorId: auth.currentUser.uid,
        createdAt: new Date(),
        likes: 0
      }, ...prev]);
      
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!auth.currentUser) {
      alert('Please sign in to like comments');
      return;
    }

    try {
      const commentRef = doc(db, 'blog_posts', postId, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const likedBy = commentDoc.data().likedBy || [];
        const userLiked = likedBy.includes(auth.currentUser.uid);
        
        await updateDoc(commentRef, {
          likes: userLiked ? increment(-1) : increment(1),
          likedBy: userLiked 
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid)
        });

        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: userLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !userLiked
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!auth.currentUser) {
      alert('Please sign in to vote');
      return;
    }

    try {
      const postRef = doc(db, 'blog_posts', postId);
      const userVoteRef = doc(db, 'blog_posts', postId, 'votes', auth.currentUser.uid);
      
      const userVoteDoc = await getDoc(userVoteRef);
      const currentVote = userVoteDoc.exists() ? userVoteDoc.data().vote : null;

      if (currentVote === voteType) {
        // Remove vote
        await updateDoc(postRef, {
          [`${voteType}s`]: increment(-1)
        });
        await deleteDoc(userVoteRef);
        setUserVote(null);
        setVotes(prev => ({
          ...prev,
          [`${voteType}s`]: prev[`${voteType}s`] - 1
        }));
      } else {
        // Add/change vote
        const batch = writeBatch(db);
        
        if (currentVote) {
          // Remove old vote
          batch.update(postRef, {
            [`${currentVote}s`]: increment(-1)
          });
        }
        
        // Add new vote
        batch.update(postRef, {
          [`${voteType}s`]: increment(1)
        });
        batch.set(userVoteRef, { vote: voteType });
        
        await batch.commit();
        
        setUserVote(voteType);
        setVotes(prev => ({
          ...prev,
          [`${currentVote}s`]: currentVote ? prev[`${currentVote}s`] - 1 : prev[`${currentVote}s`],
          [`${voteType}s`]: prev[`${voteType}s`] + 1
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
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
      <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
        {/* Desktop Side Ad */}
        <div className="hidden lg:block fixed right-4 top-1/4 w-[300px]">
          <AdUnit />
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 lg:w-[60%]">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="group flex items-center text-gray-600 hover:text-[rgb(130,88,18)] mb-8 transition-all duration-300"
          >
            <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Blog</span>
          </button>

          {/* Mobile Ad - Top */}
          <div className="lg:hidden mb-8">
            <AdUnit mobile={true} />
          </div>

          {/* Post Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center text-sm text-gray-600 gap-6 font-medium">
              <div className="flex items-center">
                <FiClock className="mr-2 text-[rgb(130,88,18)]" />
                {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <FiUser className="mr-2 text-[rgb(130,88,18)]" />
                {post.author}
              </div>
              <div className="flex items-center">
                <FiTag className="mr-2 text-[rgb(130,88,18)]" />
                {post.category}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-gray-800 font-serif"
            />
          </div>

          {/* Mobile Ad - Middle */}
          <div className="lg:hidden my-8">
            <AdUnit mobile={true} />
          </div>

          {/* Article Footer - Voting and Share */}
          <div className="border-t border-gray-100 pt-8 mb-16">
            <div className="flex flex-col items-center space-y-6">
              {/* Voting Section */}
              <div className="flex flex-col items-center">
                <p className="text-gray-600 font-medium mb-4">Was this article helpful?</p>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleVote('upvote')}
                    className={`flex flex-col items-center group ${
                      userVote === 'upvote'
                        ? 'text-[rgb(130,88,18)]'
                        : 'text-gray-400 hover:text-[rgb(130,88,18)]'
                    }`}
                  >
                    <div className={`p-3 rounded-full transition-all duration-300 ${
                      userVote === 'upvote' 
                        ? 'bg-[rgb(130,88,18)]/10' 
                        : 'group-hover:bg-[rgb(130,88,18)]/10'
                    }`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                    <span className="mt-2 font-medium">{votes.upvotes}</span>
                  </button>
                  
                  <div className="h-16 w-px bg-gray-200"></div>
                  
                  <button
                    onClick={() => handleVote('downvote')}
                    className={`flex flex-col items-center group ${
                      userVote === 'downvote'
                        ? 'text-[rgb(130,88,18)]'
                        : 'text-gray-400 hover:text-[rgb(130,88,18)]'
                    }`}
                  >
                    <div className={`p-3 rounded-full transition-all duration-300 ${
                      userVote === 'downvote' 
                        ? 'bg-[rgb(130,88,18)]/10' 
                        : 'group-hover:bg-[rgb(130,88,18)]/10'
                    }`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <span className="mt-2 font-medium">{votes.downvotes}</span>
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-[rgb(130,88,18)] hover:text-white transition-all duration-300 text-gray-600"
              >
                <FiShare2 className="mr-2" />
                Share this article
              </button>
            </div>
          </div>

          {/* Mobile Ad - Before Comments */}
          <div className="lg:hidden my-8">
            <AdUnit mobile={true} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-16">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-[rgb(130,88,18)] hover:text-white transition-colors duration-300 cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Discussion</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-12">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent transition-all duration-300 min-h-[120px] text-gray-700 placeholder-gray-400 font-serif"
                required
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[rgb(130,88,18)] text-white px-6 py-3 rounded-lg hover:bg-[rgb(110,68,0)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </span>
                  ) : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[rgb(130,88,18)] rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {comment.author[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt?.toDate ? 
                              new Date(comment.createdAt.toDate()).toLocaleDateString() :
                              new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-300 ${
                            comment.userLiked 
                              ? 'text-[rgb(130,88,18)] bg-[rgb(130,88,18)]/10' 
                              : 'text-gray-400 hover:text-[rgb(130,88,18)] hover:bg-[rgb(130,88,18)]/10'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={comment.userLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-medium">{comment.likes}</span>
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-serif">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export default BlogPost; 