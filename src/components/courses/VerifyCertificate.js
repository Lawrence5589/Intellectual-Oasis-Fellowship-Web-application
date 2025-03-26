import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingIndicator from '../common/LoadingIndicator';

function VerifyCertificate() {
  const [verificationId, setVerificationId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const certificateRef = doc(db, 'certificates', verificationId.trim());
      const certificateDoc = await getDoc(certificateRef);

      if (!certificateDoc.exists()) {
        setError('Certificate not found. Please check the verification ID.');
        return;
      }

      setCertificate(certificateDoc.data());
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          <p className="mt-2 text-gray-600">
            Enter the certificate ID to verify its authenticity
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700">
                Certificate ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="verificationId"
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., IOF-XXXXXXXX)"
                  className="shadow-sm focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)] block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(130,88,18)] hover:bg-[rgb(110,68,0)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)]"
              >
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </button>
            </div>
          </form>

          {loading && <LoadingIndicator />}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {certificate && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certificate Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p><span className="font-semibold">Name:</span> {certificate.userName}</p>
                <p><span className="font-semibold">Course:</span> {certificate.courseName}</p>
                <p>
                  <span className="font-semibold">Completed:</span>{' '}
                  {new Date(certificate.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p>
                  <span className="font-semibold">Generated:</span>{' '}
                  {new Date(certificate.generatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p><span className="font-semibold">Verification ID:</span> {certificate.verificationId}</p>
                <div className="mt-4">
                  <div className="inline-block bg-green-50 rounded-md px-4 py-2">
                    <p className="text-green-700 font-medium">✓ This certificate is valid</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyCertificate;