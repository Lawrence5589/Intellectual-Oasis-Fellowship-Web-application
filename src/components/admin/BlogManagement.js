import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiEdit2, FiTrash2, FiImage, FiSave } from 'react-icons/fi';
import LoadingIndicator from '../common/LoadingIndicator';

function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    image: ''
  });

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
  }, []);

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

  const convertGoogleDriveLink = (url) => {
    try {
      if (url.includes('drive.google.com')) {
        let fileId = '';
        
        // Handle different Google Drive URL formats
        if (url.includes('/file/d/')) {
          fileId = url.split('/file/d/')[1].split('/')[0];
        } else if (url.includes('id=')) {
          fileId = url.split('id=')[1].split('&')[0];
        }
        
        if (fileId) {
          // Use the direct download URL format
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }
      return url;
    } catch (error) {
      console.error('Error converting Google Drive link:', error);
      return url;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const postData = {
        ...formData,
        image: convertGoogleDriveLink(formData.image),
        publishedAt: editing ? (formData.publishedAt || new Date()) : new Date(),
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
        image: ''
      });
      setEditing(null);
      
      // Refresh posts list
      await fetchPosts();
      
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
      image: post.image
    });
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
        await fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog Management</h1>

      {/* Blog Post Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="space-y-6">
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
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent min-h-[300px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the URL of an image hosted online
            </p>
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(post.publishedAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] mr-3"
                      disabled={submitting}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={submitting}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BlogManagement;