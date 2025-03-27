import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiEdit2, FiTrash2, FiImage, FiSave, FiUpload, FiMessageSquare, FiBarChart2, FiCalendar, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { cld, cldConfig } from '../../config/cloudinary';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from '../common/LoadingIndicator';

function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    postsToday: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    image: '',
    scheduledDate: '',
    featured: false,
    allowComments: true
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState(null);

  const categories = [
    'Education Technology',
    'Nigerian Education',
    'STEM',
    'Higher Education',
    'Educational Resources',
    'Career Development'
  ];

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'blog_posts'),
        where('publishedAt', '>=', today)
      );
      
      const snapshot = await getDocs(q);
      const postsToday = snapshot.size;

      const allPosts = await getDocs(collection(db, 'blog_posts'));
      const publishedPosts = allPosts.docs.filter(doc => doc.data().status === 'published').length;
      
      setStats({
        totalPosts: allPosts.size,
        publishedPosts,
        draftPosts: allPosts.size - publishedPosts,
        postsToday
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const q = query(collection(db, 'blog_comments'), where('postId', '==', postId));
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleMediaDelete = async (publicId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    setDeletingMedia(publicId);
    try {
      // Delete from Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cldConfig.cloudName}/delete_by_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
            timestamp: Math.round(new Date().getTime() / 1000),
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove from local state
      setMediaFiles(prev => prev.filter(id => id !== publicId));
      
      // If the deleted image was the current form image, clear it
      if (formData.image === publicId) {
        setFormData(prev => ({ ...prev, image: '' }));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media. Please try again.');
    } finally {
      setDeletingMedia(null);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('File must be JPEG, PNG, GIF, or WebP');
      return;
    }

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cldConfig.uploadPreset);
      formData.append('folder', 'blog');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cldConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.public_id }));
      setMediaFiles(prev => [...prev, data.public_id]);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const postData = {
        ...formData,
        publishedAt: formData.scheduledDate ? new Date(formData.scheduledDate) : new Date(),
        updatedAt: new Date(),
        author: 'Admin'
      };

      if (editing) {
        const docRef = doc(db, 'blog_posts', editing);
        await updateDoc(docRef, postData);
      } else {
        await addDoc(collection(db, 'blog_posts'), postData);
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        status: 'draft',
        image: '',
        scheduledDate: '',
        featured: false,
        allowComments: true
      });
      setEditing(null);
      
      // Refresh posts list and stats
      await fetchPosts();
      await fetchStats();
      
      alert('Post saved successfully!');
      
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditing(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags || [],
      status: post.status,
      image: post.image,
      scheduledDate: post.scheduledDate || '',
      featured: post.featured || false,
      allowComments: post.allowComments ?? true
    });
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
        await fetchPosts();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommentAction = async (commentId, action) => {
    try {
      const commentRef = doc(db, 'blog_comments', commentId);
      if (action === 'delete') {
        await deleteDoc(commentRef);
      } else if (action === 'approve') {
        await updateDoc(commentRef, { approved: true });
      }
      await fetchComments(selectedPost);
    } catch (error) {
      console.error('Error managing comment:', error);
      alert('Error managing comment. Please try again.');
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog content</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowMediaGallery(!showMediaGallery)}
            className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded-lg hover:bg-[rgb(110,68,0)] transition-colors flex items-center gap-2"
          >
            <FiImage className="w-5 h-5" />
            Media Gallery
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Total Posts</h3>
            <FiBarChart2 className="w-6 h-6 text-[rgb(130,88,18)]" />
          </div>
          <p className="text-3xl font-bold text-[rgb(130,88,18)]">{stats.totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Published</h3>
            <FiBarChart2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Drafts</h3>
            <FiBarChart2 className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Posts Today</h3>
            <FiCalendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.postsToday}</p>
        </div>
      </div>

      {/* Blog Post Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              className="h-64 mb-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingMedia}
              />
              <label
                htmlFor="image-upload"
                className={`px-4 py-2 bg-gray-50 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200 ${
                  uploadingMedia ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingMedia ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    Upload Image
                  </>
                )}
              </label>
              {formData.image && (
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <AdvancedImage
                      cldImg={cld.image(formData.image)}
                      plugins={[responsive(), placeholder()]}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Featured Post</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowComments}
                onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Comments</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${
              submitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[rgb(130,88,18)] hover:bg-[rgb(110,68,0)]'
            } text-white transition-colors duration-200`}
          >
            <FiSave />
            {submitting ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">All Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {post.image && (
                        <div className="flex-shrink-0 h-12 w-12 mr-3 rounded-lg overflow-hidden">
                          <AdvancedImage
                            cldImg={cld.image(post.image)}
                            plugins={[responsive(), placeholder()]}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        {post.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(130,88,18)] text-white">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComments(true);
                          fetchComments(post.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Comments"
                      >
                        <FiMessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)]"
                        title="Edit Post"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Comments for "{selectedPost.title}"</h2>
                <p className="text-sm text-gray-500 mt-1">{comments.length} comments</p>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{comment.author}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt?.toDate()).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!comment.approved && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Approve Comment"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCommentAction(comment.id, 'delete')}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Comment"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No comments yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery Modal */}
      {showMediaGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
                <p className="text-sm text-gray-500 mt-1">{mediaFiles.length} images</p>
              </div>
              <button
                onClick={() => setShowMediaGallery(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((publicId, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                    <AdvancedImage
                      cldImg={cld.image(publicId)}
                      plugins={[responsive(), placeholder()]}
                      className="object-cover w-full h-full"
                    />
                    {deletingMedia === publicId && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, image: publicId }))}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[rgb(130,88,18)] px-4 py-2 rounded-lg"
                    >
                      Select Image
                    </button>
                    <button
                      onClick={() => handleMediaDelete(publicId)}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                      disabled={deletingMedia === publicId}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogManagement;